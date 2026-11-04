/**
 * KATALOG iPHONE — struktur Model > Varian > Foto (PRD Section 6.1).
 *
 * Hierarki:
 *   iPhone Models (kategori abstrak)
 *     └── iPhone Variants (kombinasi storage + warna + harga)
 *           └── iPhone Units (perangkat fisik unik, lihat mockUnits.js)
 *
 * Data ini berperan sebagai fallback/mock ketika backend belum berjalan.
 */

const img = (label, size = 600) =>
  `https://placehold.co/${size}x${size}/F5F5F7/1D1D1F?text=${encodeURIComponent(label)}`;

/**
 * Foto resmi HD (Apple CDN) — resolusi tinggi, sesuai model & warna.
 * Format: store.storeimages.cdn-apple.com ... fmt=png-alpha (latar transparan).
 */
const APPLE = (slug) =>
  `https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/${slug}?wid=964&hei=1134&fmt=png-alpha`;

/**
 * Foto cadangan untuk model yang sudah tidak tersedia di Apple Store CDN
 * (mis. iPhone SE generasi 3 yang sudah discontinued).
 */
const GSM = (file) => `https://fdn2.gsmarena.com/vv/pics/apple/${file}`;

/** Galeri foto per model (semua varian warna dari model tersebut). */
const MODEL_PHOTOS = {
  'mdl-15-pro-max': [
    APPLE('iphone-15-pro-max-naturaltitanium-select'),
    APPLE('iphone-15-pro-max-bluetitanium-select'),
    APPLE('iphone-15-pro-max-blacktitanium-select'),
  ],
  'mdl-15-pro': [
    APPLE('iphone-15-pro-naturaltitanium-select'),
    APPLE('iphone-15-pro-whitetitanium-select'),
    APPLE('iphone-15-pro-blueytitanium-select'),
  ],
  'mdl-15': [
    APPLE('iphone-15-pink-select-202309'),
    APPLE('iphone-15-blue-select-202309'),
    APPLE('iphone-15-black-select-202309'),
  ],
  'mdl-14-pro-max': [
    APPLE('iphone-14-pro-max-deeppurple-select'),
    APPLE('iphone-14-pro-max-spaceblack-select'),
    APPLE('iphone-14-pro-max-silver-select'),
  ],
  'mdl-14': [
    APPLE('iphone-14-blue-select-202209'),
    APPLE('iphone-14-midnight-select-202209'),
    APPLE('iphone-14-purple-select-202209'),
  ],
  'mdl-13': [
    APPLE('iphone-13-midnight-select-2021'),
    APPLE('iphone-13-pink-select-2021'),
    APPLE('iphone-13-starlight-select-2021'),
  ],
  'mdl-se-3': [
    GSM('apple-iphone-se-2022-1.jpg'),
    GSM('apple-iphone-se-2022-0.jpg'),
    GSM('apple-iphone-se-2022-2.jpg'),
  ],
};

/** Foto utama sesuai persis warna varian (kunci: modelId|Warna). */
const COLOR_PHOTO = {
  'mdl-15-pro-max|Natural Titanium': APPLE('iphone-15-pro-max-naturaltitanium-select'),
  'mdl-15-pro-max|Blue Titanium': APPLE('iphone-15-pro-max-bluetitanium-select'),
  'mdl-15-pro-max|Black Titanium': APPLE('iphone-15-pro-max-blacktitanium-select'),
  'mdl-15-pro|Natural Titanium': APPLE('iphone-15-pro-naturaltitanium-select'),
  'mdl-15-pro|White Titanium': APPLE('iphone-15-pro-whitetitanium-select'),
  'mdl-15|Pink': APPLE('iphone-15-pink-select-202309'),
  'mdl-15|Blue': APPLE('iphone-15-blue-select-202309'),
  'mdl-14-pro-max|Deep Purple': APPLE('iphone-14-pro-max-deeppurple-select'),
  'mdl-14-pro-max|Space Black': APPLE('iphone-14-pro-max-spaceblack-select'),
  'mdl-14|Blue': APPLE('iphone-14-blue-select-202209'),
  'mdl-14|Midnight': APPLE('iphone-14-midnight-select-202209'),
  'mdl-13|Midnight': APPLE('iphone-13-midnight-select-2021'),
  'mdl-13|Pink': APPLE('iphone-13-pink-select-2021'),
  'mdl-13|Starlight': APPLE('iphone-13-starlight-select-2021'),
  'mdl-se-3|Midnight': GSM('apple-iphone-se-2022-1.jpg'),
  'mdl-se-3|White': GSM('apple-iphone-se-2022-0.jpg'),
};

