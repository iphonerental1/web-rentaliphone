# Dokumentasi Branch Strategy & Git Workflow

Proyek ini menggunakan standar *Git Branching Strategy* untuk menjaga kestabilan kode tim:

1. **`main`**
   - Berisi kode final yang stabil, bebas *bug*, dan siap dipresentasikan/dikumpulkan.
   - Tidak seorang pun diizinkan *push* langsung ke branch ini; perubahan hanya bisa melalui *Pull Request* yang disetujui dari `staging`.

2. **`staging`**
   - Branch integrasi utama tempat menggabungkan seluruh fitur dari Frontend, Backend, dan Database (`database/`).
   - Tempat pengujian awal sebelum kode dinyatakan layak masuk ke `main`.

3. **`feature/*`**
   - Branch kerja harian untuk masing-masing anggota tim sesuai perannya (contoh: `feature/frontend-login`, `feature/backend-api`, `feature/db-schema`).
   - Dibuat dari branch `staging` dan dikirim kembali ke `staging` via *Pull Request*.
