/**
 * REGISTER PAGE — pendaftaran customer dengan unggah KYC (PRD 10.2 #9).
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Alert, Checkbox, Field, Input, Pill } from '../../components/ui';
import { ImageUpload } from '../../components/shared';
import { authApi } from '../../api/authApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useDocumentTitle } from '../../hooks';

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phoneNumber: '',
  nikKtp: '',
  password: '',
  confirmPassword: '',
  socialMediaLink: '',
  agreeTerms: false,
};

export const RegisterPage = () => {
  useDocumentTitle('Daftar');
  const notify = useNotification();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [ktpImage, setKtpImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next = {};

    if (form.fullName.trim().length < 3) next.fullName = 'Nama lengkap minimal 3 karakter';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Format email tidak valid';
    if (!/^[0-9]{10,15}$/.test(form.phoneNumber)) next.phoneNumber = 'Nomor telepon 10–15 digit angka';
    if (!/^[0-9]{16}$/.test(form.nikKtp)) next.nikKtp = 'NIK harus tepat 16 digit angka';
    if (form.password.length < 8) next.password = 'Password minimal 8 karakter';
    else if (!/[A-Z]/.test(form.password)) next.password = 'Harus mengandung minimal 1 huruf kapital';
    else if (!/[0-9]/.test(form.password)) next.password = 'Harus mengandung minimal 1 angka';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Konfirmasi password tidak sama';
    if (!ktpImage) next.ktpImage = 'Foto KTP wajib diunggah';
    if (!selfieImage) next.selfieImage = 'Foto selfie dengan KTP wajib diunggah';
    if (!form.agreeTerms) next.agreeTerms = 'Anda harus menyetujui syarat & ketentuan';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authApi.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber,
        nikKtp: form.nikKtp,
        password: form.password,
        socialMediaLink: form.socialMediaLink,
      });

      authApi.persistSession(res.data.user, res.data.accessToken);
      notify.success('Registrasi berhasil! Akun Anda menunggu verifikasi admin.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registrasi gagal, silakan coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Buat akun penyewa</h1>
      <p className="text-sm text-gray-500 mt-1">
        Lengkapi data identitas untuk verifikasi keamanan (KYC).
      </p>

      {serverError && (
        <Alert tone="danger" className="mt-5">
          {serverError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <Field label="Nama Lengkap (sesuai KTP)" error={errors.fullName} required>
          <Input
            placeholder="Budi Santoso"
            value={form.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
            error={errors.fullName}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email" error={errors.email} required>
            <Input
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              error={errors.email}
            />
          </Field>

          <Field label="Nomor Telepon" error={errors.phoneNumber} required>
            <Input
              inputMode="numeric"
              placeholder="081234567890"
              value={form.phoneNumber}
              onChange={(e) => setField('phoneNumber', e.target.value.replace(/\D/g, ''))}
              error={errors.phoneNumber}
            />
          </Field>
        </div>

        <Field label="NIK KTP" error={errors.nikKtp} hint="16 digit sesuai e-KTP" required>
          <Input
            inputMode="numeric"
            placeholder="3171012345670001"
            maxLength={16}
            value={form.nikKtp}
            onChange={(e) => setField('nikKtp', e.target.value.replace(/\D/g, ''))}
            error={errors.nikKtp}
          />
        </Field>

        <Field
          label="Link Media Sosial"
          hint="Opsional, membantu verifikasi profil risiko"
          error={errors.socialMediaLink}
        >
          <Input
            placeholder="https://instagram.com/username"
            value={form.socialMediaLink}
            onChange={(e) => setField('socialMediaLink', e.target.value)}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <ImageUpload
            label="Foto e-KTP"
            value={ktpImage}
            onChange={setKtpImage}
            error={errors.ktpImage}
            required
          />
          <ImageUpload
            label="Selfie dengan KTP"
            value={selfieImage}
            onChange={setSelfieImage}
            error={errors.selfieImage}
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Password" error={errors.password} required>
            <Input
              type="password"
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              error={errors.password}
            />
          </Field>

          <Field label="Konfirmasi Password" error={errors.confirmPassword} required>
            <Input
              type="password"
              placeholder="Ulangi password"
              value={form.confirmPassword}
              onChange={(e) => setField('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
            />
          </Field>
        </div>

        <Checkbox
          checked={form.agreeTerms}
          onChange={(e) => setField('agreeTerms', e.target.checked)}
          label="Saya menyetujui Syarat & Ketentuan serta Kebijakan Privasi iRent"
          description="Data identitas digunakan hanya untuk verifikasi penyewa dan disimpan secara aman."
        />
        {errors.agreeTerms && <p className="text-[11px] text-rose-600 -mt-2">{errors.agreeTerms}</p>}

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
              <UserPlus size={16} /> Daftar Sekarang
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 rounded-2xl bg-[#F5F5F7] p-4">
        <p className="text-[11px] font-semibold text-[#1D1D1F] mb-2 flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-600" /> Persyaratan penyewa
        </p>
        <ul className="space-y-1.5 text-[11px] text-gray-500">
          <li>• Minimal 17 tahun dengan KTP aktif</li>
          <li>• Nomor telepon aktif untuk verifikasi</li>
          <li>• Deposit jaminan wajib disetorkan sebelum unit diserahkan</li>
        </ul>
      </div>

      <p className="text-xs text-gray-500 text-center mt-6">
        Sudah punya akun?{' '}
        <Link to="/login" className="font-semibold text-[#0071E3] hover:underline">
          Masuk di sini
        </Link>
      </p>

      <div className="flex justify-center mt-4">
        <Pill tone="warning" size="xs">
          Akun baru berstatus “Menunggu Verifikasi” sampai admin menyetujui KYC
        </Pill>
      </div>
    </div>
  );
};

export default RegisterPage;