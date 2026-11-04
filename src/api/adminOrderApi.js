/**
 * ADMIN ORDER API — `/api/v1/admin/orders/*` & `/admin/returns/*`
 * (PRD Section 8.5 & 8.6): alokasi unit fisik, penggantian unit,
 * proses inspeksi pengembalian, dan penetapan denda.
 */

import {
  appendAuditLog,
  generateId,
  readCollection,
  simulateLatency,
  writeCollection,
} from '../data/mockDb';
import { ORDER_STATUS, STORAGE_KEYS, UNIT_STATUS } from '../constants';
import { calculateDepositSettlement } from '../utils/pricingEngine';
import { getUnitOccupancy, UNRENTABLE_UNIT_STATUSES } from './availabilityEngine';

const readOrders = () => readCollection(STORAGE_KEYS.mockOrders, []);
const writeOrders = (orders) => writeCollection(STORAGE_KEYS.mockOrders, orders);
const readUnits = () => readCollection(STORAGE_KEYS.mockUnits, []);
const writeUnits = (units) => writeCollection(STORAGE_KEYS.mockUnits, units);

/** Unit yang kandidat untuk dialokasikan pada order tertentu. */
export const getCandidateUnits = (order, excludeOrderId = null) => {
  if (!order) return [];
  const variantId = order.items?.[0]?.variantId;
  const units = readUnits().filter((u) => u.variantId === variantId);
  const { blockedUnitIds } = getUnitOccupancy(order.startDate, order.endDate, excludeOrderId || order.id);

  return units.map((u) => ({
    ...u,
    isSelectable: !blockedUnitIds.includes(u.id) && !UNRENTABLE_UNIT_STATUSES.includes(u.currentStatus),
    blockReason: blockedUnitIds.includes(u.id)
      ? 'Sudah terpesan pada rentang tanggal ini'
      : UNRENTABLE_UNIT_STATUSES.includes(u.currentStatus)
        ? `Status unit: ${u.currentStatus}`
        : null,
  }));
};

