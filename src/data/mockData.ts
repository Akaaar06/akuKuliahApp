import { Course, Task, AppSettings } from '../types';

// Helper to generate current date string in Indonesian format
function getTodayFormatted(): string {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

export const initialStudent = {
  nama: 'Sarah Az-Zahra',
  nim: '220401089',
  prodi: 'Teknik Informatika',
  semester: 3,
  bebanSks: 24,
  ipk: 3.61,
  tanggal: getTodayFormatted(),
  status: 'Aktif',
  sesiHadir: 0,
  totalSesi: 0,
  persenKehadiran: 100,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

// Data dikosongkan sesuai permintaan pengguna
export const initialCourses: Course[] = [];

export const initialTasks: Task[] = [];

export const initialSettings: AppSettings = {
  darkMode: false,
  currentSemester: 'Semester Ganjil 2024/2025',
  notifikasiDeadline: true,
  reminderPoints: {
    tujuhHari: true,
    limaHari: true,
    tigaHari: true,
    satuHari: true,
  },
  autoSilentKuliah: true,
};
