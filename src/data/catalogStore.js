/**
 * CATALOG STORE — lapisan overlay katalog untuk Admin Portal.
 *
 * Data statis (catalog.js) tidak pernah diubah; setiap edit / model baru
 * dari halaman admin disimpan di localStorage (STORAGE_KEYS.mockModels)
 * berupa array entri:
 *
 *   // edit model base (badge, deskripsi, publish, harga varian)
 *   { id: 'mdl-15', badge: 'Baru', isPublished: true,
 *     variants: [{ id: 'vr-15-128-bl', dailyRate: 180000 }] }
 *
 *   // model buatan admin — selalu memakai flag isCustom
 *   { id: 'mdl-custom-xxx', isCustom: true, modelName: '...', variants: [...] }
 *
 * Konsumen (catalogApi publik & adminApi) memanggil getMergedModels() /
 * getMergedVariants() sehingga perubahan admin langsung terlihat di
 * katalog publik tanpa menyentuh file data statis.
 */

import { STORAGE_KEYS } from '../constants';
import { readCollection, writeCollection } from './mockDb';
import { IPHONE_MODELS, IPHONE_VARIANTS } from './catalog';

/** Baca seluruh entri overlay. */
export const readCatalogStore = () => readCollection(STORAGE_KEYS.mockModels, []);

/** Tulis seluruh entri overlay. */
export const writeCatalogStore = (entries) => writeCollection(STORAGE_KEYS.mockModels, entries);

/** Ambil satu entri overlay berdasarkan id model. */
export const getStoreEntry = (modelId) => readCatalogStore().find((e) => e.id === modelId) || null;

/** Simpan/timpa satu entri overlay. */
export const upsertStoreEntry = (entry) => {
  const store = readCatalogStore();
  const idx = store.findIndex((e) => e.id === entry.id);
  if (idx >= 0) store[idx] = { ...store[idx], ...entry };
  else store.push(entry);
  writeCatalogStore(store);
  return entry;
};

/** Hapus entri overlay (kembalikan model ke keadaan statis). */
export const removeStoreEntry = (modelId) => {
  writeCatalogStore(readCatalogStore().filter((e) => e.id !== modelId));
};

/** Gabungkan model statis dengan overlay admin. */
export const getMergedModels = () => {
  const store = readCatalogStore();

  const base = IPHONE_MODELS.map((m) => {
    const entry = store.find((e) => e.id === m.id && !e.isCustom);
    if (!entry) return m;
    const { isCustom, variants: variantPatches, ...patch } = entry;
    const variants = m.variants.map((v) => {
      const vp = (variantPatches || []).find((x) => x.id === v.id);
      if (!vp) return v;
      const merged = { ...v, ...vp };
      // Foto utama baru (diunggah admin) → jadikan gambar pertama varian
      if (vp.imageUrl) {
        const others = (v.images || []).filter((i) => !i.isPrimary);
        merged.images = [
          { imageUrl: vp.imageUrl, fallback: vp.imageUrl, isPrimary: true, displayOrder: 0 },
          ...others.map((i, idx) => ({ ...i, displayOrder: idx + 1 })),
        ];
      }
      return merged;
    });
    return { ...m, ...patch, variants };
  });

  const custom = store.filter((e) => e.isCustom);
  return [...base, ...custom];
};

/** Flatten model gabungan menjadi daftar varian ala IPHONE_VARIANTS. */
export const getMergedVariants = () =>
  getMergedModels().flatMap((model) =>
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
      primaryImage: v.images?.find((i) => i.isPrimary)?.imageUrl || v.images?.[0]?.imageUrl || '',
      imageUrl: v.images?.find((i) => i.isPrimary)?.imageUrl || v.images?.[0]?.imageUrl || '',
      title: model.modelName,
      storage: v.storageCapacity,
      pricePerDay: v.dailyRate,
      isAvailable: true,
    }))
  );

/** Filter varian gabungan — logika identik dengan filterVariants(catalog.js). */
export const filterMergedVariants = (filters = {}) => {
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
  let result = getMergedVariants().filter((v) => {
    if (v.isPublished === false) return false;
    const matchSearch =
      !keyword ||
      v.modelName.toLowerCase().includes(keyword) ||
      String(v.storageCapacity).toLowerCase().includes(keyword) ||
      String(v.colorName).toLowerCase().includes(keyword);
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
      result = result.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
      break;
    default:
      result = result.sort((a, b) => b.dailyRate - a.dailyRate);
  }
  return result;
};