/** Susun galeri: foto warna ini dulu, lalu varian warna lain dari model sama. */
const buildGallery = (modelId, color, fallbackLabel) => {
  const primary = COLOR_PHOTO[`${modelId}|${color}`];
  const photos = MODEL_PHOTOS[modelId] || [];
  const ordered = [primary, ...photos.filter((p) => p !== primary)].filter(Boolean);
  const fallback = img(fallbackLabel);

  if (ordered.length === 0) {
    return [{ imageUrl: fallback, fallback, isPrimary: true, displayOrder: 0 }];
  }

  return ordered.map((url, i) => ({
    imageUrl: url,
    fallback,
    isPrimary: i === 0,
    displayOrder: i,
  }));
};

/** Bangun objek varian ringkas agar penulisan data tidak repetitif. */
const variant = (id, modelId, storage, color, daily, weekly, monthly, deposit) => ({
  id,
  modelId,
  storageCapacity: storage,
  colorName: color,
  dailyRate: daily,
  weeklyRate: weekly,
  monthlyRate: monthly,
  securityDepositAmount: deposit,
  isPublished: true,
  images: buildGallery(modelId, color, `${storage} ${color}`),
});

// ─────────────────────────────────────────────────────
// MASTER MODEL
// ─────────────────────────────────────────────────────
export const IPHONE_MODELS = [
  {
    id: 'mdl-15-pro-max',
    modelName: 'iPhone 15 Pro Max',
    slug: '15-pro-max',
    releaseYear: 2023,
    screenSize: '6.7 inci Super Retina XDR',
    processor: 'A17 Pro',
    cameraSpecs: '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto',
    description:
      'Flagship dengan bodi Titanium, chip A17 Pro, tombol Action, dan kamera telefoto 5x. Pilihan utama untuk kebutuhan content creation profesional.',
    isPublished: true,
    badge: 'Terpopuler',
    variants: [
      variant('vr-15pm-256-nt', 'mdl-15-pro-max', '256GB', 'Natural Titanium', 350000, 2100000, 7500000, 2000000),
      variant('vr-15pm-256-bt', 'mdl-15-pro-max', '256GB', 'Blue Titanium', 350000, 2100000, 7500000, 2000000),
      variant('vr-15pm-512-bt', 'mdl-15-pro-max', '512GB', 'Black Titanium', 400000, 2400000, 8500000, 2500000),
    ],
  },
  {
    id: 'mdl-15-pro',
    modelName: 'iPhone 15 Pro',
    slug: '15-pro',
    releaseYear: 2023,
    screenSize: '6.1 inci Super Retina XDR',
    processor: 'A17 Pro',
    cameraSpecs: '48MP Main + 12MP Ultra Wide + 12MP 3x Telephoto',
    description:
      'Versi kompak dari 15 Pro Max dengan performa setara. Ringan, bertenaga, dan cocok untuk pemakaian harian intensif.',
    isPublished: true,
    badge: 'Rekomendasi',
    variants: [
      variant('vr-15p-128-nt', 'mdl-15-pro', '128GB', 'Natural Titanium', 275000, 1650000, 5900000, 1500000),
      variant('vr-15p-256-nt', 'mdl-15-pro', '256GB', 'Natural Titanium', 300000, 1800000, 6400000, 1750000),
      variant('vr-15p-256-wt', 'mdl-15-pro', '256GB', 'White Titanium', 300000, 1800000, 6400000, 1750000),
    ],
  },
  {
    id: 'mdl-15',
    modelName: 'iPhone 15',
    slug: '15',
    releaseYear: 2023,
    screenSize: '6.1 inci Super Retina XDR',
    processor: 'A16 Bionic',
    cameraSpecs: '48MP Main + 12MP Ultra Wide',
    description:
      'iPhone 15 dengan Dynamic Island, USB-C, dan kamera 48MP. Pilihan seimbang antara harga dan performa.',
    isPublished: true,
    badge: null,
    variants: [
      variant('vr-15-128-pk', 'mdl-15', '128GB', 'Pink', 200000, 1200000, 4300000, 1000000),
      variant('vr-15-128-bl', 'mdl-15', '128GB', 'Blue', 200000, 1200000, 4300000, 1000000),
      variant('vr-15-256-bl', 'mdl-15', '256GB', 'Blue', 225000, 1350000, 4800000, 1250000),
    ],
  },
  {
    id: 'mdl-14-pro-max',
    modelName: 'iPhone 14 Pro Max',
    slug: '14-pro-max',
    releaseYear: 2022,
    screenSize: '6.7 inci Super Retina XDR',
    processor: 'A16 Bionic',
    cameraSpecs: '48MP Main + 12MP Ultra Wide + 12MP 3x Telephoto',
    description:
      'Selalu-On Display, Dynamic Island, dan kamera 48MP. Masih sangat relevan untuk kebutuhan profesional.',
    isPublished: true,
    badge: 'Best Value',
    variants: [
      variant('vr-14pm-128-dp', 'mdl-14-pro-max', '128GB', 'Deep Purple', 250000, 1500000, 5400000, 1500000),
      variant('vr-14pm-256-dp', 'mdl-14-pro-max', '256GB', 'Deep Purple', 275000, 1650000, 5900000, 1750000),
      variant('vr-14pm-256-sb', 'mdl-14-pro-max', '256GB', 'Space Black', 275000, 1650000, 5900000, 1750000),
    ],
  },
  {
    id: 'mdl-14',
    modelName: 'iPhone 14',
    slug: '14',
    releaseYear: 2022,
    screenSize: '6.1 inci Super Retina XDR',
    processor: 'A15 Bionic',
    cameraSpecs: '12MP Main + 12MP Ultra Wide',
    description:
      'Perangkat andal dengan performa A15 Bionic dan daya tahan baterai konsisten untuk pemakaian harian.',
    isPublished: true,
    badge: null,
    variants: [
      variant('vr-14-128-bl', 'mdl-14', '128GB', 'Blue', 175000, 1050000, 3750000, 1000000),
      variant('vr-14-128-mn', 'mdl-14', '128GB', 'Midnight', 175000, 1050000, 3750000, 1000000),
    ],
  },
  {
    id: 'mdl-13',
    modelName: 'iPhone 13',
    slug: '13',
    releaseYear: 2021,
    screenSize: '6.1 inci Super Retina XDR',
    processor: 'A15 Bionic',
    cameraSpecs: '12MP Dual Camera dengan Cinematic Mode',
    description:
      'Pilihan ekonomis untuk kebutuhan sewa harian. Baterai awet dan performa masih sangat mumpuni.',
    isPublished: true,
    badge: 'Hemat',
    variants: [
      variant('vr-13-128-mn', 'mdl-13', '128GB', 'Midnight', 140000, 840000, 3000000, 800000),
      variant('vr-13-128-pk', 'mdl-13', '128GB', 'Pink', 140000, 840000, 3000000, 800000),
      variant('vr-13-256-st', 'mdl-13', '256GB', 'Starlight', 160000, 960000, 3400000, 900000),
    ],
  },
  {
    id: 'mdl-se-3',
    modelName: 'iPhone SE (3rd Gen)',
    slug: 'se-3',
    releaseYear: 2022,
    screenSize: '4.7 inci Retina HD',
    processor: 'A15 Bionic',
    cameraSpecs: '12MP Wide Camera',
    description:
      'Perangkat ringkas dengan Touch ID dan chip A15 Bionic. Pilihan tepat untuk komunikasi dan produktivitas ringan.',
    isPublished: true,
    badge: null,
    variants: [
      variant('vr-se3-64-mn', 'mdl-se-3', '64GB', 'Midnight', 100000, 600000, 2150000, 600000),
      variant('vr-se3-128-wh', 'mdl-se-3', '128GB', 'White', 115000, 690000, 2450000, 700000),
    ],
  },
];

