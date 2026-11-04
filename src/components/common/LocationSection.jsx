/** Data dan tampilan lokasi BASECAMP GO-GRAB di Magelang. */
import React from 'react';
import { Clock3, ExternalLink, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { Button } from './Button';
import { Card, InfoRow, Pill } from '../ui';

export const STORE_LOCATION = {
  name: 'BASECAMP GO-GRAB',
  city: 'Magelang',
  region: 'Jawa Tengah',
  addressLabel: 'BASECAMP GO-GRAB, Magelang, Jawa Tengah',
  latitude: -7.4591327,
  longitude: 110.2225209,
  mapsUrl: 'https://www.google.com/maps/place/BASECAMP+GO-GRAB/@-7.4591057,110.2222813,21z/data=!4m6!3m5!1s0x2e7a85bc54b5100d:0x74caad8fd872a8bb!8m2!3d-7.4591327!4d110.2225209!16s%2Fg%2F11h1kdc5mz?entry=ttu&g_ep=EgoyMDI2MDkyMS4wIKXMDSoASAFQAw%3D%3D',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=-7.4591327,110.2225209&travelmode=driving',
  embedUrl: 'https://www.google.com/maps?q=-7.4591327,110.2225209&z=16&output=embed',
  phone: '0812-2518-8023',
  whatsapp: 'https://wa.me/6281225188023',
};

export const LocationSection = () => (
  <div className="space-y-5">
    <Card padded={false} className="overflow-hidden">
      <div className="map-embed h-[360px] sm:h-[440px] bg-[#F5F5F7] dark:bg-[#2d2d2f]">
        <iframe src={STORE_LOCATION.embedUrl} title={`Peta ${STORE_LOCATION.name}`} className="w-full h-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Pill tone="brand" size="xs" className="mb-3"><MapPin size={11} className="mr-1" /> Lokasi Gerai</Pill>
          <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-white">{STORE_LOCATION.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{STORE_LOCATION.addressLabel}</p>
          <p className="text-xs text-gray-400 mt-2">Koordinat: {STORE_LOCATION.latitude}, {STORE_LOCATION.longitude}</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <a href={STORE_LOCATION.directionsUrl} target="_blank" rel="noopener noreferrer"><Button variant="primary" className="text-xs px-4 py-2.5 flex items-center gap-2"><Navigation size={14} /> Directions</Button></a>
          <a href={STORE_LOCATION.mapsUrl} target="_blank" rel="noopener noreferrer"><Button variant="secondary" className="text-xs px-4 py-2.5 flex items-center gap-2"><ExternalLink size={14} /> Buka Maps</Button></a>
        </div>
      </div>
    </Card>
    <div className="grid md:grid-cols-2 gap-5">
      <Card>
        <p className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-3">Informasi Lokasi</p>
        <div className="divide-y divide-gray-50 dark:divide-[#3a3a3c]">
          <InfoRow label="Nama tempat" value={STORE_LOCATION.name} />
          <InfoRow label="Kota" value={`${STORE_LOCATION.city}, ${STORE_LOCATION.region}`} />
          <InfoRow label="Alamat acuan" value={STORE_LOCATION.addressLabel} />
          <InfoRow label="Jam operasional" value={<span className="inline-flex items-center gap-1.5"><Clock3 size={13} className="text-[#0071E3]" /> Setiap hari · 09.00–21.00 WIB</span>} />
        </div>
        <p className="text-[11px] text-gray-400 mt-4">Gunakan Directions untuk memperoleh rute terbaru.</p>
      </Card>
      <Card>
        <p className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-3">Hubungi BASECAMP</p>
        <div className="space-y-3">
          <a href={STORE_LOCATION.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl bg-[#F5F5F7] dark:bg-[#2d2d2f] p-3 text-[#1D1D1F] dark:text-white hover:bg-[#E8F2FD] dark:hover:bg-[#0071E3]/20"><span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><MessageCircle size={17} /></span><span><span className="block text-xs font-semibold">Chat WhatsApp</span><span className="block text-[11px] text-gray-500">{STORE_LOCATION.phone}</span></span></a>
          <a href={`tel:+${STORE_LOCATION.phone.replace(/[^0-9]/g, '')}`} className="flex items-center gap-3 rounded-xl bg-[#F5F5F7] dark:bg-[#2d2d2f] p-3 text-[#1D1D1F] dark:text-white hover:bg-[#E8F2FD] dark:hover:bg-[#0071E3]/20"><span className="w-9 h-9 rounded-xl bg-[#E8F2FD] dark:bg-[#0071E3]/20 text-[#0071E3] flex items-center justify-center"><Phone size={17} /></span><span><span className="block text-xs font-semibold">Telepon</span><span className="block text-[11px] text-gray-500">{STORE_LOCATION.phone}</span></span></a>
        </div>
      </Card>
    </div>
  </div>
);

export default LocationSection;
