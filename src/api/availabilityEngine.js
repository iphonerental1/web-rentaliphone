/**
 * AVAILABILITY ENGINE — logika anti-collision (PRD Section 4.3).
 *
 * Menjamin satu unit fisik tidak dapat memiliki dua jadwal sewa yang
 * bertabrakan. Di backend, logika ini dijalankan dalam transaksi ACID
 * dengan row-level lock (SELECT ... FOR UPDATE); di frontend disimulasikan
 * dari data order/unit pada mock database.
 */

import { readCollection } from '../data/mockDb';
import { ORDER_STATUS, STORAGE_KEYS, UNIT_STATUS } from '../constants';

/** Status pesanan yang masih memegang slot unit. */
export const SLOT_BLOCKING_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.WAITING_VERIFICATION,
  ORDER_STATUS.APPROVED,
  ORDER_STATUS.AWAITING_PAYMENT,
  ORDER_STATUS.PAID,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.ACTIVE_RENTAL,
  ORDER_STATUS.RETURNED,
  ORDER_STATUS.INSPECTION_PENDING,
  ORDER_STATUS.OVERDUE,
];

/** Pesanan komitmen tapi unit fisiknya belum dialokasikan. */
export const COMMITTED_UNALLOCATED_STATUSES = [
  ORDER_STATUS.WAITING_VERIFICATION,
  ORDER_STATUS.APPROVED,
  ORDER_STATUS.AWAITING_PAYMENT,
  ORDER_STATUS.PAID,
  ORDER_STATUS.PREPARING,
];

/** Status unit yang tidak dapat disewakan. */
export const UNRENTABLE_UNIT_STATUSES = [
  UNIT_STATUS.MAINTENANCE,
  UNIT_STATUS.LOST,
  UNIT_STATUS.DECOMMISSIONED,
  UNIT_STATUS.UNDER_INSPECTION,
];

export const readOrders = () => readCollection(STORAGE_KEYS.mockOrders, []);
export const readUnits = () => readCollection(STORAGE_KEYS.mockUnits, []);

/** Uji overlap dua rentang: (aStart < bEnd) && (aEnd > bStart). */
export const rangesOverlap = (aStart, aEnd, bStart, bEnd) => {
  const aS = new Date(aStart).getTime();
  const aE = new Date(aEnd).getTime();
  const bS = new Date(bStart).getTime();
  const bE = new Date(bEnd).getTime();
  return aS < bE && aE > bS;
};

/**
 * Ambil daftar unit yang sudah terpakai pada rentang tanggal tertentu.
 * Setara dengan query overlap pada tabel `unit_booking_slots` (PRD 4.3).
 */
export const getUnitOccupancy = (startDate, endDate, excludeOrderId = null) => {
  const orders = readOrders();
  const blockingOrders = orders.filter(
    (o) =>
      o.id !== excludeOrderId &&
      SLOT_BLOCKING_STATUSES.includes(o.orderStatus) &&
      rangesOverlap(o.startDate, o.endDate, startDate, endDate)
  );

  const blockedUnitIds = blockingOrders
    .flatMap((o) => o.items || [])
    .map((i) => i.allocatedUnitId)
    .filter(Boolean);

  return { blockedUnitIds, blockingOrders };
};

/**
 * Hitung ketersediaan unit fisik untuk sebuah varian.
 *
 * Tanpa tanggal  -> hitung unit berstatus AVAILABLE.
 * Dengan tanggal -> unit sehat dikurangi unit terblokir, dikurangi jumlah
 *                   pesanan komitmen yang belum mendapat alokasi unit.
 */
export const checkUnitAvailability = (variantId, startDate = null, endDate = null) => {
  const units = readUnits();
  const variantUnits = units.filter(
    (u) => u.variantId === variantId && !UNRENTABLE_UNIT_STATUSES.includes(u.currentStatus)
  );

  if (!startDate || !endDate) {
    return {
      totalUnits: variantUnits.length,
      availableCount: variantUnits.filter((u) => u.currentStatus === UNIT_STATUS.AVAILABLE).length,
      bookedCount: variantUnits.filter((u) => u.currentStatus === UNIT_STATUS.BOOKED).length,
      freeUnits: variantUnits
        .filter((u) => u.currentStatus === UNIT_STATUS.AVAILABLE)
        .map((u) => u.id),
    };
  }

  const { blockedUnitIds } = getUnitOccupancy(startDate, endDate);
  const freeUnits = variantUnits.filter((u) => !blockedUnitIds.includes(u.id));

  const committedCount = readOrders().filter(
    (o) =>
      COMMITTED_UNALLOCATED_STATUSES.includes(o.orderStatus) &&
      rangesOverlap(o.startDate, o.endDate, startDate, endDate) &&
      (o.items || []).some((i) => i.variantId === variantId && !i.allocatedUnitId)
  ).length;

  return {
    totalUnits: variantUnits.length,
    availableCount: Math.max(0, freeUnits.length - committedCount),
    freeUnits: freeUnits.map((u) => u.id),
    blockedUnitIds,
    committedCount,
  };
};

/** Apakah unit tertentu bebas pada rentang tanggal tertentu. */
export const isUnitFree = (unitId, startDate, endDate, excludeOrderId = null) => {
  const { blockedUnitIds } = getUnitOccupancy(startDate, endDate, excludeOrderId);
  return !blockedUnitIds.includes(unitId);
};