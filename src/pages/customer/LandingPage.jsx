/**
 * LANDING PAGE — hero showcase, value proposition, katalog unggulan,
 * cara kerja 4 langkah, galeri foto unit berjalan, dan FAQ (PRD 10.2 #1).
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  BatteryCharging,
  Zap,
  Wallet,
  ChevronDown,
  Smartphone,
  ClipboardCheck,
  CreditCard,
  PackageCheck,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card, Pill, SkeletonCard } from '../../components/ui';
import { catalogApi } from '../../api/catalogApi';
import { formatRupiah } from '../../utils/formatter';
import { onImageError } from '../../utils/imageHelpers';
import { useDocumentTitle } from '../../hooks';

/** Foto hero: iPhone 15 Pro Max resmi (Apple CDN, latar transparan). */
const HERO_IMAGE =
  'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-naturaltitanium-select?wid=964&hei=1134&fmt=png-alpha';

const HERO_FALLBACK =
  'https://placehold.co/520x560/2D2D2F/FFFFFF?text=iPhone+15+Pro+Max';

const VALUE_PROPS = [
  { icon: ShieldCheck, title: '100% Unit Original', desc: 'Semua perangkat bersegel resmi dan terverifikasi IMEI.' },
  { icon: BatteryCharging, title: 'Baterai Prima', desc: 'Battery Health minimum 80%, terdata per unit fisik.' },
  { icon: Zap, title: 'Proses Kilat', desc: 'Verifikasi cepat, unit siap dalam hitungan jam.' },
  { icon: Wallet, title: 'Harga Transparan', desc: 'Kalkulasi otomatis, tanpa biaya tersembunyi.' },
];

const STEPS = [
  { icon: Smartphone, title: 'Pilih Unit', desc: 'Telusuri katalog & pilih tanggal sewa Anda.' },
  { icon: ClipboardCheck, title: 'Verifikasi KYC', desc: 'Unggah KTP & selfie untuk keamanan bersama.' },
  { icon: CreditCard, title: 'Bayar & Konfirmasi', desc: 'Transfer sewa + deposit, admin memverifikasi.' },
  { icon: PackageCheck, title: 'Terima & Kembalikan', desc: 'Ambil unit, gunakan, lalu kembalikan tepat waktu.' },
];

const PHONE_GALLERY = [
  { 
    name: 'iPhone 15 Pro Max', 
    color: 'Natural Titanium', 
    img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-naturaltitanium-select?wid=964&hei=1134&fmt=png-alpha' 
  },
  { 
    name: 'iPhone 15 Pro', 
    color: 'Blue Titanium', 
    img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-bluetitanium-select?wid=964&hei=1134&fmt=png-alpha' 
  },
  { 
    name: 'iPhone 14 Pro Max', 
    color: 'Gold / Deep Purple', 
    img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-max-gold-select?wid=964&hei=1134&fmt=png-alpha' 
  },
  { 
    name: 'iPhone 14 Pro', 
    color: 'Space Black', 
    img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-spaceblack-select?wid=964&hei=1134&fmt=png-alpha' 
  },
];

const FAQ_ITEMS = [
  { q: 'Apa saja syarat untuk menyewa iPhone?', a: 'Anda perlu KTP aktif, nomor telepon aktif, dan mengunggah foto KTP serta selfie dengan KTP untuk verifikasi identitas. Deposit jaminan wajib disetorkan sebelum unit diserahkan.' },
  { q: 'Berapa lama proses verifikasi dan pengambilan unit?', a: 'Verifikasi identitas biasanya selesai dalam 1–2 jam pada jam operasional. Setelah pembayaran terverifikasi, unit dapat diambil pada hari yang sama.' },
  { q: 'Apakah deposit dikembalikan?', a: 'Ya. Deposit dikembalikan penuh setelah unit dikembalikan dalam kondisi baik. Jika ada keterlambatan atau kerusakan, denda dipotong dari deposit sesuai ketentuan yang berlaku.' },
  { q: 'Bagaimana jika saya terlambat mengembalikan unit?', a: 'Ada grace period 2 jam tanpa denda. Keterlambatan 2–6 jam dikenakan denda 50% tarif harian, dan lebih dari 6 jam dikenakan 1,5× tarif harian per hari keterlambatan.' },
  { q: 'Apakah bisa sewa lebih dari satu bulan?', a: 'Bisa. Kami menyediakan paket mingguan dan bulanan dengan harga lebih ekonomis dibanding tarif harian.' },
  { q: 'Bagaimana keamanan data KTP saya?', a: 'Dokumen KTP disimpan pada penyimpanan privat dan hanya dapat diakses oleh admin terverifikasi untuk keperluan verifikasi penyewa.' },
];

