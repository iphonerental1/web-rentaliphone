/**
 * MANAJEMEN BOOKING & TRANSAKSI WA (/admin/bookings)
 * - Input booking manual dari chat WhatsApp (tanggal, varian, bukti transfer)
 * - Alur status: APPROVED -> PAID -> ACTIVE_RENTAL -> COMPLETED
 * - Aksi sinkron dengan status unit fisik (anti double-booking)
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarRange,
  CheckCircle2,
  Eye,
  Loader2,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import {
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
  SkeletonTable,
  Table,
} from '../../components/ui';
import { Button } from '../../components/common/Button';
import { OrderStatusBadge, PaymentStatusBadge, OrderTimeline, UnitInfoCard } from '../../components/shared';
import { adminApi } from '../../api/adminApi';
import { catalogApi } from '../../api/catalogApi';
import { ORDER_STATUS, ORDER_STATUS_META, UNIT_STATUS } from '../../constants';
import { formatDateShort, formatRupiah } from '../../utils/formatter';
import { calculateRentalPrice } from '../../utils/pricingEngine';
import { useDocumentTitle } from '../../hooks';

const STATUS_FILTERS = [
  { value: '', label: 'Semua Status' },
  { value: ORDER_STATUS.PENDING, label: 'Menunggu Konfirmasi' },
  { value: ORDER_STATUS.APPROVED, label: 'Disetujui' },
  { value: ORDER_STATUS.PAID, label: 'Lunas' },
  { value: ORDER_STATUS.ACTIVE_RENTAL, label: 'Sedang Disewa' },
  { value: ORDER_STATUS.COMPLETED, label: 'Selesai' },
  { value: ORDER_STATUS.CANCELLED, label: 'Dibatalkan' },
];

const emptyForm = {
  customerName: '',
  customerPhone: '',
  customerNik: '',
  variantId: '',
  startDate: '',
  endDate: '',
  initialStatus: ORDER_STATUS.PENDING,
  notes: '',
};

export const AdminBookingsPage = () => {
  useDocumentTitle('Kelola Booking — Admin');
  const [bookings, setBookings] = useState([]);
  const [variants, setVariants] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [proofImage, setProofImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [detail, setDetail] = useState(null);
  const [busyAction, setBusyAction] = useState(false);
  const [toast, setToast] = useState('');

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const [b, u] = await Promise.all([
      adminApi.listBookings({ status: statusFilter, search }),
      adminApi.listUnits({}),
    ]);
    setBookings(b.data);
    setUnits(u.data);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  useEffect(() => {
    catalogApi.list({ limit: 500 }).then((res) => setVariants(res.data));
  }, []);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // Preview harga sewa (kalkulasi sama dengan kalkulator publik)
  const pricingPreview = useMemo(() => {
    const v = variants.find((x) => x.id === form.variantId);
    if (!v || !form.startDate || !form.endDate) return null;
    return calculateRentalPrice(v, form.startDate, form.endDate);
  }, [variants, form.variantId, form.startDate, form.endDate]);

  const onPickProof = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProofImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const res = await adminApi.createBooking({ ...form, proofImage });
      setShowCreate(false);
      setForm(emptyForm);
      setProofImage(null);
      flash(res.message);
      load();
    } catch (err) {
      setFormError(err?.message || 'Gagal menyimpan booking');
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (fn, successMsg) => {
    setBusyAction(true);
    try {
      const res = await fn();
      flash(successMsg || res.message);
      // Muat ulang data detail agar aksi berikutnya konsisten
      const fresh = await adminApi.listBookings({ status: statusFilter, search });
      setBookings(fresh.data);
      setDetail((d) => (d ? fresh.data.find((o) => o.id === d.id) || null : null));
    } catch (err) {
      flash(err?.message || 'Aksi gagal');
    } finally {
      setBusyAction(false);
    }
  };

  const detailUnit = detail ? units.find((u) => u.id === detail.items?.[0]?.allocatedUnitId) : null;

  const canVerify = detail &&
    [ORDER_STATUS.APPROVED, ORDER_STATUS.AWAITING_PAYMENT, ORDER_STATUS.PENDING].includes(detail.orderStatus);
  const canActivate = detail && [ORDER_STATUS.PAID, ORDER_STATUS.PREPARING, ORDER_STATUS.READY_FOR_PICKUP].includes(detail.orderStatus);
  const canComplete = detail &&
    [ORDER_STATUS.ACTIVE_RENTAL, ORDER_STATUS.OVERDUE, ORDER_STATUS.RETURNED, ORDER_STATUS.INSPECTION_PENDING].includes(detail.orderStatus);
  const canCancel = detail &&
    ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(detail.orderStatus);

  return (
    <div className="space-y-5">
      {/* HEADER + FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#1D1D1F]">Booking &amp; Transaksi</h1>
          <p className="text-xs text-gray-500">
            Catat kesepakatan dari WhatsApp, verifikasi transfer, dan kontrol siklus sewa.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 self-start"
        >
          <Plus size={15} /> Input Booking Baru
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no. order, nama, atau nomor WA..."
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-56">
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>

        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="Belum ada booking"
            description="Klik “Input Booking Baru” untuk mencatat pesanan dari WhatsApp."
          />
        ) : (
          <Table
            columns={[
              { key: 'order', label: 'Order' },
              { key: 'customer', label: 'Pelanggan' },
              { key: 'unit', label: 'Unit' },
              { key: 'period', label: 'Periode Sewa' },
              { key: 'total', label: 'Total', align: 'right' },
              { key: 'status', label: 'Status' },
              { key: 'action', label: '', align: 'right' },
            ]}
          >
            {bookings.map((o) => {
              const item = (o.items || [])[0] || {};
              return (
                <tr key={o.id} className="hover:bg-[#F9F9FB] transition-colors">
                  <td className="px-3 py-3">
                    <p className="text-xs font-mono text-[#1D1D1F] font-semibold">{o.orderNumber}</p>
                    <p className="text-[10px] text-gray-400">{formatDateShort(o.createdAt)}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-xs font-medium text-[#1D1D1F]">{o.customerName}</p>
                    <p className="text-[10px] text-gray-500">{o.customerPhone}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-xs text-[#1D1D1F]">{item.modelName || '-'}</p>
                    <p className="text-[10px] text-gray-500">
                      {item.storageCapacity} · {item.colorName}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-[11px] text-gray-600 whitespace-nowrap">
                    {formatDateShort(o.startDate)} — {formatDateShort(o.endDate)}
                    <span className="text-gray-400"> · {o.totalDays}h</span>
                  </td>
                  <td className="px-3 py-3 text-xs font-bold text-[#0071E3] text-right whitespace-nowrap">
                    {formatRupiah(o.grandTotal)}
                  </td>
                  <td className="px-3 py-3">
                    <OrderStatusBadge status={o.orderStatus} size="xs" />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDetail(o)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#0071E3] hover:bg-[#0071E3]/10 transition-colors"
                      title="Lihat detail & aksi"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1D1D1F] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-[slideUp_.3s_ease-out]">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          {toast}
          <style>{`@keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        </div>
      )}

      {/* MODAL INPUT BOOKING */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Input Booking Baru"
        subtitle="Pencatatan manual hasil kesepakatan chat WhatsApp"
        size="md"
      >
        <form onSubmit={onCreate} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="bk-name">
                Nama Penyewa *
              </label>
              <Input id="bk-name" value={form.customerName} onChange={(e) => setField('customerName', e.target.value)} placeholder="Contoh: Budi Santoso" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="bk-phone">
                Nomor WhatsApp *
              </label>
              <Input id="bk-phone" value={form.customerPhone} onChange={(e) => setField('customerPhone', e.target.value)} placeholder="0812-xxxx-xxxx" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="bk-nik">
                NIK / Jaminan
              </label>
              <Input id="bk-nik" value={form.customerNik} onChange={(e) => setField('customerNik', e.target.value)} placeholder="NIK KTP atau tanda pengenal" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="bk-variant">
                Unit yang Disewa *
              </label>
              <Select id="bk-variant" value={form.variantId} onChange={(e) => setField('variantId', e.target.value)} required>
                <option value="">— Pilih varian —</option>
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.modelName} · {v.storageCapacity} · {v.colorName} ({formatRupiah(v.dailyRate)}/hari)
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="bk-start">
                Mulai Sewa *
              </label>
              <Input id="bk-start" type="date" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="bk-end">
                Selesai Sewa *
              </label>
              <Input id="bk-end" type="date" value={form.endDate} onChange={(e) => setField('endDate', e.target.value)} required={!!form.startDate} min={form.startDate || undefined} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="bk-status">
                Status Awal
              </label>
              <Select id="bk-status" value={form.initialStatus} onChange={(e) => setField('initialStatus', e.target.value)}>
                <option value={ORDER_STATUS.PENDING}>Menunggu Konfirmasi</option>
                <option value={ORDER_STATUS.APPROVED}>Disetujui</option>
                <option value={ORDER_STATUS.ACTIVE_RENTAL}>Langsung Aktif (unit diserahkan)</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="bk-proof">
                Foto Bukti Transfer (opsional)
              </label>
              <Input id="bk-proof" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onPickProof(e.target.files?.[0])} className="text-xs" />
              {proofImage && (
                <img src={proofImage} alt="Bukti transfer" className="mt-2 h-14 rounded-lg border border-gray-100 object-cover" />
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="bk-notes">
              Catatan
            </label>
            <textarea
              id="bk-notes"
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              rows={2}
              placeholder="Contoh: ambil jam 4 sore, jaminan KTP"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0071E3]/40"
            />
          </div>

          {/* ESTIMASI HARGA OTOMATIS SESUAI FRONTEND */}
          {pricingPreview && (
            <div className="rounded-2xl bg-[#F7FAFF] border border-[#0071E3]/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs pb-1.5 border-b border-blue-100">
                <span className="text-gray-500">
                  Total Sewa ({pricingPreview.totalDays} hari · {pricingPreview.tier.toLowerCase()})
                </span>
                <span className="font-bold text-[#1D1D1F]">{formatRupiah(pricingPreview.rentalFee)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#0071E3] font-bold">
                <span>Wajib DP (30%)</span>
                <span>{formatRupiah(pricingPreview.dpAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Pelunasan Saat Serah Terima</span>
                <span>{formatRupiah(pricingPreview.remainingPayment)}</span>
              </div>
              <div className="pt-2 border-t border-blue-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#1D1D1F]">Total Biaya Sewa</span>
                <span className="text-base font-bold text-[#0071E3]">{formatRupiah(pricingPreview.grandTotal)}</span>
              </div>
            </div>
          )}

          {formError && <p className="text-xs text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{formError}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving} className="flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              Simpan Booking
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL DETAIL & AKSI BOOKING */}
      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.orderNumber}` : 'Detail Booking'}
        subtitle={detail ? `${detail.customerName} · ${detail.customerPhone}` : ''}
        size="lg"
        footer={
          detail && (
            <div className="flex flex-wrap items-center justify-end gap-2 w-full">
              {canVerify && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busyAction}
                  onClick={() => runAction(() => adminApi.verifyPayment(detail.id))}
                >
                  Verifikasi Pembayaran
                </Button>
              )}
              {canActivate && (
                <Button
                  type="button"
                  disabled={busyAction}
                  onClick={() => runAction(() => adminApi.updateBookingStatus(detail.id, ORDER_STATUS.ACTIVE_RENTAL))}
                >
                  Serah Terima Unit
                </Button>
              )}
              {canComplete && (
                <Button
                  type="button"
                  disabled={busyAction}
                  onClick={() => runAction(() => adminApi.completeBooking(detail.id))}
                >
                  Proses Pengembalian
                </Button>
              )}
              {canCancel && (
                <Button
                  type="button"
                  variant="danger"
                  disabled={busyAction}
                  onClick={() =>
                    runAction(() => adminApi.updateBookingStatus(detail.id, ORDER_STATUS.CANCELLED))
                  }
                >
                  Batalkan
                </Button>
              )}
            </div>
          )
        }
      >
        {detail && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={detail.orderStatus} />
              <PaymentStatusBadge status={detail.payment?.status} />
              <span className="text-[11px] text-gray-400">Sumber: {detail.source || 'WHATSAPP'}</span>
            </div>

            <OrderTimeline order={detail} compact />

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-gray-100 p-4 space-y-2">
                <p className="text-xs font-bold text-[#1D1D1F] mb-1">Rincian Sewa</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Unit</span>
                  <span className="font-medium text-[#1D1D1F] text-right">
                    {(detail.items || [])[0]?.modelName}
                    <br />
                    {(detail.items || [])[0]?.storageCapacity} · {(detail.items || [])[0]?.colorName}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Periode</span>
                  <span className="font-medium text-[#1D1D1F] text-right">
                    {formatDateShort(detail.startDate)} — {formatDateShort(detail.endDate)} ({detail.totalDays} hari)
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Biaya Sewa</span>
                  <span className="font-medium text-[#1D1D1F]">{formatRupiah(detail.rentalFee)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#0071E3] font-semibold">
                  <span>Wajib DP (30%)</span>
                  <span>{formatRupiah(detail.dpAmount || Math.round((detail.rentalFee || 0) * 0.3))}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Pelunasan Serah Terima</span>
                  <span>{formatRupiah(detail.remainingPayment || ((detail.rentalFee || 0) - Math.round((detail.rentalFee || 0) * 0.3)))}</span>
                </div>
                {(detail.fines || []).length > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Denda</span>
                    <span className="font-medium text-rose-600">
                      - {formatRupiah(detail.fines.reduce((s, f) => s + (f.amount || 0), 0))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs pt-2 border-t border-gray-50">
                  <span className="font-bold text-[#1D1D1F]">Grand Total</span>
                  <span className="font-bold text-[#0071E3]">{formatRupiah(detail.grandTotal)}</span>
                </div>
                {detail.notes && <p className="text-[11px] text-gray-400 pt-1">📝 {detail.notes}</p>}
              </div>

              <div className="rounded-2xl border border-gray-100 p-4 space-y-3">
                <p className="text-xs font-bold text-[#1D1D1F]">Pembayaran &amp; Unit</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Metode</span>
                  <span className="font-medium text-[#1D1D1F]">{detail.payment?.method || '-'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">No. Rekening</span>
                  <span className="font-medium text-[#1D1D1F] text-right">{detail.payment?.bankAccount || '-'}</span>
                </div>
                {detail.payment?.proofImage ? (
                  <div>
                    <p className="text-[11px] text-gray-500 mb-1">Bukti transfer:</p>
                    <img
                      src={detail.payment.proofImage}
                      alt="Bukti transfer"
                      className="h-28 rounded-xl border border-gray-100 object-cover"
                    />
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400">Belum ada bukti transfer terlampir.</p>
                )}
                {detailUnit ? (
                  <div className="pt-2 border-t border-gray-50">
                    <UnitInfoCard unit={detailUnit} className="border-0 shadow-none p-0" />
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-50">
                    Unit fisik belum dialokasikan.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminBookingsPage;
