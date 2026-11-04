/**
 * WHATSAPP API — pembuka chat wa.me dengan format booking lengkap.
 *
 * Alur utama situs:
 *   Klik "Sewa" -> wa.me terbuka -> format booking terisi otomatis
 *   -> user tinggal kirim & konfirmasi dengan admin.
 */

import { formatRupiah, formatDateIndo, formatDuration } from './formatter';

/** Nomor WhatsApp iRent (internasional, tanpa +). */
export const WA_NUMBER = '6281225188023';
export const WA_DISPLAY = '0812-2518-8023';

/** Susun URL chat WhatsApp. */
export const waLink = (message) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

/** Pesan generik (tombol chat mengambang / CTA umum). */
export const buildGeneralMessage = (context = 'Saya ingin bertanya tentang sewa iPhone di iRent.') =>
  `Halo iRent! 👋\n${context}\n\nMohon informasinya. Terima kasih!`;

/**
 * Format booking LENGKAP — dipakai dari halaman detail (tanggal & harga
 * sudah dipilih pengguna, sehingga rincian ikut terkirim).
 *
 * @param {Object} p
 * @param {string} p.modelName
 * @param {string} p.storageCapacity
 * @param {string} p.colorName
 * @param {string} p.startDate   YYYY-MM-DD
 * @param {string} p.endDate     YYYY-MM-DD
 * @param {Object} p.pricing     hasil calculateRentalPrice()
 * @param {number} [p.availableUnits]
 */
export const buildRentalMessage = ({
  modelName,
  storageCapacity,
  colorName,
  startDate,
  endDate,
  pricing,
  availableUnits,
}) => {
  const lines = [
    'Halo iRent! 👋 Saya ingin menyewa iPhone.',
    '',
    '📱 *Data Unit*',
    `• Model: ${modelName}`,
    `• Kapasitas: ${storageCapacity}`,
    `• Warna: ${colorName}`,
    '',
    '📅 *Jadwal Sewa*',
    `• Mulai: ${formatDateIndo(startDate)}`,
    `• Selesai: ${formatDateIndo(endDate)}`,
    `• Durasi: ${formatDuration(pricing?.totalDays)}`,
  ];

  if (pricing) {
    lines.push(
      '',
      '💰 *Estimasi Biaya*',
      `• Sewa (${pricing.tier.toLowerCase()}): ${formatRupiah(pricing.rentalFee)}`
    );
    if (pricing.weekendSurcharge > 0) {
      lines.push(`• Biaya akhir pekan: ${formatRupiah(pricing.weekendSurcharge)}`);
    }
    lines.push(`• Deposit (dikembalikan): ${formatRupiah(pricing.securityDeposit)}`);
    lines.push(`• *Total estimasi: ${formatRupiah(pricing.grandTotal)}*`);
  }

  if (typeof availableUnits === 'number') {
    lines.push('', `📦 Stok tersisa: ${availableUnits} unit`);
  }

  lines.push(
    '',
    'Mohon konfirmasi ketersediaan unit dan langkah selanjutnya. Terima kasih! 🙏'
  );
  return lines.join('\n');
};

/**
 * Pesan cepat dari kartu katalog — unit diminati, tanggal menyusul
 * dikonfirmasi di chat.
 */
export const buildQuickRentMessage = ({ modelName, storageCapacity, colorName, dailyRate }) =>
  [
    'Halo iRent! 👋 Saya tertarik menyewa unit berikut:',
    '',
    `📱 Model: ${modelName}`,
    `💾 Kapasitas: ${storageCapacity}`,
    `🎨 Warna: ${colorName}`,
    `💰 Tarif: ${formatRupiah(dailyRate)}/hari`,
    '',
    '📅 Rencana tanggal sewa: (akan saya konfirmasi di chat)',
    'Mohon info ketersediaan & prosedur sewanya. Terima kasih! 🙏',
  ].join('\n');

/** Buka WhatsApp di tab baru. */
export const openWhatsApp = (message = buildGeneralMessage()) => {
  window.open(waLink(message), '_blank', 'noopener,noreferrer');
};