// ─────────────────────────────────────────────────────
// FLATTENED VARIANTS (untuk katalog grid & filter)
// ─────────────────────────────────────────────────────
export const IPHONE_VARIANTS = IPHONE_MODELS.flatMap((model) =>
  model.variants.map((v) => ({
    ...v,
    modelName: model.modelName,
    slug: model.slug,
    modelSlug: model.slug,
    releaseYear: model.releaseYear,
    screenSize: model.screenSize,
    processor: model.processor,
    cameraSpecs: model.cameraSpecs,
    description: model.description,
    badge: model.badge,
    primaryImage: v.images.find((i) => i.isPrimary)?.imageUrl || v.images[0]?.imageUrl,
    imageUrl: v.images.find((i) => i.isPrimary)?.imageUrl || v.images[0]?.imageUrl,
    title: `${model.modelName}`,
    storage: v.storageCapacity,
    pricePerDay: v.dailyRate,
    isAvailable: true,
  }))
);

// ─────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────
export const getAllModels = () => IPHONE_MODELS;

export const getModelById = (modelId) =>
  IPHONE_MODELS.find((m) => m.id === modelId) || null;

export const getModelBySlug = (slug) =>
  IPHONE_MODELS.find((m) => m.slug === slug) || null;

export const getVariantById = (variantId) =>
  IPHONE_VARIANTS.find((v) => v.id === variantId) || null;

