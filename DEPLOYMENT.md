# Dokumentasi Deployment Proyek

Proyek ini menggunakan strategi deployment berbasis platform *free tier* sesuai dengan ketentuan tugas DevOps.

## 1. Arsitektur & Alur Deployment
- **Developer / Git Repository**: Kode dikelola secara terpusat di GitHub menggunakan monorepo (`/frontend`, `/backend`, `/database`)[cite: 1, 2].
- **Build & CI/CD**: Setiap perubahan kode yang masuk ke branch `staging` atau `main` akan divalidasi otomatis oleh GitHub Actions.
- **Application Online (Deployment)**: 
  - **Frontend**: Dideploy menggunakan platform *free tier* seperti **Vercel** atau **Netlify** yang terhubung langsung dengan repository GitHub.
  - **Backend / API**: Dideploy menggunakan layanan cloud gratis seperti **Render** atau **Railway**.
  - **Database**: Menggunakan layanan database hosting gratis (seperti ElephantSQL/Neon untuk PostgreSQL atau Supabase).

## 2. Langkah-Langkah Deployment (Contoh Frontend ke Vercel)
1. Masuk ke dashboard Vercel menggunakan akun GitHub.
2. Klik **Add New...** -> **Project**, lalu pilih repository GitHub proyek ini (`web-rentaliphone`).
3. Tentukan direktori root ke folder `/frontend`.
4. Masukkan konfigurasi Environment Variable sesuai dengan file `.env.example`.
5. Klik **Deploy** dan tunggu proses *build* selesai hingga aplikasi dapat diakses melalui URL publik secara gratis.
