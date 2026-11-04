/**
 * LAYOUTS — kerangka halaman (PRD Section 9.1).
 * CustomerLayout : header + navigasi + konten + footer
 * AdminLayout    : sidebar + topbar + konten
 * AuthLayout     : split-screen minimalis
 */

import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Smartphone,
  ClipboardList,
  CreditCard,
  PackageCheck,
  Users,
  BarChart3,
  ScrollText,
  User,
  Wrench,
  MapPin,
} from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { Divider } from '../ui';

import { resetMockDb } from '../../data/mockDb';
import { STORE_LOCATION } from '../common/LocationSection';

// ═══════════════════════════════════════════════════════
// CUSTOMER NAVBAR
// ═══════════════════════════════════════════════════════
export const CustomerNavbar = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/katalog', label: 'Katalog iPhone' },
    { to: '/cara-sewa', label: 'Cara Sewa' },
    { to: '/faq', label: 'FAQ' },
    { to: '/lokasi', label: 'Lokasi' },
  ];

  return (
    <nav className="bg-white/85 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-container mx-auto px-5 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-[#0071E3] rounded-lg flex items-center justify-center text-white font-bold text-lg">
              i
            </div>
            <span className="font-bold text-xl text-[#1D1D1F] tracking-tight">iRent</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#0071E3] bg-[#E8F2FD]'
                      : 'text-gray-600 hover:text-[#0071E3]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Buka menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#1D1D1F] hover:bg-[#F5F5F7]"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-[#3a3a3c] bg-white dark:bg-[#1d1d1f] px-5 py-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F7] dark:hover:bg-[#3a3a3c]"
            >
              {link.label}
            </NavLink>
          ))}
          <Divider className="my-3" />
        </div>
      )}
    </nav>
  );
};

// ═══════════════════════════════════════════════════════
// CUSTOMER FOOTER
// ═══════════════════════════════════════════════════════
export const CustomerFooter = () => (
  <footer className="bg-white dark:bg-[#1d1d1f] border-t border-gray-100 dark:border-[#3a3a3c] mt-16">
    <div className="max-w-container mx-auto px-5 sm:px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-[#0071E3] rounded-lg flex items-center justify-center text-white font-bold text-lg">
              i
            </div>
            <span className="font-bold text-lg text-[#1D1D1F] dark:text-white">iRent</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Platform sewa iPhone terpercaya. Unit original, baterai prima, proses cepat dan transparan.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold text-[#1D1D1F] mb-3 uppercase tracking-wide">Layanan</p>
          <ul className="space-y-2">
            <li><Link to="/katalog" className="text-xs text-gray-500 hover:text-[#0071E3]">Katalog iPhone</Link></li>
            <li><Link to="/cara-sewa" className="text-xs text-gray-500 hover:text-[#0071E3]">Cara Sewa</Link></li>
            <li><Link to="/faq" className="text-xs text-gray-500 hover:text-[#0071E3]">FAQ</Link></li>
            <li><Link to="/lokasi" className="text-xs text-gray-500 hover:text-[#0071E3]">Lokasi Toko</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold text-[#1D1D1F] mb-3 uppercase tracking-wide">Kontak & Lokasi</p>
          <ul className="space-y-2 text-xs text-gray-500">
            <li>WhatsApp: 0812-2518-8023</li>
            <li>Email: hello@irent.id</li>
            <li className="flex items-start gap-1.5">
              <MapPin size={12} className="mt-0.5 shrink-0" />
              <a
                href={STORE_LOCATION.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0071E3] underline"
              >
                {STORE_LOCATION.name}, {STORE_LOCATION.city}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <Divider className="my-8" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-gray-400">
          © {new Date().getFullYear()} iRent Platform. Seluruh hak cipta dilindungi.
        </p>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm('Reset semua data demo (booking, unit, katalog) ke kondisi awal?')) return;
            resetMockDb();
            window.location.reload();
          }}
          className="text-[11px] text-gray-400 hover:text-[#0071E3] underline"
        >
          Reset 
        </button>
      </div>
    </div>
  </footer>
);

