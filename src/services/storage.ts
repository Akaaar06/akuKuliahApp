import { Course, Task, MaterialFile, AttendanceRecordStatus, AppSettings } from '../types';
import { initialStudent, initialCourses, initialTasks, initialSettings } from '../data/mockData';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';

const COURSES_KEY = 'akukuliah_db_courses_v2';
const TASKS_KEY = 'akukuliah_db_tasks_v2';
const SETTINGS_KEY = 'akukuliah_db_settings_v2';
const PROFILE_KEY = 'akukuliah_db_profile_v2';

export function getTodayFormatted(): string {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

// Helper to calculate reminder dates based on deadline and createdDate
export function calculateReminders(createdDateStr: string, deadlineStr: string): string[] {
  const created = new Date(createdDateStr);
  const deadline = new Date(deadlineStr);
  const diffTime = deadline.getTime() - created.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  const available: string[] = [];
  if (diffDays > 7) available.push('7 hari sebelum');
  if (diffDays > 5) available.push('5 hari sebelum');
  if (diffDays > 3) available.push('3 hari sebelum');
  if (diffDays > 1) available.push('1 hari sebelum');

  return available;
}

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
      id: `mk-${Date.now()}`,
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
          id: `m-${Date.now()}`,
          nama: fileData.nama,
          pertemuan: fileData.pertemuan,
          format: fileData.format,
          ukuran: fileData.ukuran,
          tanggal: getTodayFormatted(),
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
  recordAttendance(
    courseId: string,
    tanggal: string,
    status: AttendanceRecordStatus,
    topik?: string
  ): Course[] {
    const courses = this.getCourses().map((c) => {
      if (c.id === courseId) {
        const records = c.riwayatPresensi || [];
        const dateToUse = tanggal.trim() || getTodayFormatted();
        const existingIdx = records.findIndex((r) => r.tanggal === dateToUse);
        let updatedRecords = [...records];

        if (existingIdx >= 0) {
          updatedRecords[existingIdx] = {
            ...updatedRecords[existingIdx],
            status,
            topik: topik || updatedRecords[existingIdx].topik,
          };
        } else if (records.length > 0 && records[records.length - 1].status === 'belum') {
          // If the last record was pending ('belum'), update it
          const lastIdx = records.length - 1;
          updatedRecords[lastIdx] = {
            ...updatedRecords[lastIdx],
            tanggal: dateToUse,
            status,
            topik: topik || updatedRecords[lastIdx].topik,
          };
        } else {
          updatedRecords.push({
            tanggal: dateToUse,
            mingguKe: updatedRecords.length + 1,
            status,
            topik: topik || 'Perkuliahan Tatap Muka',
          });
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
      }
      return c;
    });
    this.saveCourses(courses);
    return courses;
  },

  startNewWeek(): Course[] {
    const dateStr = getTodayFormatted();
    const courses = this.getCourses().map((c) => {
      const nextWeekNum = (c.riwayatPresensi || []).length + 1;
      const updatedCourse = {
        ...c,
        riwayatPresensi: [
          ...(c.riwayatPresensi || []),
          {
            tanggal: dateStr,
            mingguKe: nextWeekNum,
            status: 'belum' as const,
            topik: `Pertemuan Minggu Ke-${nextWeekNum}`,
          },
        ],
      };
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
    const nowStr = new Date().toISOString();

    const reminders = calculateReminders(nowStr, taskData.deadline);

    const d = new Date(taskData.deadline);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const displayDate = !isNaN(d.getTime())
      ? `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      : taskData.deadline;

    const newTask: Task = {
      id: `t-${Date.now()}`,
      namaTugas: taskData.namaTugas,
      mataKuliahId: taskData.mataKuliahId,
      mataKuliahNama: course ? course.nama.toUpperCase() : 'MATA KULIAH',
      deadline: taskData.deadline,
      deadlineDisplay: displayDate,
      deskripsi: taskData.deskripsi,
      tanggalDibuat: getTodayFormatted(),
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
