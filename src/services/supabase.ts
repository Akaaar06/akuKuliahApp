import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Course, Task, MaterialFile, AttendanceRecordStatus, AppSettings } from '../types';
import {
  dateKey,
  formatTanggal,
  formatTanggalWaktu,
  formatWaktu,
  gabungTanggalWaktu,
  getBadgeDeadline,
  getTanggalHariIni,
  parseTanggal,
} from '../utils/date';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials exist in localStorage if not in env
const localUrl = typeof window !== 'undefined' ? localStorage.getItem('akukuliah_supabase_url') : null;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('akukuliah_supabase_key') : null;

const supabaseUrl = envUrl || localUrl || '';
const supabaseAnonKey = envKey || localKey || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const SupabaseService = {
  isConfigured(): boolean {
    return Boolean(supabase);
  },

  setCredentials(url: string, key: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('akukuliah_supabase_url', url);
      localStorage.setItem('akukuliah_supabase_key', key);
      window.location.reload();
    }
  },

  clearCredentials() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('akukuliah_supabase_url');
      localStorage.removeItem('akukuliah_supabase_key');
      window.location.reload();
    }
  },

  // Fetch courses from Supabase
  async fetchCourses(): Promise<Course[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('mata_kuliah')
        .select(`
          *,
          riwayat_dosen (*),
          materi (*),
          presensi (*)
        `)
        .order('hari', { ascending: true });

      if (error) {
        console.error('Supabase fetchCourses error:', error);
        return null;
      }

      if (!data || data.length === 0) return null;

      // Transform relational Supabase data into Course model
      const formattedCourses: Course[] = data.map((row: any) => ({
        id: row.id,
        kode: row.kode,
        nama: row.nama,
        sks: row.sks,
        semester: row.semester,
        dosenPengampu: row.dosen_pengampu,
        dpj: row.dpj,
        linkGDrive: row.link_gdrive || '',
        hari: row.hari,
        jam: row.jam,
        ruang: row.ruang,
        riwayatDosen: (row.riwayat_dosen || []).map((rd: any) => ({
          minggu: rd.minggu,
          dosen: rd.dosen,
        })),
        materi: (row.materi || []).map((m: any) => {
          const tglUpload = parseTanggal(m.tanggal_upload);
          return {
            id: m.id,
            nama: m.nama,
            pertemuan: m.pertemuan,
            format: m.format,
            ukuran: m.ukuran,
            kategori: m.kategori,
            lokasiPenyimpanan: m.lokasi_penyimpanan,
            // Tanggal upload dari DB berupa ISO UTC; ditampilkan sebagai
            // tanggal lokal "7 Okt 2026".
            tanggal: tglUpload ? formatTanggal(tglUpload) : 'Baru',
          };
        }),
        // Presensi dari DB dinormalisasi ke format Indonesia agar pencocokan
        // sesi (dateKey) bekerja sama dengan record yang dibuat lokal.
        riwayatPresensi: (row.presensi || []).map((p: any) => {
          const tgl = parseTanggal(p.tanggal);
          return {
            tanggal: tgl ? formatTanggal(tgl) : (p.tanggal || ''),
            status: p.status as AttendanceRecordStatus,
            mingguKe: Number(p.minggu_ke) || 1,
            topik: p.topik,
          };
        }),
      }));

      return formattedCourses;
    } catch (e) {
      console.error('Supabase fetchCourses exception:', e);
      return null;
    }
  },

  // Fetch tasks from Supabase
  async fetchTasks(): Promise<Task[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('tugas')
        .select('*')
        .order('deadline', { ascending: true });

      if (error) {
        console.error('Supabase fetchTasks error:', error);
        return null;
      }

      if (!data || data.length === 0) return null;

      return data.map((t: any) => {
        // Deadline dinormalisasi ke waktu lokal "YYYY-MM-DDTHH:mm" supaya
        // form edit (yang memakai <input type="date">/type="time">) tidak
        // kehilangan jam dan sorting antar tugas konsisten.
        const deadlineDate = parseTanggal(t.deadline);
        const deadline = deadlineDate
          ? gabungTanggalWaktu(dateKey(deadlineDate), formatWaktu(deadlineDate))
          : (t.deadline || '');
        const dibuatDate = parseTanggal(t.tanggal_dibuat);

        return {
          id: t.id,
          mataKuliahId: t.id_mata_kuliah,
          namaTugas: t.nama_tugas,
          mataKuliahNama: t.nama_mata_kuliah || 'MATA KULIAH',
          deadline,
          deadlineDisplay: formatTanggalWaktu(deadlineDate) || t.deadline || '',
          badgeDeadline: getBadgeDeadline(deadline),
          deskripsi: t.deskripsi || '',
          tanggalDibuat: dibuatDate ? formatTanggal(dibuatDate) : getTanggalHariIni(),
          selesai: Boolean(t.selesai),
          reminders: t.reminders ? (typeof t.reminders === 'string' ? JSON.parse(t.reminders) : t.reminders) : [],
        };
      });
    } catch (e) {
      console.error('Supabase fetchTasks exception:', e);
      return null;
    }
  },

  // Upsert course
  async upsertCourse(course: Course): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('mata_kuliah').upsert({
        id: course.id,
        kode: course.kode,
        nama: course.nama,
        sks: course.sks,
        semester: course.semester,
        dosen_pengampu: course.dosenPengampu,
        dpj: course.dpj,
        link_gdrive: course.linkGDrive,
        hari: course.hari,
        jam: course.jam,
        ruang: course.ruang,
        updated_at: new Date().toISOString(),
      });
      return !error;
    } catch (e) {
      console.error('Supabase upsertCourse exception:', e);
      return false;
    }
  },

  // Delete course
  async deleteCourse(courseId: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('mata_kuliah').delete().eq('id', courseId);
      return !error;
    } catch (e) {
      console.error('Supabase deleteCourse exception:', e);
      return false;
    }
  },

  // Upsert task
  async upsertTask(task: Task): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('tugas').upsert({
        id: task.id,
        id_mata_kuliah: task.mataKuliahId,
        nama_tugas: task.namaTugas,
        nama_mata_kuliah: task.mataKuliahNama || null,
        deadline: task.deadline,
        tanggal_dibuat: task.tanggalDibuat || getTanggalHariIni(),
        deskripsi: task.deskripsi || null,
        selesai: task.selesai,
        reminders: JSON.stringify(task.reminders || []),
      });
      return !error;
    } catch (e) {
      console.error('Supabase upsertTask exception:', e);
      return false;
    }
  },

  // Delete task
  async deleteTask(taskId: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('tugas').delete().eq('id', taskId);
      return !error;
    } catch (e) {
      console.error('Supabase deleteTask exception:', e);
      return false;
    }
  },

  // Save attendance record
  async saveAttendanceRecord(
    courseId: string,
    mingguKe: number,
    status: AttendanceRecordStatus,
    tanggal: string,
    topik?: string
  ): Promise<boolean> {
    if (!supabase) return false;
    try {
      const recordId = `${courseId}_p${mingguKe}`;
      const { error } = await supabase.from('presensi').upsert({
        id: recordId,
        id_mata_kuliah: courseId,
        minggu_ke: mingguKe,
        status,
        tanggal,
        topik: topik || `Pertemuan ke-${mingguKe}`,
      });
      return !error;
    } catch (e) {
      console.error('Supabase saveAttendanceRecord exception:', e);
      return false;
    }
  },
};
