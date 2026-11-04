/**
 * SEED DATA: CUSTOMER & KYC (PRD Section 4.1: customers, customer_addresses).
 *
 * Menyertakan contoh customer terverifikasi dan yang masih menunggu
 * review dokumen identitas agar layar "Customer Management" bisa didemokan.
 */

const img = (label, size = 500) =>
  `https://placehold.co/${size}x${size}/E8E8ED/1D1D1F?text=${encodeURIComponent(label)}`;

export const SEED_CUSTOMERS = [
  {
    id: 'cst-0001',
    userId: 'usr-cst-01',
    fullName: 'Budi Santoso',
    email: 'budi@example.com',
    phoneNumber: '081234567890',
    nikKtp: '3171012345670001',
    ktpImageUrl: img('KTP Budi'),
    selfieKtpImageUrl: img('Selfie Budi'),
    socialMediaLink: 'https://instagram.com/budisantoso',
    isVerified: true,
    verifiedAt: '2026-08-15T09:00:00.000Z',
    addresses: [
      {
        id: 'adr-0001',
        addressLabel: 'Kantor',
        streetAddress: 'Jl. MH Thamrin No. 5, Gedung Menara Prima Lt. 12',
        city: 'Jakarta Pusat',
        province: 'DKI Jakarta',
        postalCode: '10340',
        isPrimary: true,
      },
      {
        id: 'adr-0002',
        addressLabel: 'Rumah',
        streetAddress: 'Jl. Kebon Jeruk Raya No. 88, Blok C',
        city: 'Jakarta Barat',
        province: 'DKI Jakarta',
        postalCode: '11530',
        isPrimary: false,
      },
    ],
    totalOrders: 2,
    totalSpent: 2860000,
    createdAt: '2026-08-14T08:00:00.000Z',
  },
  {
    id: 'cst-0002',
    userId: 'usr-cst-02',
    fullName: 'Siti Nurhaliza',
    email: 'siti@example.com',
    phoneNumber: '081298765432',
    nikKtp: '3171023456780002',
    ktpImageUrl: img('KTP Siti'),
    selfieKtpImageUrl: img('Selfie Siti'),
    socialMediaLink: 'https://instagram.com/sitinurhaliza',
    isVerified: true,
    verifiedAt: '2026-09-01T10:30:00.000Z',
    addresses: [
      {
        id: 'adr-0003',
        addressLabel: 'Rumah',
        streetAddress: 'Jl. Cipete Raya No. 21, Kompleks Griya Asri',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postalCode: '12410',
        isPrimary: true,
      },
    ],
    totalOrders: 2,
    totalSpent: 5740000,
    createdAt: '2026-08-31T09:00:00.000Z',
  },
  {
    id: 'cst-0003',
    userId: 'usr-cst-03',
    fullName: 'Ahmad Fauzi',
    email: 'ahmad@example.com',
    phoneNumber: '081377665544',
    nikKtp: '3171034567890003',
    ktpImageUrl: img('KTP Ahmad'),
    selfieKtpImageUrl: img('Selfie Ahmad'),
    socialMediaLink: 'https://linkedin.com/in/ahmadfauzi',
    isVerified: true,
    verifiedAt: '2026-09-18T11:00:00.000Z',
    addresses: [
      {
        id: 'adr-0004',
        addressLabel: 'Rumah',
        streetAddress: 'Jl. Radio Dalam No. 45, Perumahan Bumi Indah',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postalCode: '12140',
        isPrimary: true,
      },
    ],
    totalOrders: 1,
    totalSpent: 2650000,
    createdAt: '2026-09-17T14:00:00.000Z',
  },
  {
    id: 'cst-0004',
    userId: 'usr-cst-04',
    fullName: 'Dewi Lestari',
    email: 'dewi@example.com',
    phoneNumber: '081455443322',
    nikKtp: '3171045678900004',
    ktpImageUrl: img('KTP Dewi'),
    selfieKtpImageUrl: img('Selfie Dewi'),
    socialMediaLink: 'https://instagram.com/dewilestari',
    isVerified: false,
    verifiedAt: null,
    addresses: [
      {
        id: 'adr-0005',
        addressLabel: 'Rumah',
        streetAddress: 'Jl. Pluit Karang Ayu No. 10, Blok F',
        city: 'Jakarta Utara',
        province: 'DKI Jakarta',
        postalCode: '14450',
        isPrimary: true,
      },
    ],
    totalOrders: 1,
    totalSpent: 0,
    createdAt: '2026-09-22T10:00:00.000Z',
  },
  {
    id: 'cst-0005',
    userId: 'usr-cst-05',
    fullName: 'Rizky Pratama',
    email: 'rizky@example.com',
    phoneNumber: '081566778899',
    nikKtp: '3171056789010005',
    ktpImageUrl: img('KTP Rizky'),
    selfieKtpImageUrl: img('Selfie Rizky'),
    socialMediaLink: 'https://instagram.com/rizkypratama',
    isVerified: true,
    verifiedAt: '2026-09-10T09:00:00.000Z',
    addresses: [
      {
        id: 'adr-0006',
        addressLabel: 'Rumah',
        streetAddress: 'Jl. Kemang Selatan No. 77',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postalCode: '12730',
        isPrimary: true,
      },
    ],
    totalOrders: 1,
    totalSpent: 2250000,
    createdAt: '2026-09-09T08:00:00.000Z',
  },
];

/** Statistik customer untuk dashboard admin. */
export const CUSTOMER_STATS_SUMMARY = {
  total: SEED_CUSTOMERS.length,
  verified: SEED_CUSTOMERS.filter((c) => c.isVerified).length,
  pendingVerification: SEED_CUSTOMERS.filter((c) => !c.isVerified).length,
};