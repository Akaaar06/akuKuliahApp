import { Course, Task, MaterialFile, AttendanceRecord, AttendanceRecordStatus, AppSettings } from '../types';
import { initialStudent, initialCourses, initialTasks, initialSettings } from '../data/mockData';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import {
  buatIdUnik,
  calculateReminders,
  dateKey,
  formatTanggal,
  formatTanggalWaktu,
  formatWaktu,
  gabungTanggalWaktu,
  getBadgeDeadline,
  getTanggalHariIni,
  parseTanggal,
} from '../utils/date';

const COURSES_KEY = 'akukuliah_db_courses_v2';
const TASKS_KEY = 'akukuliah_db_tasks_v2';
const SETTINGS_KEY = 'akukuliah_db_settings_v2';
const PROFILE_KEY = 'akukuliah_db_profile_v2';

/** Dipertahankan sebagai re-export agar import lama tidak rusak. */
export function getTodayFormatted(): string {
  return getTanggalHariIni();
}

/** Nomor minggu berikutnya: max(mingguKe) + 1, bukan length + 1. */
function mingguBerikutnya(records: AttendanceRecord[]): number {
  return records.reduce((max, r) => {
    const n = Number(r.mingguKe);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0) + 1;
}

/**
 * Record absensi terakhir, diabaikan bila hanya berisi slot "belum" yang
 * menggantung di ekor riwayat.
 */
function recordTerakhir(records: AttendanceRecord[]): AttendanceRecord | undefined {
  return records.length > 0 ? records[records.length - 1] : undefined;
}

// Helper untuk reminder dipindah ke utils/date (logika tanggal murni) lalu
// di-re-export di sini agar import lama tetap berfungsi.
export { calculateReminders } from '../utils/date';

// Helper to calculate attendance percentage (excluding 'libur')
export function calculateAttendancePercentage(course: Course): {
  hadir: number;
  totalActual: number;
  persen: number;
} {
  const records = course.riwayatPresensi || [];
  const actualRecords = records.filter(
    (r) => r.status !== 'libur' && r.status !== 'belum'
  );
  const hadir = records.filter((r) => r.status === 'hadir').length;
  const totalActual = actualRecords.length;
  const persen = totalActual > 0 ? (hadir / totalActual) * 100 : 100;

  return {
    hadir,
    totalActual,
    persen: Number(persen.toFixed(1)),
  };
}

export const StorageService = {
  // Sync from Firestore if available
  async syncFromFirestore(): Promise<{ courses: Course[]; tasks: Task[] } | null> {
    try {
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const tasksSnap = await getDocs(collection(db, 'tasks'));

      const remoteCourses: Course[] = [];
      coursesSnap.forEach((d) => remoteCourses.push(d.data() as Course));

      const remoteTasks: Task[] = [];
      tasksSnap.forEach((d) => remoteTasks.push(d.data() as Task));

      if (remoteCourses.length > 0) {
        this.saveCourses(remoteCourses);
      }
      if (remoteTasks.length > 0) {
        this.saveTasks(remoteTasks);
      }

      return { courses: this.getCourses(), tasks: this.getTasks() };
    } catch (e) {
      console.warn('Syncing from Firestore offline or empty:', e);
      return null;
    }
  },

  // COURSES
  getCourses(): Course[] {
    try {
      const data = localStorage.getItem(COURSES_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return initialCourses;
  },

  saveCourses(courses: Course[]): void {
    try {
      localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    } catch (e) {
      console.error(e);
    }
  },

  addCourse(courseData: Omit<Course, 'id' | 'materi' | 'riwayatPresensi' | 'riwayatDosen'>): Course {
    const courses = this.getCourses();
    const newCourse: Course = {
      ...courseData,
      id: buatIdUnik('mk'),
      riwayatDosen: [],
      materi: [],
      riwayatPresensi: [],
    };
    courses.unshift(newCourse);
    this.saveCourses(courses);

    // Sync to Firestore
    try {
      setDoc(doc(db, 'courses', newCourse.id), newCourse).catch((err) =>
        console.warn('Firestore write warning:', err)
      );
    } catch (e) {
      console.warn('Firestore write error:', e);
    }

    return newCourse;
  },

  updateCourse(courseId: string, updatedData: Partial<Course>): Course[] {
    const courses = this.getCourses().map((c) => {
      if (c.id === courseId) {
        const merged = { ...c, ...updatedData };
        // Sync to Firestore
        try {
          setDoc(doc(db, 'courses', courseId), merged).catch((err) =>
            console.warn('Firestore write warning:', err)
          );
        } catch (e) {
          console.warn('Firestore write error:', e);
        }
        return merged;
      }
      return c;
    });
    this.saveCourses(courses);
    return courses;
  },

  deleteCourse(courseId: string): Course[] {
    const courses = this.getCourses().filter((c) => c.id !== courseId);
    this.saveCourses(courses);
    const tasks = this.getTasks().filter((t) => t.mataKuliahId !== courseId);
    this.saveTasks(tasks);

    // Sync to Firestore
    try {
      deleteDoc(doc(db, 'courses', courseId)).catch((err) =>
        console.warn('Firestore delete warning:', err)
      );
    } catch (e) {
      console.warn('Firestore delete error:', e);
    }

    return courses;
  },

  addLecturerPeriod(courseId: string, minggu: string, dosen: string): Course[] {
    const courses = this.getCourses().map((c) => {
      if (c.id === courseId) {
        const merged = {
          ...c,
          dosenPengampu: dosen,
          riwayatDosen: [...(c.riwayatDosen || []), { minggu, dosen }],
        };
        try {
          setDoc(doc(db, 'courses', courseId), merged).catch((err) =>
            console.warn('Firestore write warning:', err)
          );
        } catch (e) {
          console.warn('Firestore write error:', e);
        }
        return merged;
      }
      return c;
    });
    this.saveCourses(courses);
    return courses;
  },

  // MATERIALS
  addMaterial(
    courseId: string,
    fileData: {
      nama: string;
      pertemuan: number;
      format: 'PDF' | 'PPT' | 'PPTX';
      ukuran: string;
      kategori?: 'Materi' | 'Tugas' | 'Lainnya';
      lokasiPenyimpanan?: string;
    }
  ): Course[] {
    const courses = this.getCourses().map((c) => {
      if (c.id === courseId) {
        const newMaterial: MaterialFile = {
          id: buatIdUnik('m'),
          nama: fileData.nama,
          pertemuan: fileData.pertemuan,
          format: fileData.format,
          ukuran: fileData.ukuran,
          tanggal: getTanggalHariIni(),
          kategori: fileData.kategori || 'Materi',
          lokasiPenyimpanan: fileData.lokasiPenyimpanan || 'gs://akukuliah-app.appspot.com/materials/' + fileData.nama,
        };
        const updatedCourse = {
          ...c,
          materi: [newMaterial, ...(c.materi || [])],
        };
        try {
          setDoc(doc(db, 'courses', courseId), updatedCourse).catch((err) =>
            console.warn('Firestore write warning:', err)
          );
          setDoc(doc(db, 'materials', newMaterial.id), {
            ...newMaterial,
            courseId,
          }).catch((err) => console.warn('Firestore write warning:', err));
        } catch (e) {
          console.warn('Firestore write error:', e);
        }
        return updatedCourse;
      }
      return c;
    });
    this.saveCourses(courses);
    return courses;
  },

  deleteMaterial(courseId: string, materialId: string): Course[] {
    const courses = this.getCourses().map((c) => {
      if (c.id === courseId) {
        const updatedCourse = {
          ...c,
          materi: (c.materi || []).filter((m) => m.id !== materialId),
        };
        try {
          setDoc(doc(db, 'courses', courseId), updatedCourse).catch((err) =>
            console.warn('Firestore write warning:', err)
          );
          deleteDoc(doc(db, 'materials', materialId)).catch((err) =>
            console.warn('Firestore delete warning:', err)
          );
        } catch (e) {
          console.warn('Firestore delete error:', e);
        }
        return updatedCourse;
      }
      return c;
    });
    this.saveCourses(courses);
    return courses;
  },

  // ATTENDANCE
  /**
   * Catat kehadiran untuk satu sesi.
   *
   * Pencocokan record memakai `dateKey` (hari kalender), bukan string persis,
   * sehingga "24 Okt 2024", "24-10-2024", dan `2024-10-24` saling menimpa
   * alih-alih membuat sesi ganda.
   *
   * Slot `belum` yang menggantung di ekor riwayat TIDAK lagi ditimpa memakai
   * tanggal pilihan pengguna; kalau tanggal berbeda, record baru ditambahkan
   * dan slot `belum` tetap utuh sebagai sesi yang belum diisi.
   */
  recordAttendanceDetailed(
    courseId: string,
    tanggal: string,
    status: AttendanceRecordStatus,
    topik?: string
  ): { courses: Course[]; record: AttendanceRecord | null } {
    let saved: AttendanceRecord | null = null;

    const courses = this.getCourses().map((c) => {
      if (c.id !== courseId) return c;

      const records = c.riwayatPresensi || [];

      // Tanggal yang dipakai: input pengguna, fallback ke hari ini.
      const tanggalDipakai = (tanggal || '').trim() || getTanggalHariIni();
      const tanggalTersimpan = formatTanggal(parseTanggal(tanggalDipakai)) || tanggalDipakai;
      const kunci = dateKey(tanggalTersimpan);

      const existingIdx = records.findIndex((r) => dateKey(r.tanggal) === kunci);
      let updatedRecords: AttendanceRecord[];

      if (existingIdx >= 0) {
        // Sesi yang sama -> perbarui statusnya.
        const lama = records[existingIdx];
        const baru: AttendanceRecord = {
          ...lama,
          tanggal: tanggalTersimpan,
          status,
          topik: topik || lama.topik,
        };
        updatedRecords = [...records];
        updatedRecords[existingIdx] = baru;
        saved = baru;
      } else {
        // Sesi baru -> tambahkan, nomor minggu dihitung dari max(mingguKe).
        const baru: AttendanceRecord = {
          tanggal: tanggalTersimpan,
          mingguKe: mingguBerikutnya(records),
          status,
          topik: topik || 'Perkuliahan Tatap Muka',
        };
        updatedRecords = [...records, baru];
        saved = baru;
      }

      const updatedCourse = {
        ...c,
        riwayatPresensi: updatedRecords,
      };
      try {
        setDoc(doc(db, 'courses', courseId), updatedCourse).catch((err) =>
          console.warn('Firestore write warning:', err)
        );
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
      return updatedCourse;
    });

    this.saveCourses(courses);
    return { courses, record: saved };
  },

  recordAttendance(
    courseId: string,
    tanggal: string,
    status: AttendanceRecordStatus,
    topik?: string
  ): Course[] {
    return this.recordAttendanceDetailed(courseId, tanggal, status, topik).courses;
  },

  /**
   * Mulai minggu baru: menambah satu slot `belum` per mata kuliah.
   * Bila slot `belum` sudah ada di ekor riwayat, slot itu DAPATKAN ULANG
   * (tidak diduplikasi) supaya tombol "+ Minggu Baru" yang ditekan berkali-kali
   * tidak menumpuk baris kosong.
   */
  startNewWeek(): Course[] {
    const dateStr = getTanggalHariIni();
    const courses = this.getCourses().map((c) => {
      const records = c.riwayatPresensi || [];
      const terakhir = recordTerakhir(records);
      const sudahAdaSlotKosong = terakhir?.status === 'belum';

      const mingguKe = mingguBerikutnya(records);

      const riwayatPresensi: AttendanceRecord[] = sudahAdaSlotKosong
        ? records
        : [
            ...records,
            {
              tanggal: dateStr,
              mingguKe,
              status: 'belum' as const,
              topik: `Pertemuan Minggu Ke-${mingguKe}`,
            },
          ];

      const updatedCourse = { ...c, riwayatPresensi };
      try {
        setDoc(doc(db, 'courses', c.id), updatedCourse).catch((err) =>
          console.warn('Firestore write warning:', err)
        );
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
      return updatedCourse;
    });
    this.saveCourses(courses);
    return courses;
  },

  // TASKS
  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(TASKS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return initialTasks;
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  },

  addTask(taskData: {
    namaTugas: string;
    mataKuliahId: string;
    deadline: string;
    deskripsi: string;
  }): Task {
    const tasks = this.getTasks();
    const courses = this.getCourses();
    const course = courses.find((c) => c.id === taskData.mataKuliahId);

    // "Sekarang" harus waktu LOKAL supaya selisih dengan deadline lokal akurat.
    // (toISOString() = UTC, sedangkan deadline dari <input type="date"> = lokal;
    //  mencampur keduanya membuat reminder meleset hingga 7 jam di WIB.)
    const now = new Date();
    const nowStr = gabungTanggalWaktu(dateKey(now), formatWaktu(now));

    const reminders = calculateReminders(nowStr, taskData.deadline);

    // Normalisasi deadline ke "YYYY-MM-DDTHH:mm" waktu lokal bila bisa diparse.
    const deadline = parseTanggal(taskData.deadline);
    const deadlineNormalized = deadline
      ? gabungTanggalWaktu(dateKey(deadline), formatWaktu(deadline))
      : taskData.deadline;

    const newTask: Task = {
      id: buatIdUnik('t'),
      namaTugas: taskData.namaTugas,
      mataKuliahId: taskData.mataKuliahId,
      mataKuliahNama: course ? course.nama.toUpperCase() : 'MATA KULIAH',
      deadline: deadlineNormalized,
      deadlineDisplay: formatTanggalWaktu(deadline) || taskData.deadline,
      badgeDeadline: getBadgeDeadline(deadlineNormalized),
      deskripsi: taskData.deskripsi,
      tanggalDibuat: getTanggalHariIni(),
      selesai: false,
      reminders,
    };

    tasks.unshift(newTask);
    this.saveTasks(tasks);

    // Sync to Firestore
    try {
      setDoc(doc(db, 'tasks', newTask.id), newTask).catch((err) =>
        console.warn('Firestore write warning:', err)
      );
    } catch (e) {
      console.warn('Firestore write error:', e);
    }

    return newTask;
  },

  updateTask(taskId: string, updatedData: Partial<Task>): Task[] {
    const tasks = this.getTasks().map((t) => {
      if (t.id === taskId) {
        const merged = { ...t, ...updatedData };

        // Deadline berubah -> segarkan tampilan & badge tenggat.
        if (updatedData.deadline) {
          const d = parseTanggal(updatedData.deadline);
          merged.deadlineDisplay = formatTanggalWaktu(d) || updatedData.deadline;
          merged.badgeDeadline = getBadgeDeadline(updatedData.deadline);
        }

        try {
          setDoc(doc(db, 'tasks', taskId), merged).catch((err) =>
            console.warn('Firestore write warning:', err)
          );
        } catch (e) {
          console.warn('Firestore write error:', e);
        }
        return merged;
      }
      return t;
    });
    this.saveTasks(tasks);
    return tasks;
  },

  deleteTask(taskId: string): Task[] {
    const tasks = this.getTasks().filter((t) => t.id !== taskId);
    this.saveTasks(tasks);

    try {
      deleteDoc(doc(db, 'tasks', taskId)).catch((err) =>
        console.warn('Firestore delete warning:', err)
      );
    } catch (e) {
      console.warn('Firestore delete error:', e);
    }

    return tasks;
  },

  toggleTask(taskId: string): Task[] {
    const tasks = this.getTasks().map((t) => {
      if (t.id === taskId) {
        const merged = { ...t, selesai: !t.selesai };
        try {
          setDoc(doc(db, 'tasks', taskId), merged).catch((err) =>
            console.warn('Firestore write warning:', err)
          );
        } catch (e) {
          console.warn('Firestore write error:', e);
        }
        return merged;
      }
      return t;
    });
    this.saveTasks(tasks);
    return tasks;
  },

  // SETTINGS
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return initialSettings;
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setDoc(doc(db, 'settings', 'app_config'), settings).catch((err) =>
        console.warn('Firestore settings write warning:', err)
      );
    } catch (e) {
      console.error(e);
    }
  },

  // USER PROFILE
  getProfile() {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...initialStudent,
          ...parsed,
        };
      }
    } catch (e) {
      console.error(e);
    }
    return initialStudent;
  },

  saveProfile(profile: typeof initialStudent): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  },
};
