/**
 * Konstanta sistem iRent Platform.
 * Semua enum mengikuti spesifikasi PRD (Section 5, 6, 7) agar konsisten
 * antara tampilan frontend dan kontrak API backend.
 */

// ─────────────────────────────────────────────────────
// ROLE & AUTENTIKASI
// ─────────────────────────────────────────────────────
export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  SUPERADMIN: 'SUPERADMIN',
};

export const ROLE_LABELS = {
  CUSTOMER: 'Penyewa',
  ADMIN: 'Admin Operasional',
  SUPERADMIN: 'Super Admin',
};

// ─────────────────────────────────────────────────────
// STATUS PESANAN SEWA (Order Lifecycle — PRD 5.1)
// ─────────────────────────────────────────────────────
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  WAITING_VERIFICATION: 'WAITING_VERIFICATION',
  APPROVED: 'APPROVED',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  PAID: 'PAID',
  PREPARING: 'PREPARING',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  ACTIVE_RENTAL: 'ACTIVE_RENTAL',
  RETURNED: 'RETURNED',
  INSPECTION_PENDING: 'INSPECTION_PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  OVERDUE: 'OVERDUE',
};

export const ORDER_STATUS_META = {
  PENDING: { label: 'Menunggu Konfirmasi', tone: 'neutral', step: 1 },
  WAITING_VERIFICATION: { label: 'Verifikasi Identitas', tone: 'warning', step: 2 },
  APPROVED: { label: 'Disetujui', tone: 'info', step: 3 },
  AWAITING_PAYMENT: { label: 'Menunggu Pembayaran', tone: 'warning', step: 4 },
  PAID: { label: 'Pembayaran Diverifikasi', tone: 'info', step: 5 },
  PREPARING: { label: 'Menyiapkan Unit', tone: 'info', step: 6 },
  READY_FOR_PICKUP: { label: 'Siap Diambil', tone: 'success', step: 7 },
  OUT_FOR_DELIVERY: { label: 'Sedang Dikirim', tone: 'info', step: 7 },
  ACTIVE_RENTAL: { label: 'Sedang Disewa', tone: 'success', step: 8 },
  RETURNED: { label: 'Dikembalikan', tone: 'info', step: 9 },
  INSPECTION_PENDING: { label: 'Inspeksi', tone: 'warning', step: 10 },
  COMPLETED: { label: 'Selesai', tone: 'success', step: 11 },
  CANCELLED: { label: 'Dibatalkan', tone: 'danger', step: 0 },
  OVERDUE: { label: 'Terlambat', tone: 'danger', step: 8 },
};

/** Timeline langkah utama untuk ditampilkan sebagai stepper. */
export const ORDER_TIMELINE_STEPS = [
  { key: 'WAITING_VERIFICATION', label: 'Verifikasi Identitas' },
  { key: 'AWAITING_PAYMENT', label: 'Pembayaran' },
  { key: 'PREPARING', label: 'Persiapan Unit' },
  { key: 'ACTIVE_RENTAL', label: 'Masa Sewa' },
  { key: 'INSPECTION_PENDING', label: 'Inspeksi' },
  { key: 'COMPLETED', label: 'Selesai' },
];

// ─────────────────────────────────────────────────────
// STATUS UNIT FISIK (PRD 6.2)
// ─────────────────────────────────────────────────────
export const UNIT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  BOOKED: 'BOOKED',
  IN_RENTAL: 'IN_RENTAL',
  UNDER_INSPECTION: 'UNDER_INSPECTION',
  MAINTENANCE: 'MAINTENANCE',
  LOST: 'LOST',
  DECOMMISSIONED: 'DECOMMISSIONED',
};

export const UNIT_STATUS_META = {
  AVAILABLE: { label: 'Tersedia', tone: 'success' },
  BOOKED: { label: 'Dipesan', tone: 'warning' },
  IN_RENTAL: { label: 'Sedang Disewa', tone: 'info' },
  UNDER_INSPECTION: { label: 'Inspeksi', tone: 'warning' },
  MAINTENANCE: { label: 'Maintenance', tone: 'neutral' },
  LOST: { label: 'Hilang', tone: 'danger' },
  DECOMMISSIONED: { label: 'Pensiun', tone: 'neutral' },
};

