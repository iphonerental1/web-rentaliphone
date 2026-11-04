import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-8 px-6 mt-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div>
          <p className="font-semibold text-gray-700">SEWA HANDPHONE IRENT</p>
          <p>Layanan sewa smartphone praktis dan terpercaya.</p>
        </div>
        <p>© 2026 iRent. All rights reserved.</p>
      </div>
    </footer>
  );
};