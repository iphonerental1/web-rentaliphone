# Backend RESTful API - Sistem Penyewaan iPhone (iPhone Rental System)

Backend service untuk sistem penyewaan iPhone yang dibangun berdasarkan dokumen spesifikasi teknis `Berikut adalah dokumen perencanaan teknis.docx`.

---

## 🛠️ Tech Stack Backend

- **Runtime**: Node.js (v26)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma ORM (v6)
- **Autentikasi**: JWT (JSON Web Token) & `bcryptjs`
- **File Upload**: Multer (Mendukung upload foto unit & bukti transfer WA)
- **CORS**: Mengizinkan akses lintas domain untuk aplikasi frontend

---

## 📁 Struktur Direktori

```text
backend ulang/
├── prisma/
│   ├── schema.prisma            # Skema model database PostgreSQL Prisma
│   └── seed.js                  # Script seeder data awal (Admin, Model, Unit, Booking)
├── src/
│   ├── config/
│   │   ├── env.js               # Konfigurasi environment variables
│   │   └── prisma.js            # Inisialisasi koneksi Prisma Client
│   ├── controllers/
│   │   ├── authController.js    # Login admin & profil admin
│   │   ├── catalogController.js # Katalog publik & detail seri iPhone
│   │   ├── dashboardController.js # Statistik KPI dashboard admin
│   │   ├── iphoneModelController.js # CRUD model iPhone (katalog)
│   │   ├── iphoneUnitController.js  # CRUD inventaris unit fisik & status
│   │   ├── bookingController.js # Transaksi sewa WA & transaksi atomik Prisma
│   │   ├── uploadController.js  # Upload gambar bukti transfer / foto unit
│   │   └── reportController.js  # Rekapitulasi pendapatan & export CSV
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Middleware verifikasi JWT admin (verifyAdminToken)
│   │   ├── errorMiddleware.js   # Global error handler & 404 handler
│   │   └── uploadMiddleware.js  # Konfigurasi upload Multer & filter format gambar
│   ├── routes/
│   │   ├── index.js             # Master router (/api/v1)
│   │   ├── authRoutes.js        # Endpoint /api/v1/auth
│   │   ├── catalogRoutes.js     # Endpoint /api/v1/catalog
│   │   └── adminRoutes.js       # Endpoint /api/v1/admin (Protected)
│   ├── utils/
│   │   ├── codeGenerator.js     # Generator bookingCode & slugify
│   │   └── response.js          # Helper response JSON standar
│   └── app.js                   # Inisialisasi Express & middleware
├── tests/
│   ├── test-endpoints.js        # Test suite integrasi otomatis untuk seluruh endpoint
│   └── test-upload.js           # Pengujian endpoint upload file multipart/form-data
├── uploads/                     # Folder penyimpanan file upload lokal
│   ├── payments/                # Bukti transfer pembayaran dari WA
│   └── units/                   # Foto unit iPhone
├── index.js                     # Entry point server backend
├── package.json
├── .env
└── README.md
```

---

## ⚙️ Persiapan & Instalasi

### 1. Konfigurasi Environment (`.env`)

File `.env` telah dikonfigurasi secara otomatis:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:060706@localhost:5432/iphone_rental_db?schema=public"
JWT_SECRET="super_secret_jwt_key_iphone_rental_2026_!#secure"
JWT_EXPIRES_IN="7d"
UPLOAD_DIR="./uploads"
BASE_URL="http://localhost:5000"
```

### 2. Migrasi Database & Seeder Data Awal

Untuk melakukan sinkronisasi skema Prisma ke PostgreSQL dan menjalankan database seeder:

```bash
# Generate Prisma Client
npm run prisma:generate

# Push skema ke database PostgreSQL
npm run prisma:push

# Jalankan seeder akun Admin default & data katalog iPhone
npm run seed
```

**Kredensial Admin Default:**
- **Username**: `admin` (atau email `admin@rentaliphone.com`)
- **Password**: `admin123`

---

## 🚀 Menjalankan Server

```bash
# Menjalankan server (Production mode)
npm start

# Menjalankan server dengan live-reload (Development mode)
npm run dev
```
Server akan aktif di: `http://localhost:5000`  
Prefix API: `http://localhost:5000/api/v1`

---

## 🧪 Menjalankan Pengujian Otomatis (E2E Test)

Untuk memvalidasi seluruh fungsionalitas REST API secara otomatis (termasuk validasi transaksi atomik, double-booking prevention, dan token JWT):

```bash
npm test
```

---

## 📑 Dokumentasi Endpoint REST API (`/api/v1`)

### A. Public Endpoints (Tanpa Token)

| Method | Endpoint | Deskripsi | Query / Parameter |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Health check server | - |
| `GET` | `/api/v1/catalog` | Mengambil daftar katalog iPhone beserta ketersediaan unit `AVAILABLE` | `?series=...&storage=...&search=...` |
| `GET` | `/api/v1/catalog/:slug` | Mengambil detail spesifik satu seri iPhone beserta ketersediaan warna & unit | `:slug` (contoh: `iphone-15-pro-max-256gb`) |

---

### B. Admin Endpoints (Protected: `Authorization: Bearer <TOKEN>`)

