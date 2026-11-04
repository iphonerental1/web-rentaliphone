/**
 * PAYMENT API — `/api/v1/payments/*` (PRD Section 8.4).
 * Menangani pengunggahan bukti bayar, verifikasi admin, dan refund deposit.
 */

import {
  appendAuditLog,
  generateId,
  readCollection,
  simulateLatency,
  writeCollection,
} from '../data/mockDb';
import { ORDER_STATUS, PAYMENT_STATUS, STORAGE_KEYS } from '../constants';

const readOrders = () => readCollection(STORAGE_KEYS.mockOrders, []);
const writeOrders = (orders) => writeCollection(STORAGE_KEYS.mockOrders, orders);

export const paymentApi = {
  /** POST /payments/submit-proof — customer unggah bukti transfer. */
  submitProof: async (orderId, payload, currentUser) => {
    await simulateLatency(800);
    const orders = readOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      const error = new Error('Pesanan tidak ditemukan');
      error.status = 404;
      throw error;
    }

    const order = orders[index];
    if ([ORDER_STATUS.CANCELLED, ORDER_STATUS.COMPLETED].includes(order.orderStatus)) {
      const error = new Error('Pesanan sudah dibatalkan atau selesai');
      error.status = 400;
      throw error;
    }

    const nowIso = new Date().toISOString();
    const payment = {
      id: generateId('pay'),
      orderId,
      paymentNumber: `PAY-${Date.now().toString().slice(-8)}`,
      paymentType: 'RENTAL_AND_DEPOSIT',
      amount: order.grandTotal,
      paymentMethod: payload.paymentMethod || 'BANK_TRANSFER',
      senderName: payload.senderName || currentUser?.fullName || '-',
      transferDate: payload.transferDate,
      proofImageUrl: payload.proofImageUrl || 'https://placehold.co/400x600/E8E8ED/1D1D1F?text=Bukti+Transfer',
      status: PAYMENT_STATUS.PENDING,
      notes: payload.notes || '',
      verifiedBy: null,
      verifiedAt: null,
      createdAt: nowIso,
    };

    const updated = {
      ...order,
      payment,
      orderStatus: ORDER_STATUS.PAID,
      timeline: [
        ...(order.timeline || []),
        {
          status: ORDER_STATUS.PAID,
          at: nowIso,
          actor: currentUser?.fullName || 'Customer',
          note: `Bukti pembayaran diunggah (${payment.paymentNumber})`,
        },
      ],
      updatedAt: nowIso,
    };

    orders[index] = updated;
    writeOrders(orders);

    appendAuditLog({
      user: currentUser,
      action: 'PAYMENT_SUBMITTED',
      entityName: 'payments',
      entityId: payment.id,
      newValues: { orderId, amount: payment.amount, method: payment.paymentMethod },
    });

    return { success: true, message: 'Bukti pembayaran terkirim, menunggu verifikasi admin', data: updated };
  },

  /** PUT /payments/:id/verify — admin memverifikasi atau menolak pembayaran. */
  verify: async (orderId, payload, currentUser) => {
    await simulateLatency(600);
    const orders = readOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      const error = new Error('Pesanan tidak ditemukan');
      error.status = 404;
      throw error;
    }

    const order = orders[index];
    if (!order.payment) {
      const error = new Error('Pesanan belum memiliki data pembayaran');
      error.status = 400;
      throw error;
    }
    if ([ORDER_STATUS.CANCELLED, ORDER_STATUS.COMPLETED].includes(order.orderStatus)) {
      const error = new Error('Tidak dapat memverifikasi pembayaran untuk pesanan ini');
      error.status = 400;
      throw error;
    }

    const nowIso = new Date().toISOString();
    const isVerified = payload.status === PAYMENT_STATUS.VERIFIED;

    const updated = {
      ...order,
      payment: {
        ...order.payment,
        status: payload.status,
        notes: payload.notes || order.payment.notes,
        verifiedBy: currentUser?.email || 'admin@irent.local',
        verifiedAt: nowIso,
      },
      orderStatus: isVerified ? ORDER_STATUS.PREPARING : ORDER_STATUS.AWAITING_PAYMENT,
      timeline: [
        ...(order.timeline || []),
        {
          status: isVerified ? ORDER_STATUS.PREPARING : ORDER_STATUS.AWAITING_PAYMENT,
          at: nowIso,
          actor: currentUser?.email || 'admin@irent.local',
          note: isVerified ? `Pembayaran diverifikasi. ${payload.notes || ''}` : `Pembayaran ditolak: ${payload.notes || ''}`,
        },
      ],
      updatedAt: nowIso,
    };

    orders[index] = updated;
    writeOrders(orders);

    appendAuditLog({
      user: currentUser,
      action: isVerified ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
      entityName: 'payments',
      entityId: order.payment.id,
      oldValues: { status: PAYMENT_STATUS.PENDING },
      newValues: { status: payload.status, notes: payload.notes },
    });

    return {
      success: true,
      message: isVerified ? 'Pembayaran terverifikasi' : 'Pembayaran ditolak',
      data: updated,
    };
  },

  /** POST /payments/refund — admin memproses pengembalian deposit. */
  processRefund: async (orderId, amount, currentUser) => {
    await simulateLatency(600);
    const orders = readOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      const error = new Error('Pesanan tidak ditemukan');
      error.status = 404;
      throw error;
    }

    const order = orders[index];
    const nowIso = new Date().toISOString();
    const refund = {
      id: generateId('pay'),
      orderId,
      paymentNumber: `REF-${Date.now().toString().slice(-8)}`,
      paymentType: 'DEPOSIT_REFUND',
      amount: Number(amount) || 0,
      paymentMethod: 'BANK_TRANSFER',
      status: PAYMENT_STATUS.VERIFIED,
      verifiedBy: currentUser?.email || 'admin@irent.local',
      verifiedAt: nowIso,
      createdAt: nowIso,
    };

    const updated = { ...order, refund, updatedAt: nowIso };
    orders[index] = updated;
    writeOrders(orders);

    appendAuditLog({
      user: currentUser,
      action: 'DEPOSIT_REFUNDED',
      entityName: 'payments',
      entityId: refund.id,
      newValues: { orderId, amount: refund.amount },
    });

    return { success: true, message: 'Deposit berhasil dikembalikan', data: updated };
  },

  /** GET /admin/payments/pending — daftar pembayaran yang menunggu verifikasi. */
  pendingList: async () => {
    await simulateLatency(400);
    const orders = readOrders().filter(
      (o) => o.orderStatus === ORDER_STATUS.PAID && o.payment?.status === PAYMENT_STATUS.PENDING
    );
    return { success: true, data: orders, meta: { total: orders.length } };
  },

  /** Statistik pembayaran. */
  stats: async () => {
    await simulateLatency(300);
    const orders = readOrders();
    const withPayment = orders.filter((o) => o.payment);
    const verified = withPayment.filter((o) => o.payment.status === PAYMENT_STATUS.VERIFIED);
    const pending = withPayment.filter((o) => o.payment.status === PAYMENT_STATUS.PENDING);

    return {
      success: true,
      data: {
        totalTransactions: withPayment.length,
        verifiedCount: verified.length,
        pendingCount: pending.length,
        totalVerifiedAmount: verified.reduce((s, o) => s + (o.payment.amount || 0), 0),
        totalPendingAmount: pending.reduce((s, o) => s + (o.payment.amount || 0), 0),
        totalRefunded: orders.reduce((s, o) => s + (o.refund?.amount || 0), 0),
      },
    };
  },
};