import React from 'react';
import { formatRupiah } from '../../utils/formatter';
import { Button } from './Button';
export const ProductCard = ({ title, storage, pricePerDay, imageUrl, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col justify-between">
      <div>
        <div className="h-48 w-full flex items-center justify-center mb-4 bg-[#F5F5F7] rounded-xl overflow-hidden">
          <img 
            src={imageUrl || "https://placehold.co/300x300?text=iPhone"} 
            alt={title} 
            className="h-40 object-contain hover:scale-105 transition-transform" 
          />
        </div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-[#1D1D1F]">{title}</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{storage}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Mulai dari</p>
          <p className="text-base font-bold text-[#0071E3]">{formatRupiah(pricePerDay)}<span className="text-xs font-normal text-gray-500">/hari</span></p>
        </div>
        <Button variant="primary" onClick={onSelect}>Sewa</Button>
      </div>
    </div>
  );
};