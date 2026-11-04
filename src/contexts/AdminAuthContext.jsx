/**
 * ADMIN AUTH CONTEXT — sesi admin mock (localStorage, tanpa backend).
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('irent_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (username, password) => {
    const res = await authApi.login(username, password);
    setUser(res.data.user);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      // Sesi admin sah hanya jika role ADMIN/SUPERADMIN dan token login ada
      isAuthenticated:
        !!user &&
        ['ADMIN', 'SUPERADMIN'].includes(user.role) &&
        !!localStorage.getItem('irent_access_token'),
      login,
      logout,
    }),
    [user, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth harus dipakai di dalam <AdminAuthProvider>');
  return ctx;
};
