/**
 * SHARED DOMAIN COMPONENTS — komponen yang dipakai lintas halaman
 * customer & admin (status, timeline pesanan, rincian harga, upload).
 */

import React, { useRef, useState } from 'react';
import { CheckCircle2, Clock, Circle, Upload, Trash2, ImageIcon, ShieldCheck } from 'lucide-react';
import { Card, InfoRow, Pill, ProgressBar } from '../ui';
import {
  ORDER_STATUS_META,
  ORDER_TIMELINE_STEPS,
  UNIT_STATUS_META,
  PHYSICAL_GRADE_META,
  PAYMENT_STATUS_META,
  FINE_TYPE_LABELS,
} from '../../constants';
import { formatRupiah, formatDateTime } from '../../utils/formatter';

// ─────────────────────────────────────────────────────
// STATUS BADGES
// ─────────────────────────────────────────────────────
export const OrderStatusBadge = ({ status, size = 'sm' }) => {
  const meta = ORDER_STATUS_META[status] || { label: status, tone: 'neutral' };
  return <Pill tone={meta.tone} size={size}>{meta.label}</Pill>;
};

export const UnitStatusBadge = ({ status, size = 'sm' }) => {
  const meta = UNIT_STATUS_META[status] || { label: status, tone: 'neutral' };
  return <Pill tone={meta.tone} size={size}>{meta.label}</Pill>;
};

export const GradeBadge = ({ grade, size = 'sm' }) => {
  const meta = PHYSICAL_GRADE_META[grade] || { label: grade, tone: 'neutral' };
  return <Pill tone={meta.tone} size={size}>{meta.label}</Pill>;
};

export const PaymentStatusBadge = ({ status, size = 'sm' }) => {
  const meta = PAYMENT_STATUS_META[status] || { label: status, tone: 'neutral' };
  return <Pill tone={meta.tone} size={size}>{meta.label}</Pill>;
};

export const BatteryBadge = ({ health }) => {
  const tone = health >= 90 ? 'success' : health >= 80 ? 'warning' : 'danger';
  return <Pill tone={tone} size="xs">{health}% BH</Pill>;
};

