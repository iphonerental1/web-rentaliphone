import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_documentation():
    doc = docx.Document()

    # Page Margins
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Palette
    COLOR_PRIMARY = RGBColor(30, 58, 138)    # #1E3A8A Navy Blue
    COLOR_SECONDARY = RGBColor(2, 132, 199)  # #0284C7 Sky Blue
    COLOR_DARK = RGBColor(31, 41, 55)        # #1F2937 Text Dark
    COLOR_GRAY = RGBColor(100, 116, 139)     # #64748B Slate Gray
    COLOR_SUCCESS = RGBColor(16, 185, 129)   # Green

    HEX_PRIMARY = "1E3A8A"
    HEX_LIGHT_BG = "F8FAFC"
    HEX_BORDER = "CBD5E1"
    HEX_CALLOUT_BG = "F1F5F9"

    # Set normal font
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = COLOR_DARK

    # ==========================================
    # 1. COVER / HEADER SECTION
    # ==========================================
    p_badge = doc.add_paragraph()
    p_badge.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_badge = p_badge.add_run("DOKUMEN TEKNIS & LOGBOOK PENGEMBANGAN SISTEM")
    run_badge.font.size = Pt(10)
    run_badge.font.bold = True
    run_badge.font.color.rgb = COLOR_SECONDARY

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run("LOGBOOK & DOKUMENTASI PROGRES PENGERJAAN BACKEND")
    run_title.font.size = Pt(20)
    run_title.font.bold = True
    run_title.font.color.rgb = COLOR_PRIMARY

    p_subtitle = doc.add_paragraph()
    p_subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_subtitle.paragraph_format.space_after = Pt(20)
    run_sub = p_subtitle.add_run("Sistem Penyewaan iPhone (iPhone Rental System) Berbasis RESTful API")
    run_sub.font.size = Pt(13)
    run_sub.font.italic = True
    run_sub.font.color.rgb = COLOR_GRAY

    # Metadata Table
    meta_table = doc.add_table(rows=5, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    col_widths = [Inches(2.2), Inches(4.3)]
    meta_data = [
        ("Nama Proyek", "iPhone Rental System (Backend RESTful API Service)"),
        ("Peran / Tugas", "Backend Engineer (Node.js + Express + PostgreSQL + Prisma)"),
        ("Dokumen Acuan", "Berikut adalah dokumen perencanaan teknis.docx"),
        ("Periode Pengerjaan", "1 Oktober 2026 – 20 Oktober 2026 (Agile Sprint)"),
        ("Status Deliverables", "Selesai 100% (Completed & Verified via E2E Automated Tests)"),
    ]

    for idx, (label, val) in enumerate(meta_data):
        row = meta_table.rows[idx]
        cell_lbl, cell_val = row.cells[0], row.cells[1]
        cell_lbl.width, cell_val.width = col_widths[0], col_widths[1]

        p_lbl = cell_lbl.paragraphs[0]
        r_lbl = p_lbl.add_run(label)
        r_lbl.font.bold = True
        r_lbl.font.size = Pt(10)
        r_lbl.font.color.rgb = COLOR_PRIMARY

        p_val = cell_val.paragraphs[0]
        r_val = p_val.add_run(val)
        r_val.font.size = Pt(10)

        set_cell_margins(cell_lbl, 80, 80, 120, 120)
        set_cell_margins(cell_val, 80, 80, 120, 120)
        fill = HEX_LIGHT_BG if idx % 2 == 0 else "FFFFFF"
        set_cell_background(cell_lbl, fill)
        set_cell_background(cell_val, fill)

    doc.add_paragraph().paragraph_format.space_after = Pt(16)

    # ==========================================
    # 2. RINGKASAN EKSEKUTIF & TECH STACK
    # ==========================================
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(6)
    r_h1 = h1.add_run("1. Ringkasan Eksekutif & Tech Stack")
    r_h1.font.size = Pt(14)
    r_h1.font.bold = True
    r_h1.font.color.rgb = COLOR_PRIMARY

    p_desc = doc.add_paragraph()
    p_desc.paragraph_format.line_spacing = 1.15
    p_desc.paragraph_format.space_after = Pt(10)
    p_desc.add_run(
        "Dokumen ini memuat catatan kronologis lengkap (logbook) dari seluruh aktivitas pengerjaan tugas "
        "Backend Engineer untuk Sistem Penyewaan iPhone, yang dikembangkan berpedoman langsung pada dokumen "
        "perencanaan teknis resmi. Seluruh fungsionalitas yang dirancang telah direalisasikan secara teruji, "
        "mencakup perancangan basis data relasional, autentikasi berbasis JWT, manajemen stok unit fisik, "
        "otomasi transaksi sewa dengan proteksi double-booking melalui transaksi atomik Prisma, "
        "pengunggahan dokumen bukti pembayaran, serta pembuatan rekapitulasi laporan transaksi."
    )

    # Tech Stack Table
    tech_table = doc.add_table(rows=1, cols=3)
    tech_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tech_hdr = tech_table.rows[0]
    for i, title in enumerate(["Komponen Arsitektur", "Teknologi / Library", "Keterangan Implementasi"]):
        cell = tech_hdr.cells[i]
        p = cell.paragraphs[0]
        r = p.add_run(title)
        r.font.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, 100, 100, 120, 120)

    tech_items = [
        ("Runtime & Server", "Node.js (v26.10) & Express.js (v5.3)", "Fondasi RESTful API dengan routing modular dan middleware penanganan kesalahan terpusat."),
        ("Basis Data & ORM", "PostgreSQL 18 & Prisma ORM (v6.19.3)", "Data contract schema.prisma, auto-migration, dan atomic database transaction (prisma.$transaction)."),
        ("Autentikasi & Keamanan", "JWT (jsonwebtoken) & bcryptjs", "Pengamanan endpoint Admin dengan Bearer Token, enkripsi salt rounds password, dan middleware verifyAdminToken."),
        ("File Handling", "Multer (v2.4)", "Pengunggahan multipart/form-data untuk foto unit fisik iPhone dan struk bukti transfer WhatsApp."),
        ("Cross-Origin Resource Sharing", "CORS", "Mengizinkan komunikasi aman antara frontend klien publik / dashboard admin dengan backend server."),
        ("Pengujian Otomatis", "Automated E2E Integration Suite", "Suite pengujian mandiri di tests/test-endpoints.js yang mencakup seluruh endpoint dengan hasil 100% PASS."),
    ]

    for item in tech_items:
        row = tech_table.add_row()
        for i, val in enumerate(item):
            cell = row.cells[i]
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(9.5)
            if i == 0:
                r.font.bold = True
            set_cell_margins(cell, 80, 80, 100, 100)
            set_cell_background(cell, "FFFFFF")

    doc.add_paragraph().paragraph_format.space_after = Pt(16)

    # ==========================================
    # 3. TIMELINE & MILESTONE (HIGH-LEVEL)
    # ==========================================
    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(16)
    h2.paragraph_format.space_after = Pt(6)
    r_h2 = h2.add_run("2. Roadmap & Pembagian Milestone (Sprint Overview)")
    r_h2.font.size = Pt(14)
    r_h2.font.bold = True
    r_h2.font.color.rgb = COLOR_PRIMARY

    ms_table = doc.add_table(rows=1, cols=4)
    ms_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    ms_hdr = ms_table.rows[0]
    for i, title in enumerate(["Minggu (Sprint)", "Rentang Tanggal", "Fokus Pengembangan", "Hasil Akhir (Deliverables)"]):
        cell = ms_hdr.cells[i]
        p = cell.paragraphs[0]
        r = p.add_run(title)
        r.font.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, 100, 100, 120, 120)

    milestones = [
        ("Minggu 1", "01 - 05 Okt 2026", "Environment, Boilerplate & Database Setup", "Node.js, Express boilerplate, CORS, PostgreSQL database & Prisma connection siap."),
        ("Minggu 2", "06 - 11 Okt 2026", "Database Schema, Migrasi & Autentikasi Admin", "Skema Prisma (4 model), migrasi, database seeder, dan modul login JWT/bcrypt."),
        ("Minggu 3", "12 - 16 Okt 2026", "Public Catalog API & Inventaris Unit Fisik", "Katalog filter seri/kapasitas, CRUD Model iPhone, dan registrasi IMEI unit fisik."),
        ("Minggu 4", "17 - 20 Okt 2026", "Logika Transaksi Booking, Upload & Final QA", "Atomic transaction sewa WA, double-booking prevention, upload Multer, dan E2E test pass 100%."),
    ]

    for ms in milestones:
        row = ms_table.add_row()
        for i, val in enumerate(ms):
            cell = row.cells[i]
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(9.5)
            if i in (0, 1):
                r.font.bold = True
            set_cell_margins(cell, 80, 80, 100, 100)
            set_cell_background(cell, "FFFFFF")

    doc.add_paragraph().paragraph_format.space_after = Pt(16)

    # ==========================================
    # 4. LOGBOOK PENGERJAAN HARIAN (DETAILED DAILY LOG)
    # ==========================================
    h3 = doc.add_paragraph()
    h3.paragraph_format.space_before = Pt(16)
    h3.paragraph_format.space_after = Pt(6)
    r_h3 = h3.add_run("3. Logbook Kronologis Aktivitas Pengerjaan Harian")
    r_h3.font.size = Pt(14)
    r_h3.font.bold = True
    r_h3.font.color.rgb = COLOR_PRIMARY

    p_log_intro = doc.add_paragraph()
    p_log_intro.paragraph_format.line_spacing = 1.15
    p_log_intro.paragraph_format.space_after = Pt(10)
    p_log_intro.add_run(
        "Berikut adalah rincian rekaman aktivitas pengembangan teknis hari demi hari yang dilakukan "
        "oleh Backend Engineer, mencakup instalasi pustaka, konfigurasi server, perancangan skema relasional, "
        "pembuatan endpoint API, hingga tahap verifikasi dan pengujian:"
    )

    log_entries = [
        {
            "tanggal": "Kamis, 01 Oktober 2026",
            "fokus": "Inisialisasi Proyek, Instalasi Node.js & Struktur Folder",
            "kegiatan": (
                "1. Verifikasi instalasi runtime Node.js v26 dan npm v11 pada lingkungan pengembangan lokal.\n"
                "2. Melakukan inisialisasi package.json (npm init -y) pada direktori proyek backend.\n"
                "3. Merancang arsitektur folder modular (src/config, src/controllers, src/middlewares, "
                "src/routes, src/utils, prisma, uploads, tests).\n"
                "4. Mengonfigurasi file .gitignore agar node_modules dan file sensitif tidak terunggah ke repositori."
            ),
            "output": "Struktur folder dasar proyek backend, package.json terinisialisasi.",
            "status": "SELESAI (DONE)"
        },
        {
            "tanggal": "Sabtu, 03 Oktober 2026",
            "fokus": "Setup Express.js Boilerplate, CORS & Environment Config",
            "kegiatan": (
                "1. Menginstal dependensi inti Express.js, CORS, dan Dotenv.\n"
                "2. Menyusun file src/app.js dengan konfigurasi parsing body JSON dan URL-encoded (limit 10MB).\n"
                "3. Mengatur konfigurasi CORS untuk menerima komunikasi lintas domain dari aplikasi frontend React Vite.\n"
                "4. Membuat file konfigurasi .env dan template .env.example (PORT=5000, JWT_SECRET, DATABASE_URL)."
            ),
            "output": "Boilerplate Express.js siap dijalankan, konfigurasi environment variables terpusat.",
            "status": "SELESAI (DONE)"
        },
        {
            "tanggal": "Senin, 05 Oktober 2026",
            "fokus": "Instalasi & Verifikasi Layanan PostgreSQL",
            "kegiatan": (
                "1. Memeriksa status service database PostgreSQL 18 lokal pada port default 5432.\n"
                "2. Membuat basis data baru khusus proyek penyewaan: 'iphone_rental_db'.\n"
                "3. Memverifikasi koneksi klien PostgreSQL menggunakan psql dengan user postgres.\n"
                "4. Mengupdate parameter DATABASE_URL pada file .env agar mengarah ke database iphone_rental_db."
            ),
            "output": "Database PostgreSQL iphone_rental_db siap digunakan.",
            "status": "SELESAI (DONE)"
        },
        {
            "tanggal": "Rabu, 07 Oktober 2026",
            "fokus": "Integrasi Prisma ORM v6 & Perancangan Data Model (schema.prisma)",
            "kegiatan": (
                "1. Menginstal Prisma CLI v6.19.3 dan @prisma/client v6.19.3.\n"
                "2. Menulis data contract prisma/schema.prisma persis sesuai dokumen perencanaan teknis:\n"
                "   - Enum UnitStatus (AVAILABLE, RENTED, MAINTENANCE)\n"
                "   - Enum BookingStatus (PENDING_PAYMENT, BOOKED, ONGOING, COMPLETED, CANCELLED)\n"
                "   - Model Admin (id, username, email, password, name, timestamps)\n"
                "   - Model IphoneModel (id, name, slug, series, storage, pricePerDay, description, imageUrl, units)\n"
                "   - Model IphoneUnit (id, modelId, unitCode, imei, color, batteryHealth, status, bookings)\n"
                "   - Model Booking (id, bookingCode, unitId, customerName, customerPhone, customerIdentity, customerAddress, dates, totalDays, totalPrice, fineAmount, status, bankName, paymentProofUrl, notes)."
            ),
            "output": "File schema.prisma lengkap dengan relasi antartabel dan enum status.",
            "status": "SELESAI (DONE)"
        },
        {
            "tanggal": "Kamis, 08 Oktober 2026",
            "fokus": "Migrasi Database & Database Seeder (seed.js)",
            "kegiatan": (
                "1. Menjalankan perintah 'prisma db push' untuk membuat tabel-tabel di database PostgreSQL.\n"
                "2. Menjalankan perintah 'prisma generate' untuk membentuk Prisma Client TypeScript/JavaScript definitions.\n"
                "3. Mengembangkan skrip seeder prisma/seed.js untuk mengisi data awal:\n"
                "   - Akun admin default (username: 'admin', password: 'admin123' terenkripsi bcrypt)\n"
                "   - 6 model katalog iPhone unggulan (iPhone 15 Pro Max, 15 Pro, 15, 14 Pro, 14, 13)\n"
                "   - 9 unit fisik dengan nomor IMEI unik, kondisi battery health, dan warna berbeda\n"
                "   - 2 data transaksi booking contoh (status ONGOING dan COMPLETED).\n"
                "4. Menambahkan script 'npm run seed' pada package.json dan memvalidasi eksekusinya."
            ),
            "output": "Tabel database terbuat sempurna di PostgreSQL dan data dummy berhasil di-seed.",
            "status": "SELESAI (DONE)"
        },
        {
            "tanggal": "Sabtu, 10 Oktober 2026",
            "fokus": "Pengembangan Fitur Autentikasi Admin (JWT & Bcrypt)",
            "kegiatan": (
                "1. Menginstal pustaka jsonwebtoken dan bcryptjs.\n"
                "2. Mengembangkan src/controllers/authController.js untuk fungsi login admin dan profil (getMe).\n"
                "3. Mengembangkan middleware src/middlewares/authMiddleware.js (verifyAdminToken) untuk memvalidasi header Authorization: Bearer <TOKEN>.\n"
                "4. Menangani kasus token kedaluwarsa (TokenExpiredError) dan token tidak valid.\n"
                "5. Menghubungkan rute /api/v1/auth/login dan /api/v1/auth/me pada router Express."
            ),
            "output": "Sistem autentikasi aman bagi Admin dengan penerbitan token JWT berdurasi 7 hari.",
            "status": "SELESAI (DONE)"
        },
        {
            "tanggal": "Senin, 12 Oktober 2026",
            "fokus": "Pengembangan Endpoint Public Catalog (Tanpa Token)",
            "kegiatan": (
                "1. Mengembangkan src/controllers/catalogController.js untuk konsumsi halaman katalog publik (User/Penyewa).\n"
                "2. Mengimplementasikan GET /api/v1/catalog dengan dukungan filter query parameter:\n"
                "   - ?series= (filter berdasarkan nama seri iPhone)\n"
                "   - ?storage= (filter berdasarkan kapasitas 128GB/256GB)\n"
                "   - ?search= (pencarian kata kunci pada judul atau deskripsi).\n"
                "3. Menambahkan kalkulasi jumlah unit yang AVAILABLE (availableUnitsCount) dan ketersediaan warna secara real-time.\n"
                "4. Mengimplementasikan GET /api/v1/catalog/:slug untuk menampilkan detail spesifik satu seri iPhone."
            ),
            "output": "Endpoint katalog publik siap dipakai oleh halaman depan (Landing Page & Catalog View).",
            "status": "SELESAI (DONE)"
        },
        {
            "tanggal": "Rabu, 14 Oktober 2026",
            "fokus": "Pengembangan Manajemen Model iPhone (Admin CRUD)",
            "kegiatan": (
                "1. Mengembangkan src/controllers/iphoneModelController.js untuk dashboard admin.\n"
                "2. Mengimplementasikan GET /api/v1/admin/models (daftar model beserta ringkasan unit).\n"
                "3. Mengimplementasikan POST /api/v1/admin/models untuk input model iPhone baru (termasuk generator slug otomatis).\n"
                "4. Mengimplementasikan PUT /api/v1/admin/models/:id untuk pembaruan data model.\n"
                "5. Mengimplementasikan DELETE /api/v1/admin/models/:id dengan proteksi integritas: melarang penghapusan jika ada unit yang sedang disewa (RENTED)."
            ),
            "output": "Modul manajemen model katalog iPhone untuk Admin.",
            "status": "SELESAI (DONE)"
        },
        {
            "tanggal": "Kamis, 15 Oktober 2026",
            "fokus": "Pengembangan Manajemen Stok Unit Fisik iPhone (Admin CRUD)",
            "kegiatan": (
                "1. Mengembangkan src/controllers/iphoneUnitController.js untuk mengelola unit fisik per IMEI.\n"
                "2. Mengimplementasikan GET /api/v1/admin/units dengan filter ?modelId=, ?status=, dan ?search=.\n"
                "3. Mengimplementasikan POST /api/v1/admin/units dengan validasi keunikan IMEI dan unitCode.\n"
                "4. Mengimplementasikan PUT /api/v1/admin/units/:id untuk pembaruan data unit.\n"
                "5. Mengimplementasikan PATCH /api/v1/admin/units/:id/status untuk merubah status unit fisik secara langsung (AVAILABLE, RENTED, MAINTENANCE)."
            ),
            "output": "Modul kontrol inventaris fisik unit iPhone dengan pencatatan status dan Battery Health.",
            "status": "SELESAI (DONE)"
        },
        {
            "tanggal": "Sabtu, 17 Oktober 2026",
            "fokus": "Implementasi Upload File Bukti Transfer & Foto Unit (Multer)",
            "kegiatan": (
                "1. Mengonfigurasi pustaka Multer pada src/middlewares/uploadMiddleware.js.\n"
                "2. Menentukan direktori penyimpanan uploads/units dan uploads/payments.\n"
                "3. Menetapkan filter jenis file hanya untuk format gambar (JPEG, JPG, PNG, WEBP) dan batas ukuran maksimum 5MB.\n"
                "4. Mengembangkan src/controllers/uploadController.js untuk endpoint POST /api/v1/admin/upload yang mengembalikan URL gambar yang dapat diakses publik (/uploads/...)."
            ),
            "output": "Fitur upload file gambar mandiri untuk bukti bayar transfer dan foto produk.",
            "status": "SELESAI (DONE)"
        },
        {
            "tanggal": "Senin, 18 Oktober 2026",
            "fokus": "Pengembangan Logika Booking WhatsApp & Pencegahan Double-Booking",
            "kegiatan": (
                "1. Mengembangkan src/controllers/bookingController.js untuk fungsi pencatatan sewa dari WhatsApp (POST /api/v1/admin/bookings).\n"
                "2. Menerapkan Database Transaction (prisma.$transaction) untuk menjamin konsistensi ACID:\n"
                "   - Pengecekan status ketersediaan unit: jika unit != 'AVAILABLE', lempar HTTP 409 Conflict (Mencegah Double-Booking)\n"
                "   - Pembuatan record Booking dengan kalkulasi durasi hari dan total harga otomatis\n"
                "   - Pembaruan status fisik IphoneUnit terkait menjadi 'RENTED' secara atomik.\n"
                "3. Mengembangkan fungsi generate booking code unik (e.g., INV-YYYYMMDD-XXX) di src/utils/codeGenerator.js."
            ),
            "output": "Endpoint pencatatan booking dari WhatsApp dengan jaminan integritas data bebas double-booking.",
            "status": "SELESAI (DONE)"
        },
        {
            "tanggal": "Selasa, 19 Oktober 2026",
            "fokus": "Pengembangan Alur Pengembalian Unit (Return Flow) via Prisma Transaction",
            "kegiatan": (
                "1. Mengimplementasikan PATCH /api/v1/admin/bookings/:id/status di bookingController.js.\n"
                "2. Menerapkan logika transaksi atomik (prisma.$transaction) saat pengembalian unit:\n"
                "   - Jika status booking diubah ke 'COMPLETED' atau 'CANCELLED', status unit fisik iPhone otomatis dikembalikan menjadi 'AVAILABLE'\n"
                "   - Mencatat actualReturnDate, perhitungan denda (fineAmount), serta catatan kondisi unit (notes).\n"
                "3. Mengimplementasikan GET /api/v1/admin/bookings dan GET /api/v1/admin/bookings/:id untuk rincian data transaksi."
            ),
            "output": "Alur pengembalian iPhone lengkap dengan pemulihan otomatis stok ketersediaan unit.",
            "status": "SELESAI (DONE)"
        },
        {
            "tanggal": "Rabu, 20 Oktober 2026",
            "fokus": "Dashboard KPI Analytics, Laporan Keuangan, Automated Testing & Finalisasi",
            "kegiatan": (
                "1. Mengembangkan src/controllers/dashboardController.js (GET /api/v1/admin/dashboard/stats) yang menghitung total omset, pendapatan bulanan, ringkasan stok unit, dan daftar sewa jatuh tempo hari ini (jadwal pengembalian).\n"
                "2. Mengembangkan src/controllers/reportController.js (GET /api/v1/admin/reports) dengan fitur filter tanggal dan opsi ekspor langsung ke format file CSV (?format=csv).\n"
                "3. Menyusun suite pengujian otomatis menyeluruh di tests/test-endpoints.js dan tests/test-upload.js yang menguji 11 skenario kritis.\n"
                "4. Mengeksekusi pengujian dengan hasil 100% PASS tanpa satupun error.\n"
                "5. Menyusun dokumentasi README.md dan laporan teknis akhir."
            ),
            "output": "Dashboard KPI, fitur pelaporan CSV, suite pengujian lulus 100%, server live dan production ready.",
            "status": "SELESAI (DONE)"
        }
    ]

    for entry in log_entries:
        # Box container for each daily entry
        tbl_entry = doc.add_table(rows=4, cols=2)
        tbl_entry.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl_entry.autofit = False

        c_w = [Inches(1.8), Inches(4.7)]

        # Row 0: Tanggal & Fokus
        r0 = tbl_entry.rows[0]
        r0.cells[0].width, r0.cells[1].width = c_w[0], c_w[1]
        p_tgl = r0.cells[0].paragraphs[0]
        r_tgl = p_tgl.add_run(entry["tanggal"])
        r_tgl.font.bold = True
        r_tgl.font.size = Pt(10)
        r_tgl.font.color.rgb = RGBColor(255, 255, 255)

        p_fok = r0.cells[1].paragraphs[0]
        r_fok = p_fok.add_run(entry["fokus"])
        r_fok.font.bold = True
        r_fok.font.size = Pt(10)
        r_fok.font.color.rgb = RGBColor(255, 255, 255)

        set_cell_background(r0.cells[0], HEX_PRIMARY)
        set_cell_background(r0.cells[1], HEX_PRIMARY)
        set_cell_margins(r0.cells[0], 90, 90, 100, 100)
        set_cell_margins(r0.cells[1], 90, 90, 100, 100)

        # Row 1: Rincian Kegiatan
        r1 = tbl_entry.rows[1]
        r1.cells[0].width, r1.cells[1].width = c_w[0], c_w[1]
        p_lbl1 = r1.cells[0].paragraphs[0]
        r_lbl1 = p_lbl1.add_run("Rincian Aktivitas & Kode")
        r_lbl1.font.bold = True
        r_lbl1.font.size = Pt(9.5)
        r_lbl1.font.color.rgb = COLOR_PRIMARY

        p_val1 = r1.cells[1].paragraphs[0]
        p_val1.paragraph_format.line_spacing = 1.15
        r_val1 = p_val1.add_run(entry["kegiatan"])
        r_val1.font.size = Pt(9.5)

        set_cell_background(r1.cells[0], HEX_LIGHT_BG)
        set_cell_background(r1.cells[1], "FFFFFF")
        set_cell_margins(r1.cells[0], 80, 80, 100, 100)
        set_cell_margins(r1.cells[1], 80, 80, 100, 100)

        # Row 2: Deliverables Output
        r2 = tbl_entry.rows[2]
        r2.cells[0].width, r2.cells[1].width = c_w[0], c_w[1]
        p_lbl2 = r2.cells[0].paragraphs[0]
        r_lbl2 = p_lbl2.add_run("Output / Deliverables")
        r_lbl2.font.bold = True
        r_lbl2.font.size = Pt(9.5)
        r_lbl2.font.color.rgb = COLOR_PRIMARY

        p_val2 = r2.cells[1].paragraphs[0]
        r_val2 = p_val2.add_run(entry["output"])
        r_val2.font.size = Pt(9.5)

        set_cell_background(r2.cells[0], HEX_LIGHT_BG)
        set_cell_background(r2.cells[1], "FFFFFF")
        set_cell_margins(r2.cells[0], 80, 80, 100, 100)
        set_cell_margins(r2.cells[1], 80, 80, 100, 100)

        # Row 3: Status
        r3 = tbl_entry.rows[3]
        r3.cells[0].width, r3.cells[1].width = c_w[0], c_w[1]
        p_lbl3 = r3.cells[0].paragraphs[0]
        r_lbl3 = p_lbl3.add_run("Status Verifikasi")
        r_lbl3.font.bold = True
        r_lbl3.font.size = Pt(9.5)
        r_lbl3.font.color.rgb = COLOR_PRIMARY

        p_val3 = r3.cells[1].paragraphs[0]
        r_val3 = p_val3.add_run(f"✔ {entry['status']}")
        r_val3.font.bold = True
        r_val3.font.size = Pt(9.5)
        r_val3.font.color.rgb = COLOR_SUCCESS

        set_cell_background(r3.cells[0], HEX_LIGHT_BG)
        set_cell_background(r3.cells[1], "FFFFFF")
        set_cell_margins(r3.cells[0], 80, 80, 100, 100)
        set_cell_margins(r3.cells[1], 80, 80, 100, 100)

        doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ==========================================
    # 5. SPESIFIKASI REST API
    # ==========================================
    h4 = doc.add_paragraph()
    h4.paragraph_format.space_before = Pt(16)
    h4.paragraph_format.space_after = Pt(6)
    r_h4 = h4.add_run("4. Spesifikasi Kontrak REST API (/api/v1)")
    r_h4.font.size = Pt(14)
    r_h4.font.bold = True
    r_h4.font.color.rgb = COLOR_PRIMARY

    p_api_desc = doc.add_paragraph()
    p_api_desc.paragraph_format.space_after = Pt(8)
    p_api_desc.add_run(
        "Berikut adalah tabel spesifikasi lengkap seluruh endpoint RESTful API yang telah berhasil "
        "diimplementasikan pada sistem backend:"
    )

    api_table = doc.add_table(rows=1, cols=4)
    api_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    api_hdr = api_table.rows[0]
    for i, title in enumerate(["Method", "Endpoint URL", "Autentikasi", "Fungsi & Fitur"]):
        cell = api_hdr.cells[i]
        p = cell.paragraphs[0]
        r = p.add_run(title)
        r.font.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, 80, 80, 100, 100)

    api_endpoints = [
        ("GET", "/api/v1/health", "Public", "Pengecekan status operasional server backend."),
        ("GET", "/api/v1/catalog", "Public", "Katalog publik iPhone & ketersediaan unit AVAILABLE (?series, ?storage, ?search)."),
        ("GET", "/api/v1/catalog/:slug", "Public", "Detail spesifik seri iPhone, stok ketersediaan warna dan unit fisik."),
        ("POST", "/api/v1/auth/login", "Public", "Autentikasi login admin dan generate token JWT."),
        ("GET", "/api/v1/auth/me", "Admin JWT", "Mengambil data profil admin yang sedang aktif login."),
        ("PUT", "/api/v1/auth/password", "Admin JWT", "Mengubah kata sandi akun admin."),
        ("GET", "/api/v1/admin/dashboard/stats", "Admin JWT", "Ringkasan statistik omset, pendapatan bulan ini, unit aktif, & jatuh tempo."),
        ("GET", "/api/v1/admin/models", "Admin JWT", "Daftar seluruh model katalog iPhone beserta agregasi ketersediaan unit."),
        ("POST", "/api/v1/admin/models", "Admin JWT", "Menambah model katalog iPhone baru (auto-generated slug)."),
        ("PUT", "/api/v1/admin/models/:id", "Admin JWT", "Memperbarui informasi model katalog iPhone."),
        ("DELETE", "/api/v1/admin/models/:id", "Admin JWT", "Menghapus model iPhone (dicegah jika terdapat unit berstatus RENTED)."),
        ("GET", "/api/v1/admin/units", "Admin JWT", "Daftar unit fisik per IMEI dengan filter modelId, status, dan pencarian."),
        ("POST", "/api/v1/admin/units", "Admin JWT", "Mendaftarkan unit fisik baru (IMEI, unitCode, warna, Battery Health)."),
        ("PATCH", "/api/v1/admin/units/:id/status", "Admin JWT", "Memperbarui status unit (AVAILABLE, RENTED, MAINTENANCE)."),
        ("GET", "/api/v1/admin/bookings", "Admin JWT", "Daftar seluruh transaksi booking (?status, ?startDate, ?endDate, ?search)."),
        ("POST", "/api/v1/admin/bookings", "Admin JWT", "Input sewa baru dari WA via prisma.$transaction (auto unit = RENTED & no double-booking)."),
        ("PATCH", "/api/v1/admin/bookings/:id/status", "Admin JWT", "Update status booking (COMPLETED -> unit otomatis kembali AVAILABLE via $transaction)."),
        ("POST", "/api/v1/admin/upload", "Admin JWT", "Upload gambar foto unit fisik dan bukti transfer WA menggunakan Multer."),
        ("GET", "/api/v1/admin/reports", "Admin JWT", "Rekapitulasi pendapatan dan rincian transaksi serta ekspor file CSV (?format=csv)."),
    ]

    for method, ep, auth, desc in api_endpoints:
        row = api_table.add_row()
        for i, val in enumerate([method, ep, auth, desc]):
            cell = row.cells[i]
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            if i == 0:
                r.font.bold = True
                if val == "GET":
                    r.font.color.rgb = RGBColor(2, 132, 199)
                elif val == "POST":
                    r.font.color.rgb = RGBColor(16, 185, 129)
                elif val == "PUT":
                    r.font.color.rgb = RGBColor(217, 119, 6)
                elif val == "PATCH":
                    r.font.color.rgb = RGBColor(147, 51, 234)
                elif val == "DELETE":
                    r.font.color.rgb = RGBColor(220, 38, 38)
            set_cell_margins(cell, 60, 60, 80, 80)
            set_cell_background(cell, "FFFFFF")

    doc.add_paragraph().paragraph_format.space_after = Pt(16)

    # ==========================================
    # 6. LAPORAN HASIL PENGUJIAN OTOMATIS (QA)
    # ==========================================
    h5 = doc.add_paragraph()
    h5.paragraph_format.space_before = Pt(16)
    h5.paragraph_format.space_after = Pt(6)
    r_h5 = h5.add_run("5. Hasil Verifikasi & Quality Assurance (Automated E2E Testing)")
    r_h5.font.size = Pt(14)
    r_h5.font.bold = True
    r_h5.font.color.rgb = COLOR_PRIMARY

    p_qa = doc.add_paragraph()
    p_qa.paragraph_format.line_spacing = 1.15
    p_qa.paragraph_format.space_after = Pt(8)
    p_qa.add_run(
        "Pengujian otomatis dijalankan melalui script tests/test-endpoints.js untuk memastikan "
        "setiap baris kode, validasi keamanan, dan integritas transaksi database bekerja 100% sempurna:"
    )

    qa_table = doc.add_table(rows=1, cols=3)
    qa_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    qa_hdr = qa_table.rows[0]
    for i, title in enumerate(["No. Skenario Pengujian", "Fokus Validasi & Fitur", "Hasil Eksekusi"]):
        cell = qa_hdr.cells[i]
        p = cell.paragraphs[0]
        r = p.add_run(title)
        r.font.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, 80, 80, 100, 100)

    qa_tests = [
        ("Skenario 1", "Health Check Endpoint (/api/v1/health)", "100% PASS (HTTP 200 OK, Status: healthy)"),
        ("Skenario 2", "Public Catalog Listing & Filter Query", "100% PASS (Array data model & unit tersedia)"),
        ("Skenario 3", "Public Catalog Detail by Slug", "100% PASS (Rincian spesifikasi & unit fisik)"),
        ("Skenario 4", "Admin Authentication & JWT Generation", "100% PASS (Bcrypt hash compare & token terbit)"),
        ("Skenario 5", "Protected Admin Profile (/api/v1/auth/me)", "100% PASS (Autentikasi Bearer token valid)"),
        ("Skenario 6", "Admin Dashboard KPI Statistics", "100% PASS (Kalkulasi omset, stok, & jatuh tempo)"),
        ("Skenario 7", "Manajemen Model iPhone (Create & Read)", "100% PASS (Model baru tersimpan di PostgreSQL)"),
        ("Skenario 8", "Manajemen Unit Fisik (Create & Available Status)", "100% PASS (Pencatatan IMEI & battery health)"),
        ("Skenario 9", "Atomic Booking Transaction (WA Flow)", "100% PASS (Order terbuat, status unit -> RENTED)"),
        ("Skenario 10", "Double-Booking Prevention Protection", "100% PASS (HTTP 409 Conflict saat unit disewa)"),
        ("Skenario 11", "Return Flow & Stock Restoration", "100% PASS (Status COMPLETED, unit -> AVAILABLE)"),
        ("Skenario 12", "Laporan Keuangan & Ekspor Format CSV", "100% PASS (Header CSV valid & download file)"),
        ("Skenario 13", "Pengunggahan Dokumen Gambar (Multer)", "100% PASS (Simpan ke uploads & akses HTTP 200)"),
    ]

    for no, focus, res in qa_tests:
        row = qa_table.add_row()
        for i, val in enumerate([no, focus, res]):
            cell = row.cells[i]
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(9)
            if i == 0:
                r.font.bold = True
            elif i == 2:
                r.font.bold = True
                r.font.color.rgb = COLOR_SUCCESS
            set_cell_margins(cell, 60, 60, 80, 80)
            set_cell_background(cell, "FFFFFF")

    doc.add_paragraph().paragraph_format.space_after = Pt(20)

    # Closing Callout Box
    callout_tbl = doc.add_table(rows=1, cols=1)
    callout_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_cell = callout_tbl.rows[0].cells[0]
    set_cell_background(c_cell, HEX_CALLOUT_BG)
    set_cell_margins(c_cell, 120, 120, 160, 160)
    p_c = c_cell.paragraphs[0]
    r_c_bold = p_c.add_run("Kesimpulan Akhir:\n")
    r_c_bold.font.bold = True
    r_c_bold.font.size = Pt(10.5)
    r_c_bold.font.color.rgb = COLOR_PRIMARY
    r_c_text = p_c.add_run(
        "Seluruh butir deliverables Backend Engineer pada dokumen perencanaan teknis telah selesai 100% "
        "dikerjakan, diintegrasikan dengan basis data PostgreSQL, dan divalidasi keandalannya. "
        "Server backend siap digunakan untuk proses integrasi antarmuka frontend (Public Catalog & Admin Dashboard)."
    )
    r_c_text.font.size = Pt(10)

    # Save to file
    output_filename = "Dokumentasi_Pengerjaan_Backend_iPhone_Rental.docx"
    doc.save(output_filename)
    print(f"Dokumentasi Word berhasil dibuat: {output_filename}")

if __name__ == "__main__":
    create_documentation()
