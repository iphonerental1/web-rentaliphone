/**
 * ADMIN API — logika bisnis Admin Portal (MOCK, tanpa backend).
 *
 * Meniru endpoint /api/v1/admin/* dari dokumen perencanaan:
 *   GET/POST/PATCH /admin/bookings     — pencatatan transaksi WhatsApp
 *   GET/POST/PATCH/DELETE /admin/units — inventaris unit fisik
 *   GET/PATCH /admin/catalog           — CRUD katalog (via catalogStore)
 *   GET /admin/dashboard, /admin/reports
 *
 * Semua operasi memakai primitif localStorage dari mockDb dan
 * availabilityEngine (anti double-booking), plus appendAuditLog untuk
 * jejak aktivitas — konsisten dengan sisi publik.
 */

import {
  appendAuditLog,
  generateId,
  generateOrderNumber,
  generatePaymentNumber,
  readCollection,
  simulateLatency,
  writeCollection,
} from '../data/mockDb';
import {
  ORDER_STATUS,
  ORDER_STATUS_META,
  PAYMENT_STATUS,
  STORAGE_KEYS,
  UNIT_STATUS,
} from '../constants';
import { readUnits } from './availabilityEngine';
import {
  getMergedModels,
  getMergedVariants,
  readCatalogStore,
  removeStoreEntry,
  upsertStoreEntry,
} from '../data/catalogStore';
import {
  calculateRentalPrice,
  calculateLateFine,
  calculateDepositSettlement,
} from '../utils/pricingEngine';
import { slugify } from '../utils/formatter';

const readOrders = () => readCollection(STORAGE_KEYS.mockOrders, []);
const writeOrders = (orders) => writeCollection(STORAGE_KEYS.mockOrders, orders);
const writeUnits = (units) => writeCollection(STORAGE_KEYS.mockUnits, units);

/** Setor audit log memakai sesi admin aktif. */
const audit = (action, entityName, entityId, oldValues, newValues) => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null');
  } catch {
    user = null;
  }
  appendAuditLog({ user, action, entityName, entityId, oldValues, newValues });
};

/** Aktivasi/penyelesaian sewa selalu sinkronkan status unit fisik. */
const syncUnitStatus = (unitId, status) => {
  if (!unitId) return;
  const units = readUnits();
  const idx = units.findIndex((u) => u.id === unitId);
  if (idx >= 0) {
    units[idx] = { ...units[idx], currentStatus: status };
    writeUnits(units);
  }
};