export const adminOrderApi = {
  /** POST /admin/orders/:orderId/allocate-unit (PRD 8.5). */
  allocateUnit: async (orderId, unitId, currentUser) => {
    await simulateLatency(500);
    const orders = readOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      const error = new Error('Pesanan tidak ditemukan');
      error.status = 404;
      throw error;
    }

    const order = orders[index];
    const units = readUnits();
    const unit = units.find((u) => u.id === unitId);
    if (!unit) {
      const error = new Error('Unit tidak ditemukan');
      error.status = 404;
      throw error;
    }

    // ── Anti double-booking (PRD 4.3) ──
    const { blockedUnitIds } = getUnitOccupancy(order.startDate, order.endDate, orderId);
    if (blockedUnitIds.includes(unitId)) {
      const error = new Error(
        `Unit ${unit.imei} sudah terpesan pada rentang tanggal tersebut (anti double-booking).`
      );
      error.status = 409;
      throw error;
    }
    if (UNRENTABLE_UNIT_STATUSES.includes(unit.currentStatus)) {
      const error = new Error(`Unit tidak dapat dialokasikan (status: ${unit.currentStatus})`);
      error.status = 400;
      throw error;
    }

    const nowIso = new Date().toISOString();
    const nextOrderStatus =
      order.orderStatus === ORDER_STATUS.PAID ? ORDER_STATUS.PREPARING : order.orderStatus;

    const updated = {
      ...order,
      items: (order.items || []).map((item) =>
        item.variantId === unit.variantId || !item.allocatedUnitId
          ? { ...item, allocatedUnitId: unit.id, allocatedImei: unit.imei }
          : item
      ),
      orderStatus: nextOrderStatus,
      timeline: [
        ...(order.timeline || []),
        {
          status: nextOrderStatus,
          at: nowIso,
          actor: currentUser?.email || 'admin@irent.local',
          note: `Unit ${unit.imei} (${unit.serialNumber}) dialokasikan`,
        },
      ],
      updatedAt: nowIso,
    };

    orders[index] = updated;
    writeOrders(orders);
    writeUnits(
      units.map((u) => (u.id === unitId ? { ...u, currentStatus: UNIT_STATUS.BOOKED, updatedAt: nowIso } : u))
    );

    appendAuditLog({
      user: currentUser,
      action: 'UNIT_ALLOCATED',
      entityName: 'rental_items',
      entityId: orderId,
      oldValues: { allocatedUnitId: null },
      newValues: { allocatedUnitId: unit.id, imei: unit.imei },
    });

    return { success: true, message: `Unit ${unit.imei} berhasil dialokasikan`, data: updated };
  },

  /** POST /admin/orders/:id/replace-unit — penggantian unit darurat (PRD 6.4). */
  replaceUnit: async (orderId, newUnitId, currentUser) => {
    const orders = readOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      const error = new Error('Pesanan tidak ditemukan');
      error.status = 404;
      throw error;
    }

    const oldUnitId = (order.items || []).find((i) => i.allocatedUnitId)?.allocatedUnitId;
    const result = await adminOrderApi.allocateUnit(orderId, newUnitId, currentUser);

    if (oldUnitId && oldUnitId !== newUnitId) {
      const nowIso = new Date().toISOString();
      writeUnits(
        readUnits().map((u) =>
          u.id === oldUnitId ? { ...u, currentStatus: UNIT_STATUS.AVAILABLE, updatedAt: nowIso } : u
        )
      );
      appendAuditLog({
        user: currentUser,
        action: 'UNIT_RELEASED',
        entityName: 'iphone_units',
        entityId: oldUnitId,
        oldValues: { currentStatus: UNIT_STATUS.BOOKED },
        newValues: { currentStatus: UNIT_STATUS.AVAILABLE, reason: 'Diganti unit lain' },
      });
    }
    return result;
  },

  /** POST /admin/returns/:orderId/inspect (PRD 8.6). */
  submitInspection: async (orderId, payload, currentUser) => {
    await simulateLatency(700);
    const orders = readOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      const error = new Error('Pesanan tidak ditemukan');
      error.status = 404;
      throw error;
    }

    const order = orders[index];
    const allocatedUnitId = (order.items || []).find((i) => i.allocatedUnitId)?.allocatedUnitId;
    const nowIso = new Date().toISOString();

    const inspection = {
      id: generateId('ins'),
      orderId,
      unitId: allocatedUnitId,
      inspectorUserId: currentUser?.id,
      inspectorName: currentUser?.fullName || 'Admin',
      actualReturnTime: payload.actualReturnTime,
      initialBatteryHealth: payload.initialBatteryHealth ?? null,
      returnedBatteryHealth: Number(payload.returnedBatteryHealth),
      icloudRemoved: Boolean(payload.icloudRemoved),
      passcodeRemoved: Boolean(payload.passcodeRemoved),
      screenCondition: payload.screenCondition,
      bodyCondition: payload.bodyCondition,
      checklist: payload.checklist || {},
      accessoriesReturned: payload.accessoriesReturned || {},
      inspectionNotes: payload.inspectionNotes || '',
      inspectionImages: payload.inspectionImages || [],
      createdAt: nowIso,
    };

    const fines = (payload.fines || []).map((f) => ({
      id: generateId('fin'),
      orderId,
      inspectionId: inspection.id,
      fineType: f.fineType,
      amount: Number(f.amount) || 0,
      reason: f.reason,
      deductedFromDeposit: f.deductedFromDeposit !== false,
      settlementStatus: 'DEDUCTED_FROM_DEPOSIT',
      createdAt: nowIso,
    }));

    const settlement = calculateDepositSettlement(order.securityDeposit, fines);

    const updated = {
      ...order,
      inspection,
      fines,
      settlement,
      orderStatus: ORDER_STATUS.COMPLETED,
      timeline: [
        ...(order.timeline || []),
        { status: ORDER_STATUS.INSPECTION_PENDING, at: nowIso, actor: currentUser?.email || 'admin@irent.local', note: 'Inspeksi disimpan' },
        {
          status: ORDER_STATUS.COMPLETED,
          at: nowIso,
          actor: currentUser?.email || 'admin@irent.local',
          note: `Refund deposit: ${settlement.refundAmount}`,
        },
      ],
      refund: {
        id: generateId('pay'),
        paymentNumber: `REF-${Date.now().toString().slice(-8)}`,
        paymentType: 'DEPOSIT_REFUND',
        amount: Math.max(0, settlement.refundAmount),
        paymentMethod: 'BANK_TRANSFER',
        status: 'VERIFIED',
        verifiedBy: currentUser?.email || 'admin@irent.local',
        verifiedAt: nowIso,
        createdAt: nowIso,
      },
      updatedAt: nowIso,
    };

    orders[index] = updated;
    writeOrders(orders);

    if (allocatedUnitId) {
      writeUnits(
        readUnits().map((u) =>
          u.id === allocatedUnitId
            ? {
                ...u,
                currentStatus: UNIT_STATUS.AVAILABLE,
                batteryHealth: inspection.returnedBatteryHealth || u.batteryHealth,
                notes: payload.inspectionNotes || u.notes,
                updatedAt: nowIso,
              }
            : u
        )
      );
    }

    appendAuditLog({
      user: currentUser,
      action: 'INSPECTION_SUBMITTED',
      entityName: 'return_inspections',
      entityId: inspection.id,
      newValues: { orderId, fines: fines.length, refund: settlement.refundAmount },
    });

    return { success: true, message: 'Inspeksi tersimpan, pesanan selesai', data: updated };
  },

  /** POST /admin/orders/:id/fines — tambah denda manual. */
  addFine: async (orderId, finePayload, currentUser) => {
    await simulateLatency(350);
    const orders = readOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      const error = new Error('Pesanan tidak ditemukan');
      error.status = 404;
      throw error;
    }

    const order = orders[index];
    const fine = {
      id: generateId('fin'),
      orderId,
      inspectionId: order.inspection?.id || null,
      fineType: finePayload.fineType,
      amount: Number(finePayload.amount) || 0,
      reason: finePayload.reason,
      deductedFromDeposit: finePayload.deductedFromDeposit !== false,
      settlementStatus: 'DEDUCTED_FROM_DEPOSIT',
      createdAt: new Date().toISOString(),
    };

    const fines = [...(order.fines || []), fine];
    const updated = { ...order, fines, settlement: calculateDepositSettlement(order.securityDeposit, fines) };
    orders[index] = updated;
    writeOrders(orders);

    appendAuditLog({
      user: currentUser,
      action: 'FINE_ISSUED',
      entityName: 'fines',
      entityId: fine.id,
      newValues: { orderId, amount: fine.amount, reason: fine.reason },
    });

    return { success: true, message: 'Denda ditambahkan', data: updated };
  },
};