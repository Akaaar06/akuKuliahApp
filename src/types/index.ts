export type PageType = 'home' | 'absen' | 'tugas' | 'matakuliah' | 'setting';

export type AttendanceRecordStatus = 'hadir' | 'tidak-hadir' | 'belum' | 'libur';

export interface LecturerHistory {
  minggu: string; // e.g. "Minggu 1–7"
  dosen: string;
}

export interface MaterialFile {
  id: string;
  nama: string;
  pertemuan: number;
  format: 'PDF' | 'PPT' | 'PPTX';
  ukuran: string;
  tanggal: string;
  kategori?: 'Materi' | 'Tugas' | 'Lainnya';
  lokasiPenyimpanan?: string;
  fileUrl?: string;
}

export interface AttendanceRecord {
  tanggal: string;
  mingguKe: number;
  status: AttendanceRecordStatus;
  topik?: string;
}

export interface Course {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  dosenPengampu: string;
  dpj: string; // Dosen Penanggung Jawab
  riwayatDosen: LecturerHistory[];
  linkGDrive: string;
  ruang: string;
  jam: string;
  hari: string;
  materi: MaterialFile[];
  riwayatPresensi: AttendanceRecord[];
}

export interface Task {
  id: string;
  namaTugas: string;
  mataKuliahId: string;
  mataKuliahNama: string;
  deadline: string; // e.g. "2024-10-25T23:59" or display text
  deadlineDisplay: string;
  badgeDeadline?: string;
  deskripsi: string;
  tanggalDibuat: string;
  selesai: boolean;
  reminders: string[]; // e.g. ["7 hari sebelum", "3 hari sebelum", "1 hari sebelum"]
}

export interface AppSettings {
  darkMode: boolean;
  currentSemester: string;
  notifikasiDeadline: boolean;
  reminderPoints: {
    tujuhHari: boolean;
    limaHari: boolean;
    tigaHari: boolean;
    satuHari: boolean;
  };
  autoSilentKuliah: boolean;
}
