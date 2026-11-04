/**
 * PRICING ENGINE — implementasi rumus PRD Section 7.
 *
 * PENTING: Mesin ini adalah cerminan dari logika yang HARUS dihitung di backend.
 * Di frontend dipakai untuk kalkulasi sementara (optimistic UI) pada kalkulator
 * sewa dan preview invoice. Nilai final tetap dihitung backend (jangan pernah
 * mempercayai nominal Rupiah dari klien).
 */

import { diffInDays } from './formatter';
import { SYSTEM_CONFIG } from '../constants';

/**
 * Hitung biaya sewa berdasarkan tier durasi (PRD 7.2).
 * - Harian   (1–6 hari)
 * - Mingguan (7–29 hari)  -> weeks * weekly_rate + sisa hari * daily_rate
 * - Bulanan  (>= 30 hari) -> months * monthly_rate + sisa hari * daily_rate
 *
 * @param {object} rate - { dailyRate, weeklyRate, monthlyRate }
 * @param {number} totalDays
 * @returns {{ rentalFee:number, breakdown:Array, tier:string, savings:number }}
 */
export const calculateRentalFee = (rate, totalDays) => {
  const days = Math.max(SYSTEM_CONFIG.minRentalDays, Number(totalDays) || 0);
  const dailyRate = Number(rate?.dailyRate) || 0;
  const weeklyRate = Number(rate?.weeklyRate) || 0;
  const monthlyRate = Number(rate?.monthlyRate) || 0;

  const fullDailyPrice = dailyRate * days;
  const breakdown = [];

  // Bulanan
  if (days >= 30 && monthlyRate > 0) {
    const months = Math.floor(days / 30);
    const restDays = days % 30;
    const monthsFee = months * monthlyRate;
    const restFee = restDays * dailyRate;
    breakdown.push({
      label: `Paket Bulanan ${months} × ${months}`,
      quantity: months,
      unitPrice: monthlyRate,
      subtotal: monthsFee,
    });
    if (restDays > 0) {
      breakdown.push({
        label: 'Hari Sisa',
        quantity: restDays,
        unitPrice: dailyRate,
        subtotal: restFee,
      });
    }
    const rentalFee = monthsFee + restFee;
    return {
      rentalFee,
      breakdown,
      tier: 'BULANAN',
      savings: Math.max(0, fullDailyPrice - rentalFee),
    };
  }

  // Mingguan
  if (days >= 7 && weeklyRate > 0) {
    const weeks = Math.floor(days / 7);
    const restDays = days % 7;
    const weeksFee = weeks * weeklyRate;
    const restFee = restDays * dailyRate;
    breakdown.push({
      label: 'Paket Mingguan',
      quantity: weeks,
      unitPrice: weeklyRate,
      subtotal: weeksFee,
    });
    if (restDays > 0) {
      breakdown.push({
        label: 'Hari Sisa',
        quantity: restDays,
        unitPrice: dailyRate,
        subtotal: restFee,
      });
    }
    const rentalFee = weeksFee + restFee;
    return {
      rentalFee,
      breakdown,
      tier: 'MINGGUAN',
      savings: Math.max(0, fullDailyPrice - rentalFee),
    };
  }

  // Harian
  const rentalFee = days * dailyRate;
  breakdown.push({
    label: 'Sewa Harian',
    quantity: days,
    unitPrice: dailyRate,
    subtotal: rentalFee,
  });
  return { rentalFee, breakdown, tier: 'HARIAN', savings: 0 };
};

/**
 * Hitung surcharge weekend (PRD 7.3). Nonaktif bila konfigurasi 0.
 */
export const calculateWeekendSurcharge = (rate, startDate, endDate) => {
  const percent = SYSTEM_CONFIG.weekendSurchargePercent;
  if (!percent) return { amount: 0, weekendDays: 0 };

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { amount: 0, weekendDays: 0 };
  }

  let weekendDays = 0;
  const cursor = new Date(start);
  while (cursor < end) {
    const day = cursor.getDay();
    if (day === 0 || day === 6) weekendDays += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  const dailyRate = Number(rate?.dailyRate) || 0;
  const amount = Math.round((dailyRate * percent * weekendDays) / 100);
  return { amount, weekendDays };
};

/**
 * Perhitungan lengkap harga sewa satu varian.
 *
 * @param {object} variant  - data varian (harga + deposit)
 * @param {string} startDate - ISO date
 * @param {string} endDate   - ISO date
 * @param {number} discount  - potongan promo (opsional)
 * @returns {object} rincian lengkap
 */
