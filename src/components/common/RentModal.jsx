import React, { useState } from 'react';
import { formatRupiah } from '../../utils/formatter';
import { Button } from './Button';

export const RentModal = ({ product, onClose, onSubmitOrder }) => {
  const [days, setDays] = useState(1);
  const [startDate, setStartDate] = useState('');

  if (!product) return null;

  const totalPrice = product.pricePerDay * days;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate) {
      alert('Silakan pilih tanggal mulai sewa!');
      return;
    }

    const newOrder = {
      id: `TRX-${Date.now()}`,
      productName: product.title,
      storage: product.storage,
      startDate,
      days,
      totalPrice,
      status: 'PENDING',
    };

    onSubmitOrder(newOrder);
    alert('Pesanan berhasil dibuat!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-xl">
        <div className="flex justify-between items-center border-b pb-4 border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-[#1D1D1F]">Form Sewa HP</h3>
            <p className="text-xs text-gray-500">{product.title} ({product.storage})</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Mulai Sewa</label>
            <input 
              type="date" 
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0071E3]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Durasi Sewa (Hari)</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDays(Math.max(1, days - 1))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50 active:scale-95"
              >
                -
              </button>
              <input 
                type="number" 
                min="1"
                value={days}
                onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-center text-sm font-semibold focus:outline-none focus:border-[#0071E3]"
              />
              <button
                type="button"
                onClick={() => setDays(days + 1)}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-[#F5F5F7] p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Harga per hari</span>
              <span>{formatRupiah(product.pricePerDay)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Durasi</span>
              <span>{days} Hari</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-[#1D1D1F]">
              <span>Total Estimasi</span>
              <span className="text-[#0071E3]">{formatRupiah(totalPrice)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 text-xs py-3">
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1 text-xs py-3">
              Konfirmasi Sewa
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};