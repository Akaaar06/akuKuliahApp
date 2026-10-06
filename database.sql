-- ==========================================================
-- SKEMA BASIS DATA SQL LENGKAP: akuKuliah
-- Sistem Pengelolaan Informasi Akademik Mahasiswa
-- Kompatibel dengan PostgreSQL, MySQL, SQLite, & MariaDB
-- ==========================================================

-- ----------------------------------------------------------
-- 1. PEMBUATAN DATABASE
-- ----------------------------------------------------------
CREATE DATABASE IF NOT EXISTS akukuliah_db;
-- USE akukuliah_db;

-- ----------------------------------------------------------
-- 2. TABEL PROFIL PENGGUNA (MAHASISWA)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS mahasiswa (
    id VARCHAR(64) PRIMARY KEY,
    nim VARCHAR(32) NOT NULL UNIQUE,
    nama VARCHAR(128) NOT NULL,
    prodi VARCHAR(64) NOT NULL DEFAULT 'Teknik Informatika',
    fakultas VARCHAR(64) DEFAULT 'Ilmu Komputer',
    semester_aktif INT NOT NULL DEFAULT 5,
    foto_profil TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- 3. TABEL MATA KULIAH
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS mata_kuliah (
    id VARCHAR(64) PRIMARY KEY,
    kode VARCHAR(16) NOT NULL,
    nama VARCHAR(128) NOT NULL,
    sks INT NOT NULL DEFAULT 3,
    semester INT NOT NULL DEFAULT 5,
    dosen_pengampu VARCHAR(128) NOT NULL,
    dpj VARCHAR(128) NOT NULL, -- Dosen Penanggung Jawab
    link_gdrive TEXT,
    hari VARCHAR(16) DEFAULT 'Senin',
    jam VARCHAR(32) DEFAULT '08:00 - 10:30',
    ruang VARCHAR(64) DEFAULT 'Lab 304',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- 4. TABEL RIWAYAT PERGANTIAN DOSEN
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS riwayat_dosen (
    id VARCHAR(64) PRIMARY KEY,
    id_mata_kuliah VARCHAR(64) NOT NULL,
    minggu VARCHAR(64) NOT NULL, -- Contoh: "Minggu 1–7", "Minggu 8–14"
    dosen VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_riwayat_mk FOREIGN KEY (id_mata_kuliah) 
        REFERENCES mata_kuliah(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- 5. TABEL BERKAS MATERI PERKULIAHAN
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS materi (
    id VARCHAR(64) PRIMARY KEY,
    id_mata_kuliah VARCHAR(64) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    pertemuan INT NOT NULL,
    format VARCHAR(8) NOT NULL, -- 'PDF', 'PPT', 'PPTX'
    ukuran VARCHAR(32) NOT NULL,
    kategori VARCHAR(32) DEFAULT 'Materi', -- 'Materi', 'Tugas', 'Lainnya'
    lokasi_penyimpanan TEXT NOT NULL, -- Firebase Storage gs:// URL
    tanggal_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_materi_mk FOREIGN KEY (id_mata_kuliah) 
        REFERENCES mata_kuliah(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- 6. TABEL PRESENSI PERTEMUAN KULIAH
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS presensi (
    id VARCHAR(64) PRIMARY KEY,
    id_mata_kuliah VARCHAR(64) NOT NULL,
    tanggal VARCHAR(32) NOT NULL, -- Format tanggal e.g. "24 Okt 2024"
    minggu_ke INT NOT NULL,
    status VARCHAR(32) NOT NULL, -- 'hadir', 'tidak-hadir', 'belum', 'libur'
    topik TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_presensi_mk FOREIGN KEY (id_mata_kuliah) 
        REFERENCES mata_kuliah(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- 7. TABEL TUGAS KULIAH
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS tugas (
    id VARCHAR(64) PRIMARY KEY,
    id_mata_kuliah VARCHAR(64) NOT NULL,
    nama_tugas VARCHAR(255) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    deskripsi TEXT,
    selesai BOOLEAN DEFAULT FALSE,
    tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tugas_mk FOREIGN KEY (id_mata_kuliah) 
        REFERENCES mata_kuliah(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- 8. TABEL PENGATURAN APLIKASI
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS pengaturan (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'app_settings',
    dark_mode BOOLEAN DEFAULT FALSE,
    current_semester VARCHAR(64) DEFAULT 'Semester Ganjil 2024/2025',
    notifikasi_deadline BOOLEAN DEFAULT TRUE,
    auto_silent_kuliah BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- 9. INDEKS PERFORMA QUERY
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_mk_semester ON mata_kuliah(semester);
CREATE INDEX IF NOT EXISTS idx_tugas_deadline ON tugas(deadline);
CREATE INDEX IF NOT EXISTS idx_tugas_selesai ON tugas(selesai);
CREATE INDEX IF NOT EXISTS idx_presensi_mk ON presensi(id_mata_kuliah);
CREATE INDEX IF NOT EXISTS idx_presensi_status ON presensi(status);
CREATE INDEX IF NOT EXISTS idx_materi_mk ON materi(id_mata_kuliah);

-- ==========================================================
-- VIEW / QUERY REKAPITULASI DATA OTOMATIS
-- ==========================================================

-- VIEW 1: REKAP PERSENTASE KEHADIRAN (Mengabaikan status 'libur')
CREATE OR REPLACE VIEW view_rekap_presensi AS
SELECT 
    mk.id AS id_mata_kuliah,
    mk.kode,
    mk.nama AS nama_mata_kuliah,
    mk.dosen_pengampu,
    COUNT(CASE WHEN p.status = 'hadir' THEN 1 END) AS total_hadir,
    COUNT(CASE WHEN p.status IN ('hadir', 'tidak-hadir') THEN 1 END) AS total_pertemuan_riil,
    ROUND(
        COALESCE(
            (COUNT(CASE WHEN p.status = 'hadir' THEN 1.0 END) / 
             NULLIF(COUNT(CASE WHEN p.status IN ('hadir', 'tidak-hadir') THEN 1.0 END), 0)) * 100, 
            100.0
        ), 2
    ) AS persentase_kehadiran
FROM mata_kuliah mk
LEFT JOIN presensi p ON mk.id = p.id_mata_kuliah
GROUP BY mk.id, mk.kode, mk.nama, mk.dosen_pengampu;

-- VIEW 2: DAFTAR TUGAS DENGAN NAMA MATA KULIAH
CREATE OR REPLACE VIEW view_daftar_tugas AS
SELECT 
    t.id AS id_tugas,
    t.nama_tugas,
    t.deadline,
    t.deskripsi,
    t.selesai,
    t.tanggal_dibuat,
    mk.id AS id_mata_kuliah,
    mk.nama AS nama_mata_kuliah,
    mk.kode AS kode_mata_kuliah
FROM tugas t
JOIN mata_kuliah mk ON t.id_mata_kuliah = mk.id
ORDER BY t.deadline ASC;

-- ==========================================================
-- CONTOH OPERASI SQL (CRUD QUERY)
-- ==========================================================

-- 1. MENAMBAH MATA KULIAH BARU
-- INSERT INTO mata_kuliah (id, kode, nama, sks, semester, dosen_pengampu, dpj, link_gdrive, hari, jam, ruang)
-- VALUES ('mk-1', 'IF-3102', 'Rekayasa Perangkat Lunak', 3, 5, 'Dr. Andi Wijaya', 'Prof. Joko Susilo', 'https://drive.google.com/...', 'Senin', '08:00 - 10:30', 'Lab 304');

-- 2. MENAMBAH PERIODE HISTORI DOSEN
-- INSERT INTO riwayat_dosen (id, id_mata_kuliah, minggu, dosen)
-- VALUES ('rd-1', 'mk-1', 'Minggu 1–7', 'Prof. Joko Susilo'),
--        ('rd-2', 'mk-1', 'Minggu 8–14', 'Dr. Andi Wijaya');

-- 3. MENAMBAH TUGAS KULIAH
-- INSERT INTO tugas (id, id_mata_kuliah, nama_tugas, deadline, deskripsi)
-- VALUES ('t-1', 'mk-1', 'Proposal Proyek Akhir', '2024-10-28 17:00:00', 'Bab 1 dan Diagram SRS');

-- 4. MENAMBAH BERKAS MATERI
-- INSERT INTO materi (id, id_mata_kuliah, nama, pertemuan, format, ukuran, kategori, lokasi_penyimpanan)
-- VALUES ('m-1', 'mk-1', '01_Pengantar_RPL.pdf', 1, 'PDF', '2.4 MB', 'Materi', 'gs://akukuliah-app.appspot.com/materials/01_Pengantar_RPL.pdf');

-- 5. MENCATAT STATUS PRESENSI MINGGUAN
-- INSERT INTO presensi (id, id_mata_kuliah, tanggal, minggu_ke, status, topik)
-- VALUES ('p-1', 'mk-1', '24 Okt 2024', 8, 'hadir', 'Evaluasi Arsitektur');

-- 6. MENGUBAH STATUS TUGAS MENJADI SELESAI
-- UPDATE tugas SET selesai = TRUE WHERE id = 't-1';

-- 7. QUERY DASHBOARD (TUGAS MENDEKATI DEADLINE)
-- SELECT * FROM view_daftar_tugas WHERE selesai = FALSE AND deadline >= CURRENT_TIMESTAMP ORDER BY deadline ASC LIMIT 3;

-- 8. QUERY MATA KULIAH SEMESTER AKTIF
-- SELECT * FROM mata_kuliah WHERE semester = 5 ORDER BY hari, jam;

-- 9. MENGHAPUS MATA KULIAH (Otomatis menghapus tugas, materi, dan presensi via CASCADE)
-- DELETE FROM mata_kuliah WHERE id = 'mk-1';
