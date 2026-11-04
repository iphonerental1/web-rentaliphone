/**
 * Skema validasi form dengan Zod.
 * Dipakai bersama React Hook Form melalui @hookform/resolvers/zod.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────
// AUTENTIKASI
// ─────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter').max(150),
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    phoneNumber: z
      .string()
      .min(10, 'Nomor telepon minimal 10 digit')
      .max(15, 'Nomor telepon maksimal 15 digit')
      .regex(/^[0-9+]+$/, 'Nomor telepon hanya boleh berisi angka'),
    nikKtp: z
      .string()
      .length(16, 'NIK harus tepat 16 digit')
      .regex(/^[0-9]+$/, 'NIK hanya boleh berisi angka'),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Harus mengandung minimal 1 huruf kapital')
      .regex(/[0-9]/, 'Harus mengandung minimal 1 angka'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
    socialMediaLink: z.string().url('Format URL tidak valid').optional().or(z.literal('')),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'Anda harus menyetujui syarat & ketentuan' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak sama',
    path: ['confirmPassword'],
  });

// ─────────────────────────────────────────────────────
// PROFIL
// ─────────────────────────────────────────────────────
export const profileSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  phoneNumber: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  socialMediaLink: z.string().url('Format URL tidak valid').optional().or(z.literal('')),
});

export const addressSchema = z.object({
  addressLabel: z.string().min(2, 'Label alamat wajib diisi'),
  streetAddress: z.string().min(10, 'Alamat minimal 10 karakter'),
  city: z.string().min(3, 'Kota wajib diisi'),
  province: z.string().min(3, 'Provinsi wajib diisi'),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'Kode pos harus 5 digit angka'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
    newPassword: z
      .string()
      .min(8, 'Password baru minimal 8 karakter')
      .regex(/[A-Z]/, 'Harus mengandung minimal 1 huruf kapital')
      .regex(/[0-9]/, 'Harus mengandung minimal 1 angka'),
    confirmNewPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Konfirmasi password tidak sama',
    path: ['confirmNewPassword'],
  });

// ─────────────────────────────────────────────────────
// KYC (UPLOAD IDENTITAS)
// ─────────────────────────────────────────────────────
export const kycSchema = z.object({
  nikKtp: z.string().length(16, 'NIK harus tepat 16 digit'),
  socialMediaLink: z.string().url('Format URL tidak valid').optional().or(z.literal('')),
});

// ─────────────────────────────────────────────────────
// BOOKING SEWA
// ─────────────────────────────────────────────────────
export const bookingSchema = z
  .object({
    variantId: z.string().min(1, 'Varian wajib dipilih'),
    startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
    endDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
    deliveryType: z.enum(['STORE_PICKUP', 'COURIER_DELIVERY']),
    addressId: z.string().optional().nullable(),
    notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['endDate'],
  })
  .refine(
    (data) => data.deliveryType !== 'COURIER_DELIVERY' || Boolean(data.addressId),
    {
      message: 'Alamat pengiriman wajib dipilih untuk pengantaran kurir',
      path: ['addressId'],
    }
  );

// ─────────────────────────────────────────────────────
// PEMBAYARAN
// ─────────────────────────────────────────────────────
export const paymentProofSchema = z.object({
  paymentMethod: z.enum(['BANK_TRANSFER', 'MANUAL_QRIS', 'CASH']),
  senderName: z.string().min(3, 'Nama pengirim wajib diisi'),
  transferDate: z.string().min(1, 'Tanggal transfer wajib diisi'),
  notes: z.string().max(300).optional(),
});

// ─────────────────────────────────────────────────────
// ADMIN: UNIT FISIK
// ─────────────────────────────────────────────────────
export const unitSchema = z.object({
  variantId: z.string().min(1, 'Varian wajib dipilih'),
  imei: z
    .string()
    .min(15, 'IMEI minimal 15 digit')
    .max(18, 'IMEI maksimal 18 digit')
    .regex(/^[0-9]+$/, 'IMEI hanya boleh berisi angka'),
  serialNumber: z.string().min(5, 'Serial number minimal 5 karakter').max(50),
  batteryHealth: z.coerce
    .number()
    .min(1, 'Battery health minimal 1%')
    .max(100, 'Battery health maksimal 100%'),
  physicalGrade: z.enum(['GRADE_A', 'GRADE_B', 'GRADE_C']),
  notes: z.string().max(500).optional(),
});

// ─────────────────────────────────────────────────────
// ADMIN: MODEL & VARIAN
// ─────────────────────────────────────────────────────
export const iphoneModelSchema = z.object({
  modelName: z.string().min(3, 'Nama model wajib diisi'),
  releaseYear: z.coerce.number().min(2007).max(2100),
  screenSize: z.string().min(2, 'Ukuran layar wajib diisi'),
  processor: z.string().min(2, 'Prosesor wajib diisi'),
  cameraSpecs: z.string().min(3, 'Spesifikasi kamera wajib diisi'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  isPublished: z.boolean().default(true),
});

export const iphoneVariantSchema = z.object({
  modelId: z.string().min(1, 'Model wajib dipilih'),
  storageCapacity: z.string().min(1, 'Kapasitas storage wajib diisi'),
  colorName: z.string().min(2, 'Nama warna wajib diisi'),
  dailyRate: z.coerce.number().min(1000, 'Tarif harian minimal Rp 1.000'),
  weeklyRate: z.coerce.number().min(1000, 'Tarif mingguan minimal Rp 1.000'),
  monthlyRate: z.coerce.number().min(1000, 'Tarif bulanan minimal Rp 1.000'),
  securityDepositAmount: z.coerce.number().min(0, 'Deposit tidak boleh negatif'),
});

// ─────────────────────────────────────────────────────
// ADMIN: INSPEKSI PENGEMBALIAN
// ─────────────────────────────────────────────────────
export const inspectionSchema = z.object({
  actualReturnTime: z.string().min(1, 'Waktu pengembalian wajib diisi'),
  returnedBatteryHealth: z.coerce.number().min(1).max(100),
  icloudRemoved: z.boolean(),
  passcodeRemoved: z.boolean(),
  screenCondition: z.enum(['GOOD', 'SCRATCHED', 'CRACKED', 'DEAD_PIXEL']),
  bodyCondition: z.enum(['PRISTINE', 'LIGHT_SCRATCH', 'DENTED', 'BENT']),
  accessoriesReturned: z.object({
    cable: z.boolean(),
    charger_brick: z.boolean(),
    box: z.boolean(),
  }),
  inspectionNotes: z.string().max(1000).optional(),
});

// ─────────────────────────────────────────────────────
// ADMIN: HANDPHONE MODEL / MAINTENANCE
// ─────────────────────────────────────────────────────
export const maintenanceSchema = z.object({
  unitId: z.string().min(1, 'Unit wajib dipilih'),
  maintenanceType: z.enum([
    'BATTERY_REPLACEMENT',
    'SCREEN_REPAIR',
    'BODY_HOUSING',
    'SOFTWARE_RESTORE',
    'ROUTINE_CHECK',
  ]),
  cost: z.coerce.number().min(0, 'Biaya tidak boleh negatif'),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
  vendorName: z.string().optional(),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter'),
});

// ─────────────────────────────────────────────────────
// ADMIN: VERIFIKASI PEMBAYARAN
// ─────────────────────────────────────────────────────
export const paymentVerifySchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  notes: z.string().min(3, 'Catatan verifikasi wajib diisi'),
});

// ─────────────────────────────────────────────────────
// ADMIN: VERIFIKASI KYC CUSTOMER
// ─────────────────────────────────────────────────────
export const kycVerifySchema = z.object({
  isVerified: z.boolean(),
  rejectionReason: z.string().optional(),
});

// ─────────────────────────────────────────────────────
// ADMIN: PENETAPAN DENDA
// ─────────────────────────────────────────────────────
export const fineSchema = z.object({
  fineType: z.enum([
    'LATE_RETURN',
    'PHYSICAL_DAMAGE',
    'MISSING_ACCESSORY',
    'ICLOUD_LOCKED',
    'OTHER',
  ]),
  amount: z.coerce.number().min(0, 'Nominal denda tidak boleh negatif'),
  reason: z.string().min(5, 'Alasan denda minimal 5 karakter'),
  deductedFromDeposit: z.boolean().default(true),
});