export const LandingPage = () => {
  useDocumentTitle('Sewa iPhone Premium');
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    catalogApi
      .list({ limit: 6, sort: 'popular' })
      .then((res) => setVariants(res.data))
      .catch(() => setVariants([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="bg-[#1D1D1F] text-white overflow-hidden">
        <div className="max-w-container mx-auto px-5 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Pill tone="brand" className="mb-5">
              ✦ Layanan Sewa iPhone Terpercaya
            </Pill>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              iPhone flagship, <span className="text-[#0071E3]">tanpa harus membeli.</span>
            </h1>
            <p className="text-sm sm:text-base text-white/60 mt-5 max-w-lg leading-relaxed">
              Sewa iPhone terbaru untuk konten, acara, perjalanan, atau kebutuhan profesional. Unit
              original dengan Battery Health terverifikasi dan harga transparan.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/katalog">
                <Button variant="primary" className="px-6 py-3 flex items-center gap-2">
                  Lihat Katalog <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/cara-sewa">
                <Button className="px-6 py-3 bg-white/10 text-white hover:bg-white/20">
                  Cara Sewa
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10">
              <div>
                <p className="text-2xl sm:text-3xl font-bold">17</p>
                <p className="text-[11px] text-white/50 mt-1">Unit Siap Sewa</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold">7</p>
                <p className="text-[11px] text-white/50 mt-1">Model iPhone</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold">4.9</p>
                <p className="text-[11px] text-white/50 mt-1">Rating Penyewa</p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:flex items-center justify-center">
            <div className="absolute w-72 h-72 bg-[#0071E3]/25 rounded-full blur-3xl" />
            <img
              src={HERO_IMAGE}
              alt="iPhone 15 Pro Max"
              onError={(e) => onImageError(e, 'iPhone 15 Pro Max', HERO_FALLBACK)}
              className="relative w-full max-w-md object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ── VALUE PROPOSITION ── */}
      <section className="max-w-container mx-auto px-5 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUE_PROPS.map((prop) => {
            const Icon = prop.icon;
            return (
              <Card key={prop.title} hover>
                <div className="w-11 h-11 rounded-xl bg-[#E8F2FD] flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#0071E3]" />
                </div>
                <p className="text-sm font-semibold text-[#1D1D1F]">{prop.title}</p>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{prop.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── UNGGULAN KATALOG ── */}
      <section className="max-w-container mx-auto px-5 sm:px-6 pb-16">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] tracking-tight">
              Pilihan paling populer
            </h2>
            <p id="populer" className="text-sm text-gray-500 mt-1 scroll-mt-40">Unit yang paling sering disewa pelanggan kami.</p>
          </div>
          <Link
            to="/katalog"
            className="text-xs font-semibold text-[#0071E3] hover:underline shrink-0 flex items-center gap-1"
          >
            Lihat semua <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {variants.map((v) => (
              <Link key={v.id} to={`/iphone/${v.slug}`}>
                <Card hover className="h-full flex flex-col">
                  {v.badge && (
                    <Pill tone="brand" size="xs" className="self-start mb-3">
                      {v.badge}
                    </Pill>
                  )}
                  <div className="bg-[#F5F5F7] rounded-xl h-44 flex items-center justify-center mb-4 overflow-hidden">
                    <img
                      src={v.primaryImage}
                      alt={v.modelName}
                      onError={(e) => onImageError(e, v.modelName)}
                      loading="lazy"
                      className="h-36 object-contain hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-sm font-semibold text-[#1D1D1F]">{v.modelName}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {v.storageCapacity} · {v.colorName}
                  </p>
                  <div className="mt-auto pt-4 flex items-end justify-between border-t border-gray-50">
                    <div>
                      <p className="text-[10px] text-gray-400">Mulai dari</p>
                      <p className="text-base font-bold text-[#0071E3]">
                        {formatRupiah(v.dailyRate)}
                        <span className="text-[11px] font-normal text-gray-400">/hari</span>
                      </p>
                    </div>
                    <Pill tone="success" size="xs">Tersedia</Pill>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── CARA KERJA ── */}
      <section className="bg-white border-y border-gray-100 py-16">
        <div className="max-w-container mx-auto px-5 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] tracking-tight">
              Sewa dalam 4 langkah
            </h2>
            <p className="text-sm text-gray-500 mt-2">Proses sederhana, transparan, dan terdokumentasi.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.title}>
                  <div className="w-11 h-11 rounded-xl bg-[#0071E3] flex items-center justify-center text-white mb-4">
                    <Icon size={20} />
                  </div>
                  <p className="text-[11px] font-bold text-[#0071E3] mb-1">LANGKAH {idx + 1}</p>
                  <p className="text-sm font-semibold text-[#1D1D1F]">{step.title}</p>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GALERI FOTO HP BERGERAK OTOMATIS (SLIDESHOW) ── */}
      <section className="py-16 overflow-hidden bg-gray-50/50">
        <div className="max-w-container mx-auto px-5 sm:px-6 mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] tracking-tight">
            Koleksi Unit iRent
          </h2>
          <p className="text-sm text-gray-500 mt-1">Semua unit iPhone original, mulus, dan siap sewa.</p>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 inset-y-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 inset-y-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee flex gap-6 py-4">
            {[...PHONE_GALLERY, ...PHONE_GALLERY].map((item, index) => (
              <div key={index} className="w-[240px] sm:w-[270px] shrink-0">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center h-60 hover:shadow-md transition-shadow">
                  <div className="h-36 flex items-center justify-center mb-3">
                    <img 
                      src={item.img} 
                      alt={item.name} 
                      onError={(e) => onImageError(e, item.name)}
                      className="h-full object-contain hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  <p className="text-xs font-semibold text-[#1D1D1F]">{item.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.color}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-container mx-auto px-5 sm:px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] tracking-tight text-center mb-8">
            Pertanyaan yang sering diajukan
          </h2>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <Card key={item.q} padded={false} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="text-sm font-semibold text-[#1D1D1F]">{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 -mt-1">
                      <p className="text-xs text-gray-500 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-container mx-auto px-5 sm:px-6 pb-16">
        <div className="bg-[#1D1D1F] rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Siap menyewa iPhone impian Anda?
          </h2>
          <p className="text-sm text-white/60 mt-3 max-w-lg mx-auto">
            Pilih unit favorit Anda, atur tanggal sewa, dan unit siap diambil pada hari yang sama.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <Link to="/katalog#populer" onClick={(e) => { e.preventDefault(); document.getElementById('populer')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
              <Button variant="primary" className="px-6 py-3">Mulai Sekarang</Button>
            </Link>
            <Link to="/katalog">
              <Button className="px-6 py-3 bg-white/10 text-white hover:bg-white/20">
                Telusuri Katalog
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;