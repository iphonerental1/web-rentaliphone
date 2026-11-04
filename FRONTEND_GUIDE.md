# 🎨 PANDUAN FRONTEND DEVELOPER — iRent Platform

> **Role:** Frontend Developer (Primary)  
> **Project:** Sistem Sewa iPhone (iRent Platform)  
> **Tech Stack:** React 19 + Vite + Tailwind CSS  
> **Referensi PRD:** `IMPLEMENTATION_PLAN.md` (Blueprint & Implementation Plan)

---

## 📌 1. RINGKASAN TUGAS ANDA

Sebagai **Frontend Developer**, tugas Anda adalah:

1. **Mengimplementasikan desain Figma** menjadi antarmuka web yang dapat digunakan.
2. **Membuat komponen, halaman, routing, form, dan state**.
3. **Melakukan validasi pada sisi client** (React Hook Form + Zod).
4. **Menghubungkan frontend dengan API backend** (Axios) serta menangani loading dan error state.
5. **Memastikan tampilan responsif** di mobile, tablet, dan desktop.

---

## 📌 2. LINK FIGMA & CARA MENGAKSESNYA

**Link Figma:**  
👉 https://www.figma.com/design/syx3kbddwbUimFQ0QgeyCD/Untitled?node-id=0-1&t=DiMy2GYI2ez0aaQB-1

### Cara Menggunakan Figma sebagai Frontend:
1. **Buka link Figma** di browser (Chrome/Edge direkomendasikan).
2. **Klik "Open in Figma"** atau login dengan akun Figma Anda.
3. **Mode Inspect (Developer Mode):**
   - Klik elemen desain → panel kanan menampilkan **CSS code** (warna, font, spacing, border-radius).
   - Gunakan tab **"Inspect"** untuk melihat properti CSS yang siap disalin.
4. **Export Asset:**
   - Klik gambar/ikon → panel kanan → tab **"Export"** → pilih format PNG/SVG → klik **Export**.
5. **Copy Text Styles & Color Tokens:**
   - Buka tab **"Design"** → perhatikan nama style (misal: `H1 / Bold`, `Body / Regular`).
   - Catat warna hex, ukuran font, dan spacing untuk konsistensi.

---

## 📌 3. DESIGN SYSTEM (WAJIB DIIKUTI)

Berdasarkan PRD Section 10.1, berikut design token yang harus konsisten:

### 🎨 Color Palette
| Token | Hex | Penggunaan |
|-------|-----|------------|
| **Brand Primary** | `#0071E3` | Tombol CTA, link aktif, highlight |
| **Dark / Neutral-900** | `#1D1D1F` | Teks utama, hero background |
| **Neutral-800** | `#2D2D2F` | Card background (dark mode) |
| **Neutral-100** | `#F5F5F7` | Background halaman, container fill |
| **White** | `#FFFFFF` | Card surface, modal |
| **Success Green** | `#34C759` | Status: Available, Verified, Completed |
| **Warning Amber** | `#FF9F0A` | Status: Waiting Payment, Under Inspection |
| **Destructive Red** | `#FF3B30` | Status: Overdue, Cancelled, Damage |

### 🔤 Typography
| Style | Ukuran | Weight |
|-------|--------|--------|
| Display | 36–48px | Bold |
| H1 | 30–36px | Semibold |
| H2 | 24–28px | Semibold |
| H3 | 20–22px | Medium |
| Body | 14–16px | Regular |
| Caption | 12–13px | Regular |

**Font:** SF Pro Display / Inter (fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)

### 📐 Grid & Spacing
- **8-point grid system:** 8px, 16px, 24px, 32px, 48px, 64px
- **Container max-width:** 1200px (desktop)
- **Breakpoints:** Mobile `<640px` | Tablet `640–1024px` | Desktop `>1024px`

---

## 📌 4. STRUKTUR PROYEK YANG SUDAH ADA

