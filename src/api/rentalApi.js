/**
 * RENTAL API — `/api/v1/rentals/*` (PRD Section 8.3).
 * Menangani pembuatan order, riwayat, detail, perubahan status, dan statistik.
 * Alokasi unit & inspeksi ada di `adminOrderApi.js`.
 */

import {
  appendAuditLog,
  generateId,
  generateOrderNumber,
  readCollection,
  simulateLatency,
  writeCollection,
} from '../data/mockDb';
import { getVariantById } from '../data/catalog';
import { ORDER_STATUS, STORAGE_KEYS, UNIT_STATUS } from '../constants';
import { calculateRentalPrice } from '../utils/pricingEngine';
import { checkUnitAvailability } from './availabilityEngine';

const readOrders = () => readCollection(STORAGE_KEYS.mockOrders, []);
const writeOrders = (orders) => writeCollection(STORAGE_KEYS.mockOrders, orders);
const readUnits = () => readCollection(STORAGE_KEYS.mockUnits, []);
const writeUnits = (units) => writeCollection(STORAGE_KEYS.mockUnits, units);

const countByStatus = (orders, status) => orders.filter((o) => o.orderStatus === status).length;

export const rentalApi = {
  /** POST /rentals — buat pesanan baru dengan penguncian slot. */
  create: async (payload, currentUser) => {
    await simulateLatency(700);
    const variant = getVariantById(payload.variantId);
    if (!variant) {
      const error = new Error('Varian tidak ditemukan');
      error.status = 404;
      throw error;
    }
    if (new Date(payload.endDate) <= new Date(payload.startDate)) {
      const error = new Error('Tanggal selesai harus setelah tanggal mulai');
      error.status = 400;
      throw error;
    }

    const availability = checkUnitAvailability(payload.variantId, payload.startDate, payload.endDate);
    if (availability.availableCount <= 0) {
      const error = new Error('Unit tidak tersedia pada rentang tanggal tersebut. Silakan pilih tanggal lain.');
      error.status = 409;
      throw error;
    }

    const pricing = calculateRentalPrice(variant, payload.startDate, payload.endDate, 0);
    const orders = readOrders();
    const nowIso = new Date().toISOString();

    const order = {
      id: generateId('ord'),
      orderNumber: generateOrderNumber(orders.length + 1),
      customerId: currentUser?.customerId || 'cst-guest',
      customerName: currentUser?.fullName || 'Guest',
      customerEmail: currentUser?.email || '-',
      customerPhone: currentUser?.phoneNumber || '-',
      items: [
        {
          id: generateId('itm'),
          variantId: variant.id,
          modelName: variant.modelName,
          storageCapacity: variant.storageCapacity,
          colorName: variant.colorName,
          allocatedUnitId: null,
          allocatedImei: null,
          itemDailyPrice: variant.dailyRate,
          itemSubtotal: pricing.rentalFee,
        },
      ],
      startDate: payload.startDate,
      endDate: payload.endDate,
      totalDays: pricing.totalDays,
      rentalFee: pricing.rentalFee,
      securityDeposit: pricing.securityDeposit,
      discountAmount: 0,
      grandTotal: pricing.grandTotal,
      deliveryType: payload.deliveryType || 'STORE_PICKUP',
      addressId: payload.addressId || null,
      notes: payload.notes || null,
      orderStatus: ORDER_STATUS.WAITING_VERIFICATION,
      payment: null,
      inspection: null,
      fines: [],
      timeline: [
        { status: ORDER_STATUS.PENDING, at: nowIso, actor: currentUser?.fullName || 'Customer' },
        { status: ORDER_STATUS.WAITING_VERIFICATION, at: nowIso, actor: currentUser?.fullName || 'Customer' },
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    writeOrders([order, ...orders]);
    appendAuditLog({
      user: currentUser,
      action: 'ORDER_CREATED',
      entityName: 'rental_orders',
      entityId: order.id,
      newValues: { orderNumber: order.orderNumber, grandTotal: order.grandTotal },
    });

    return { success: true, message: 'Pesanan berhasil dibuat', data: order };
  },

  /** GET /rentals/my-orders */
  myOrders: async (customerEmail) => {
    await simulateLatency(400);
    const orders = readOrders();
    const filtered = customerEmail
      ? orders.filter((o) => o.customerEmail === customerEmail)
      : orders;
    return { success: true, data: filtered };
  },

  /** GET /rentals/:id */
  detail: async (orderId) => {
    await simulateLatency(300);
    const order = readOrders().find((o) => o.id === orderId);
    if (!order) {
      const error = new Error('Pesanan tidak ditemukan');
      error.status = 404;
      throw error;
    }
    return { success: true, data: order };
  },

  /** GET /admin/orders — daftar semua pesanan. */
  listAll: async (filters = {}) => {
    await simulateLatency(400);
    const { status = '', search = '' } = filters;
    let orders = readOrders();

    if (status) orders = orders.filter((o) => o.orderStatus === status);
    if (search) {
      const k = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(k) ||
          o.customerName.toLowerCase().includes(k) ||
          (o.items || []).some((i) => (i.allocatedImei || '').includes(k))
      );
    }
    return { success: true, data: orders, meta: { total: orders.length } };
  },

  /** PATCH /admin/orders/:id/status — transisi status (state machine PRD 5.2). */
  updateStatus: async (orderId, newStatus, currentUser, note = '') => {
    await simulateLatency(400);
    const orders = readOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      const error = new Error('Pesanan tidak ditemukan');
      error.status = 404;
      throw error;
    }

    const order = orders[index];
    const oldStatus = order.orderStatus;
    const nowIso = new Date().toISOString();

    const updated = {
      ...order,
      orderStatus: newStatus,
      timeline: [
        ...(order.timeline || []),
        { status: newStatus, at: nowIso, actor: currentUser?.email || 'system@irent.local', note },
      ],
      updatedAt: nowIso,
    };

    // Sinkronkan status unit fisik yang teralokasi.
    const allocatedIds = (updated.items || []).map((i) => i.allocatedUnitId).filter(Boolean);
    if (allocatedIds.length) {
      const units = readUnits();
      writeUnits(
        units.map((u) => {
          if (!allocatedIds.includes(u.id)) return u;
          let next = u.currentStatus;
          if ([ORDER_STATUS.ACTIVE_RENTAL, ORDER_STATUS.OVERDUE].includes(newStatus)) {
            next = UNIT_STATUS.IN_RENTAL;
          } else if (
            [ORDER_STATUS.PREPARING, ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.OUT_FOR_DELIVERY].includes(newStatus)
          ) {
            next = UNIT_STATUS.BOOKED;
          } else if ([ORDER_STATUS.RETURNED, ORDER_STATUS.INSPECTION_PENDING].includes(newStatus)) {
            next = UNIT_STATUS.UNDER_INSPECTION;
          } else if ([ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(newStatus)) {
            next = UNIT_STATUS.AVAILABLE;
          }
          return { ...u, currentStatus: next, updatedAt: nowIso };
        })
      );
    }

    orders[index] = updated;
    writeOrders(orders);
    appendAuditLog({
      user: currentUser,
      action: 'ORDER_STATUS_CHANGED',
      entityName: 'rental_orders',
      entityId: orderId,
      oldValues: { orderStatus: oldStatus },
      newValues: { orderStatus: newStatus, note },
    });

    return { success: true, message: `Status diperbarui menjadi ${newStatus}`, data: updated };
  },

  /** Ringkasan statistik untuk dashboard admin. */
  stats: async () => {
    await simulateLatency(300);
    const orders = readOrders();
    const units = readUnits();
    const paid = orders.filter((o) => o.payment?.status === 'VERIFIED');

    return {
      success: true,
      data: {
        totalOrders: orders.length,
        activeRentals: countByStatus(orders, ORDER_STATUS.ACTIVE_RENTAL),
        overdue: countByStatus(orders, ORDER_STATUS.OVERDUE),
        awaitingPayment: countByStatus(orders, ORDER_STATUS.AWAITING_PAYMENT),
        waitingVerification: countByStatus(orders, ORDER_STATUS.WAITING_VERIFICATION),
        preparing: countByStatus(orders, ORDER_STATUS.PREPARING),
        inspectionPending: countByStatus(orders, ORDER_STATUS.INSPECTION_PENDING),
        completed: countByStatus(orders, ORDER_STATUS.COMPLETED),
        cancelled: countByStatus(orders, ORDER_STATUS.CANCELLED),
        revenue: paid.reduce((s, o) => s + (o.payment?.amount || 0), 0),
        rentalRevenue: paid.reduce((s, o) => s + (o.rentalFee || 0), 0),
        depositHeld: orders
          .filter((o) =>
            [ORDER_STATUS.ACTIVE_RENTAL, ORDER_STATUS.PREPARING, ORDER_STATUS.READY_FOR_PICKUP].includes(o.orderStatus)
          )
          .reduce((s, o) => s + (o.securityDeposit || 0), 0),
        totalFines: orders.reduce((s, o) => s + (o.fines || []).reduce((a, f) => a + (f.amount || 0), 0), 0),
        totalUnits: units.length,
        availableUnits: units.filter((u) => u.currentStatus === UNIT_STATUS.AVAILABLE).length,
        rentedUnits: units.filter((u) => u.currentStatus === UNIT_STATUS.IN_RENTAL).length,
        maintenanceUnits: units.filter((u) => u.currentStatus === UNIT_STATUS.MAINTENANCE).length,
        lowBatteryUnits: units.filter((u) => u.batteryHealth < 85).length,
      },
    };
  },
};