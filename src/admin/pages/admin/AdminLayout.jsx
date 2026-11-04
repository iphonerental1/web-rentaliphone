/**
 * ADMIN LAYOUT — sidebar + topbar tema terang (Apple Cupertino Light) untuk seluruh rute /admin/*.
 * Logo disesuaikan dengan identitas utama iRent di Frontend.
 */
import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CalendarCheck,
  LayoutDashboard,
  Layers,
  LogOut,
  Package,
  ExternalLink,
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { getInitials } from '../../utils/formatter';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/bookings', label: 'Booking', icon: CalendarCheck },
  { to: '/admin/units', label: 'Inventaris Unit', icon: Package },
  { to: '/admin/katalog', label: 'Katalog', icon: Layers },
  { to: '/admin/laporan', label: 'Laporan', icon: BarChart3 },
];

/** Apple SVG Icon minimalis untuk aksen pendamping brand iRent */
const AppleLogoMini = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.79-.96 2.84 1.04.08 2.08-.52 2.72-1.3" />
  </svg>
);

export const AdminLayout = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col lg:flex-row">
      {/* SIDEBAR TEMA TERANG */}
      <aside className="lg:w-64 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-gray-200/80 lg:min-h-screen flex flex-col shadow-sm">
        {/* LOGO — Selaras dengan logo iRent di Frontend */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-[#0071E3] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#0071E3]/30 group-hover:scale-105 transition-transform">
              i
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-[#1D1D1F] tracking-tight leading-none">
                  iRent
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#E8F2FD] text-[9px] font-bold uppercase tracking-wider text-[#0071E3] border border-[#0071E3]/20">
                  <AppleLogoMini className="w-2.5 h-2.5" /> Admin
                </span>
              </div>
              <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                Sewa iPhone Magelang
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex lg:flex-col gap-1.5 p-3 overflow-x-auto lg:overflow-visible">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0071E3] text-white shadow-md shadow-[#0071E3]/25 translate-x-0.5'
                    : 'text-gray-600 hover:bg-[#F5F5F7] hover:text-[#0071E3]'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block mt-auto px-4 py-4 border-t border-gray-100">
          <Link
            to="/"
            className="flex items-center justify-between text-[11px] font-medium text-gray-500 hover:text-[#0071E3] transition-colors py-2 px-3 rounded-xl hover:bg-[#F5F5F7]"
          >
            <span>← Lihat situs publik</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </aside>

      {/* KONTEN */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0071E3] rounded-lg flex items-center justify-center text-white font-bold text-base shadow-md shadow-[#0071E3]/25 sm:hidden">
              i
            </div>
            <div>
              <p className="text-sm font-bold text-[#1D1D1F] flex items-center gap-1.5">
                Dashboard Admin iRent
              </p>
              <p className="text-[11px] text-gray-400">
                Data transaksi WhatsApp &amp; armada iPhone tersinkron lokal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[#1D1D1F] leading-tight">
                {user?.name || 'Admin Operasional'}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">
                {user?.email || 'admin@irent.local'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#0071E3] text-white flex items-center justify-center text-xs font-bold shadow-md shadow-[#0071E3]/25">
              {getInitials(user?.name || 'Admin')}
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Keluar dari Admin"
              className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;