#### 1. Autentikasi (`/api/v1/auth`)
| Method | Endpoint | Deskripsi | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Login admin & generate token JWT | `{ "username": "admin", "password": "admin123" }` |
| `GET` | `/api/v1/auth/me` | Mengambil profil admin yang sedang login | - |
| `PUT` | `/api/v1/auth/password` | Mengubah password admin | `{ "oldPassword": "...", "newPassword": "..." }` |

#### 2. Dashboard & Analytics (`/api/v1/admin/dashboard`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/dashboard/stats` | Ringkasan statistik pendapatan (total & bulan ini), stok unit fisik aktif, jadwal pengembalian hari ini / overdue, dan transaksi terkini. |

#### 3. Manajemen Model iPhone / Katalog (`/api/v1/admin/models`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/models` | List semua model katalog iPhone beserta rincian jumlah unit |
| `POST` | `/api/v1/admin/models` | Tambah model katalog iPhone baru |
| `GET` | `/api/v1/admin/models/:id` | Detail spesifik satu model |
| `PUT` | `/api/v1/admin/models/:id` | Edit informasi model katalog |
| `DELETE`| `/api/v1/admin/models/:id` | Hapus model katalog iPhone (dicegah jika terdapat unit yang sedang `RENTED`) |

#### 4. Manajemen Unit Fisik (`/api/v1/admin/units`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/units` | List stok fisik unit (IMEI, warna, battery health, status) dengan filter `?modelId=&status=&search=` |
| `POST` | `/api/v1/admin/units` | Tambah stok unit fisik baru |
| `GET` | `/api/v1/admin/units/:id` | Detail spesifik unit fisik beserta histori booking |
| `PUT` | `/api/v1/admin/units/:id` | Edit detail unit fisik |
| `PATCH`| `/api/v1/admin/units/:id/status` | Ubah status unit fisik (`AVAILABLE`, `RENTED`, `MAINTENANCE`) |
| `DELETE`| `/api/v1/admin/units/:id` | Hapus unit fisik |

#### 5. Manajemen Booking & Transaksi (`/api/v1/admin/bookings`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/bookings` | Mengambil semua daftar booking & transaksi (filter `?status=&startDate=&endDate=&search=`) |
| `POST` | `/api/v1/admin/bookings` | **Admin menginput transaksi baru dari WA**.<br>Menggunakan `prisma.$transaction`: Memvalidasi unit `AVAILABLE`, mencegah *double-booking*, membuat order sewa, dan otomatis mengubah status unit iPhone menjadi `RENTED`. |
| `GET` | `/api/v1/admin/bookings/:id` | Detail transaksi, data penyewa, data unit, dan bukti transfer |
| `PATCH`| `/api/v1/admin/bookings/:id/status` | **Update status booking** (`BOOKED`, `ONGOING`, `COMPLETED`, `CANCELLED`).<br>Menggunakan `prisma.$transaction`: Saat status diubah ke `COMPLETED` atau `CANCELLED`, status unit iPhone **otomatis kembali menjadi `AVAILABLE`**, serta mencatat tanggal pengembalian aktual dan denda jika ada. |
| `PUT` | `/api/v1/admin/bookings/:id` | Edit informasi data transaksi booking |

#### 6. Upload File (`/api/v1/admin/upload`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/v1/admin/upload` | Upload file gambar (bukti transfer atau foto unit). Form data field: `file` atau `image`. Query opsional: `?type=payments` atau `?type=units`. |

#### 7. Laporan Transaksi & Keuangan (`/api/v1/admin/reports`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/reports` | Rekapitulasi pendapatan dan rincian transaksi berdasarkan rentang tanggal (`?startDate=...&endDate=...&status=...`). Mendukung ekspor format CSV dengan menambahkan query `?format=csv`. |

---

## 🔒 Fitur Integritas Transaksi Database

Sesuai butir 5 pada deliverables backend dokumen perencanaan teknis:
- **Pencegahan Double-Booking**: Sistem memvalidasi ketersediaan unit di dalam `prisma.$transaction`. Jika unit sedang berstatus `RENTED` atau `MAINTENANCE`, transaksi ditolak dengan HTTP 409 Conflict.
- **Konsistensi Status Otomatis**:
  - Saat booking baru dibuat -> Status `IphoneUnit` langsung berubah menjadi `RENTED`.
  - Saat booking diselesaikan (`COMPLETED`) atau dibatalkan (`CANCELLED`) -> Status `IphoneUnit` langsung kembali menjadi `AVAILABLE`.

---

## 📬 Postman Collection & Environment

Tersedia file koleksi dan environment Postman yang siap diimpor langsung:
- **Collection**: [`postman_collection.json`](./postman_collection.json) (Seluruh endpoint publik & admin dengan auto-save token JWT)
- **Environment**: [`postman_environment.json`](./postman_environment.json) (Variabel konfigurasi `baseUrl`, `token`, `modelId`, `unitId`, `bookingId`)

### Cara Import ke Postman:
1. Buka aplikasi **Postman**.
2. Klik tombol **Import** di pojok kiri atas.
3. Drag & drop kedua file: [`postman_collection.json`](./postman_collection.json) dan [`postman_environment.json`](./postman_environment.json).
4. Di pojok kanan atas Postman, pilih environment **"iPhone Rental - Local Environment"**.
5. Buka folder **2. Autentikasi** -> jalankan **Login Admin** (`POST /api/v1/auth/login`).
6. Token JWT akan otomatis tersimpan ke variabel `{{token}}` dan seluruh endpoint admin yang diproteksi siap digunakan langsung.

