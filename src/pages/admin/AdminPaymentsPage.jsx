/**
 * ADMIN PAYMENTS — Verifikasi pembayaran: tinjau bukti transfer,
 * cocokkan nominal, verifikasi atau tolak (PRD 10.3 #7).
 */

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Wallet,
  TrendingUp,
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
  StatCard,
  Table,
  Td,
  TextArea,
  Tr,
} from '../../components/ui';
import { PaymentStatusBadge } from '../../components/shared';
import { rentalApi } from '../../api/rentalApi';
import { paymentApi } from '../../api/paymentApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useDocumentTitle } from '../../hooks';
import { formatRupiah, formatDateTime } from '../../utils/formatter';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../constants';

export const AdminPaymentsPage = () => {
  useDocumentTitle('Verifikasi Pembayaran');
  const notify = useNotification();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    rentalApi
      .listAll({})
      .then((res) => {
        const all = res.data || [];
        setOrders(
          all.filter(
            (o) => o.payment && ![ORDER_STATUS.CANCELLED].includes(o.orderStatus)
          )
        );
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleVerify = async (status) => {
    if (status === PAYMENT_STATUS.REJECTED && !notes.trim()) {
      notify.warning('Catatan alasan penolakan wajib diisi');
      return;
    }

    setProcessing(true);
    try {
      const res = await paymentApi.verify(selected.id, { status, notes }, user);
      notify.success(res.message);
      setSelected(null);
      setNotes('');
      load();
    } catch (err) {
      notify.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const pending = orders.filter((o) => o.payment?.status === PAYMENT_STATUS.PENDING);
  const verified = orders.filter((o) => o.payment?.status === PAYMENT_STATUS.VERIFIED);
  const rejected = orders.filter((o) => o.payment?.status === PAYMENT_STATUS.REJECTED);

  const displayed =
    filter === 'pending' ? pending : filter === 'verified' ? verified : filter === 'rejected' ? rejected : orders;

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title="Verifikasi Pembayaran"
        subtitle="Tinjau bukti transfer customer, cocokkan nominal, lalu verifikasi."
        actions={
          <Button variant="secondary" className="text-xs flex items-center gap-2" onClick={load}>
            <RefreshCw size={13} /> Muat Ulang
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Menunggu Verifikasi" value={pending.length} icon={CreditCard} tone="warning" />
        <StatCard label="Terverifikasi" value={verified.length} icon={CheckCircle2} tone="success" />
        <StatCard
          label="Nominal Pending"
          value={formatRupiah(pending.reduce((s, o) => s + (o.payment?.amount || 0), 0))}
          icon={Wallet}
          tone="neutral"
        />
        <StatCard
          label="Total Terverifikasi"
          value={formatRupiah(verified.reduce((s, o) => s + (o.payment?.amount || 0), 0))}
          icon={TrendingUp}
          tone="brand"
        />
      </div>

      <Card className="mb-5">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: `Semua (${orders.length})` },
            { value: 'pending', label: `Menunggu (${pending.length})` },
            { value: 'verified', label: `Terverifikasi (${verified.length})` },
            { value: 'rejected', label: `Ditolak (${rejected.length})` },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === tab.value
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#F5F5F7] text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      <Card padded={false}>
        {displayed.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Tidak ada pembayaran"
            description="Belum ada pembayaran pada filter ini."
          />
        ) : (
          <div className="p-5">
            <Table
              columns={[
                { key: 'payment', label: 'No. Pembayaran' },
                { key: 'customer', label: 'Customer' },
                { key: 'order', label: 'Pesanan' },
                { key: 'amount', label: 'Nominal', align: 'right' },
                { key: 'status', label: 'Status' },
                { key: 'action', label: '', align: 'right' },
              ]}
            >
              {displayed.map((order) => (
                <Tr key={order.id}>
                  <Td>
                    <span className="font-mono text-[11px] block">{order.payment.paymentNumber}</span>
                    <span className="text-[10px] text-gray-400">{formatDateTime(order.payment.createdAt)}</span>
                  </Td>
                  <Td>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-[10px] text-gray-400">Pengirim: {order.payment.senderName}</p>
                  </Td>
                  <Td>
                    <span className="font-mono text-[11px]">{order.orderNumber}</span>
                    <span className="block text-[10px] text-gray-400">{(order.items || [])[0]?.modelName}</span>
                  </Td>
                  <Td align="right">
                    <span className="font-semibold">{formatRupiah(order.payment.amount)}</span>
                  </Td>
                  <Td>
                    <PaymentStatusBadge status={order.payment.status} size="xs" />
                  </Td>
                  <Td align="right">
                    <Button
                      variant={order.payment.status === PAYMENT_STATUS.PENDING ? 'primary' : 'secondary'}
                      className="text-[10px] px-3 py-1.5"
                      onClick={() => {
                        setSelected(order);
                        setNotes('');
                      }}
                    >
                      <Eye size={11} className="inline mr-1" />
                      {order.payment.status === PAYMENT_STATUS.PENDING ? 'Tinjau' : 'Lihat'}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Table>
          </div>
        )}
      </Card>

      {/* Modal tinjau bukti */}
      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        size="md"
        title="Tinjau Bukti Pembayaran"
        subtitle={selected?.payment?.paymentNumber}
        footer={
          selected?.payment?.status === PAYMENT_STATUS.PENDING ? (
            <>
              <Button
                variant="danger"
                className="text-xs flex items-center gap-2"
                disabled={processing}
                onClick={() => handleVerify(PAYMENT_STATUS.REJECTED)}
              >
                <XCircle size={13} /> Tolak
              </Button>
              <Button
                variant="primary"
                className="text-xs flex items-center gap-2"
                disabled={processing}
                onClick={() => handleVerify(PAYMENT_STATUS.VERIFIED)}
              >
                <CheckCircle2 size={13} /> Verifikasi
              </Button>
            </>
          ) : (
            <Button variant="secondary" className="text-xs" onClick={() => setSelected(null)}>
              Tutup
            </Button>
          )
        }
      >
        {selected && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Bukti Transfer</p>
              <img
                src={selected.payment.proofImageUrl}
                alt="Bukti transfer"
                className="w-full rounded-xl border border-gray-100 object-contain max-h-80"
              />
            </div>

            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Data Transfer</p>
              <div className="divide-y divide-gray-50">
                <InfoRow label="Nominal Tagihan" value={formatRupiah(selected.grandTotal)} strong />
                <InfoRow label="Nominal Transfer" value={formatRupiah(selected.payment.amount)} strong />
                <InfoRow
                  label="Selisih"
                  value={formatRupiah(selected.payment.amount - selected.grandTotal)}
                  valueClass={
                    selected.payment.amount === selected.grandTotal ? 'text-emerald-600' : 'text-rose-600'
                  }
                />
                <InfoRow label="Metode" value={selected.payment.paymentMethod} />
                <InfoRow label="Nama Pengirim" value={selected.payment.senderName} />
                <InfoRow label="Pesanan" value={<span className="font-mono">{selected.orderNumber}</span>} />
                <InfoRow label="Customer" value={selected.customerName} />
              </div>

              {selected.payment.status === PAYMENT_STATUS.PENDING && (
                <Field label="Catatan Verifikasi" className="mt-4" required>
                  <TextArea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Dana mutasi masuk Rp 2.250.000 sesuai tagihan"
                  />
                </Field>
              )}

              {selected.payment.verifiedBy && (
                <Alert tone="info" className="mt-3">
                  Diverifikasi oleh {selected.payment.verifiedBy} pada{' '}
                  {formatDateTime(selected.payment.verifiedAt)}
                </Alert>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPaymentsPage;