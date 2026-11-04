/**
 * AUTH API — implementasi endpoint `/api/v1/auth/*` (PRD Section 8.1).
 *
 * Menyimulasikan register, login, refresh token, dan profil user.
 * Kredensial demo:
 *   Customer  : budi@example.com      / Customer123
 *   Admin     : admin / irent123  atau admin@irent.com / Admin12345
 *   Superadmin: superadmin / irent123 atau superadmin@irent.com / Super12345
 */

import { appendAuditLog, simulateLatency } from '../data/mockDb';
import { ROLES, STORAGE_KEYS } from '../constants';

const DEMO_ACCOUNTS = [
  {
    id: 'usr-cst-01',
    email: 'budi@example.com',
    username: 'budi',
    password: 'Customer123',
    role: ROLES.CUSTOMER,
    fullName: 'Budi Santoso',
    name: 'Budi Santoso',
    phoneNumber: '081234567890',
    customerId: 'cst-0001',
    isVerified: true,
  },
  {
    id: 'usr-cst-02',
    email: 'siti@example.com',
    username: 'siti',
    password: 'Customer123',
    role: ROLES.CUSTOMER,
    fullName: 'Siti Nurhaliza',
    name: 'Siti Nurhaliza',
    phoneNumber: '081298765432',
    customerId: 'cst-0002',
    isVerified: true,
  },
  {
    id: 'usr-admin-01',
    email: 'admin@irent.com',
    username: 'admin',
    password: 'irent123',
    altPassword: 'Admin12345',
    role: ROLES.ADMIN,
    fullName: 'Admin Operasional',
    name: 'Admin Operasional',
    phoneNumber: '081225188023',
    customerId: null,
    isVerified: true,
  },
  {
    id: 'usr-superadmin-01',
    email: 'superadmin@irent.com',
    username: 'superadmin',
    password: 'irent123',
    altPassword: 'Super12345',
    role: ROLES.SUPERADMIN,
    fullName: 'Super Admin',
    name: 'Super Admin',
    phoneNumber: '081225188023',
    customerId: null,
    isVerified: true,
  },
];

const REGISTERED_KEY = 'irent_registered_accounts';

const readRegistered = () => {
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_KEY)) || [];
  } catch {
    return [];
  }
};

const writeRegistered = (accounts) => {
  localStorage.setItem(REGISTERED_KEY, JSON.stringify(accounts));
};

/** Bangun token mock (bukan JWT asli, hanya untuk demo). */
const buildToken = (account) =>
  `mock.${btoa(`${account.id}:${account.email || account.username}:${account.role}`)}.${Date.now()}`;

/** Buang field sensitif sebelum dikirim ke klien. */
const toPublicUser = (account) => ({
  id: account.id,
  email: account.email,
  username: account.username || account.email?.split('@')[0],
  role: account.role,
  fullName: account.fullName || account.name,
  name: account.name || account.fullName,
  phoneNumber: account.phoneNumber,
  customerId: account.customerId,
  isVerified: account.isVerified,
});

export const authApi = {
  /** POST /auth/register */
  register: async (payload) => {
    await simulateLatency(600);
    const all = [...DEMO_ACCOUNTS, ...readRegistered()];

    if (all.some((a) => a.email && a.email.toLowerCase() === payload.email.toLowerCase())) {
      const error = new Error('Email sudah terdaftar');
      error.status = 409;
      throw error;
    }

    const newAccount = {
      id: `usr-${Date.now().toString(36)}`,
      email: payload.email,
      username: payload.email.split('@')[0],
      password: payload.password,
      role: ROLES.CUSTOMER,
      fullName: payload.fullName,
      name: payload.fullName,
      phoneNumber: payload.phoneNumber,
      customerId: `cst-${Date.now().toString(36)}`,
      isVerified: false,
      nikKtp: payload.nikKtp,
      socialMediaLink: payload.socialMediaLink || '',
    };

    writeRegistered([...readRegistered(), newAccount]);

    return {
      success: true,
      message: 'Registrasi berhasil. Akun Anda menunggu verifikasi admin.',
      data: {
        accessToken: buildToken(newAccount),
        user: toPublicUser(newAccount),
      },
    };
  },

  /**
   * POST /auth/login — mendukung format fleksibel:
   * login(username, password) ATAU login({ email/username, password })
   */
  login: async (arg1, arg2) => {
    await simulateLatency(500);

    let identifier = '';
    let password = '';

    if (typeof arg1 === 'object' && arg1 !== null) {
      identifier = String(arg1.email || arg1.username || '').trim().toLowerCase();
      password = arg1.password;
    } else {
      identifier = String(arg1 || '').trim().toLowerCase();
      password = arg2;
    }

    const all = [...DEMO_ACCOUNTS, ...readRegistered()];
    const account = all.find((a) => {
      const matchEmail = a.email && a.email.toLowerCase() === identifier;
      const matchUsername = a.username && a.username.toLowerCase() === identifier;
      return matchEmail || matchUsername;
    });

    const isPassValid =
      account &&
      (account.password === password || (account.altPassword && account.altPassword === password));

    if (!account || !isPassValid) {
      const error = new Error('Username / email atau password salah');
      error.status = 401;
      throw error;
    }

    const user = toPublicUser(account);
    const token = buildToken(account);

    localStorage.setItem(STORAGE_KEYS.accessToken, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

    if (typeof appendAuditLog === 'function') {
      appendAuditLog({
        user,
        action: 'LOGIN',
        entityName: 'User',
        entityId: user.id,
        oldValues: null,
        newValues: { username: account.username || account.email },
      });
    }

    return {
      success: true,
      message: `Selamat datang, ${user.fullName}`,
      data: {
        accessToken: token,
        token,
        user,
      },
    };
  },

  /** POST /auth/logout */
  logout: async () => {
    const rawUser = localStorage.getItem(STORAGE_KEYS.user);
    const user = rawUser ? JSON.parse(rawUser) : null;
    if (user && typeof appendAuditLog === 'function') {
      appendAuditLog({
        user,
        action: 'LOGOUT',
        entityName: 'User',
        entityId: user.id,
        oldValues: null,
        newValues: null,
      });
    }
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.user);
    return { success: true, message: 'Berhasil keluar' };
  },

  /** POST /auth/refresh-token */
  refreshToken: async () => {
    await simulateLatency(200);
    const stored = localStorage.getItem(STORAGE_KEYS.user);
    if (!stored) {
      const error = new Error('Sesi telah berakhir');
      error.status = 401;
      throw error;
    }
    const user = JSON.parse(stored);
    return { success: true, data: { accessToken: buildToken(user), user } };
  },

  /** GET /auth/me */
  me: async () => {
    await simulateLatency(250);
    const stored = localStorage.getItem(STORAGE_KEYS.user);
    if (!stored) {
      const error = new Error('Tidak terautentikasi');
      error.status = 401;
      throw error;
    }
    return { success: true, data: JSON.parse(stored) };
  },

  /** Simpan sesi ke localStorage. */
  persistSession: (user, token) => {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.accessToken, token);
  },

  /** Hapus sesi. */
  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.accessToken);
  },

  /** Ambil sesi tersimpan (sinkron, untuk inisialisasi awal). */
  getStoredUser: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.user);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};

export { DEMO_ACCOUNTS };
