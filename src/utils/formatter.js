/**
 * Formatter utilities — mata uang IDR, tanggal, dan angka.
 * Digunakan di seluruh aplikasi untuk konsistensi tampilan.
 */

/**
 * Format angka menjadi Rupiah tanpa desimal.
 * @example formatRupiah(150000) => "Rp 150.000"
 */
export const formatRupiah = (value, withPrefix = true) => {
  const number = Number(value) || 0;
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(number);
  return withPrefix ? `Rp ${formatted}` : formatted;
};

/** Format angka dengan pemisah ribuan. */
export const formatNumber = (value) =>
  new Intl.NumberFormat('id-ID').format(Number(value) || 0);

/** Format tanggal lengkap Indonesia: "1 Oktober 2026" */
export const formatDateIndo = (dateInput) => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

/** Format tanggal singkat: "01 Okt 2026" */
export const formatDateShort = (dateInput) => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/** Format tanggal + jam: "01 Okt 2026, 09.00" */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/** Konversi Date ke string input type="date" (YYYY-MM-DD) berbasis lokal. */
export const toInputDate = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

/** Selisih hari (ceil), minimal 1 hari. */
export const diffInDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (24 * 3600 * 1000)));
};

/** Label durasi ringkas: "3 Hari", "1 Minggu 2 Hari", "1 Bulan 5 Hari". */
export const formatDuration = (totalDays) => {
  const days = Number(totalDays) || 0;
  if (days <= 0) return '-';
  if (days < 7) return `${days} Hari`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const rest = days % 7;
    return rest > 0 ? `${weeks} Minggu ${rest} Hari` : `${weeks} Minggu`;
  }
  const months = Math.floor(days / 30);
  const rest = days % 30;
  return rest > 0 ? `${months} Bulan ${rest} Hari` : `${months} Bulan`;
};

/** Masking NIK: "3171********0001" */
export const maskNik = (nik) => {
  if (!nik || nik.length < 8) return nik || '-';
  return `${nik.slice(0, 4)}********${nik.slice(-4)}`;
};

/** Masking nomor telepon: "0812-****-890" */
export const maskPhone = (phone) => {
  if (!phone || phone.length < 8) return phone || '-';
  return `${phone.slice(0, 4)}-****-${phone.slice(-3)}`;
};

/** Inisial nama untuk avatar fallback. */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

/** Slug untuk kebutuhan URL. */
export const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Persentase dengan satu desimal. */
export const formatPercent = (value) =>
  `${(Number(value) || 0).toFixed(1)}%`;