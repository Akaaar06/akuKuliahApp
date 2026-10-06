# Panduan Deploy Vercel & Supabase Database: akuKuliah

Aplikasi ini sudah dikonfigurasi penuh untuk:
1. **PWA (Progressive Web App)** lengkap dengan ikon logo resmi, Web App Manifest, dan tombol install langsung ke layar utama Android & iOS (iPhone).
2. **Supabase Database (PostgreSQL)** dengan skrip tabel otomatis dan Row Level Security (RLS).
3. **Vercel Deployment** dengan file konfigurasi `vercel.json` siap pakai untuk URL kustom Anda (misal: `akukuliahbjir.vercel.app`).

---

## 1. Setup Supabase & Lihat Tabel Database

1. Buka [https://supabase.com](https://supabase.com) dan buat proyek baru (contoh nama: `akukuliah`).
2. Masuk ke menu **SQL Editor** di sidebar kiri Supabase.
3. Klik **New Query**, lalu salin seluruh isi file **`supabase_schema.sql`** yang ada di folder ini dan klik **Run**.
4. Selesai! Klik menu **Table Editor** di sidebar kiri Supabase. Anda akan melihat semua tabel yang sudah dibuat dan langsung terisi data:
   - `mahasiswa` (data profil mahasiswa)
   - `mata_kuliah` (daftar mata kuliah semester aktif)
   - `riwayat_dosen` (histori periode dosen)
   - `tugas` (daftar tugas kuliah & deadline)
   - `materi` (berkas materi perkuliahan)
   - `presensi` (rekam kehadiran mingguan)
   - `pengaturan` (preferensi aplikasi)

### Mengambil Kunci API Supabase:
- Buka **Project Settings > API** di Supabase.
- Salin:
  - **Project URL** (contoh: `https://xyzabc.supabase.co`)
  - **anon / public API key** (contoh: `eyJhbGciOiJIUzI1...`)

---

## 2. Deploy ke Vercel (URL: `akukuliahbjir.vercel.app`)

1. Upload/Push repositori kode ini ke GitHub Anda.
2. Buka [https://vercel.com](https://vercel.com) dan klik **Add New... > Project**.
3. Import repositori GitHub Anda.
4. Pada bagian **Project Name**, ubah namanya menjadi **`akukuliahbjir`** agar mendapatkan domain:
   👉 `https://akukuliahbjir.vercel.app`
5. Pada bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL` = (Project URL Supabase Anda)
   - `VITE_SUPABASE_ANON_KEY` = (anon public key Supabase Anda)
6. Klik **Deploy**. Dalam waktu ~1 menit, aplikasi Anda sudah live di internet!

---

## 3. Cara Install Aplikasi di HP dengan Logo Ikon Resmi

Aplikasi ini sudah dilengkapi ikon beresolusi tinggi (`192x192`, `512x512`, `apple-touch-icon`) dan Service Worker PWA.

### Di HP Android (Chrome / Edge):
1. Buka link web Anda (misal `akukuliahbjir.vercel.app`) di Google Chrome HP.
2. Di layar akan muncul tombol **"Install App"** di bagian atas atau di menu **Pengaturan**.
3. Tekan tombol tersebut, atau tekan titik tiga di pojok kanan atas browser > **"Add to Home screen" / "Install app"**.
4. Ikon topi sarjana **akuKuliah** akan otomatis muncul di layar utama smartphone Anda seperti aplikasi Play Store.

### Di iPhone / iPad (Safari):
1. Buka website di Safari iOS.
2. Tekan tombol **Share** (kotak dengan panah ke atas) di bagian bawah layar.
3. Gulir ke bawah dan pilih **"Add to Home Screen"** (Tambah ke Layar Utama).
4. Tekan **Add** di pojok kanan atas. Logo ikon resmi **akuKuliah** akan langsung terpasang di beranda iOS Anda.