```
SEWA HANDPHONE IRENT/
├── index.html
├── package.json
├── vite.config.js
├── postcss.config.cjs
├── src/
│   ├── main.jsx              # Entry point React
│   ├── App.jsx               # Halaman utama (Katalog + Riwayat)
│   ├── index.css             # Tailwind CSS entry
│   ├── tailwind.config.cjs   # Konfigurasi Tailwind
│   ├── assets/               # Gambar & aset statis
│   ├── components/
│   │   └── common/           # Komponen reusable
│   │       ├── Navbar.jsx    # ✅ Sudah ada
│   │       ├── Footer.jsx    # ✅ Sudah ada
│   │       ├── Button.jsx    # ✅ Sudah ada
│   │       ├── Badge.jsx     # ✅ Sudah ada
│   │       ├── ProductCard.jsx # ✅ Sudah ada
│   │       ├── FilterBar.jsx # ✅ Sudah ada
│   │       └── RentModal.jsx # ✅ Sudah ada
│   ├── data/
│   │   └── products.js       # ✅ Data produk statis
│   └── utils/
│       └── formatter.js      # ✅ Format Rupiah & tanggal
```

### ✅ Yang Sudah Berjalan
- Katalog produk dengan grid card
- Filter pencarian & kategori
- Modal form sewa (tanggal + durasi + total harga)
- Riwayat transaksi sederhana
- Design system warna sudah sesuai PRD

---

## 📌 5. ROADMAP IMPLEMENTASI FRONTEND (13 Halaman Customer)

Berdasarkan PRD Section 10.2, berikut urutan implementasi yang disarankan:

### Fase 1 — Fondasi (Minggu 1-2)
- [ ] **Setup React Router** (`react-router-dom`) untuk multi-halaman
- [ ] **Setup Axios** untuk integrasi API (`src/api/axiosClient.js`)
- [ ] **Setup React Context** untuk autentikasi (`src/contexts/AuthContext.jsx`)
- [ ] **Setup Tailwind config** dengan design token (warna, font, spacing)

### Fase 2 — Halaman Publik (Minggu 3-5)
- [ ] **Landing Page** — Hero, value proposition, cara kerja 4 langkah, testimonial, FAQ
- [ ] **Katalog iPhone** — Grid produk + filter (seri, storage, harga, tanggal)
- [ ] **Detail iPhone** — Galeri, spesifikasi, pilih varian, kalkulator sewa
- [ ] **Login & Register** — Form autentikasi dengan validasi

### Fase 3 — Alur Booking (Minggu 6-8)
- [ ] **Booking Page** — Pilih tanggal, metode pengambilan, catatan
- [ ] **Checkout / KYC** — Upload KTP, selfie, link sosial media
- [ ] **Payment Page** — Rincian tagihan, instruksi transfer, upload bukti bayar

### Fase 4 — Dashboard Customer (Minggu 9-10)
- [ ] **Customer Dashboard** — Status sewa aktif, jatuh tempo, shortcut booking
- [ ] **Rental Detail** — Timeline status, detail unit (IMEI/SN), invoice
- [ ] **Rental History** — Tabel riwayat transaksi
- [ ] **Customer Profile** — Edit profil, ubah password, alamat

### Fase 5 — Admin Dashboard (Minggu 11-14)
- [ ] **Admin Login**
- [ ] **Dashboard Overview** — KPI metrics, grafik utilisasi
- [ ] **Manajemen Unit** — CRUD unit fisik (IMEI, SN, Battery Health)
- [ ] **Manajemen Order** — Verifikasi, alokasi unit, tracking status
- [ ] **Payment Verification**
- [ ] **Return & Inspection** — Checklist 12 titik
- [ ] **Fines & Denda**
- [ ] **Reports & Audit Logs**

---

## 📌 6. STRUKTUR FOLDER YANG DIREKOMENDASIKAN

Berdasarkan PRD Section 9.1, buat struktur folder berikut:

