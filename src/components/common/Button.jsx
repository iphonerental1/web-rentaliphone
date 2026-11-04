import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-5 py-2.5 rounded-full font-medium transition-all duration-200 disabled:opacity-50 cursor-pointer";
  
  const variants = {
    primary: "bg-[#0071E3] text-white hover:bg-[#0077ED] active:scale-95",
    secondary: "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] active:scale-95 dark:bg-[#3a3a3c] dark:text-white dark:hover:bg-[#48484a]",
    outline: "border border-[#0071E3] text-[#0071E3] hover:bg-[#0071E3]/10 dark:border-[#5ac8fa] dark:text-[#5ac8fa] dark:hover:bg-[#0071E3]/20",
    danger: "bg-[#FF3B30] text-white hover:bg-[#E03126]"
  };

  // Tombol custom (mis. bg-white/10 di section gelap) tetap terang saat dark mode.
  const isLightOnDark = /bg-white\/\d|\bbg-white\b/.test(className);

  return (
    <button
      className={`${baseStyle} ${variants[variant] || variants.primary} ${
        isLightOnDark ? 'dark:bg-white/10 dark:text-white dark:hover:bg-white/20' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};