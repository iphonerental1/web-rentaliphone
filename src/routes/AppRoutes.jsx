/**
 * ROUTES — konfigurasi seluruh rute aplikasi.
 * Publik: /, /katalog, /iphone/:slug, /cara-sewa, /faq, /lokasi
 * Admin : /admin/login dan /admin/* (wajib login admin)
 */

import React from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { CustomerLayout } from '../components/layout';
import { Button } from '../components/common/Button';

// Customer (publik, tidak perlu login)
import { LandingPage } from '../pages/customer/LandingPage';
import { CatalogPage } from '../pages/customer/CatalogPage';
import { IphoneDetailPage } from '../pages/customer/IphoneDetailPage';
import { HowToRentPage, FaqPage } from '../pages/customer/CustomerPages';
import { LocationPage } from '../pages/customer/LocationPage';

// Admin Portal (terkonsolidasi penuh di src/)
import { AdminAuthProvider, useAdminAuth } from '../contexts/AdminAuthContext';
import {
  AdminLayout,
  AdminLoginPage,
  AdminDashboardPage,
  AdminBookingsPage,
  AdminUnitsPage,
  AdminCatalogPage,
  AdminReportsPage,
} from '../pages/admin';

/** Penjaga rute admin — bila belum login sebagai admin, lempar ke /admin/login. */
const RequireAdmin = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
};

/** Halaman 404. */
const NotFoundPage = () => (
  <div className="max-w-md mx-auto px-4 py-24 text-center">
    <p className="text-6xl font-bold text-[#0071E3]">404</p>
    <h1 className="text-xl font-semibold text-[#1D1D1F] mt-4">Halaman tidak ditemukan</h1>
    <p className="text-sm text-gray-500 mt-2">
      Halaman yang Anda cari telah dipindahkan atau tidak pernah ada.
    </p>
    <Link to="/" className="inline-block mt-6">
      <Button variant="primary" className="text-xs px-6 py-3">Kembali ke Beranda</Button>
    </Link>
  </div>
);

export const AppRoutes = () => {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* ── ADMIN PORTAL ── */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/login/admin" element={<Navigate to="/admin/login" replace />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="pesanan" element={<Navigate to="/admin/bookings" replace />} />
          <Route path="units" element={<AdminUnitsPage />} />
          <Route path="unit" element={<Navigate to="/admin/units" replace />} />
          <Route path="katalog" element={<AdminCatalogPage />} />
          <Route path="catalog" element={<Navigate to="/admin/katalog" replace />} />
          <Route path="laporan" element={<AdminReportsPage />} />
          <Route path="reports" element={<Navigate to="/admin/laporan" replace />} />
        </Route>

        {/* ── CUSTOMER (publik, tidak perlu login) ── */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/katalog" element={<CatalogPage />} />
          <Route path="/iphone/:slug" element={<IphoneDetailPage />} />
          <Route path="/cara-sewa" element={<HowToRentPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/lokasi" element={<LocationPage />} />

          {/* Alias */}
          <Route path="/catalog" element={<Navigate to="/katalog" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
};

export default AppRoutes;