```
src/
├── api/                      # Axios instance & API calls
│   ├── axiosClient.js
│   ├── authApi.js
│   ├── catalogApi.js
│   ├── rentalApi.js
│   └── adminApi.js
├── components/
│   ├── common/               # ✅ Sudah ada (Button, Badge, dll)
│   ├── feedback/             # Alert, Skeleton, Toast, EmptyState
│   ├── layout/               # Navbar, Footer, Sidebar, PageContainer
│   └── form/                 # DateRangePicker, FileDropzone, Select
├── contexts/
│   ├── AuthContext.jsx       # Session, JWT token, user info
│   └── NotificationContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useDebounce.js
│   ├── useRentalCalculator.js
│   └── usePagination.js
├── layouts/
│   ├── CustomerLayout.jsx    # Header + Nav + Main + Footer
│   ├── AdminLayout.jsx       # Sidebar + Topbar + Content
│   └── AuthLayout.jsx        # Split-screen layout
├── pages/
│   ├── customer/
│   │   ├── LandingPage.jsx
│   │   ├── CatalogPage.jsx
│   │   ├── IphoneDetailPage.jsx
│   │   ├── BookingCheckoutPage.jsx
│   │   ├── PaymentInstructionPage.jsx
│   │   ├── CustomerDashboardPage.jsx
│   │   ├── OrderDetailPage.jsx
│   │   └── CustomerProfilePage.jsx
│   ├── admin/
│   │   ├── AdminDashboardPage.jsx
│   │   ├── UnitInventoryPage.jsx
│   │   ├── OrderManagementPage.jsx
│   │   ├── InspectionProcessPage.jsx
│   │   ├── CustomerListPage.jsx
│   │   ├── ReportsPage.jsx
│   │   └── AuditLogPage.jsx
│   └── auth/
│       ├── LoginPage.jsx
│       └── RegisterPage.jsx
├── routes/
│   ├── AppRoutes.jsx
│   ├── ProtectedRoute.jsx   # Role-based route guard
│   └── paths.js
├── utils/
│   ├── currencyFormatter.js # ✅ Sudah ada (formatter.js)
│   ├── dateUtils.js
│   └── validators.js
├── App.jsx
└── main.jsx
```

---

## 📌 7. DEPENDENCIES YANG PERLU DIINSTALL

```bash
# Routing
npm install react-router-dom

# HTTP Client
npm install axios

# Form & Validasi
npm install react-hook-form zod @hookform/resolvers

# State Management (Server State)
npm install @tanstack/react-query

# Date Handling
npm install date-fns

# Icons
npm install lucide-react
```

---

## 📌 8. CONTOH IMPLEMENTASI AWAL

### 8.1 Setup React Router (`src/main.jsx`)

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### 8.2 Setup Axios Client (`src/api/axiosClient.js`)

```js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: tambahkan token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect ke login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
```

### 8.3 Setup Auth Context (`src/contexts/AuthContext.jsx`)

```jsx
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 8.4 Setup Tailwind Config dengan Design Token (`src/tailwind.config.cjs`)

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0071E3',
          hover: '#0077ED',
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
```

---

## 📌 9. ALUR KERJA SEHARI-HARI (WORKFLOW)

### 9.1 Menjalankan Proyek
```bash
# Install dependencies (pertama kali)
npm install

# Jalankan development server
npm run dev
# Buka http://localhost:5173
```

### 9.2 Git Workflow
```bash
# Buat branch fitur
git checkout -b feature/landing-page

# Setelah selesai, commit
git add .
git commit -m "feat(landing): add hero section and value propositions"

# Push ke remote
git push origin feature/landing-page
```

### 9.3 Checklist Sebelum Commit
- [ ] Kode berjalan tanpa error (`npm run dev`)
- [ ] Tidak ada warning di console browser
- [ ] Tampilan responsif (cek di mobile & desktop)
- [ ] Mengikuti design system (warna, font, spacing)
- [ ] Komponen reusable dipisahkan di `components/`
- [ ] Data tidak hardcoded di komponen (gunakan `data/` atau API)

---

## 📌 10. INTEGRASI DENGAN BACKEND (API CONTRACT)

Berdasarkan PRD Section 8, berikut endpoint yang akan Anda gunakan:

