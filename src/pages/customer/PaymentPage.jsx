/**
 * PAYMENT PAGE — rincian tagihan, instruksi transfer, dan unggah bukti bayar
 * (PRD 10.2 #7). Menampilkan countdown grace period pembayaran.
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Clock, Upload, CheckCircle2, Copy, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Alert, Card, EmptyState, Field, InfoRow, Input, LoadingBlock, Pill, TextArea } from '../../components/ui';
import { ImageUpload, OrderStatusBadge, OrderTimeline } from '../../components/shared';
import { rentalApi } from '../../api/rentalApi';
import { paymentApi } from '../../api/paymentApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useCountdown, useDocumentTitle } from '../../hooks';
import { BANK_ACCOUNTS, PAYMENT_GRACE_PERIOD_HOURS, PAYMENT_STATUS } from '../../constants';
import { formatRupiah, formatDateTime, toInputDate } from '../../utils/formatter';

export const PaymentPage = () => {
  useDocumentTitle('Pembayaran');

  const { orderId } = useParams();
  const notify = useNotification();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [senderName, setSenderName] = useState('');
  const [transferDate, setTransferDate] = useState(toInputDate(new Date()));
  const [notes, setNotes] = useState('');
  const [proof, setProof] = useState(null);
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState('');

  // Deadline = waktu order dibuat + grace period
  const deadline = order ? new Date(new Date(order.createdAt).getTime() + PAYMENT_GRACE_PERIOD_HOURS * 3600000).toISOString() : null;
  const countdown = useCountdown(deadline);

  const loadOrder = () => {
    setLoading(true);
    rentalApi
      .detail(orderId)
      .then((res) => {
        setOrder(res.data);
        setSenderName(res.data.customerName || '');
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const copyText = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (senderName.trim().length < 3) next.senderName = 'Nama pengirim wajib diisi';
    if (!transferDate) next.transferDate = 'Tanggal transfer wajib diisi';
    if (!proof) next.proof = 'Bukti transfer wajib diunggah';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await paymentApi.submitProof(
        orderId,
        {
          paymentMethod: 'BANK_TRANSFER',
          senderName,
          transferDate,
          notes,
          proofImageUrl: proof.previewUrl,
        },
        user
      );
      notify.success('Bukti pembayaran terkirim! Menunggu verifikasi admin.');
      loadOrder();
    } catch (err) {
      notify.error(err.message || 'Gagal mengunggah bukti pembayaran');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12">
        <LoadingBlock label="Memuat tagihan..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12">
        <Card>
          <EmptyState
            title="Pesanan tidak ditemukan"
            description="Periksa kembali nomor pesanan Anda atau buka daftar riwayat sewa."
            action={
              <Link to="/riwayat">
                <Button variant="primary" className="text-xs">Lihat Riwayat</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  const isPaymentPending =
    order.payment?.status === PAYMENT_STATUS.PENDING || !order.payment;
  const hasSubmitted = Boolean(order.payment);
  const isVerified = order.payment?.status === PAYMENT_STATUS.VERIFIED;

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
      <Link to="/riwayat" className="text-xs text-gray-500 hover:text-[#0071E3] inline-flex items-center gap-1.5 mb-6">
        <ArrowLeft size={13} /> Riwayat Sewa
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-mono text-gray-500">{order.orderNumber}</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] tracking-tight mt-1">
            Instruksi Pembayaran
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Selesaikan pembayaran untuk mengamankan unit Anda.
          </p>
        </div>
        <OrderStatusBadge status={order.orderStatus} />
      </div>

      <Card className="mb-5">
        <OrderTimeline order={order} />
      </Card>

      {/* Countdown */}
      {isPaymentPending && !hasSubmitted && (
        <Card className="mb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${countdown.isExpired ? 'bg-rose-50' : 'bg-amber-50'}`}>
                <Clock size={20} className={countdown.isExpired ? 'text-rose-600' : 'text-amber-600'} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1D1D1F]">
                  {countdown.isExpired ? 'Batas pembayaran telah lewat' : 'Batas waktu pembayaran'}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Transfer sesuai nominal, lalu unggah bukti bayar
                </p>
              </div>
            </div>
            <p className={`text-2xl font-bold font-mono ${countdown.isExpired ? 'text-rose-600' : 'text-amber-600'}`}>
              {countdown.label}
            </p>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-5">
          {/* Instruksi transfer */}
          {!hasSubmitted && (
            <Card>
              <p className="text-sm font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                <Building2 size={15} className="text-[#0071E3]" /> Rekening Tujuan Transfer
              </p>

              <div className="space-y-3">
                {BANK_ACCOUNTS.map((acc) => (
                  <div key={acc.accountNumber} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Pill tone="brand" size="xs">{acc.bank}</Pill>
                      <button
                        type="button"
                        onClick={() => copyText(acc.accountNumber, acc.bank)}
                        className="text-[11px] text-[#0071E3] font-semibold flex items-center gap-1 hover:underline"
                      >
                        <Copy size={11} /> {copied === acc.bank ? 'Tersalin!' : 'Salin'}
                      </button>
                    </div>
                    <p className="text-lg font-bold text-[#1D1D1F] font-mono tracking-wide">
                      {acc.accountNumber}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">a/n {acc.accountName}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-[#E8F2FD] border border-blue-200 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#0071E3] font-semibold">Nominal Transfer</span>
                  <button
                    type="button"
                    onClick={() => copyText(String(order.grandTotal), 'amount')}
                    className="text-[11px] text-[#0071E3] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Copy size={11} /> {copied === 'amount' ? 'Tersalin!' : 'Salin'}
                  </button>
                </div>
                <p className="text-2xl font-bold text-[#0071E3]">{formatRupiah(order.grandTotal)}</p>
                <p className="text-[10px] text-[#0071E3]/70 mt-1">
                  Pembayaran sewa + deposit jaminan
                </p>
              </div>

              <Alert tone="warning" className="mt-4" title="Pastikan nominal tepat">
                Transfer dengan nominal <strong>sama persis</strong> agar admin dapat memverifikasi
                lebih cepat. Nominal berbeda akan menghambat proses verifikasi.
              </Alert>
            </Card>
          )}

          {/* Status / form upload */}
          {hasSubmitted ? (
            <Card>
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isVerified ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                  {isVerified ? (
                    <CheckCircle2 size={20} className="text-emerald-600" />
                  ) : (
                    <Clock size={20} className="text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1D1D1F]">
                    {isVerified ? 'Pembayaran Terverifikasi' : 'Menunggu Verifikasi Admin'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isVerified
                      ? 'Unit Anda sedang disiapkan untuk serah terima.'
                      : 'Admin akan memverifikasi bukti transfer Anda dalam 1–2 jam pada jam operasional.'}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                <InfoRow label="Nomor Pembayaran" value={<span className="font-mono">{order.payment.paymentNumber}</span>} />
                <InfoRow label="Nominal" value={formatRupiah(order.payment.amount)} strong />
                <InfoRow label="Metode" value="Transfer Bank" />
                <InfoRow label="Nama Pengirim" value={order.payment.senderName} />
                <InfoRow label="Waktu Unggah" value={formatDateTime(order.payment.createdAt)} />
                <InfoRow
                  label="Status"
                  value={
                    <Pill tone={isVerified ? 'success' : 'warning'} size="xs">
                      {isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                    </Pill>
                  }
                />
                {order.payment.verifiedBy && (
                  <InfoRow label="Diverifikasi Oleh" value={order.payment.verifiedBy} />
                )}
              </div>

              {order.payment.proofImageUrl && (
                <div className="mt-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Bukti Transfer</p>
                  <img
                    src={order.payment.proofImageUrl}
                    alt="Bukti transfer"
                    className="max-h-64 rounded-xl border border-gray-100 object-contain"
                  />
                </div>
              )}

              {isVerified && (
                <Link to={`/pesanan/${order.id}`}>
                  <Button variant="primary" className="w-full py-3 mt-5">
                    Lihat Detail Pesanan
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <Card>
              <p className="text-sm font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                <Upload size={15} className="text-[#0071E3]" /> Unggah Bukti Transfer
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Nama Pengirim (sesuai rekening)" error={errors.senderName} required>
                  <Input
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Nama sesuai rekening pengirim"
                    error={errors.senderName}
                  />
                </Field>

                <Field label="Tanggal & Waktu Transfer" error={errors.transferDate} required>
                  <Input
                    type="date"
                    value={transferDate}
                    max={toInputDate(new Date())}
                    onChange={(e) => setTransferDate(e.target.value)}
                    error={errors.transferDate}
                  />
                </Field>

                <div className="grid sm:grid-cols-[200px_1fr] gap-4">
                  <ImageUpload
                    label="Bukti Transfer"
                    value={proof}
                    onChange={setProof}
                    error={errors.proof}
                    hint="Screenshot/struk mutasi yang jelas"
                    required
                  />

                  <Field label="Catatan (opsional)">
                    <TextArea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: transfer dari rekening BCA a/n istri saya"
                      rows={6}
                      maxLength={300}
                    />
                  </Field>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? 'Mengirim...' : (<><Upload size={16} /> Kirim Bukti Pembayaran</>)}
                </Button>
              </form>
            </Card>
          )}

          {order.notes && (
            <Card>
              <p className="text-xs font-semibold text-[#1D1D1F] mb-1.5">Catatan Anda</p>
              <p className="text-xs text-gray-500 leading-relaxed">{order.notes}</p>
            </Card>
          )}
        </div>

        {/* Ringkasan tagihan */}
        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <Card>
            <p className="text-sm font-semibold text-[#1D1D1F] mb-3">Rincian Tagihan</p>
            <div className="divide-y divide-gray-50">
              <InfoRow label="Unit" value={`${(order.items || [])[0]?.modelName}`} />
              <InfoRow
                label="Varian"
                value={`${(order.items || [])[0]?.storageCapacity} · ${(order.items || [])[0]?.colorName}`}
              />
              <InfoRow label="Durasi" value={`${order.totalDays} hari`} />
              <InfoRow label="Biaya Sewa" value={formatRupiah(order.rentalFee)} />
              <InfoRow label="Deposit Jaminan" value={formatRupiah(order.securityDeposit)} />
              {order.discountAmount > 0 && (
                <InfoRow
                  label="Diskon"
                  value={`- ${formatRupiah(order.discountAmount)}`}
                  valueClass="text-emerald-600"
                />
              )}
              <div className="pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-[#1D1D1F]">Total Tagihan</span>
                <span className="text-lg font-bold text-[#0071E3]">{formatRupiah(order.grandTotal)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold text-[#1D1D1F] mb-3">Butuh bantuan?</p>
            <ul className="space-y-2 text-[11px] text-gray-500">
              <li>WhatsApp: 0812-2518-8023</li>
              <li>Email: hello@irent.id</li>
            </ul>
            <Alert tone="info" className="mt-3">
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={12} /> Dilarang transfer ke rekening selain yang tertera.
              </span>
            </Alert>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default PaymentPage;