export const calculateRentalPrice = (variant, startDate, endDate, discount = 0) => {
  const totalDays = diffInDays(startDate, endDate);
  const rate = {
    dailyRate: variant?.dailyRate || variant?.pricePerDay || 0,
    weeklyRate: variant?.weeklyRate || 0,
    monthlyRate: variant?.monthlyRate || 0,
  };

  const { rentalFee, breakdown, tier, savings } = calculateRentalFee(rate, totalDays);
  const weekend = calculateWeekendSurcharge(rate, startDate, endDate);
  const securityDeposit = 0; // Deposit ditiadakan (diganti sistem DP 30%)
  const discountAmount = Number(discount) || 0;

  const grandTotal = rentalFee + weekend.amount - discountAmount;
  const dpAmount = Math.round(grandTotal * 0.3); // Wajib DP 30%
  const remainingPayment = grandTotal - dpAmount; // Pelunasan saat serah terima

  return {
    totalDays,
    dailyRate: rate.dailyRate,
    weeklyRate: rate.weeklyRate,
    monthlyRate: rate.monthlyRate,
    rentalFee,
    breakdown,
    tier,
    savings,
    weekendSurcharge: weekend.amount,
    weekendDays: weekend.weekendDays,
    securityDeposit: 0,
    dpAmount,
    remainingPayment,
    discountAmount,
    grandTotal: Math.max(0, grandTotal),
    isAvailable: variant?.isAvailable !== false,
  };
};

/**
 * Hitung denda keterlambatan (PRD 7.5).
 * - Grace period 2 jam tanpa denda.
 * - Terlambat 2–6 jam: 50% daily rate.
 * - Terlambat > 6 jam: ceil(days) * dailyRate * 1.5
 *
 * @param {Date|string} dueDate    - batas akhir sewa
 * @param {Date|string} returnDate - waktu aktual pengembalian
 * @param {number} dailyRate
 */
export const calculateLateFine = (dueDate, returnDate, dailyRate) => {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  const rate = Number(dailyRate) || 0;

  if (Number.isNaN(due.getTime()) || Number.isNaN(returned.getTime())) {
    return { amount: 0, lateHours: 0, overdueDays: 0, note: 'Tanggal tidak valid' };
  }

  const lateMs = returned.getTime() - due.getTime();
  const lateHours = lateMs / (3600 * 1000);

  if (lateHours <= SYSTEM_CONFIG.lateGracePeriodHours) {
    return {
      amount: 0,
      lateHours: Math.max(0, lateHours),
      overdueDays: 0,
      note: 'Dalam grace period — tidak ada denda',
    };
  }

  if (lateHours <= 6) {
    const amount = Math.round((rate * SYSTEM_CONFIG.lateFineUnderSixHoursPercent) / 100);
    return {
      amount,
      lateHours,
      overdueDays: 0,
      note: `Terlambat ${lateHours.toFixed(1)} jam — denda 50% tarif harian`,
    };
  }

  const overdueDays = Math.ceil(lateHours / 24);
  const amount = Math.round(overdueDays * rate * SYSTEM_CONFIG.lateFineMultiplierPerDay);
  return {
    amount,
    lateHours,
    overdueDays,
    note: `Terlambat ${overdueDays} hari — denda 1.5× tarif harian per hari`,
  };
};

/**
 * Hitung total denda dari daftar fines dan settlement deposit (PRD 7.5).
 *
 * @param {number} securityDeposit
 * @param {Array<{amount:number}>} fines
 * @returns {{ totalFines:number, refundAmount:number, additionalInvoice:number }}
 */
export const calculateDepositSettlement = (securityDeposit, fines = []) => {
  const deposit = Number(securityDeposit) || 0;
  const totalFines = fines.reduce((sum, fine) => sum + (Number(fine?.amount) || 0), 0);
  const refundAmount = deposit - totalFines;

  return {
    totalFines,
    refundAmount,
    additionalInvoice: refundAmount < 0 ? Math.abs(refundAmount) : 0,
    depositExhausted: refundAmount <= 0,
  };
};

/**
 * Estimasi denda aksesori yang hilang (PRD 7.5).
 */
export const calculateAccessoryFines = (accessoriesReturned = {}, rates) => {
  const rateMap = rates || {};
  return Object.entries(rateMap).map(([key, amount]) => ({
    key,
    returned: Boolean(accessoriesReturned[key]),
    amount: accessoriesReturned[key] ? 0 : amount,
  }));
};

/**
 * Hitung utilisasi unit (%) — dipakai pada dashboard admin.
 */
export const calculateUtilization = (rentedDays, totalAvailableDays) => {
  const total = Number(totalAvailableDays) || 0;
  if (total === 0) return 0;
  return Math.min(100, ((Number(rentedDays) || 0) / total) * 100);
};