### Public Endpoints
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/v1/auth/register` | Registrasi customer |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/iphones` | Katalog iPhone (dengan filter) |
| GET | `/api/v1/iphones/:id` | Detail iPhone |
| POST | `/api/v1/iphones/calculate-price` | Kalkulasi harga sewa |

### Customer Endpoints (Perlu Token)
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/v1/auth/me` | Profil user |
| POST | `/api/v1/rentals` | Buat pesanan sewa |
| GET | `/api/v1/rentals/my-orders` | Riwayat pesanan |
| GET | `/api/v1/rentals/:id` | Detail pesanan |
| POST | `/api/v1/payments/submit-proof` | Upload bukti bayar |

### Admin Endpoints (Perlu Token Admin)
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/v1/admin/units` | Daftar unit fisik |
| POST | `/api/v1/admin/units` | Tambah unit |
| PUT | `/api/v1/admin/units/:id` | Update unit |
| POST | `/api/v1/admin/orders/:orderId/allocate-unit` | Alokasi unit ke order |
| POST | `/api/v1/admin/returns/:orderId/inspect` | Inspeksi pengembalian |
| GET | `/api/v1/admin/reports/overview` | Dashboard metrics |

### Format Response API
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 100 }
}
```

---

## 📌 11. TIPS & BEST PRACTICES

### ✅ Lakukan
1. **Komponen kecil & reusable** — pecah komponen besar menjadi komponen kecil.
2. **Gunakan Tailwind utility classes** — jangan buat CSS custom kecuali diperlukan.
3. **Handle loading & error state** — tampilkan skeleton/spinner saat loading, dan pesan error yang jelas.
4. **Gunakan `formatRupiah`** dari `utils/formatter.js` untuk semua format harga.
5. **Ikuti design token** — jangan hardcode warna selain dari design system.
6. **Responsive first** — mulai dari mobile, lalu naik ke desktop (`sm:`, `md:`, `lg:`).

### ❌ Hindari
1. **Jangan hardcode data** di dalam komponen — gunakan `data/products.js` atau API.
2. **Jangan gunakan `alert()`** untuk feedback — buat komponen Toast/Notification.
3. **Jangan abaikan accessibility** — tambahkan `aria-label`, `alt` text, dan focus states.
4. **Jangan buat halaman terlalu panjang** — pecah menjadi komponen section.

---

## 📌 12. CHECKLIST PROGRESS (SALIN KE KANBAN ANDA)

### Halaman Customer (13)
- [ ] Landing Page
- [ ] Katalog iPhone
- [ ] Detail iPhone
- [ ] Rental Calculator
- [ ] Booking Page
- [ ] Checkout / KYC
- [ ] Payment Page
- [ ] Login Page
- [ ] Register Page
- [ ] Customer Dashboard
- [ ] Rental Detail
- [ ] Rental History
- [ ] Customer Profile

### Halaman Admin (14)
- [ ] Admin Login
- [ ] Dashboard Overview
- [ ] Manajemen Model iPhone
- [ ] Manajemen Unit Fisik
- [ ] Manajemen Customer / KYC
- [ ] Manajemen Order
- [ ] Verifikasi Pembayaran
- [ ] Return & Handover
- [ ] Inspeksi & QC
- [ ] Denda & Fines
- [ ] Maintenance
- [ ] Reports & Analytics
- [ ] User & Admin Management
- [ ] Audit Logs

---

## 📌 13. REFERENSI

- **PRD Lengkap:** `IMPLEMENTATION_PLAN.md` (di folder Documents)
- **Figma Design:** https://www.figma.com/design/syx3kbddwbUimFQ0QgeyCD/Untitled
- **React Docs:** https://react.dev
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **React Router Docs:** https://reactrouter.com
- **Axios Docs:** https://axios-http.com
- **React Hook Form:** https://react-hook-form.com
- **Zod:** https://zod.dev

---

> 💡 **Tips:** Mulailah dari halaman yang paling sederhana dulu (Login, Register, Landing Page), lalu lanjut ke halaman yang lebih kompleks (Booking, Checkout, Admin Dashboard). Jangan lupa selalu update progress di Kanban board Anda!