// ─────────────────────────────────────────────────────
// ORDER TIMELINE (STEPPER)
// ─────────────────────────────────────────────────────
export const OrderTimeline = ({ order, compact = false }) => {
  const currentStep = ORDER_STATUS_META[order?.orderStatus]?.step || 0;
  const isCancelled = order?.orderStatus === 'CANCELLED';

  return (
    <div className={compact ? '' : 'space-y-4'}>
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {ORDER_TIMELINE_STEPS.map((step, idx) => {
          const stepIndex = idx + 1;
          const stepMeta = ORDER_STATUS_META[step.key] || {};
          const done = !isCancelled && currentStep >= stepMeta.step;
          const active = !isCancelled && currentStep === stepMeta.step;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center gap-1.5 shrink-0 min-w-[74px]">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    done ? 'bg-[#0071E3] text-white' : 'bg-[#F5F5F7] text-gray-400'
                  } ${active ? 'ring-4 ring-[#0071E3]/15' : ''}`}
                >
                  {done && !active ? <CheckCircle2 size={14} /> : <Circle size={12} />}
                </div>
                <span
                  className={`text-[10px] text-center leading-tight ${
                    done ? 'text-[#1D1D1F] font-semibold' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < ORDER_TIMELINE_STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 min-w-[16px] ${done ? 'bg-[#0071E3]' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {isCancelled && (
        <Pill tone="danger" className="mt-2">
          Pesanan dibatalkan
        </Pill>
      )}

      {!compact && currentStep > 0 && currentStep < 11 && (
        <ProgressBar value={(currentStep / 11) * 100} />
      )}
    </div>
  );
};

/** Riwayat perubahan status (log timeline). */
export const OrderHistory = ({ timeline = [] }) => (
  <div className="space-y-3">
    {timeline
      .slice()
      .reverse()
      .map((entry, idx) => (
        <div key={`${entry.status}-${idx}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-[#0071E3] mt-1.5 shrink-0" />
            {idx < timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
          </div>
          <div className="pb-2">
            <p className="text-xs font-semibold text-[#1D1D1F]">
              {(ORDER_STATUS_META[entry.status] || {}).label || entry.status}
            </p>
            <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
              <Clock size={11} /> {formatDateTime(entry.at)} • {entry.actor}
            </p>
            {entry.note && <p className="text-[11px] text-gray-400 mt-0.5">{entry.note}</p>}
          </div>
        </div>
      ))}
  </div>
);

// ─────────────────────────────────────────────────────
// PRICE SUMMARY
// ─────────────────────────────────────────────────────
export const PriceSummary = ({ pricing, variant, showDepositNote = true, className = '' }) => {
  if (!pricing) return null;

  return (
    <Card className={className}>
      <p className="text-sm font-semibold text-[#1D1D1F] mb-3">Rincian Biaya</p>

      <div className="divide-y divide-gray-50">
        {(pricing.breakdown || []).map((row, idx) => (
          <InfoRow
            key={idx}
            label={`${row.label} ${row.quantity ? `× ${row.quantity}` : ''}`}
            value={formatRupiah(row.subtotal)}
          />
        ))}

        {pricing.weekendSurcharge > 0 && (
          <InfoRow
            label={`Surcharge Weekend (${pricing.weekendDays} hari)`}
            value={formatRupiah(pricing.weekendSurcharge)}
          />
        )}

        <InfoRow label="Subtotal Sewa" value={formatRupiah(pricing.rentalFee)} strong />
        <InfoRow label="Security Deposit" value={formatRupiah(pricing.securityDeposit)} />

        {pricing.discountAmount > 0 && (
          <InfoRow
            label="Diskon"
            value={`- ${formatRupiah(pricing.discountAmount)}`}
            valueClass="text-emerald-600 font-semibold"
          />
        )}

        <div className="pt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-[#1D1D1F]">Total</span>
          <span className="text-lg font-bold text-[#0071E3]">{formatRupiah(pricing.grandTotal)}</span>
        </div>
      </div>

      {pricing.savings > 0 && (
        <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
          <p className="text-[11px] text-emerald-700 font-semibold">
            🎉 Anda hemat {formatRupiah(pricing.savings)} dengan paket {pricing.tier.toLowerCase()}!
          </p>
        </div>
      )}

      {showDepositNote && (
        <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
          Deposit dikembalikan penuh setelah unit dikembalikan dalam kondisi baik (dikurangi denda jika ada).
        </p>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────────────────
// DEPOSIT SETTLEMENT
// ─────────────────────────────────────────────────────
export const DepositSettlement = ({ order }) => {
  const settlement = order?.settlement;
  const fines = order?.fines || [];

  if (!settlement && fines.length === 0) return null;

  const totalFines = settlement?.totalFines ?? fines.reduce((s, f) => s + (f.amount || 0), 0);
  const deposit = order?.securityDeposit || 0;
  const refund = settlement?.refundAmount ?? deposit - totalFines;
  const additional = settlement?.additionalInvoice ?? (refund < 0 ? Math.abs(refund) : 0);

  return (
    <Card>
      <p className="text-sm font-semibold text-[#1D1D1F] mb-3 flex items-center gap-2">
        <ShieldCheck size={16} className="text-[#0071E3]" /> Penyelesaian Deposit
      </p>

      <div className="divide-y divide-gray-50">
        <InfoRow label="Deposit Dibayar" value={formatRupiah(deposit)} />
        {fines.map((fine) => (
          <InfoRow
            key={fine.id}
            label={FINE_TYPE_LABELS[fine.fineType] || fine.fineType}
            value={`- ${formatRupiah(fine.amount)}`}
            valueClass="text-rose-600"
          />
        ))}
        <InfoRow label="Total Denda" value={formatRupiah(totalFines)} strong valueClass="text-rose-600" />

        {additional > 0 ? (
          <InfoRow
            label="Tagihan Tambahan"
            value={formatRupiah(additional)}
            strong
            valueClass="text-rose-600"
          />
        ) : (
          <InfoRow
            label="Deposit Dikembalikan"
            value={formatRupiah(Math.max(0, refund))}
            strong
            valueClass="text-emerald-600"
          />
        )}
      </div>

      {fines.length > 0 && (
        <div className="mt-3 space-y-2">
          {fines.map((fine) => (
            <div key={fine.id} className="rounded-xl bg-[#F5F5F7] p-3">
              <p className="text-[11px] font-semibold text-[#1D1D1F]">
                {FINE_TYPE_LABELS[fine.fineType] || fine.fineType}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">{fine.reason}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────────────────
// IMAGE UPLOAD (DROPZONE)
// ─────────────────────────────────────────────────────
export const ImageUpload = ({ label, hint, value, onChange, required, error, aspect = 'h-28 sm:h-32 w-full' }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange?.({ file, previewUrl: url, fileName: file.name });
  };

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-colors ${
          dragOver ? 'border-[#0071E3] bg-[#E8F2FD]' : error ? 'border-rose-300' : 'border-gray-200 bg-[#F9F9FB]'
        } ${aspect}`}
      >
        {value?.previewUrl ? (
          <>
            <img src={value.previewUrl} alt={label || 'Preview'} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange?.(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/95 flex items-center justify-center text-rose-600 shadow"
              aria-label="Hapus gambar"
            >
              <Trash2 size={14} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
              <ImageIcon size={18} />
            </div>
            <p className="text-[11px] font-semibold text-[#1D1D1F] flex items-center gap-1">
              <Upload size={12} /> Unggah foto
            </p>
            <p className="text-[10px] text-gray-400">JPG / PNG maks. 5 MB</p>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
      {!error && hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// UNIT INFO CARD
// ─────────────────────────────────────────────────────
export const UnitInfoCard = ({ unit, className = '' }) => {
  if (!unit) return null;
  return (
    <Card className={className}>
      <p className="text-sm font-semibold text-[#1D1D1F] mb-3">Identitas Unit Fisik</p>
      <div className="divide-y divide-gray-50">
        <InfoRow label="Model" value={unit.modelName} />
        <InfoRow label="Storage / Warna" value={`${unit.storageCapacity} · ${unit.colorName}`} />
        <InfoRow label="IMEI" value={<span className="font-mono">{unit.imei}</span>} />
        <InfoRow label="Serial Number" value={<span className="font-mono">{unit.serialNumber}</span>} />
        <InfoRow label="Battery Health" value={`${unit.batteryHealth}%`} />
        <InfoRow label="Grade Fisik" value={<GradeBadge grade={unit.physicalGrade} />} />
        <InfoRow label="Status" value={<UnitStatusBadge status={unit.currentStatus} />} />
      </div>
    </Card>
  );
};

// ─────────────────────────────────────────────────────
// EMPTY / LOADING HELPERS
// ─────────────────────────────────────────────────────
export const OrderCard = ({ order, onOpen }) => (
  <Card hover className="cursor-pointer" >
    <div onClick={onOpen} className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-mono text-gray-500">{order.orderNumber}</p>
          <p className="text-sm font-semibold text-[#1D1D1F] mt-0.5 truncate">
            {(order.items || [])[0]?.modelName || '-'}
          </p>
          <p className="text-[11px] text-gray-500">
            {(order.items || [])[0]?.storageCapacity} · {(order.items || [])[0]?.colorName}
          </p>
        </div>
        <OrderStatusBadge status={order.orderStatus} />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div>
          <p className="text-[10px] text-gray-400">Periode Sewa</p>
          <p className="text-[11px] text-[#1D1D1F] font-medium">
            {formatDateTime(order.startDate).split(',')[0]} — {formatDateTime(order.endDate).split(',')[0]}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400">Total</p>
          <p className="text-sm font-bold text-[#0071E3]">{formatRupiah(order.grandTotal)}</p>
        </div>
      </div>
    </div>
  </Card>
);