// ─────────────────────────────────────────────────────
// GRADE FISIK UNIT (PRD 6.3)
// ─────────────────────────────────────────────────────
export const PHYSICAL_GRADE = {
  GRADE_A: 'GRADE_A',
  GRADE_B: 'GRADE_B',
  GRADE_C: 'GRADE_C',
};

export const PHYSICAL_GRADE_META = {
  GRADE_A: { label: 'Grade A', desc: 'Pristine, BH ≥ 90%', tone: 'success' },
  GRADE_B: { label: 'Grade B', desc: 'Good, BH 80–89%', tone: 'info' },
  GRADE_C: { label: 'Grade C', desc: 'Fair, BH < 80%', tone: 'warning' },
};

// ─────────────────────────────────────────────────────
// PEMBAYARAN
// ─────────────────────────────────────────────────────
export const PAYMENT_TYPE = {
  RENTAL_AND_DEPOSIT: 'RENTAL_AND_DEPOSIT',
  LATE_FINE: 'LATE_FINE',
  DAMAGE_FINE: 'DAMAGE_FINE',
  DEPOSIT_REFUND: 'DEPOSIT_REFUND',
};

export const PAYMENT_TYPE_LABELS = {
  RENTAL_AND_DEPOSIT: 'Sewa + Deposit',
  LATE_FINE: 'Denda Keterlambatan',
  DAMAGE_FINE: 'Denda Kerusakan',
  DEPOSIT_REFUND: 'Pengembalian Deposit',
};

export const PAYMENT_METHOD = {
  BANK_TRANSFER: 'BANK_TRANSFER',
  MANUAL_QRIS: 'MANUAL_QRIS',
  CASH: 'CASH',
  PAYMENT_GATEWAY: 'PAYMENT_GATEWAY',
};

