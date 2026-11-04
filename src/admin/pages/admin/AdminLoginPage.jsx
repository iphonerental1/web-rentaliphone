/**
 * HALAMAN LOGIN ADMIN (/admin/login) — selaras dengan tampilan customer iRent.
 * Palet: putih #FFFFFF, abu #F5F5F7, biru #0071E3, biru muda #E8F2FD, teks #1D1D1F.
 */
import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, ShieldCheck, User } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useDocumentTitle } from '../../hooks';

const AppleLogo = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.79-.96 2.84 1.04.08 2.08-.52 2.72-1.3" />
  </svg>
);

const PHONE_IMAGE = '/images/iphone-15-pro-max-naturaltitanium-select.png';

export const AdminLoginPage = () => {
  useDocumentTitle('Login Admin');
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAdminAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('irent123');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Login gagal, periksa username & password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F5F7] flex items-center justify-center px-4 py-8">
      {/* Latar lembut ala landing page customer */}
      <div className="pointer-events-none absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full bg-[#0071E3]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 w-[560px] h-[560px] rounded-full bg-[#BF5AF2]/10 blur-[120px]" />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-[#0071E3]/10 overflow-hidden grid md:grid-cols-[1.05fr_1fr] animate-[fadeUp_0.6s_ease-out_both]">
        {/* Panel visual: gradien biru muda seperti kartu katalog */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-b from-[#F7FAFF] to-[#E8F2FD] p-8 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1D1D1F] bg-white rounded-full px-3 py-1.5 shadow-sm">
              <AppleLogo className="w-3.5 h-3.5" /> Apple Flagship Rental
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
            </span>
          </div>

          <div className="relative flex items-center justify-center py-4">
            <div className="absolute w-56 h-56 rounded-full bg-[#0071E3]/15 blur-2xl" />
            <img
              src={PHONE_IMAGE}
              alt="iPhone 15 Pro Max"
              className="relative w-56 object-contain mix-blend-multiply drop-shadow-[0_24px_30px_rgba(0,113,227,0.25)] animate-[floatY_5s_ease-in-out_infinite]"
            />
          </div>

          <div>
            <p className="text-lg font-bold text-[#1D1D1F] leading-tight">iPhone 15 Pro Max</p>
            <p className="text-xs text-gray-500 mt-0.5">Sewa iPhone profesional · Magelang</p>
          </div>
        </div>

        {/* Form login */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-[#0071E3] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#0071E3]/30">
              i
            </div>
            <span className="font-bold text-xl text-[#1D1D1F] tracking-tight">iRent</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071E3] bg-[#E8F2FD] rounded-full px-2.5 py-1">
              Admin
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">
            Selamat Datang, <span className="text-[#0071E3]">Admin</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">Masuk untuk mengelola dashboard iRent.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-username" className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  className="w-full rounded-xl bg-[#F5F5F7] border border-gray-200 pl-10 pr-4 py-2.5 text-sm text-[#1D1D1F] focus:outline-none focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl bg-[#F5F5F7] border border-gray-200 pl-10 pr-10 py-2.5 text-sm text-[#1D1D1F] focus:outline-none focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1D1D1F] cursor-pointer"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="shine w-full rounded-full bg-[#0071E3] hover:bg-[#0077ED] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0071E3]/30 text-white text-sm font-bold py-3 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Memverifikasi...
                </>
              ) : (
                <>
                  Masuk Dashboard <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-gray-400">
            <Link to="/" className="hover:text-[#0071E3] transition-colors">
              ← Situs publik
            </Link>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck size={12} className="text-[#0071E3]" /> Akses terproteksi
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
};

export default AdminLoginPage;