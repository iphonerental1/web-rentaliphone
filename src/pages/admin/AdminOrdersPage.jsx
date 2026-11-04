/**
 * ADMIN ORDERS — Manajemen pesanan: verifikasi, alokasi unit fisik
 * (anti double-booking), transisi status, dan ganti unit (PRD 10.3 #6).
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList,
  RefreshCw,
  ShieldCheck,
  ArrowRightLeft,
  Building2,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import {
  Alert,
  Card,
  EmptyState,
  Field,
  InfoRow,
  LoadingBlock,
  Modal,
  PageHeader,
  Pagination,
  Pill,
  SearchInput,
  SectionTitle,
  Select,
  Table,
  Tabs,
  Td,
  TextArea,
  Tr,
} from '../../components/ui';
import {
  BatteryBadge,
  GradeBadge,
  OrderStatusBadge,
  OrderTimeline,
  PaymentStatusBadge,
  UnitStatusBadge,
} from '../../components/shared';
import { rentalApi } from '../../api/rentalApi';
import { adminOrderApi, getCandidateUnits } from '../../api/adminOrderApi';
import { adminApi } from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useDocumentTitle, usePagination } from '../../hooks';
import { formatRupiah, formatDateTime, formatDateShort } from '../../utils/formatter';
import { ORDER_STATUS } from '../../constants';

/** Peta aksi status berikutnya yang valid (state machine PRD 5.2). */
const NEXT_STATUS_MAP = {
  [ORDER_STATUS.WAITING_VERIFICATION]: [ORDER_STATUS.APPROVED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.APPROVED]: [ORDER_STATUS.AWAITING_PAYMENT, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.AWAITING_PAYMENT]: [ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAID]: [ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [
    ORDER_STATUS.READY_FOR_PICKUP,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.READY_FOR_PICKUP]: [ORDER_STATUS.ACTIVE_RENTAL],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.ACTIVE_RENTAL],
  [ORDER_STATUS.ACTIVE_RENTAL]: [ORDER_STATUS.OVERDUE, ORDER_STATUS.RETURNED],
  [ORDER_STATUS.OVERDUE]: [ORDER_STATUS.RETURNED],
  [ORDER_STATUS.RETURNED]: [ORDER_STATUS.INSPECTION_PENDING],
};

const STATUS_ACTIONS = {
  [ORDER_STATUS.APPROVED]: 'Setujui Pesanan',
  [ORDER_STATUS.AWAITING_PAYMENT]: 'Terbitkan Tagihan',
  [ORDER_STATUS.READY_FOR_PICKUP]: 'Tandai Siap Diambil',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Tandai Dikirim',
  [ORDER_STATUS.ACTIVE_RENTAL]: 'Mulai Masa Sewa',
  [ORDER_STATUS.OVERDUE]: 'Tandai Terlambat',
  [ORDER_STATUS.RETURNED]: 'Terima Pengembalian',
  [ORDER_STATUS.INSPECTION_PENDING]: 'Mulai Inspeksi',
  [ORDER_STATUS.CANCELLED]: 'Batalkan Pesanan',
};

const ORDER_TABS = [
  { value: '', label: 'Semua' },
  { value: ORDER_STATUS.WAITING_VERIFICATION, label: 'Verifikasi KYC' },
  { value: ORDER_STATUS.AWAITING_PAYMENT, label: 'Menunggu Bayar' },
  { value: ORDER_STATUS.PAID, label: 'Perlu Alokasi' },
  { value: ORDER_STATUS.PREPARING, label: 'Persiapan' },
  { value: ORDER_STATUS.ACTIVE_RENTAL, label: 'Aktif' },
  { value: ORDER_STATUS.OVERDUE, label: 'Terlambat' },
  { value: ORDER_STATUS.COMPLETED, label: 'Selesai' },
];

