/**
 * DETAIL iPHONE PAGE — galeri, spesifikasi, pemilih varian, dan
 * kalkulator sewa interaktif dengan Checkout Langsung ke WhatsApp.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Cpu,
  Camera,
  Monitor,
  Calendar,
  Shield,
  CheckCircle2,
  AlertCircle,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import {
  Alert,
  Card,
  ErrorState,
  Field,
  Input,
  LoadingBlock,
  Pill,
} from '../../components/ui';
import { catalogApi } from '../../api/catalogApi';
import { formatRupiah, toInputDate, diffInDays } from '../../utils/formatter';
import { onImageError } from '../../utils/imageHelpers';
import { useDocumentTitle } from '../../hooks';

// Data penyesuaian harga logis pasaran rental Magelang
const MAGELANG_PRICE_LIST = {
  'iphone-11': { daily: 70000, weekly: 380000, monthly: 1100000 },
  'iphone-11-pro': { daily: 95000, weekly: 500000, monthly: 1450000 },
  'iphone-11-pro-max': { daily: 115000, weekly: 600000, monthly: 1750000 },
  'iphone-12': { daily: 100000, weekly: 550000, monthly: 1600000 },
  'iphone-12-pro': { daily: 130000, weekly: 700000, monthly: 2000000 },
  'iphone-12-pro-max': { daily: 150000, weekly: 800000, monthly: 2350000 },
  'iphone-13': { daily: 140000, weekly: 750000, monthly: 2200000 },
  'iphone-13-pro': { daily: 180000, weekly: 980000, monthly: 2800000 },
  'iphone-13-pro-max': { daily: 210000, weekly: 1150000, monthly: 3300000 },
  'iphone-14': { daily: 180000, weekly: 950000, monthly: 2750000 },
  'iphone-14-pro': { daily: 230000, weekly: 1250000, monthly: 3600000 },
  'iphone-14-pro-max': { daily: 260000, weekly: 1400000, monthly: 4000000 },
  'iphone-15': { daily: 230000, weekly: 1200000, monthly: 3500000 },
  'iphone-15-pro': { daily: 300000, weekly: 1650000, monthly: 4800000 },
  'iphone-15-pro-max': { daily: 350000, weekly: 1900000, monthly: 5500000 },
};

export const IphoneDetailPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(searchParams.get('variant') || '');
  const [activeImage, setActiveImage] = useState(0);

  // Tanggal default: Hari ini dan Besok
  const today = toInputDate(new Date());
  const tomorrow = toInputDate(new Date(Date.now() + 86400000));
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);

  useDocumentTitle(model?.modelName || 'Detail iPhone');

  useEffect(() => {
    setLoading(true);
    setError(null);
    catalogApi
      .detail(slug)
      .then((res) => {
        const localRates = MAGELANG_PRICE_LIST[slug] || {
          daily: 150000,
          weekly: 800000,
          monthly: 2300000,
        };

        const updatedVariants = (res.data.variants || []).map((v) => {
          let storageMultiplier = 1;
          if (v.storageCapacity?.includes('256GB')) storageMultiplier = 1.15;
          if (v.storageCapacity?.includes('512GB')) storageMultiplier = 1.35;
          if (v.storageCapacity?.includes('1TB')) storageMultiplier = 1.6;

          return {
            ...v,
            availableUnits: v.availableUnits && v.availableUnits > 0 ? v.availableUnits : 5,
            dailyRate: Math.round(localRates.daily * storageMultiplier),
            weeklyRate: Math.round(localRates.weekly * storageMultiplier),
            monthlyRate: Math.round(localRates.monthly * storageMultiplier),
          };
        });

        const updatedData = {
          ...res.data,
          variants: updatedVariants,
        };

        setModel(updatedData);
        setSelectedVariantId((prev) => prev || updatedVariants[0]?.id || '');
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [slug]);

  const selectedVariant = useMemo(
    () => model?.variants?.find((v) => v.id === selectedVariantId),
    [model, selectedVariantId]
  );

  // Kalkulasi harga otomatis real-time
  const pricing = useMemo(() => {
    if (!selectedVariant || !startDate || !endDate) return null;
    const days = diffInDays(startDate, endDate);
    if (days <= 0) return null;

    let tier = 'HARIAN';
    let subtotal = 0;

    if (days >= 30) {
      tier = 'BULANAN';
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      subtotal = months * selectedVariant.monthlyRate + remainingDays * (selectedVariant.monthlyRate / 30);
    } else if (days >= 7) {
      tier = 'MINGGUAN';
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      subtotal = weeks * selectedVariant.weeklyRate + remainingDays * (selectedVariant.weeklyRate / 7);
    } else {
      subtotal = days * selectedVariant.dailyRate;
    }

    subtotal = Math.round(subtotal);
    const dpAmount = Math.round(subtotal * 0.3); // DP 30%
    const remainingPayment = subtotal - dpAmount;

    return {
      durationDays: days,
      tier,
      dailyRate: selectedVariant.dailyRate,
      subtotal,
      dpAmount,
      remainingPayment,
      total: subtotal,
    };
  }, [selectedVariant, startDate, endDate]);

  const gallery = selectedVariant?.images || [];

  // Fungsi untuk mengarahkan langsung ke WhatsApp dengan pesan terisi otomatis
  const handleCheckoutWhatsApp = () => {
    if (!selectedVariant || !pricing || !model) return;

    const phoneNumber = '6281225188023'; // Nomor WA tujuan dalam format internasional
    
    // Format teks pemesanan
    const message = 
`Halo iRent, saya ingin melakukan pemesanan sewa iPhone.

📋 *FORM PEMESANAN SEWA iPHONE*
• *Nama Penyewa:* [Isi Nama Lengkap]
• *Perangkat:* ${model.modelName}
• *Varian:* ${selectedVariant.storageCapacity} - ${selectedVariant.colorName}

🗓 *DURASI SEWA*
• *Tanggal Mulai:* ${startDate}
• *Tanggal Selesai:* ${endDate}
• *Total Durasi:* ${pricing.durationDays} Hari (${pricing.tier})

💰 *RINCIAN BIAYA*
• *Total Sewa:* ${formatRupiah(pricing.total)}
• *Wajib DP (30%):* ${formatRupiah(pricing.dpAmount)}
• *Sisa Pelunasan:* ${formatRupiah(pricing.remainingPayment)}

⚠️ *Ketentuan DP:* Saya memahami bahwa DP wajib dilunasi dalam 1x24 jam, dan jika melewati batas waktu tersebut DP akan hangus.

Mohon diproses untuk ketersediaan unit dan petunjuk pembayaran DP. Terima kasih!`;

    // Encode string agar aman digunakan dalam URL WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Buka WhatsApp di tab/aplikasi baru
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="max-w-container mx-auto px-5 sm:px-6 py-12">
        <LoadingBlock label="Memuat detail perangkat..." />
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="max-w-container mx-auto px-5 sm:px-6 py-12">
        <Card>
          <ErrorState message={error?.message || 'Model tidak ditemukan'} />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-container mx-auto px-5 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate('/katalog')}
        className="text-xs text-gray-500 hover:text-[#0071E3] flex items-center gap-1.5 mb-6"
      >
        <ArrowLeft size={13} /> Kembali ke Katalog
      </button>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* ── KIRI: GALERI + SPESIFIKASI ── */}
        <div className="space-y-6">
          <Card padded={false} className="overflow-hidden">
            <div className="bg-[#F5F5F7] aspect-square sm:aspect-[4/3] flex items-center justify-center p-8">
              <img
                src={gallery[activeImage]?.imageUrl || selectedVariant?.primaryImage}
                alt={model.modelName}
                onError={(e) =>
                  onImageError(e, model.modelName, gallery[activeImage]?.fallback)
                }
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-3 p-4 border-t border-gray-100">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-colors ${
                      activeImage === idx ? 'border-[#0071E3]' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={`Tampilan ${idx + 1}`}
                      onError={(e) => onImageError(e, model.modelName, img.fallback)}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Header model */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {model.badge && <Pill tone="brand" size="xs">{model.badge}</Pill>}
              <Pill tone="neutral" size="xs">{model.releaseYear}</Pill>
              <Pill tone="success" size="xs">
                Tersedia ({selectedVariant?.availableUnits ?? 5} unit)
              </Pill>
              <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                <MapPin size={12} className="text-[#0071E3]" /> Area Magelang & Sekitarnya
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] tracking-tight">
              {model.modelName}
            </h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{model.description}</p>
          </div>

          {/* Spesifikasi */}
          <Card>
            <p className="text-sm font-semibold text-[#1D1D1F] mb-4">Spesifikasi Teknis</p>
            <div className="grid sm:grid-cols-3 gap-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F2FD] flex items-center justify-center shrink-0">
                  <Monitor size={16} className="text-[#0071E3]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Layar</p>
                  <p className="text-xs font-semibold text-[#1D1D1F] mt-0.5">{model.screenSize}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F2FD] flex items-center justify-center shrink-0">
                  <Cpu size={16} className="text-[#0071E3]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Chipset</p>
                  <p className="text-xs font-semibold text-[#1D1D1F] mt-0.5">{model.processor}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F2FD] flex items-center justify-center shrink-0">
                  <Camera size={16} className="text-[#0071E3]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Kamera</p>
                  <p className="text-xs font-semibold text-[#1D1D1F] mt-0.5">{model.cameraSpecs}</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span className="text-[11px] text-gray-600">Garansi unit original & tersegel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span className="text-[11px] text-gray-600">Battery Health terverifikasi (≥85%)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span className="text-[11px] text-gray-600">Inspeksi 12 titik sebelum diserahkan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span className="text-[11px] text-gray-600">Aksesori lengkap (kabel & adaptor)</span>
              </div>
            </div>
          </Card>

          {/* Tabel tier harga pasaran Magelang */}
          <Card>
            <p className="text-sm font-semibold text-[#1D1D1F] mb-4">
              Tarif Sewa (Pasaran Area Magelang)
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-[#F5F5F7] p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Harian</p>
                <p className="text-lg font-bold text-[#1D1D1F] mt-1">
                  {formatRupiah(selectedVariant?.dailyRate || 0)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">1–6 hari</p>
              </div>
              <div className="rounded-2xl bg-[#E8F2FD] border border-blue-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-[#0071E3] uppercase tracking-wide font-bold">Mingguan</p>
                  <Shield size={12} className="text-[#0071E3]" />
                </div>
                <p className="text-lg font-bold text-[#0071E3] mt-1">
                  {formatRupiah(selectedVariant?.weeklyRate || 0)}
                </p>
                <p className="text-[10px] text-[#0071E3]/70 mt-0.5">7–29 hari · lebih hemat</p>
              </div>
              <div className="rounded-2xl bg-[#F5F5F7] p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Bulanan</p>
                <p className="text-lg font-bold text-[#1D1D1F] mt-1">
                  {formatRupiah(selectedVariant?.monthlyRate || 0)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">≥ 30 hari</p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── KANAN: KALKULATOR OTOMATIS STICKY ── */}
        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <Card>
            <p className="text-sm font-semibold text-[#1D1D1F] mb-4">Pilih Varian Barang</p>

            {/* List Varian */}
            <div className="space-y-2 mb-5">
              {model.variants.map((v) => {
                const isSelected = v.id === selectedVariantId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border-2 transition-colors text-left ${
                      isSelected ? 'border-[#0071E3] bg-[#E8F2FD]/40' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#1D1D1F]">
                        {v.storageCapacity} · {v.colorName}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {formatRupiah(v.dailyRate)}/hari
                      </p>
                    </div>
                    <Pill tone="success" size="xs">
                      Tersedia
                    </Pill>
                  </button>
                );
              })}
            </div>

            {/* Input Tanggal */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <Field label="Tanggal Mulai Sewa">
                <Input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (new Date(endDate) <= new Date(e.target.value)) {
                      const next = new Date(e.target.value);
                      next.setDate(next.getDate() + 1);
                      setEndDate(toInputDate(next));
                    }
                  }}
                />
              </Field>

              <Field label="Tanggal Selesai Sewa">
                <Input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Field>

              {pricing && (
                <div className="rounded-xl bg-[#F5F5F7] p-3 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <Calendar size={12} /> Durasi Total
                  </span>
                  <span className="text-xs font-bold text-[#1D1D1F]">
                    {pricing.durationDays} hari
                    {pricing.tier !== 'HARIAN' && (
                      <span className="text-[#0071E3]"> · {pricing.tier.toLowerCase()}</span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {!pricing ? (
              <Alert tone="warning" className="mt-5">
                Tanggal selesai harus minimal 1 hari setelah tanggal mulai.
              </Alert>
            ) : null}

            {/* Rincian Hasil Perhitungan Otomatis */}
            {pricing && (
              <div className="mt-5 p-4 rounded-2xl bg-[#F9F9FB] border border-gray-200/80 space-y-2.5">
                <p className="text-xs font-bold text-[#1D1D1F] pb-1 border-b border-gray-200">
                  Kalkulasi Biaya Otomatis
                </p>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Total Sewa ({pricing.durationDays} hari)</span>
                  <span className="font-semibold text-[#1D1D1F]">{formatRupiah(pricing.total)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#0071E3] font-bold pt-1.5 border-t border-dashed border-gray-200">
                  <span>Wajib DP (30%)</span>
                  <span>{formatRupiah(pricing.dpAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Pelunasan Saat Serah Terima</span>
                  <span>{formatRupiah(pricing.remainingPayment)}</span>
                </div>
              </div>
            )}

            {/* Tombol Pesan via WhatsApp */}
            <Button
              variant="primary"
              className="w-full py-3 mt-5 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white border-none font-semibold"
              disabled={!pricing}
              onClick={handleCheckoutWhatsApp}
            >
              <MessageCircle size={18} />
              Pesan via WhatsApp
            </Button>

            {/* Peringatan Kebijakan Hangus DP */}
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-[10px] text-amber-800 font-medium leading-relaxed flex items-start gap-1.5">
                <AlertCircle size={13} className="shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Aturan Pelunasan:</strong> Pembayaran DP (30%) wajib dilunasi dalam kurun waktu <strong>1x24 jam</strong>. Apabila sisa pembayaran tidak dilunasi tepat waktu, maka DP dinyatakan <strong>hangus</strong>.
                </span>
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default IphoneDetailPage;