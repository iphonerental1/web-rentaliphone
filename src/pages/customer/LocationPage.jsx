/** Halaman lokasi publik BASECAMP GO-GRAB. */
import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { Card, PageHeader, Pill } from '../../components/ui';
import { LocationSection, STORE_LOCATION } from '../../components/common/LocationSection';
import { useDocumentTitle } from '../../hooks';

export const LocationPage = () => {
  useDocumentTitle('Lokasi Toko');
  return (
    <div className="max-w-container mx-auto px-5 sm:px-6 py-8 sm:py-12">
      <PageHeader title="Lokasi BASECAMP GO-GRAB" subtitle="Temukan gerai kami di Magelang dan dapatkan rute menuju lokasi." breadcrumb="Beranda / Lokasi" />
      <div className="mb-6 grid sm:grid-cols-3 gap-3">
        <Card className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#E8F2FD] dark:bg-[#0071E3]/20 text-[#0071E3] flex items-center justify-center"><MapPin size={18} /></div><div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Wilayah</p><p className="text-sm font-semibold text-[#1D1D1F] dark:text-white">{STORE_LOCATION.city}</p></div></Card>
        <Card className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 flex items-center justify-center"><Sparkles size={18} /></div><div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Status</p><p className="text-sm font-semibold text-[#1D1D1F] dark:text-white">Lokasi aktif</p></div></Card>
        <Card className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#F5F5F7] dark:bg-[#3a3a3c] text-[#1D1D1F] dark:text-white flex items-center justify-center"><span className="font-mono text-xs">21z</span></div><div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Peta</p><p className="text-sm font-semibold text-[#1D1D1F] dark:text-white">Google Maps</p></div></Card>
      </div>
      <LocationSection />
      <div className="mt-5 flex items-start gap-2 rounded-2xl border border-blue-200 dark:border-[#0071E3]/40 bg-blue-50 dark:bg-[#0071E3]/10 p-4 text-xs text-blue-800 dark:text-blue-200"><Pill tone="brand" size="xs">Info</Pill><p className="leading-relaxed">Peta menggunakan koordinat lokasi yang diberikan. Klik <strong>Buka Maps</strong> atau <strong>Directions</strong> untuk membuka navigasi Google Maps.</p></div>
    </div>
  );
};

export default LocationPage;