export const adminApi = {
  // ───────────────────────────────────────────────────
  // DASHBOARD OVERVIEW  (GET /admin/dashboard)
  // ───────────────────────────────────────────────────
  dashboard: async () => {
    await simulateLatency(350);
    const orders = readOrders();
    const units = readUnits();

    const paidStatuses = [ORDER_STATUS.PAID, ORDER_STATUS.ACTIVE_RENTAL, ORDER_STATUS.RETURNED, ORDER_STATUS.COMPLETED];
    const totalRevenue = orders
      .filter((o) => paidStatuses.includes(o.orderStatus))
      .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
    const totalFines = orders.reduce(
      (sum, o) => sum + (o.fines || []).reduce((s, f) => s + (Number(f.amount) || 0), 0),
      0
    );

    const activeStatuses = [ORDER_STATUS.ACTIVE_RENTAL, ORDER_STATUS.OVERDUE];
    const activeRentals = orders.filter((o) => activeStatuses.includes(o.orderStatus));
    const pendingOrders = orders.filter((o) =>
      [ORDER_STATUS.PENDING, ORDER_STATUS.WAITING_VERIFICATION, ORDER_STATUS.AWAITING_PAYMENT].includes(o.orderStatus)
    );

    const inSevenDays = Date.now() + 7 * 86400000;
    const upcomingReturns = activeRentals
      .filter((o) => new Date(o.endDate).getTime() <= inSevenDays)
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

    const unitByStatus = units.reduce((acc, u) => {
      acc[u.currentStatus] = (acc[u.currentStatus] || 0) + 1;
      return acc;
    }, {});

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    return {
      success: true,
      data: {
        totalRevenue,
        totalFines,
        totalUnits: units.length,
        availableUnits: unitByStatus[UNIT_STATUS.AVAILABLE] || 0,
        rentedUnits: unitByStatus[UNIT_STATUS.IN_RENTAL] || 0,
        activeRentals: activeRentals.length,
        pendingOrders: pendingOrders.length,
        totalOrders: orders.length,
        upcomingReturns,
        unitByStatus,
        recentOrders,
      },
    };
  },

  // ───────────────────────────────────────────────────
  // BOOKINGS  (list / create / update status)
  // ───────────────────────────────────────────────────
  /** GET /admin/bookings — filter by status & pencarian. */
  listBookings: async ({ status = '', search = '' } = {}) => {
    await simulateLatency(300);
    const keyword = search.trim().toLowerCase();
    let data = readOrders();
    if (status) data = data.filter((o) => o.orderStatus === status);
    if (keyword) {
      data = data.filter(
        (o) =>
          String(o.orderNumber).toLowerCase().includes(keyword) ||
          String(o.customerName).toLowerCase().includes(keyword) ||
          String(o.customerPhone).toLowerCase().includes(keyword)
      );
    }
    data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { success: true, data };
  },

  /**
   * POST /admin/bookings — input booking manual dari kesepakatan WhatsApp.
   * Mengalokasikan unit AVAILABLE pertama & men-set status unit sesuai
   * status awal booking (mencegah double-booking via availabilityEngine).
   */
  createBooking: async (payload) => {
    await simulateLatency(400);
    const {
      customerName,
      customerPhone,
      customerNik = '-',
      variantId,
      startDate,
      endDate,
      initialStatus = ORDER_STATUS.PENDING,
      paymentMethod = 'TRANSFER_BANK',
      proofImage = null,
      notes = '',
      fineAmount = 0,
    } = payload;

    const variant = getMergedVariants().find((v) => v.id === variantId);
    if (!variant) {
      const error = new Error('Varian tidak ditemukan');
      error.status = 404;
      throw error;
    }
    if (!customerName || !customerPhone || !startDate || !endDate) {
      const error = new Error('Nama, nomor WA, dan tanggal sewa wajib diisi');
      error.status = 400;
      throw error;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      const error = new Error('Tanggal selesai sewa harus setelah tanggal mulai sewa');
      error.status = 400;
      throw error;
    }

    const orders = readOrders();
    const units = readUnits();

    // Alokasi unit: cari unit varian ini yang bebas pada rentang tanggal.
    const blocking = orders
      .filter(
        (o) =>
          ![ORDER_STATUS.CANCELLED, ORDER_STATUS.COMPLETED].includes(o.orderStatus) &&
          new Date(o.startDate) < new Date(endDate) &&
          new Date(o.endDate) > new Date(startDate)
      )
      .flatMap((o) => (o.items || []).map((i) => i.allocatedUnitId))
      .filter(Boolean);

    const freeUnit = units.find(
      (u) =>
        u.variantId === variantId &&
        u.currentStatus === UNIT_STATUS.AVAILABLE &&
        !blocking.includes(u.id)
    );

    const pricing = calculateRentalPrice(variant, startDate, endDate);
    const seq = orders.length + 1;

    const newOrder = {
      id: generateId('ord'),
      orderNumber: generateOrderNumber(seq),
      customerName,
      customerPhone,
      customerNik,
      source: 'WHATSAPP',
      orderStatus: initialStatus,
      startDate,
      endDate,
      totalDays: pricing.totalDays,
      items: [
        {
          variantId: variant.id,
          modelName: variant.modelName,
          storageCapacity: variant.storageCapacity,
          colorName: variant.colorName,
          imageUrl: variant.imageUrl,
          dailyRate: variant.dailyRate,
          qty: 1,
          allocatedUnitId: freeUnit?.id || null,
        },
      ],
      rentalFee: pricing.rentalFee,
      securityDeposit: 0,
      dpAmount: pricing.dpAmount,
      remainingPayment: pricing.remainingPayment,
      grandTotal: pricing.grandTotal + (Number(fineAmount) || 0),
      fines:
        Number(fineAmount) > 0
          ? [
              {
                id: generateId('fine'),
                fineType: 'OTHER',
                amount: Number(fineAmount),
                reason: 'Denda disepakati di WhatsApp',
                createdAt: new Date().toISOString(),
              },
            ]
          : [],
      payment: {
        method: paymentMethod,
        bankAccount: 'BCA 8820-1177-99 a.n. iRent',
        amount: pricing.rentalFee,
        status: PAYMENT_STATUS.PENDING,
        proofImage,
        paidAt: proofImage ? new Date().toISOString() : null,
        verifiedAt: null,
        number: generatePaymentNumber(seq),
      },
      notes,
      createdAt: new Date().toISOString(),
      actualReturnDate: null,
    };

    orders.unshift(newOrder);
    writeOrders(orders);

    // Unit dialokasikan -> BOOKED (atau IN_RENTAL bila langsung aktif)
    if (freeUnit) {
      const unitStatus =
        initialStatus === ORDER_STATUS.ACTIVE_RENTAL ? UNIT_STATUS.IN_RENTAL : UNIT_STATUS.BOOKED;
      syncUnitStatus(freeUnit.id, unitStatus);
    }

    audit('CREATE_BOOKING', 'Booking', newOrder.id, null, {
      orderNumber: newOrder.orderNumber,
      customerName,
      grandTotal: newOrder.grandTotal,
    });

    return {
      success: true,
      message: `Booking ${newOrder.orderNumber} tersimpan${freeUnit ? '' : ' (unit akan dialokasikan belakangan)'}`,
      data: newOrder,
    };
  },

  /**
   * PATCH /admin/bookings/:id/status — alur status sesuai dokumen.
   *  WAITING_VERIFICATION -> APPROVED -> PAID (setelah verif pembayaran)
   *  -> ACTIVE_RENTAL (serah terima unit) -> COMPLETED (pengembalian)
   * Setiap transisi menjaga sinkronisasi status unit fisik.
   */
  updateBookingStatus: async (orderId, nextStatus, { proofImage = null } = {}) => {
    await simulateLatency(300);
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx < 0) {
      const error = new Error('Booking tidak ditemukan');
      error.status = 404;
      throw error;
    }

    const order = { ...orders[idx] };
    const oldStatus = order.orderStatus;
    const unitId = order.items?.[0]?.allocatedUnitId || null;
    const now = new Date().toISOString();

    order.orderStatus = nextStatus;

    if (nextStatus === ORDER_STATUS.AWAITING_PAYMENT || nextStatus === ORDER_STATUS.APPROVED) {
      if (unitId) syncUnitStatus(unitId, UNIT_STATUS.BOOKED);
      // Bukti transfer dikirim penyewa via WA, admin tempelkan di sini.
      if (proofImage || order.payment) {
        order.payment = {
          ...order.payment,
          proofImage: proofImage || order.payment?.proofImage || null,
          paidAt: proofImage ? now : order.payment?.paidAt || null,
        };
      }
    }

    if (nextStatus === ORDER_STATUS.ACTIVE_RENTAL) {
      if (unitId) syncUnitStatus(unitId, UNIT_STATUS.IN_RENTAL);
    }

    if (nextStatus === ORDER_STATUS.COMPLETED) {
      order.actualReturnDate = now;
      if (unitId) syncUnitStatus(unitId, UNIT_STATUS.AVAILABLE);
    }

    if (nextStatus === ORDER_STATUS.CANCELLED) {
      if (unitId) syncUnitStatus(unitId, UNIT_STATUS.AVAILABLE);
    }

    orders[idx] = order;
    writeOrders(orders);

    audit('UPDATE_BOOKING_STATUS', 'Booking', order.id, { status: oldStatus }, { status: nextStatus });

    return {
      success: true,
      message: `${order.orderNumber} -> ${ORDER_STATUS_META[nextStatus]?.label || nextStatus}`,
      data: order,
    };
  },

  /** POST /admin/bookings/:id/verify-payment — tandai transfer terverifikasi. */
  verifyPayment: async (orderId) => {
    await simulateLatency(300);
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx < 0) {
      const error = new Error('Booking tidak ditemukan');
      error.status = 404;
      throw error;
    }
    const now = new Date().toISOString();
    orders[idx] = {
      ...orders[idx],
      orderStatus: ORDER_STATUS.PAID,
      payment: {
        ...orders[idx].payment,
        status: PAYMENT_STATUS.VERIFIED,
        verifiedAt: now,
        paidAt: orders[idx].payment?.paidAt || now,
      },
    };
    writeOrders(orders);
    audit('VERIFY_PAYMENT', 'Payment', orderId, null, { amount: orders[idx].payment?.amount });
    return { success: true, message: 'Pembayaran terverifikasi', data: orders[idx] };
  },

  /**
   * POST /admin/bookings/:id/return — proses pengembalian + penyelesaian
   * denda atas keterlambatan/kerusakan, lalu settlement deposit (PRD 7.5).
   */
  completeBooking: async (orderId, { returnDate = null, extraFines = [], waiveFines = false } = {}) => {
    await simulateLatency(350);
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx < 0) {
      const error = new Error('Booking tidak ditemukan');
      error.status = 404;
      throw error;
    }

    const order = { ...orders[idx] };
    const returnedAt = returnDate || new Date().toISOString();
    const dailyRate = order.items?.[0]?.dailyRate || 0;

    // Denda keterlambatan otomatis (PRD 7.5)
    const lateFine = waiveFines
      ? { amount: 0, note: 'Denda diwaive admin' }
      : calculateLateFine(order.endDate, returnedAt, dailyRate);

    const fines = [
      ...(order.fines || []),
      ...(lateFine.amount > 0
        ? [
            {
              id: generateId('fine'),
              fineType: 'LATE_RETURN',
              amount: lateFine.amount,
              reason: lateFine.note,
              createdAt: new Date().toISOString(),
            },
          ]
        : []),
      ...extraFines.map((f) => ({
        id: generateId('fine'),
        fineType: f.fineType || 'PHYSICAL_DAMAGE',
        amount: Number(f.amount) || 0,
        reason: f.reason || 'Denda tambahan',
        createdAt: new Date().toISOString(),
      })),
    ];

    const settlement = calculateDepositSettlement(order.securityDeposit, fines);

    const updated = {
      ...order,
      orderStatus: ORDER_STATUS.COMPLETED,
      actualReturnDate: returnedAt,
      fines,
      settlement: { ...settlement, waived: waiveFines },
    };
    orders[idx] = updated;
    writeOrders(orders);

    const unitId = order.items?.[0]?.allocatedUnitId || null;
    if (unitId) syncUnitStatus(unitId, UNIT_STATUS.AVAILABLE);

    audit('COMPLETE_BOOKING', 'Booking', order.id, { status: order.orderStatus }, {
      status: ORDER_STATUS.COMPLETED,
      totalFines: settlement.totalFines,
    });

    return {
      success: true,
      message: `Booking selesai — denda ${settlement.totalFines > 0 ? 'dipotong dari deposit' : 'tidak ada'}`,
      data: updated,
    };
  },

  // ───────────────────────────────────────────────────
  // INVENTARIS UNIT FISIK  (/admin/units)
  // ───────────────────────────────────────────────────
  /** GET /admin/units — daftar unit dengan filter status & pencarian. */
  listUnits: async ({ status = '', search = '' } = {}) => {
    await simulateLatency(300);
    const keyword = search.trim().toLowerCase();
    let data = readUnits();
    if (status) data = data.filter((u) => u.currentStatus === status);
    if (keyword) {
      data = data.filter(
        (u) =>
          String(u.imei).includes(keyword) ||
          String(u.modelName).toLowerCase().includes(keyword) ||
          String(u.colorName).toLowerCase().includes(keyword) ||
          String(u.storageCapacity).toLowerCase().includes(keyword)
      );
    }
    return { success: true, data };
  },

  /** POST /admin/units — tambah unit fisik baru (IMEI unik). */
  createUnit: async (payload) => {
    await simulateLatency(300);
    const units = readUnits();
    const { imei, variantId, modelName, storageCapacity, colorName, batteryHealth = 90, physicalGrade, imageUrl = '', notes = '' } = payload;

    if (!imei || !variantId) {
      const error = new Error('IMEI dan varian wajib diisi');
      error.status = 400;
      throw error;
    }
    if (units.some((u) => String(u.imei) === String(imei))) {
      const error = new Error(`IMEI ${imei} sudah terdaftar`);
      error.status = 409;
      throw error;
    }

    const variant = getMergedVariants().find((v) => v.id === variantId);
    const unit = {
      id: generateId('unit'),
      variantId,
      modelName: modelName || variant?.modelName || '-',
      storageCapacity: storageCapacity || variant?.storageCapacity || '-',
      colorName: colorName || variant?.colorName || '-',
      imei: String(imei),
      serialNumber: `SN${Date.now().toString(36).toUpperCase()}`,
      batteryHealth: Number(batteryHealth) || 90,
      physicalGrade:
        physicalGrade || ((Number(batteryHealth) || 0) >= 90 ? 'GRADE_A' : 'GRADE_B'),
      currentStatus: UNIT_STATUS.AVAILABLE,
      imageUrl: imageUrl || variant?.imageUrl || '',
      notes,
      createdAt: new Date().toISOString(),
    };

    units.unshift(unit);
    writeUnits(units);
    audit('CREATE_UNIT', 'IphoneUnit', unit.id, null, { imei: unit.imei, modelName: unit.modelName });
    return { success: true, message: `Unit ${unit.imei} ditambahkan`, data: unit };
  },

  /** PATCH /admin/units/:id — edit data unit (status hanya via booking). */
  updateUnit: async (unitId, patch) => {
    await simulateLatency(250);
    const units = readUnits();
    const idx = units.findIndex((u) => u.id === unitId);
    if (idx < 0) {
      const error = new Error('Unit tidak ditemukan');
      error.status = 404;
      throw error;
    }
    const old = { ...units[idx] };
    const allowed = ['imei', 'serialNumber', 'batteryHealth', 'physicalGrade', 'currentStatus', 'notes', 'imageUrl'];
    const next = { ...units[idx] };
    allowed.forEach((k) => {
      if (patch[k] !== undefined) next[k] = patch[k];
    });
    if (String(next.imei) !== String(old.imei) && units.some((u, i) => i !== idx && String(u.imei) === String(next.imei))) {
      const error = new Error(`IMEI ${next.imei} sudah dipakai unit lain`);
      error.status = 409;
      throw error;
    }
    next.batteryHealth = Number(next.batteryHealth) || old.batteryHealth;
    units[idx] = next;
    writeUnits(units);
    audit('UPDATE_UNIT', 'IphoneUnit', unitId, old, next);
    return { success: true, message: 'Unit diperbarui', data: next };
  },

  /** DELETE /admin/units/:id — hapus unit (tidak boleh sedang disewa). */
  deleteUnit: async (unitId) => {
    await simulateLatency(250);
    const units = readUnits();
    const unit = units.find((u) => u.id === unitId);
    if (!unit) {
      const error = new Error('Unit tidak ditemukan');
      error.status = 404;
      throw error;
    }
    if (unit.currentStatus === UNIT_STATUS.IN_RENTAL) {
      const error = new Error('Unit sedang disewa dan tidak dapat dihapus');
      error.status = 409;
      throw error;
    }
    writeUnits(units.filter((u) => u.id !== unitId));
    audit('DELETE_UNIT', 'IphoneUnit', unitId, unit, null);
    return { success: true, message: `Unit ${unit.imei} dihapus` };
  },

  // ───────────────────────────────────────────────────
  // MANAJEMEN KATALOG  (/admin/catalog)
  // ───────────────────────────────────────────────────
  /** GET /admin/catalog — daftar model (statis + overlay + buatan admin). */
  listCatalog: async () => {
    await simulateLatency(250);
    const store = readCatalogStore();
    const data = getMergedModels().map((m) => ({
      ...m,
      variantCount: (m.variants || []).length,
      isCustom: !!m.isCustom,
      isOverridden: store.some((e) => e.id === m.id),
      minRate: (m.variants || []).length ? Math.min(...m.variants.map((v) => v.dailyRate)) : 0,
    }));
    return { success: true, data };
  },

  /**
   * PATCH /admin/catalog/:id — edit model base (badge, deskripsi, publish)
   * dan/atau harga varian. Perubahan disimpan sebagai overlay sehingga
   * file data statis tidak pernah dimodifikasi.
   */
  updateModel: async (modelId, patch) => {
    await simulateLatency(250);
    const base = getMergedModels().find((m) => m.id === modelId);
    if (!base) {
      const error = new Error('Model tidak ditemukan');
      error.status = 404;
      throw error;
    }

    const entry = {
      id: modelId,
      isCustom: !!base.isCustom,
      ...(patch.badge !== undefined && { badge: patch.badge }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.isPublished !== undefined && { isPublished: !!patch.isPublished }),
    };

    // Patch harga varian + foto utama (hanya varian milik model ini)
    if (Array.isArray(patch.variantRates)) {
      entry.variants = patch.variantRates
        .filter((vr) => (base.variants || []).some((v) => v.id === vr.id))
        .map((vr) => ({
          id: vr.id,
          dailyRate: Number(vr.dailyRate) || 0,
          ...(vr.imageUrl ? { imageUrl: vr.imageUrl } : {}),
        }));
    }

    upsertStoreEntry(entry);
    audit('UPDATE_MODEL', 'IphoneModel', modelId, null, entry);

    const updated = getMergedModels().find((m) => m.id === modelId);
    return { success: true, message: `Model ${updated?.modelName || modelId} diperbarui`, data: updated };
  },

  /**
   * POST /admin/catalog — tambah model baru buatan admin
   * (lengkap dengan varian pertamanya).
   */
  createModel: async (payload) => {
    await simulateLatency(300);
    const {
      modelName,
      storageCapacity,
      colorName,
      dailyRate,
      weeklyRate,
      monthlyRate,
      securityDepositAmount,
      releaseYear,
      badge,
      description,
      screenSize,
      processor,
      cameraSpecs,
      imageUrl = '',
    } = payload;

    if (!modelName || !storageCapacity || !colorName || !dailyRate) {
      const error = new Error('Nama model, kapasitas, warna, dan harga harian wajib diisi');
      error.status = 400;
      throw error;
    }

    const models = getMergedModels();
    let slug = slugify(modelName);
    if (models.some((m) => m.slug === slug)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const modelId = generateId('mdl');
    const variantId = generateId('vr');
    const label = String(modelName).replace(/[<>&'"]/g, '').slice(0, 24);
    const fallbackImg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='100%' height='100%' fill='#F5F5F7'/><text x='50%' y='50%' text-anchor='middle' font-family='Inter,sans-serif' font-size='32' fill='#6E6E73'>${label}</text></svg>`
    )}`;
    // Foto unggahan admin (data URL) menggantikan placeholder bila ada
    const primaryImg = imageUrl || fallbackImg;

    const newModel = {
      id: modelId,
      isCustom: true,
      modelName: modelName.trim(),
      slug,
      releaseYear: Number(releaseYear) || new Date().getFullYear(),
      screenSize: screenSize || '6.1 inci',
      processor: processor || '-',
      cameraSpecs: cameraSpecs || '-',
      description: description || '',
      isPublished: true,
      badge: badge || null,
      variants: [
        {
          id: variantId,
          modelId,
          storageCapacity: storageCapacity.trim(),
          colorName: colorName.trim(),
          dailyRate: Number(dailyRate),
          weeklyRate: Number(weeklyRate) || Number(dailyRate) * 6,
          monthlyRate: Number(monthlyRate) || Number(dailyRate) * 24,
          securityDepositAmount: Number(securityDepositAmount) || 500000,
          isPublished: true,
          images: [
            { imageUrl: primaryImg, fallback: primaryImg, isPrimary: true, displayOrder: 0 },
          ],
        },
      ],
    };

    upsertStoreEntry(newModel);
    audit('CREATE_MODEL', 'IphoneModel', modelId, null, { modelName: newModel.modelName, slug });
    return { success: true, message: `Model ${newModel.modelName} ditambahkan`, data: newModel };
  },

  /**
   * DELETE /admin/catalog/:id — model statis: hapus overlay & sembunyikan.
   * Model buatan admin: hapus total dari store.
   */
  deleteModel: async (modelId) => {
    await simulateLatency(250);
    const model = getMergedModels().find((m) => m.id === modelId);
    if (!model) {
      const error = new Error('Model tidak ditemukan');
      error.status = 404;
      throw error;
    }
    if (model.isCustom) {
      removeStoreEntry(modelId);
    } else {
      upsertStoreEntry({ id: modelId, isPublished: false });
    }
    audit('DELETE_MODEL', 'IphoneModel', modelId, model, null);
    return {
      success: true,
      message: model.isCustom
        ? `Model ${model.modelName} dihapus`
        : `Model ${model.modelName} disembunyikan dari katalog`,
    };
  },

  // ───────────────────────────────────────────────────
  // LAPORAN TRANSAKSI  (/admin/reports)
  // ───────────────────────────────────────────────────
  /** GET /admin/reports — rekapitulasi pendapatan pada rentang tanggal. */
  reports: async ({ from = '', to = '' } = {}) => {
    await simulateLatency(300);
    const orders = readOrders();
    const units = readUnits();

    const inRange = orders.filter((o) => {
      const start = new Date(o.startDate).getTime();
      const end = new Date(o.endDate).getTime();
      const fromTs = from ? new Date(from).getTime() : -Infinity;
      const toTs = to ? new Date(to).getTime() + 86399999 : Infinity;
      return start <= toTs && end >= fromTs;
    });

    const settled = inRange.filter((o) =>
      [ORDER_STATUS.PAID, ORDER_STATUS.ACTIVE_RENTAL, ORDER_STATUS.RETURNED, ORDER_STATUS.COMPLETED].includes(
        o.orderStatus
      )
    );
    const revenue = settled.reduce((s, o) => s + (Number(o.grandTotal) || 0), 0);
    const fines = inRange.reduce(
      (s, o) => s + (o.fines || []).reduce((x, f) => x + (Number(f.amount) || 0), 0),
      0
    );
    const rentalDays = inRange.reduce((s, o) => s + (Number(o.totalDays) || 0), 0);
    const completedCount = inRange.filter((o) => o.orderStatus === ORDER_STATUS.COMPLETED).length;
    const cancelledCount = inRange.filter((o) => o.orderStatus === ORDER_STATUS.CANCELLED).length;

    // Utilisasi unit: hari sewa / (total unit × hari rentang)
    const fromTs = from ? new Date(from).getTime() : Date.now() - 30 * 86400000;
    const toTs = to ? new Date(to).getTime() : Date.now();
    const rangeDays = Math.max(1, Math.ceil((toTs - fromTs) / 86400000));
    const utilization = units.length > 0 ? Math.min(100, (rentalDays / (units.length * rangeDays)) * 100) : 0;

    return {
      success: true,
      data: {
        from,
        to,
        totalOrders: inRange.length,
        completedCount,
        cancelledCount,
        revenue,
        fines,
        rentalDays,
        utilization: Math.round(utilization * 10) / 10,
        orders: [...inRange].sort((a, b) => new Date(b.startDate) - new Date(a.startDate)),
      },
    };
  },
};
