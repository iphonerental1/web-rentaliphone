/**
 * CATALOG API — endpoint publik `/api/v1/iphones/*` (PRD Section 8.2).
 */

import { simulateLatency } from '../data/mockDb';
import {
  filterMergedVariants,
  getMergedModels,
  getMergedVariants,
} from '../data/catalogStore';
import { calculateRentalPrice } from '../utils/pricingEngine';
import { checkUnitAvailability } from './availabilityEngine';

export const catalogApi = {
  /** GET /iphones — daftar variasi iPhone dengan filter & paginasi. */
  list: async (filters = {}) => {
    await simulateLatency(350);
    const { page = 1, limit = 12 } = filters;
    const all = filterMergedVariants(filters);
    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit);

    return {
      success: true,
      message: 'Katalog berhasil dimuat',
      data,
      meta: { page, limit, total: all.length, totalPages: Math.ceil(all.length / limit) },
    };
  },

  /** GET /iphones/models — daftar model untuk navigasi/filter. */
  listModels: async () => {
    await simulateLatency(200);
    return { success: true, data: getMergedModels() };
  },

  /** GET /iphones/:slug — detail model + semua variannya. */
  detail: async (slug) => {
    await simulateLatency(350);
    const model = getMergedModels().find((m) => m.slug === slug) || null;
    if (!model) {
      const error = new Error('Model iPhone tidak ditemukan');
      error.status = 404;
      throw error;
    }
    const variants = getMergedVariants()
      .filter((v) => v.slug === slug)
      .map((v) => ({
        ...v,
        availableUnits: checkUnitAvailability(v.id).availableCount,
      }));
    return { success: true, data: { ...model, variants } };
  },

  /** GET /iphones/variant/:id — detail satu varian. */
  variant: async (variantId) => {
    await simulateLatency(250);
    const variant = getMergedVariants().find((v) => v.id === variantId);
    if (!variant) {
      const error = new Error('Varian tidak ditemukan');
      error.status = 404;
      throw error;
    }
    return {
      success: true,
      data: { ...variant, availableUnits: checkUnitAvailability(variantId).availableCount },
    };
  },

  /** POST /iphones/calculate-price — kalkulasi harga di sisi server (mock). */
  calculatePrice: async ({ variantId, startDate, endDate, discount = 0 }) => {
    await simulateLatency(250);
    // Pakai getMergedVariants() agar varian hasil edit/model admin ikut terhitung.
    const variant = getMergedVariants().find((v) => v.id === variantId);
    if (!variant) {
      const error = new Error('Varian tidak ditemukan');
      error.status = 404;
      throw error;
    }
    const result = calculateRentalPrice(variant, startDate, endDate, discount);
    const availability = checkUnitAvailability(variantId, startDate, endDate);
    return {
      success: true,
      data: { ...result, isAvailable: availability.availableCount > 0 },
    };
  },

  /** Statistik katalog untuk landing page. */
  stats: async () => {
    await simulateLatency(150);
    const models = getMergedModels().filter((m) => m.isPublished !== false);
    const variants = getMergedVariants().filter((v) => v.isPublished !== false);
    return {
      success: true,
      data: {
        totalModels: models.length,
        totalVariants: variants.length,
        lowestDailyRate: variants.length
          ? Math.min(...variants.map((v) => v.dailyRate))
          : 0,
      },
    };
  },
};