export const getVariantsByModel = (modelId) =>
  IPHONE_VARIANTS.filter((v) => v.modelId === modelId);

export const getVariantsBySlug = (slug) =>
  IPHONE_VARIANTS.filter((v) => v.slug === slug);

/** Daftar storage unik untuk facet filter. */
export const getStorageOptions = () =>
  [...new Set(IPHONE_VARIANTS.map((v) => v.storageCapacity))].sort();

/** Daftar warna unik untuk facet filter. */
export const getColorOptions = () =>
  [...new Set(IPHONE_VARIANTS.map((v) => v.colorName))].sort();

/** Rentang harga katalog. */
export const getPriceRange = () => {
  const prices = IPHONE_VARIANTS.map((v) => v.dailyRate);
  return { min: Math.min(...prices), max: Math.max(...prices) };
};

/**
 * Filter katalog berdasarkan kriteria pencarian customer.
 * @param {object} filters - { search, modelSlug, storage, color, minPrice, maxPrice, sort }
 */
export const filterVariants = (filters = {}) => {
  const {
    search = '',
    modelSlug = '',
    storage = '',
    color = '',
    minPrice = 0,
    maxPrice = Number.MAX_SAFE_INTEGER,
    sort = 'popular',
  } = filters;

  const keyword = search.trim().toLowerCase();

  let result = IPHONE_VARIANTS.filter((v) => {
    const matchSearch =
      !keyword ||
      v.modelName.toLowerCase().includes(keyword) ||
      v.storageCapacity.toLowerCase().includes(keyword) ||
      v.colorName.toLowerCase().includes(keyword);

    const matchModel = !modelSlug || v.slug === modelSlug;
    const matchStorage = !storage || v.storageCapacity === storage;
    const matchColor = !color || v.colorName === color;
    const matchPrice = v.dailyRate >= minPrice && v.dailyRate <= maxPrice;

    return matchSearch && matchModel && matchStorage && matchColor && matchPrice;
  });

  switch (sort) {
    case 'price-asc':
      result = result.sort((a, b) => a.dailyRate - b.dailyRate);
      break;
    case 'price-desc':
      result = result.sort((a, b) => b.dailyRate - a.dailyRate);
      break;
    case 'newest':
      result = result.sort((a, b) => b.releaseYear - a.releaseYear);
      break;
    default:
      result = result.sort((a, b) => b.dailyRate - a.dailyRate);
  }

  return result;
};