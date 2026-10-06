-- ==============================================================================
-- SUPABASE COMPLETE SQL SCHEMA: akuKuliah
-- Jalankan skrip ini langsung di menu: Supabase Dashboard > SQL Editor > New Query > Run
-- ==============================================================================

-- 1. TABEL MAHASISWA (Profil Mahasiswa)
CREATE TABLE IF NOT EXISTS public.mahasiswa (
    id TEXT PRIMARY KEY DEFAULT 'mhs_sarah',
    nim TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    prodi TEXT NOT NULL DEFAULT 'Teknik Informatika',
    fakultas TEXT DEFAULT 'Ilmu Komputer',
    semester_aktif INT NOT NULL DEFAULT 5,
    beban_sks INT DEFAULT 21,
    ipk NUMERIC(3,2) DEFAULT 3.82,
    foto_profil TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL MATA KULIAH
CREATE TABLE IF NOT EXISTS public.mata_kuliah (
    id TEXT PRIMARY KEY,
    kode TEXT NOT NULL,
    nama TEXT NOT NULL,
    sks INT NOT NULL DEFAULT 3,
    semester INT NOT NULL DEFAULT 5,
    dosen_pengampu TEXT NOT NULL,
    dpj TEXT NOT NULL,
    link_gdrive TEXT,
    hari TEXT DEFAULT 'Senin',
    jam TEXT DEFAULT '08:00 - 10:30',
    ruang TEXT DEFAULT 'Lab 304',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL RIWAYAT PERGANTIAN DOSEN
CREATE TABLE IF NOT EXISTS public.riwayat_dosen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_mata_kuliah TEXT NOT NULL REFERENCES public.mata_kuliah(id) ON DELETE CASCADE,
    minggu TEXT NOT NULL, -- Contoh: "Minggu 1–7", "Minggu 8–14"
    dosen TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL BERKAS MATERI
CREATE TABLE IF NOT EXISTS public.materi (
    id TEXT PRIMARY KEY,
    id_mata_kuliah TEXT NOT NULL REFERENCES public.mata_kuliah(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    pertemuan INT NOT NULL,
    format TEXT NOT NULL, -- 'PDF', 'PPT', 'PPTX'
    ukuran TEXT NOT NULL,
    kategori TEXT DEFAULT 'Materi', -- 'Materi', 'Tugas', 'Lainnya'
    lokasi_penyimpanan TEXT NOT NULL,
    tanggal_upload TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL PRESENSI PERTEMUAN KULIAH
CREATE TABLE IF NOT EXISTS public.presensi (
    id TEXT PRIMARY KEY, -- Misal: 'mk1_p1'
    id_mata_kuliah TEXT NOT NULL REFERENCES public.mata_kuliah(id) ON DELETE CASCADE,
    tanggal TEXT NOT NULL,
    minggu_ke INT NOT NULL,
    status TEXT NOT NULL, -- 'hadir', 'tidak-hadir', 'belum', 'libur'
    topik TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL TUGAS KULIAH
CREATE TABLE IF NOT EXISTS public.tugas (
    id TEXT PRIMARY KEY,
    id_mata_kuliah TEXT NOT NULL REFERENCES public.mata_kuliah(id) ON DELETE CASCADE,
    nama_tugas TEXT NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    deskripsi TEXT,
    selesai BOOLEAN DEFAULT FALSE,
    reminders JSONB DEFAULT '[]'::jsonb,
    tanggal_dibuat TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL PENGATURAN APLIKASI
CREATE TABLE IF NOT EXISTS public.pengaturan (
    id TEXT PRIMARY KEY DEFAULT 'app_settings',
    dark_mode BOOLEAN DEFAULT FALSE,
    current_semester TEXT DEFAULT 'Semester Ganjil 2024/2025',
    notifikasi_deadline BOOLEAN DEFAULT TRUE,
    auto_silent_kuliah BOOLEAN DEFAULT TRUE,
    reminder_points JSONB DEFAULT '{"tujuhHari":true,"limaHari":true,"tigaHari":true,"satuHari":true}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- AKTIFKAN ROW LEVEL SECURITY (RLS) & IZIN AKSES SUPABASE (ANON & AUTHENTICATED)
-- ==============================================================================

ALTER TABLE public.mahasiswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mata_kuliah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat_dosen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tugas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengaturan ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses: Izinkan Baca & Tulis penuh untuk Anonim (Web App) dan Terotentikasi
CREATE POLICY "Akses Mahasiswa" ON public.mahasiswa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Mata Kuliah" ON public.mata_kuliah FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Riwayat Dosen" ON public.riwayat_dosen FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Materi" ON public.materi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Presensi" ON public.presensi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Tugas" ON public.tugas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Pengaturan" ON public.pengaturan FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- SEED DATA AWAL (Biar Tabel di Supabase Table Editor Langsung Terisi Data)
-- ==============================================================================

-- Profil
INSERT INTO public.mahasiswa (id, nim, nama, prodi, fakultas, semester_aktif, beban_sks, ipk, foto_profil)
VALUES ('mhs_sarah', '220401089', 'Sarah Az-Zahra', 'Teknik Informatika', 'Ilmu Komputer', 5, 21, 3.82, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80')
ON CONFLICT (id) DO UPDATE SET nama = EXCLUDED.nama;

-- Mata Kuliah
INSERT INTO public.mata_kuliah (id, kode, nama, sks, semester, dosen_pengampu, dpj, link_gdrive, hari, jam, ruang)
VALUES 
('mk1', 'IF-3102', 'Rekayasa Perangkat Lunak', 3, 5, 'Dr. Andi Wijaya', 'Prof. Joko Susilo', 'https://drive.google.com/drive/folders/akukuliah-rpl', 'Senin', '08:00 - 10:30', 'Lab 304'),
('mk2', 'IF-3105', 'Basis Data Lanjut', 3, 5, 'Siti Nurhaliza, M.Kom', 'Siti Nurhaliza, M.Kom', 'https://drive.google.com/drive/folders/akukuliah-bdl', 'Selasa', '13:00 - 15:30', 'R. 402'),
('mk3', 'IF-3201', 'Kecerdasan Buatan', 3, 5, 'Prof. Bambang Riyanto', 'Dr. Hendra Wijaya', 'https://drive.google.com/drive/folders/akukuliah-ai', 'Rabu', '10:00 - 12:30', 'Lab AI'),
('mk4', 'IF-3108', 'Jaringan Komputer Lanjut', 3, 5, 'Ahmad Fauzan, M.T', 'Ahmad Fauzan, M.T', 'https://drive.google.com/drive/folders/akukuliah-jkl', 'Kamis', '08:00 - 10:30', 'Lab Jaringan'),
('mk5', 'IF-3302', 'Etika Profesi IT', 2, 5, 'Dra. Ratna Kusuma, M.Hum', 'Dra. Ratna Kusuma, M.Hum', 'https://drive.google.com/drive/folders/akukuliah-etika', 'Jumat', '09:00 - 10:40', 'R. 201')
ON CONFLICT (id) DO UPDATE SET nama = EXCLUDED.nama;

-- Riwayat Dosen
INSERT INTO public.riwayat_dosen (id_mata_kuliah, minggu, dosen)
VALUES
('mk1', 'Minggu 1–7', 'Prof. Joko Susilo'),
('mk1', 'Minggu 8–14', 'Dr. Andi Wijaya'),
('mk3', 'Minggu 1–7', 'Dr. Hendra Wijaya'),
('mk3', 'Minggu 8–14', 'Prof. Bambang Riyanto');

-- Materi
INSERT INTO public.materi (id, id_mata_kuliah, nama, pertemuan, format, ukuran, kategori, lokasi_penyimpanan)
VALUES
('mat1', 'mk1', '01_Pengantar_SDLC_dan_Agile.pdf', 1, 'PDF', '2.4 MB', 'Materi', 'https://example.com/materials/01_Pengantar_SDLC_dan_Agile.pdf'),
('mat2', 'mk1', '02_Requirement_Engineering_SRS.pdf', 2, 'PDF', '3.8 MB', 'Materi', 'https://example.com/materials/02_Requirement_Engineering_SRS.pdf'),
('mat3', 'mk2', '01_Optimasi_Query_Index_BTree.pdf', 1, 'PDF', '1.9 MB', 'Materi', 'https://example.com/materials/01_Optimasi_Query_Index_BTree.pdf');

-- Tugas
INSERT INTO public.tugas (id, id_mata_kuliah, nama_tugas, deadline, deskripsi, selesai, reminders)
VALUES
('t1', 'mk1', 'Proposal Proyek Akhir RPL', NOW() + INTERVAL '2 days', 'Menyusun dokumen Bab 1 sampai Bab 3 dan diagram use case SRS', false, '["3 hari sebelum","1 hari sebelum"]'::jsonb),
('t2', 'mk2', 'Query Optimization & Indexing Benchmark', NOW() + INTERVAL '4 days', 'Eksperimen EXPLAIN ANALYZE pada tabel 500k baris', false, '["3 hari sebelum","1 hari sebelum"]'::jsonb),
('t3', 'mk3', 'Implementasi Algoritma A* Pathfinding', NOW() + INTERVAL '7 days', 'Kode Python Jupyter Notebook dengan visualisasi grid visual', false, '["7 hari sebelum","5 hari sebelum"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET nama_tugas = EXCLUDED.nama_tugas;

-- Pengaturan
INSERT INTO public.pengaturan (id, dark_mode, current_semester, notifikasi_deadline, auto_silent_kuliah)
VALUES ('app_settings', false, 'Semester Ganjil 2024/2025', true, true)
ON CONFLICT (id) DO NOTHING;

-- Selesai! Semua tabel sudah siap dilihat di Supabase Table Editor.