export const PAYMENT_METHOD_LABELS = {
  BANK_TRANSFER: 'Transfer Bank',
  MANUAL_QRIS: 'QRIS Manual',
  CASH: 'Tunai',
  PAYMENT_GATEWAY: 'Payment Gateway',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

export const PAYMENT_STATUS_META = {
  PENDING: { label: 'Menunggu Verifikasi', tone: 'warning' },
  VERIFIED: { label: 'Terverifikasi', tone: 'success' },
  REJECTED: { label: 'Ditolak', tone: 'danger' },
};

/** Rekening tujuan transfer manual (mock, akan datang dari backend). */
export const BANK_ACCOUNTS = [
  { bank: 'BCA', accountNumber: '1234567890', accountName: 'PT iRent Indonesia' },
  { bank: 'Mandiri', accountNumber: '0987654321', accountName: 'PT iRent Indonesia' },
];

/** Grace period pembayaran (jam) — PRD 5.2 */
export const PAYMENT_GRACE_PERIOD_HOURS = 4;

// ─────────────────────────────────────────────────────
// JENIS DENDA (PRD 7.5)
// ─────────────────────────────────────────────────────
export const FINE_TYPE = {
  LATE_RETURN: 'LATE_RETURN',
  PHYSICAL_DAMAGE: 'PHYSICAL_DAMAGE',
  MISSING_ACCESSORY: 'MISSING_ACCESSORY',
  ICLOUD_LOCKED: 'ICLOUD_LOCKED',
  OTHER: 'OTHER',
};

export const FINE_TYPE_LABELS = {
  LATE_RETURN: 'Keterlambatan Pengembalian',
  PHYSICAL_DAMAGE: 'Kerusakan Fisik',
  MISSING_ACCESSORY: 'Aksesori Hilang',
  ICLOUD_LOCKED: 'iCloud Terkunci',
  OTHER: 'Lainnya',
};

export const FINE_SETTLEMENT_STATUS = {
  UNPAID: 'UNPAID',
  DEDUCTED_FROM_DEPOSIT: 'DEDUCTED_FROM_DEPOSIT',
  ADDITIONAL_INVOICE_PAID: 'ADDITIONAL_INVOICE_PAID',
  WAIVED: 'WAIVED',
};

/** Tarif denda aksesori standar (PRD 7.5). */
export const ACCESSORY_FINE_RATES = {
  cable: 250000,
  charger_brick: 350000,
  box: 150000,
};

// ─────────────────────────────────────────────────────
// KONDISI INSPEKSI (PRD 4.1 tabel return_inspections)
// ─────────────────────────────────────────────────────
export const SCREEN_CONDITION = {
  GOOD: 'GOOD',
  SCRATCHED: 'SCRATCHED',
  CRACKED: 'CRACKED',
  DEAD_PIXEL: 'DEAD_PIXEL',
};

export const SCREEN_CONDITION_LABELS = {
  GOOD: 'Normal',
  SCRATCHED: 'Baret/Goresan',
  CRACKED: 'Retak/Pecah',
  DEAD_PIXEL: 'Dead Pixel',
};

export const BODY_CONDITION = {
  PRISTINE: 'PRISTINE',
  LIGHT_SCRATCH: 'LIGHT_SCRATCH',
  DENTED: 'DENTED',
  BENT: 'BENT',
};

export const BODY_CONDITION_LABELS = {
  PRISTINE: 'Mulus',
  LIGHT_SCRATCH: 'Baret Halus',
  DENTED: 'Penyok',
  BENT: 'Bengkok',
};

/** Checklist inspeksi 12 titik (PRD 10.3 bagian 9). */
export const INSPECTION_CHECKLIST = [
  { key: 'screen', label: 'Layar / LCD' },
  { key: 'touch', label: 'Touchscreen' },
  { key: 'cameraMain', label: 'Kamera Utama (1x)' },
  { key: 'cameraUltraWide', label: 'Kamera Ultra Wide (0.5x)' },
  { key: 'cameraTele', label: 'Kamera Telephoto (3x)' },
  { key: 'frontCamera', label: 'Kamera Depan' },
  { key: 'speaker', label: 'Speaker' },
  { key: 'microphone', label: 'Mikrofon' },
  { key: 'faceId', label: 'Face ID' },
  { key: 'physicalButtons', label: 'Tombol Fisik' },
  { key: 'chargingPort', label: 'Port Charging' },
  { key: 'wifiCellular', label: 'WiFi & Cellular' },
];

// ─────────────────────────────────────────────────────
// TIPE MAINTENANCE
// ─────────────────────────────────────────────────────
export const MAINTENANCE_TYPE = {
  BATTERY_REPLACEMENT: 'BATTERY_REPLACEMENT',
  SCREEN_REPAIR: 'SCREEN_REPAIR',
  BODY_HOUSING: 'BODY_HOUSING',
  SOFTWARE_RESTORE: 'SOFTWARE_RESTORE',
  ROUTINE_CHECK: 'ROUTINE_CHECK',
};

export const MAINTENANCE_TYPE_LABELS = {
  BATTERY_REPLACEMENT: 'Ganti Baterai',
  SCREEN_REPAIR: 'Perbaikan Layar',
  BODY_HOUSING: 'Ganti Housing',
  SOFTWARE_RESTORE: 'Restore Software',
  ROUTINE_CHECK: 'Pengecekan Rutin',
};

// ─────────────────────────────────────────────────────
// TIPE PENGAMBILAN
// ─────────────────────────────────────────────────────
export const DELIVERY_TYPE = {
  STORE_PICKUP: 'STORE_PICKUP',
  COURIER_DELIVERY: 'COURIER_DELIVERY',
};

export const DELIVERY_TYPE_LABELS = {
  STORE_PICKUP: 'Ambil di Toko',
  COURIER_DELIVERY: 'Diantar Kurir',
};

// ─────────────────────────────────────────────────────
// KONFIGURASI SISTEM & DENDA (PRD 7)
// ─────────────────────────────────────────────────────
export const SYSTEM_CONFIG = {
  minRentalDays: 1,
  weekendSurchargePercent: 0, // 0 = nonaktif
  lateGracePeriodHours: 2,
  lateFineUnderSixHoursPercent: 50, // 50% daily rate
  lateFineMultiplierPerDay: 1.5,
  paymentGracePeriodHours: PAYMENT_GRACE_PERIOD_HOURS,
};

// ─────────────────────────────────────────────────────
// PAGINATION & UI
// ─────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 10;

export const SORT_OPTIONS = [
  { value: 'popular', label: 'Paling Populer' },
  { value: 'price-asc', label: 'Harga Terendah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'newest', label: 'Terbaru' },
];

// ─────────────────────────────────────────────────────
// STORAGE KEYS
// ─────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  accessToken: 'irent_access_token',
  refreshToken: 'irent_refresh_token',
  user: 'irent_user',
  mockOrders: 'irent_mock_orders',
  mockUnits: 'irent_mock_units',
  mockCustomers: 'irent_mock_customers',
  mockAuditLogs: 'irent_mock_audit_logs',
  draftBooking: 'irent_draft_booking',
};