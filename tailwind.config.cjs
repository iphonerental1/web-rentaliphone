/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0071E3',
          hover: '#0077ED',
          light: '#E8F2FD',
        },
        dark: '#1D1D1F',
        neutral: {
          800: '#2D2D2F',
          100: '#F5F5F7',
        },
        success: '#34C759',
        warning: '#FF9F0A',
        danger: '#FF3B30',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        container: '1200px',
      },
    },
  },
  plugins: [],
};
