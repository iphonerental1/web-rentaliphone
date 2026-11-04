/**
 * AUTH CONTEXT — session, JWT token, dan role pengguna.
 * Menyediakan state autentikasi global untuk seluruh aplikasi.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';
import { ROLES } from '../constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authApi.getStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem('irent_access_token'));
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  // Sinkronkan sesi bila token ada tetapi user belum di memori
  useEffect(() => {
    if (token && !user) {
      authApi
        .me()
        .then((res) => setUser(res.data))
        .catch(() => {
          authApi.clearSession();
          setToken(null);
        });
    }
  }, [token, user]);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    authApi.persistSession(res.data.user, res.data.accessToken);
    setUser(res.data.user);
    setToken(res.data.accessToken);
    return res.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    authApi.persistSession(res.data.user, res.data.accessToken);
    setUser(res.data.user);
    setToken(res.data.accessToken);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    authApi.clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem('irent_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      setIsBootstrapping,
      isCustomer: user?.role === ROLES.CUSTOMER,
      isAdmin: user?.role === ROLES.ADMIN,
      isSuperAdmin: user?.role === ROLES.SUPERADMIN,
      isStaff: [ROLES.ADMIN, ROLES.SUPERADMIN].includes(user?.role),
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, isBootstrapping, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
};

export default AuthContext;