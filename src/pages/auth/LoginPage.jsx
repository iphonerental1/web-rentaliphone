/**
 * LOGIN PAGE — autentikasi pengguna (PRD 10.2 #8).
 * Menyediakan tombol isi-cepat kredensial demo untuk keperluan presentasi.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Alert, Divider, Field, Input, Pill } from '../../components/ui';
import { DEMO_CREDENTIALS } from '../../components/layout';
import { authApi } from '../../api/authApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useDocumentTitle } from '../../hooks';
import { ROLES } from '../../constants';

export const LoginPage = () => {
  useDocumentTitle('Masuk');
  const notify = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const from = location.state?.from?.pathname;

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Format email tidak valid';
    if (!form.password) next.password = 'Password wajib diisi';
    else if (form.password.length < 6) next.password = 'Password minimal 6 karakter';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authApi.login({ email: form.email.trim(), password: form.password });
      const user = res.data.user;
      authApi.persistSession(user, res.data.accessToken);
      notify.success(`Selamat datang kembali, ${user.fullName.split(' ')[0]}!`);

      const target =
        from || ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(user.role) ? '/admin' : '/dashboard');
      navigate(target, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Login gagal, silakan coba lagi');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred) => {
    setForm({ email: cred.email, password: cred.password });
    setErrors({});
    setServerError('');
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Masuk ke akun Anda</h1>
      <p className="text-sm text-gray-500 mt-1">Kelola sewa iPhone Anda dengan aman dan mudah.</p>

      {serverError && (
        <Alert tone="danger" className="mt-5">
          {serverError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <Field label="Email" error={errors.email} required>
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="nama@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
        </Field>

        <Field label="Password" error={errors.password} required>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder="Masukkan password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1D1D1F] p-1"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-[#0071E3] focus:ring-[#0071E3]"
            />
            <span className="text-xs text-gray-600">Ingat saya</span>
          </label>
          <button type="button" className="text-xs font-semibold text-[#0071E3] hover:underline">
            Lupa password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            'Memproses...'
          ) : (
            <>
              <LogIn size={16} /> Masuk
            </>
          )}
        </Button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-5">
        Belum punya akun?{' '}
        <Link to="/register" className="font-semibold text-[#0071E3] hover:underline">
          Daftar sekarang
        </Link>
      </p>

      <Divider label="Akun Demo" className="my-7" />

      <div className="space-y-2">
        {DEMO_CREDENTIALS.map((cred) => (
          <button
            key={cred.email}
            type="button"
            onClick={() => fillDemo(cred)}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-gray-200 hover:border-[#0071E3] hover:bg-[#E8F2FD]/40 transition-colors text-left"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1D1D1F]">{cred.role}</p>
              <p className="text-[11px] text-gray-400 truncate">{cred.email}</p>
            </div>
            <Pill tone="brand" size="xs">
              Isi cepat
            </Pill>
          </button>
        ))}
      </div>

      <p className="text-[11px] text-gray-400 mt-4 flex items-center gap-1.5">
        <ShieldCheck size={12} className="text-[#0071E3]" />
        Data disimpan lokal (mock backend) selama backend belum terhubung.
      </p>
    </div>
  );
};

export default LoginPage;