// ═══════════════════════════════════════════════════════
// CUSTOMER LAYOUT
// ═══════════════════════════════════════════════════════
export const CustomerLayout = () => (
  <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
    <CustomerNavbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <CustomerFooter />
  </div>
);

// ═══════════════════════════════════════════════════════
// ADMIN SIDEBAR
// ═══════════════════════════════════════════════════════
const ADMIN_MENU = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/pesanan', label: 'Pesanan Sewa', icon: ClipboardList },
  { to: '/admin/pembayaran', label: 'Verifikasi Bayar', icon: CreditCard },
  { to: '/admin/unit', label: 'Unit Fisik', icon: Smartphone },
  { to: '/admin/pengembalian', label: 'Pengembalian', icon: PackageCheck },
  { to: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/admin/customer', label: 'Customer & KYC', icon: Users },
  { to: '/admin/laporan', label: 'Laporan', icon: BarChart3 },
  { to: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
];

export const AdminLayout = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-100 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0071E3] rounded-lg flex items-center justify-center text-white font-bold text-lg">
              i
            </div>
            <div>
              <span className="font-bold text-base text-[#1D1D1F] block leading-none">iRent</span>
              <span className="text-[10px] text-gray-400">Admin Panel</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-[#1D1D1F]"
            aria-label="Tutup sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {ADMIN_MENU.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#0071E3] text-white'
                      : 'text-gray-600 hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'
                  }`
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white/85 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30 flex items-center justify-between px-5 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#F5F5F7]"
              aria-label="Buka sidebar"
            >
              <Menu size={18} />
            </button>
            <div>
              <p className="text-sm font-semibold text-[#1D1D1F]">Panel Operasional</p>
              <p className="text-[10px] text-gray-400 hidden sm:block">
                Kelola pesanan, unit fisik, pembayaran, dan inspeksi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-semibold text-[#0071E3] hover:underline hidden sm:block"
            >
              Lihat Situs Publik
            </Link>
            <Pill tone="brand" size="xs">
              Admin
            </Pill>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// AUTH LAYOUT (SPLIT SCREEN)
// ═══════════════════════════════════════════════════════
export const AuthLayout = () => (
  <div className="min-h-screen grid lg:grid-cols-2 bg-white">
    {/* Left: brand panel */}
    <div className="hidden lg:flex flex-col justify-between relative bg-[#1D1D1F] text-white p-12">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-[#0071E3] rounded-xl flex items-center justify-center text-white font-bold text-xl">
          i
        </div>
        <span className="font-bold text-xl tracking-tight">iRent</span>
      </Link>

      <div className="space-y-6 max-w-md">
        <h2 className="text-4xl font-bold leading-tight tracking-tight">
          Sewa iPhone flagship tanpa ribet.
        </h2>
        <p className="text-sm text-white/60 leading-relaxed">
          Unit original dengan Battery Health terverifikasi, dokumen sewa transparan, dan proses
          verifikasi cepat. Cocok untuk content creator, traveller, dan kebutuhan profesional.
        </p>

        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
          <div>
            <p className="text-2xl font-bold">17</p>
            <p className="text-[11px] text-white/50 mt-0.5">Unit Siap Sewa</p>
          </div>
          <div>
            <p className="text-2xl font-bold">100%</p>
            <p className="text-[11px] text-white/50 mt-0.5">Unit Original</p>
          </div>
          <div>
            <p className="text-2xl font-bold">4.9</p>
            <p className="text-[11px] text-white/50 mt-0.5">Rating Penyewa</p>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-white/40">
        © {new Date().getFullYear()} iRent Platform. Seluruh hak cipta dilindungi.
      </p>
    </div>

    {/* Right: form area */}
    <div className="flex flex-col justify-center p-6 sm:p-12 relative">
      
      <div className="w-full max-w-md mx-auto">
        <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-[#0071E3] rounded-lg flex items-center justify-center text-white font-bold text-lg">
            i
          </div>
          <span className="font-bold text-lg text-[#1D1D1F]">iRent</span>
        </Link>
        <Outlet />
      </div>
    </div>
  </div>
);