export const AdminOrdersPage = () => {
  useDocumentTitle('Manajemen Pesanan');
  const notify = useNotification();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [statusModal, setStatusModal] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [showReplace, setShowReplace] = useState(false);

  const load = () => {
    setLoading(true);
    rentalApi
      .listAll({ status: tab, search })
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab, search]);

  const pagination = usePagination(orders, 10);

  const openOrder = (order) => {
    setSelected(order);
    setCandidates(getCandidateUnits(order));
    setStatusNote('');
    setShowReplace(false);
  };

  const refreshSelected = (updated) => {
    setSelected(updated);
    setCandidates(getCandidateUnits(updated));
    load();
  };

  const handleAllocate = async (unitId, isReplace = false) => {
    setProcessing(true);
    try {
      const res = isReplace
        ? await adminOrderApi.replaceUnit(selected.id, unitId, user)
        : await adminOrderApi.allocateUnit(selected.id, unitId, user);
      notify.success(res.message);
      setShowReplace(false);
      refreshSelected(res.data);
    } catch (err) {
      notify.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setProcessing(true);
    try {
      const res = await rentalApi.updateStatus(selected.id, newStatus, user, statusNote);
      notify.success(res.message);
      setStatusModal(null);
      refreshSelected(res.data);
    } catch (err) {
      notify.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const nextStatuses = useMemo(
    () => (selected ? NEXT_STATUS_MAP[selected.orderStatus] || [] : []),
    [selected]
  );

  const allocatedItem = (selected?.items || []).find((i) => i.allocatedUnitId);
  const needsAllocation =
    selected &&
    [ORDER_STATUS.PAID, ORDER_STATUS.PREPARING].includes(selected.orderStatus) &&
    !allocatedItem;

  return (
    <div>
      <PageHeader
        title="Manajemen Pesanan"
        subtitle="Verifikasi identitas, alokasikan unit fisik, dan kelola siklus pesanan."
        actions={
          <Button variant="secondary" className="text-xs flex items-center gap-2" onClick={load}>
            <RefreshCw size={13} /> Muat Ulang
          </Button>
        }
      />

      <Card className="mb-5">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nomor pesanan, nama customer, atau IMEI..."
        />
        <div className="mt-4">
          <Tabs tabs={ORDER_TABS} active={tab} onChange={setTab} />
        </div>
      </Card>

      <Card padded={false}>
        {loading ? (
          <div className="p-6">
            <LoadingBlock />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Tidak ada pesanan" description="Belum ada pesanan pada filter ini." />
        ) : (
          <div className="p-5">
            <Table
              columns={[
                { key: 'order', label: 'Pesanan' },
                { key: 'customer', label: 'Customer' },
                { key: 'unit', label: 'Unit & IMEI' },
                { key: 'period', label: 'Periode' },
                { key: 'status', label: 'Status' },
                { key: 'total', label: 'Total', align: 'right' },
                { key: 'action', label: '', align: 'right' },
              ]}
            >
              {pagination.paginated.map((order) => (
                <Tr key={order.id} onClick={() => openOrder(order)}>
                  <Td>
                    <span className="font-mono text-[11px] block">{order.orderNumber}</span>
                    <span className="text-[10px] text-gray-400">{formatDateTime(order.createdAt)}</span>
                  </Td>
                  <Td>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-[10px] text-gray-400">{order.customerPhone}</p>
                  </Td>
                  <Td>
                    <p>{(order.items || [])[0]?.modelName || '-'}</p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {(order.items || [])[0]?.allocatedImei || 'Belum dialokasikan'}
                    </p>
                  </Td>
                  <Td>
                    <span className="whitespace-nowrap text-[11px]">
                      {formatDateShort(order.startDate)} — {formatDateShort(order.endDate)}
                    </span>
                    <span className="block text-[10px] text-gray-400">{order.totalDays} hari</span>
                  </Td>
                  <Td>
                    <OrderStatusBadge status={order.orderStatus} size="xs" />
                  </Td>
                  <Td align="right">
                    <span className="font-semibold">{formatRupiah(order.grandTotal)}</span>
                  </Td>
                  <Td align="right">
                    <span className="text-[10px] font-semibold text-[#0071E3]">Kelola →</span>
                  </Td>
                </Tr>
              ))}
            </Table>

            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onChange={pagination.setPage}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
            />
          </div>
        )}
      </Card>

      {/* ── MODAL DETAIL & AKSI ── */}
      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        size="lg"
        title={selected ? `Pesanan ${selected.orderNumber}` : ''}
        subtitle={
          selected
            ? `${formatDateShort(selected.startDate)} — ${formatDateShort(selected.endDate)} · ${selected.totalDays} hari`
            : ''
        }
        footer={
          <Button variant="secondary" className="text-xs" onClick={() => setSelected(null)}>
            Tutup
          </Button>
        }
      >
        {selected && (
          <div className="space-y-5">
            <OrderTimeline order={selected} />

            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-[#F9F9FB]">
                <p className="text-xs font-bold text-[#1D1D1F] mb-2 flex items-center gap-1.5">
                  <UserCheck size={13} /> Data Customer
                </p>
                <div className="divide-y divide-gray-100">
                  <InfoRow label="Nama" value={selected.customerName} />
                  <InfoRow label="Email" value={selected.customerEmail} />
                  <InfoRow label="Telepon" value={selected.customerPhone} />
                  <InfoRow
                    label="Metode"
                    value={selected.deliveryType === 'COURIER_DELIVERY' ? 'Diantar Kurir' : 'Ambil di Toko'}
                  />
                  {selected.notes && <InfoRow label="Catatan" value={selected.notes} />}
                </div>
              </Card>

              <Card className="bg-[#F9F9FB]">
                <p className="text-xs font-bold text-[#1D1D1F] mb-2 flex items-center gap-1.5">
                  <Building2 size={13} /> Ringkasan Finansial
                </p>
                <div className="divide-y divide-gray-100">
                  <InfoRow label="Biaya Sewa" value={formatRupiah(selected.rentalFee)} />
                  <InfoRow label="Deposit" value={formatRupiah(selected.securityDeposit)} />
                  <InfoRow label="Total Tagihan" value={formatRupiah(selected.grandTotal)} strong />
                  {selected.payment && (
                    <InfoRow
                      label="Status Bayar"
                      value={<PaymentStatusBadge status={selected.payment.status} size="xs" />}
                    />
                  )}
                </div>
              </Card>
            </div>

            {/* Unit teralokasi */}
            {allocatedItem && (
              <Card>
                <SectionTitle
                  subtitle="Unit fisik yang terikat pada pesanan ini"
                  actions={
                    [ORDER_STATUS.PAID, ORDER_STATUS.PREPARING].includes(selected.orderStatus) && (
                      <Button
                        variant="secondary"
                        className="text-[10px] px-3 py-2 flex items-center gap-1.5"
                        onClick={() => setShowReplace((v) => !v)}
                      >
                        <ArrowRightLeft size={12} /> Ganti Unit
                      </Button>
                    )
                  }
                >
                  Unit Teralokasi
                </SectionTitle>

                <div className="rounded-xl bg-[#E8F2FD] border border-blue-200 p-4">
                  <p className="text-sm font-bold text-[#0071E3] font-mono">{allocatedItem.allocatedImei}</p>
                  <p className="text-[11px] text-[#0071E3]/80 mt-1">
                    {allocatedItem.modelName} · {allocatedItem.storageCapacity} · {allocatedItem.colorName}
                  </p>
                </div>
              </Card>
            )}

            {/* Alokasi unit */}
            {(needsAllocation || showReplace) && (
              <Card>
                <SectionTitle subtitle="Unit tersedia untuk varian yang sama pada rentang tanggal ini">
                  {showReplace ? 'Pilih Unit Pengganti' : 'Alokasi Unit Fisik'}
                </SectionTitle>

                {candidates.length === 0 ? (
                  <Alert tone="warning">Tidak ada unit dengan varian yang sama di inventori.</Alert>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {candidates.map((unit) => (
                      <div
                        key={unit.id}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                          unit.isSelectable ? 'border-gray-100' : 'border-gray-100 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1D1D1F] font-mono">{unit.imei}</p>
                          <p className="text-[10px] text-gray-400">
                            SN {unit.serialNumber} · {unit.modelName} {unit.storageCapacity}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <BatteryBadge health={unit.batteryHealth} />
                            <GradeBadge grade={unit.physicalGrade} size="xs" />
                            <UnitStatusBadge status={unit.currentStatus} size="xs" />
                          </div>
                          {unit.blockReason && <p className="text-[10px] text-rose-500 mt-1">{unit.blockReason}</p>}
                        </div>

                        <Button
                          variant={unit.isSelectable ? 'primary' : 'secondary'}
                          className="text-[10px] px-3 py-2 shrink-0"
                          disabled={!unit.isSelectable || processing}
                          onClick={() => handleAllocate(unit.id, showReplace)}
                        >
                          {processing ? '...' : showReplace ? 'Ganti' : 'Alokasikan'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Alert tone="info" className="mt-3">
                  Sistem menolak unit yang sudah terpesan pada rentang tanggal yang sama (anti double-booking).
                </Alert>
              </Card>
            )}

            {/* Riwayat */}
            <Card>
              <p className="text-xs font-bold text-[#1D1D1F] mb-3">Riwayat Status</p>
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {(selected.timeline || [])
                  .slice()
                  .reverse()
                  .map((t, i) => (
                    <div key={i} className="flex items-start gap-3 text-[11px]">
                      <span className="text-gray-400 shrink-0 w-32">{formatDateTime(t.at)}</span>
                      <span className="font-semibold text-[#1D1D1F] shrink-0 w-40">
                        {(STATUS_ACTIONS[t.status] && t.status) || t.status}
                      </span>
                      <span className="text-gray-400 truncate">{t.note || t.actor}</span>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Aksi perubahan status */}
            {nextStatuses.length > 0 && (
              <Card>
                <p className="text-xs font-bold text-[#1D1D1F] mb-3">Aksi Tersedia</p>
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((status) => (
                    <Button
                      key={status}
                      variant={status === ORDER_STATUS.CANCELLED ? 'danger' : 'primary'}
                      className="text-xs"
                      onClick={() => setStatusModal(status)}
                    >
                      {STATUS_ACTIONS[status] || status}
                    </Button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Modal konfirmasi status */}
      <Modal
        isOpen={Boolean(statusModal)}
        onClose={() => setStatusModal(null)}
        size="sm"
        title="Konfirmasi Perubahan Status"
        footer={
          <>
            <Button variant="secondary" className="text-xs" onClick={() => setStatusModal(null)}>
              Batal
            </Button>
            <Button
              variant={statusModal === ORDER_STATUS.CANCELLED ? 'danger' : 'primary'}
              className="text-xs"
              disabled={processing}
              onClick={() => handleStatusChange(statusModal)}
            >
              {processing ? 'Memproses...' : 'Konfirmasi'}
            </Button>
          </>
        }
      >
        <Alert tone={statusModal === ORDER_STATUS.CANCELLED ? 'danger' : 'info'}>
          Status diubah dari <strong>{selected?.orderStatus}</strong> menjadi <strong>{statusModal}</strong>.
          Perubahan tercatat pada audit log.
        </Alert>
        <Field label="Catatan (opsional)" className="mt-4">
          <TextArea
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            placeholder="Contoh: KTP & selfie sudah diverifikasi valid"
          />
        </Field>
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;