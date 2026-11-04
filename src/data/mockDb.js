/**
 * MOCK DATABASE — penyimpanan berbasis localStorage.
 *
 * Berfungsi sebagai simulasi backend selama backend Express belum siap.
 * Setiap entitas disimpan dengan kunci pada STORAGE_KEYS agar data
 * (order, unit, customer, audit log) tetap ada saat halaman di-refresh.
 *
 * Saat backend sudah siap, ganti pemakaian modul ini dengan pemanggilan
 * API pada `src/api/*` — struktur datanya sudah disamakan dengan PRD.
 */

import { STORAGE_KEYS } from '../constants';
import { SEED_UNITS } from './seedUnits';
import { SEED_ORDERS } from './seedOrders';
import { SEED_CUSTOMERS } from './seedCustomers';
import { SEED_AUDIT_LOGS } from './seedAuditLogs';

/** Baca koleksi dari localStorage, kembalikan fallback bila belum ada. */
export const readCollection = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

/** Tulis koleksi ke localStorage. */
export const writeCollection = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

/** Generate ID sederhana untuk entitas baru. */
export const generateId = (prefix = 'id') =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Generate nomor order sesuai format PRD: ORD-YYYYMMDD-XXXX */
export const generateOrderNumber = (sequence = 1) => {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  return `ORD-${ymd}-${String(sequence).padStart(4, '0')}`;
};

/** Generate nomor pembayaran sesuai format PRD. */
export const generatePaymentNumber = (sequence = 1) => {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  return `PAY-${ymd}-${String(sequence).padStart(4, '0')}`;
};

// ─────────────────────────────────────────────────────
// SEEDING
// ─────────────────────────────────────────────────────
/**
 * Inisialisasi database mock bila belum pernah di-seed.
 * Dipanggil sekali pada bootstrap aplikasi (main.jsx).
 */
export const initMockDb = () => {
  if (!localStorage.getItem(STORAGE_KEYS.mockUnits)) {
    writeCollection(STORAGE_KEYS.mockUnits, SEED_UNITS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.mockOrders)) {
    writeCollection(STORAGE_KEYS.mockOrders, SEED_ORDERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.mockCustomers)) {
    writeCollection(STORAGE_KEYS.mockCustomers, SEED_CUSTOMERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.mockAuditLogs)) {
    writeCollection(STORAGE_KEYS.mockAuditLogs, SEED_AUDIT_LOGS);
  }
};

/** Reset seluruh database mock ke kondisi awal (tombol "reset demo"). */
export const resetMockDb = () => {
  writeCollection(STORAGE_KEYS.mockUnits, SEED_UNITS);
  writeCollection(STORAGE_KEYS.mockOrders, SEED_ORDERS);
  writeCollection(STORAGE_KEYS.mockCustomers, SEED_CUSTOMERS);
  writeCollection(STORAGE_KEYS.mockAuditLogs, SEED_AUDIT_LOGS);
};

// ─────────────────────────────────────────────────────
// AUDIT LOG
// ─────────────────────────────────────────────────────
/** Catat aktivitas sensitif (PRD tabel audit_logs). */
export const appendAuditLog = ({ user, action, entityName, entityId, oldValues, newValues }) => {
  const logs = readCollection(STORAGE_KEYS.mockAuditLogs, []);
  const entry = {
    id: generateId('log'),
    userId: user?.id || null,
    userEmail: user?.email || 'system@irent.local',
    userRole: user?.role || 'SYSTEM',
    action,
    entityName,
    entityId,
    oldValues: oldValues || null,
    newValues: newValues || null,
    ipAddress: '127.0.0.1',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 120) : '-',
    createdAt: new Date().toISOString(),
  };
  writeCollection(STORAGE_KEYS.mockAuditLogs, [entry, ...logs].slice(0, 300));
  return entry;
};

export const getAuditLogs = () => readCollection(STORAGE_KEYS.mockAuditLogs, []);

// ─────────────────────────────────────────────────────
// SIMULASI NETWORK LATENCY
// ─────────────────────────────────────────────────────
/** Simulasi jeda jaringan agar skeleton loading terlihat. */
export const simulateLatency = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));