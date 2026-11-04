import React from 'react';
import { Button } from './Button';

export const Navbar = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-[#0071E3] rounded-lg flex items-center justify-center text-white font-bold text-lg">
            i
          </div>
          <span className="font-bold text-xl text-[#1D1D1F] tracking-tight">iRent</span>
        </div>

        {/* Menu Navigasi */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#katalog" className="hover:text-[#0071E3] transition-colors">Katalog HP</a>
          <a href="#syarat" className="hover:text-[#0071E3] transition-colors">Syarat & Ketentuan</a>
          <a href="#kontak" className="hover:text-[#0071E3] transition-colors">Kontak Kami</a>
        </div>



      </div>
    </nav>
  );
};