/**
 * BOOKING PAGE — form pemesanan dengan pilihan metode pengambilan (PRD 10.2 #5).
 * Mengunci harga dari backend (mock), lalu membuat order baru.
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Truck, Info, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Alert, Card, EmptyState, Field, Input, LoadingBlock, Pill, TextArea } from '../../components/ui';
import { PriceSummary } from '../../components/shared';
import { rentalApi } from '../../api/rentalApi';
import { catalogApi } from '../../api/catalogApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useDocumentTitle } from '../../hooks';
import { DELIVERY_TYPE, STORAGE_KEYS } from '../../constants';
import { formatRupiah } from '../../utils/formatter';
import { onImageError } from '../../utils/imageHelpers';
import { checkUnitAvailability } from '../../api/availabilityEngine';

export const BookingPage = () => {
  useDocumentTitle('Konfirmasi Pemesanan');
  const notify = useNotification();
  const navigate = useNavigate();

  const [draft, setDraft] = useState(null);
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [deliveryType, setDeliveryType] = useState(DELIVERY_TYPE.STORE_PICKUP);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.draftBooking);
    if (!raw) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(raw);
    setDraft(parsed);

    // Ambil ulang harga dari "server" (jangan percaya nominal dari klien)
    catalogApi
      .calculatePrice({
        variantId: parsed.variantId,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
      })
      .then((res) => setDraft((prev) => ({ ...prev, pricing: res.data })))
      .catch(() => {});

    catalogApi.variant(parsed.variantId).then((res) => setVariant(res.data)).catch(() => {});
    setLoading(false);
  }, []);

  const availability = draft?.variantId
    ? checkUnitAvailability(draft.variantId, draft.startDate, draft.endDate)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const res = await rentalApi.create({
        variantId: draft.variantId,
        startDate: draft.startDate,
        endDate: draft.endDate,
        deliveryType,
        notes,
      });

      localStorage.removeItem(STORAGE_KEYS.draftBooking);
      notify.success(`Pesanan ${res.data.orderNumber} berhasil dibuat!`);

      // Lanjut ke upload bukti pembayaran
      navigate(`/pembayaran/${res.data.id}`);
    } catch (err) {
      notify.error(err.message || 'Gagal membuat pesanan');
      if (err.status === 409) {
        setErrors({ submit: err.message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12">
        <LoadingBlock label="Menyiapkan pemesanan..." />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12">
        <Card>
          <EmptyState
            title="Belum ada unit yang dipilih"
            description="Silakan pilih iPhone dari katalog dan tentukan tanggal sewa terlebih dahulu."
            action={
              <Link to="/katalog">
                <Button variant="primary" className="text-xs">Buka Katalog</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
      <Link to={`/iphone/${variant?.slug || ''}?variant=${draft.variantId}`} className="text-xs text-gray-500 hover:text-[#0071E3] inline-flex items-center gap-1.5 mb-6">
        <ArrowLeft size={13} /> Ubah pilihan
      </Link>

      <div className="mb-6">
        <p className="text-xs text-gray-500">Langkah 1 dari 3</p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] tracking-tight mt-1">
          Konfirmasi Pemesanan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Periksa detail pesanan Anda sebelum melanjutkan ke pembayaran.
        </p>
      </div>

      {!isAuthenticated && (
        <Alert tone="warning" className="mb-5" title="Anda belum masuk">
          Anda perlu masuk atau mendaftar untuk menyelesaikan pemesanan.{' '}
          <Link to="/login" className="font-semibold underline">
            Masuk sekarang
          </Link>
        </Alert>
      )}

      {errors.submit && (
        <Alert tone="danger" className="mb-5" title="Unit tidak tersedia">
          {errors.submit}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-5">
          {/* Detail unit */}
          <Card>
            <p className="text-sm font-semibold text-[#1D1D1F] mb-4">Unit yang Disewa</p>
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={variant?.primaryImage}
                  alt={draft.modelName}
                  onError={(e) => onImageError(e, draft.modelName)}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1D1D1F]">{draft.modelName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {draft.storageCapacity} · {draft.colorName}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Pill tone="neutral" size="xs">
                    {draft.pricing?.totalDays} hari
                  </Pill>
                  <Pill tone={availability?.availableCount > 0 ? 'success' : 'danger'} size="xs">
                    {availability?.availableCount > 0
                      ? `${availability.availableCount} unit tersedia`
                      : 'Tidak tersedia'}
                  </Pill>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-50">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Mulai Sewa</p>
                <p className="text-xs font-semibold text-[#1D1D1F] mt-1">{draft.startDate}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Selesai Sewa</p>
                <p className="text-xs font-semibold text-[#1D1D1F] mt-1">{draft.endDate}</p>
              </div>
            </div>
          </Card>

          {/* Metode pengambilan */}
          <Card>
            <p className="text-sm font-semibold text-[#1D1D1F] mb-4">Metode Pengambilan</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType(DELIVERY_TYPE.STORE_PICKUP)}
                className={`p-4 rounded-2xl border-2 text-left transition-colors ${
                  deliveryType === DELIVERY_TYPE.STORE_PICKUP
                    ? 'border-[#0071E3] bg-[#E8F2FD]/40'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <Store size={20} className={deliveryType === DELIVERY_TYPE.STORE_PICKUP ? 'text-[#0071E3]' : 'text-gray-400'} />
                <p className="text-xs font-semibold text-[#1D1D1F] mt-2">Ambil di Toko</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Jakarta Thamrin · tanpa biaya kirim
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType(DELIVERY_TYPE.COURIER_DELIVERY)}
                className={`p-4 rounded-2xl border-2 text-left transition-colors ${
                  deliveryType === DELIVERY_TYPE.COURIER_DELIVERY
                    ? 'border-[#0071E3] bg-[#E8F2FD]/40'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <Truck size={20} className={deliveryType === DELIVERY_TYPE.COURIER_DELIVERY ? 'text-[#0071E3]' : 'text-gray-400'} />
                <p className="text-xs font-semibold text-[#1D1D1F] mt-2">Diantar Kurir</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Area Jabodetabek · konfirmasi via admin
                </p>
              </button>
            </div>

            {deliveryType === DELIVERY_TYPE.COURIER_DELIVERY && (
              <Alert tone="info" className="mt-4">
                Tim kami akan menghubungi Anda untuk konfirmasi alamat dan jadwal pengiriman setelah
                pembayaran diverifikasi.
              </Alert>
            )}
          </Card>

          {/* Catatan */}
          <Card>
            <Field
              label="Catatan Tambahan (opsional)"
              hint="Contoh: mohon siapkan unit dengan kondisi terbaik, ambil jam 10 pagi."
            >
              <TextArea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                placeholder="Tuliskan permintaan khusus Anda di sini..."
              />
            </Field>
          </Card>

          {/* Info penting */}
          <Card>
            <p className="text-sm font-semibold text-[#1D1D1F] mb-3 flex items-center gap-2">
              <Info size={15} className="text-[#0071E3]" /> Hal yang perlu diperhatikan
            </p>
            <ul className="space-y-2 text-[11px] text-gray-600">
              <li className="flex gap-2">
                <span className="text-[#0071E3]">•</span>
                Identitas (KTP & selfie) wajib sudah diverifikasi sebelum unit diserahkan.
              </li>
              <li className="flex gap-2">
                <span className="text-[#0071E3]">•</span>
                Deposit dikembalikan penuh jika unit kembali dalam kondisi baik.
              </li>
              <li className="flex gap-2">
                <span className="text-[#0071E3]">•</span>
                Keterlambatan pengembalian dikenakan denda sesuai ketentuan (grace period 2 jam).
              </li>
              <li className="flex gap-2">
                <span className="text-[#0071E3]">•</span>
                Unit akan diinspeksi bersama saat serah terima dan pengembalian.
              </li>
            </ul>
          </Card>
        </div>

        {/* Ringkasan */}
        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          {draft.pricing && <PriceSummary pricing={draft.pricing} />}

          <Card>
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 flex items-center justify-center gap-2"
              disabled={submitting || (availability && availability.availableCount <= 0)}
            >
              {submitting ? 'Membuat pesanan...' : 'Buat Pesanan'}
            </Button>
            <p className="text-[10px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1.5">
              <ShieldCheck size={11} className="text-[#0071E3]" />
              Pesanan dibuat dengan penguncian slot unit anti double-booking
            </p>
          </Card>

          <Alert tone="info">
            Setelah pesanan dibuat, Anda akan diarahkan ke halaman pembayaran untuk mengunggah bukti
            transfer sebesar {formatRupiah(draft.pricing?.grandTotal || 0)}.
          </Alert>
        </aside>
      </form>
    </div>
  );
};

export default BookingPage;