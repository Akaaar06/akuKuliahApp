import React, { useState, useEffect } from 'react';
import {
  PageType,
  Course,
  Task,
  MaterialFile,
  AttendanceRecordStatus,
  AppSettings,
} from './types';
import { StorageService } from './services/storage';
import { SupabaseService } from './services/supabase';
import { Header } from './components/Header';
import { BottomNavbar } from './components/BottomNavbar';
import { PlusActionModal } from './components/PlusActionModal';
import { HomePage } from './components/HomePage';
import { AbsenPage } from './components/AbsenPage';
import { TugasPage } from './components/TugasPage';
import { MataKuliahPage } from './components/MataKuliahPage';
import { SettingPage } from './components/SettingPage';
import { CourseDetailModal } from './components/CourseDetailModal';
import { CourseFormModal } from './components/CourseFormModal';
import { TaskFormModal } from './components/TaskFormModal';
import { TambahMateriModal } from './components/TambahMateriModal';
import { IsiPresensiModal } from './components/IsiPresensiModal';
import { ProfileAvatarModal } from './components/ProfileAvatarModal';
import { EditProfileModal } from './components/EditProfileModal';

function getPageFromUrl(): PageType {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (path === 'absen') return 'absen';
  if (path === 'tugas') return 'tugas';
  if (path === 'matakuliah' || path === 'mata-kuliah') return 'matakuliah';
  if (path === 'setting' || path === 'pengaturan') return 'setting';
  return 'home';
}

export default function App() {
  // Navigation State with persistent sub-URL routing (Home, Absen, Tugas, Mata Kuliah, Setting)
  const [currentPage, setCurrentPage] = useState<PageType>(() => getPageFromUrl());

  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
    const targetPath = page === 'home' ? '/' : `/${page}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page }, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPageFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Database / Storage State
  const [courses, setCourses] = useState<Course[]>(() => StorageService.getCourses());
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [userProfile, setUserProfile] = useState(() => StorageService.getProfile());

  // Modal States
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [isTambahMateriOpen, setIsTambahMateriOpen] = useState(false);
  const [materiCourseId, setMateriCourseId] = useState<string | undefined>(undefined);
  const [isIsiPresensiOpen, setIsIsiPresensiOpen] = useState(false);
  const [activeCourseIdForPresensi, setActiveCourseIdForPresensi] = useState<string | undefined>(undefined);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Sync dark mode class
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Sync data from Supabase or Firestore on initial mount
  useEffect(() => {
    if (SupabaseService.isConfigured()) {
      Promise.all([SupabaseService.fetchCourses(), SupabaseService.fetchTasks()]).then(
        ([remoteCourses, remoteTasks]) => {
          if (remoteCourses && remoteCourses.length > 0) {
            setCourses(remoteCourses);
            StorageService.saveCourses(remoteCourses);
          }
          if (remoteTasks && remoteTasks.length > 0) {
            setTasks(remoteTasks);
            StorageService.saveTasks(remoteTasks);
          }
        }
      );
    } else {
      StorageService.syncFromFirestore().then((res) => {
        if (res) {
          setCourses(res.courses);
          setTasks(res.tasks);
        }
      });
    }
  }, []);

  // Keep detail modal synced when courses change
  useEffect(() => {
    if (selectedCourseForDetail) {
      const updated = courses.find((c) => c.id === selectedCourseForDetail.id);
      if (updated) {
        setSelectedCourseForDetail(updated);
      }
    }
  }, [courses]);

  // 1. Plus Button Actions (Exactly 3)
  const handleSelectPlusAction = (action: 'tugas' | 'materi' | 'presensi') => {
    if (action === 'tugas') {
      setTaskToEdit(null);
      setIsTaskFormOpen(true);
    } else if (action === 'materi') {
      setMateriCourseId(undefined);
      setIsTambahMateriOpen(true);
    } else if (action === 'presensi') {
      setActiveCourseIdForPresensi(undefined);
      setIsIsiPresensiOpen(true);
    }
  };

  // 2. Task Handlers (CRUD + Toggle)
  const handleToggleTask = (taskId: string) => {
    const updated = StorageService.toggleTask(taskId);
    setTasks(updated);
    const toggled = updated.find((t) => t.id === taskId);
    if (toggled) {
      SupabaseService.upsertTask(toggled);
    }
  };

  const handleSaveTask = (taskData: {
    namaTugas: string;
    mataKuliahId: string;
    deadline: string;
    deskripsi: string;
    id?: string;
  }) => {
    if (taskData.id) {
      // Edit task
      const course = courses.find((c) => c.id === taskData.mataKuliahId);
      const updated = StorageService.updateTask(taskData.id, {
        namaTugas: taskData.namaTugas,
        mataKuliahId: taskData.mataKuliahId,
        mataKuliahNama: course ? course.nama.toUpperCase() : 'MATA KULIAH',
        deadline: taskData.deadline,
        deskripsi: taskData.deskripsi,
      });
      setTasks(updated);
      const saved = updated.find((t) => t.id === taskData.id);
      if (saved) SupabaseService.upsertTask(saved);
      showToast('Tugas berhasil diperbarui');
    } else {
      // Add task
      const newTask = StorageService.addTask({
        namaTugas: taskData.namaTugas,
        mataKuliahId: taskData.mataKuliahId,
        deadline: taskData.deadline,
        deskripsi: taskData.deskripsi,
      });
      setTasks(StorageService.getTasks());
      SupabaseService.upsertTask(newTask);
      showToast('Tugas baru berhasil disimpan');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = StorageService.deleteTask(taskId);
    setTasks(updated);
    SupabaseService.deleteTask(taskId);
    showToast('Tugas berhasil dihapus');
  };

  // 3. Course Handlers (CRUD + Lecturer Periods)
  const handleSaveCourse = (
    courseData: Omit<Course, 'id' | 'materi' | 'riwayatPresensi' | 'riwayatDosen'> & { id?: string }
  ) => {
    if (courseData.id) {
      // Edit
      const updated = StorageService.updateCourse(courseData.id, courseData);
      setCourses(updated);
      const saved = updated.find((c) => c.id === courseData.id);
      if (saved) SupabaseService.upsertCourse(saved);
      showToast('Mata kuliah berhasil diperbarui');
    } else {
      // Add
      const newCourse = StorageService.addCourse(courseData);
      setCourses(StorageService.getCourses());
      SupabaseService.upsertCourse(newCourse);
      showToast('Mata kuliah baru berhasil ditambahkan');
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    const updated = StorageService.deleteCourse(courseId);
    setCourses(updated);
    setTasks(StorageService.getTasks());
    SupabaseService.deleteCourse(courseId);
    showToast('Mata kuliah berhasil dihapus');
  };

  const handleAddLecturerPeriod = (courseId: string, minggu: string, dosen: string) => {
    const updated = StorageService.addLecturerPeriod(courseId, minggu, dosen);
    setCourses(updated);
    showToast('Periode dosen baru ditambahkan');
  };

  // 4. Material Handlers
  const handleAddMaterial = (
    courseId: string,
    fileData: {
      nama: string;
      pertemuan: number;
      format: 'PDF' | 'PPT' | 'PPTX';
      ukuran: string;
      kategori: 'Materi' | 'Tugas' | 'Lainnya';
      lokasiPenyimpanan: string;
    }
  ) => {
    const updated = StorageService.addMaterial(courseId, fileData);
    setCourses(updated);
    showToast(`Berkas ${fileData.nama} berhasil diunggah`);
  };

  const handleDeleteMaterial = (courseId: string, materialId: string) => {
    const updated = StorageService.deleteMaterial(courseId, materialId);
    setCourses(updated);
    showToast('Berkas berhasil dihapus');
  };

  const handleDownloadMaterial = (material: MaterialFile) => {
    showToast(`Membuka / Mengunduh ${material.nama}`);
  };

  // 5. Attendance Handlers
  const handleSaveAttendance = (
    courseId: string,
    tanggal: string,
    status: AttendanceRecordStatus,
    topik?: string
  ) => {
    const updated = StorageService.recordAttendance(courseId, tanggal, status, topik);
    setCourses(updated);
    const crs = updated.find((c) => c.id === courseId);
    const rec = crs?.riwayatPresensi.find((r) => r.tanggal === tanggal);
    SupabaseService.saveAttendanceRecord(
      courseId,
      rec ? rec.mingguKe : 1,
      status,
      tanggal,
      topik
    );
    showToast('Presensi berhasil dicatat');
  };

  const handleStartNewWeek = () => {
    const updated = StorageService.startNewWeek();
    setCourses(updated);
    showToast('Minggu baru dimulai dengan status Belum Diisi');
  };

  // 6. User Profile Avatar & Data Handlers
  const handleSaveAvatar = (newAvatarUrl: string) => {
    const updated = { ...userProfile, avatarUrl: newAvatarUrl };
    setUserProfile(updated);
    StorageService.saveProfile(updated);
    showToast('Foto profil berhasil diubah');
  };

  const handleSaveStudentProfile = (updatedData: {
    nama: string;
    semester: number;
    prodi: string;
    bebanSks: number;
    ipk: number;
  }) => {
    const updated = {
      ...userProfile,
      ...updatedData,
    };
    setUserProfile(updated);
    StorageService.saveProfile(updated);
    showToast('Data semester & profil berhasil diperbarui');
  };

  // 7. Settings Update Handler
  const handleUpdateSettings = (newVals: Partial<AppSettings>) => {
    const updated = { ...settings, ...newVals };
    setSettings(updated);
    StorageService.saveSettings(updated);
    showToast('Pengaturan disimpan');
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#020617] flex justify-center selection:bg-[#BA3808] selection:text-white transition-colors">
      {/* Mobile-proportioned container matching Google Stitch Prototype */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#FDFCFB] dark:bg-[#0B1120] relative flex flex-col shadow-xl border-x border-slate-100 dark:border-slate-800/80">
        {/* Fixed Header */}
        <Header
          currentPage={currentPage}
          onOpenSettings={() => navigateTo('setting')}
          avatarUrl={userProfile.avatarUrl}
          onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
          darkMode={settings.darkMode}
          onToggleDarkMode={() => handleUpdateSettings({ darkMode: !settings.darkMode })}
        />

        {/* Main Content Area (EXACTLY 5 PAGES) */}
        <main className="flex-1 px-4 pt-3 pb-24 overflow-x-hidden">
          {/* 1. Home / Beranda */}
          {currentPage === 'home' && (
            <HomePage
              courses={courses}
              tasks={tasks}
              userProfile={userProfile}
              onNavigateToTugas={() => navigateTo('tugas')}
              onNavigateToAbsen={() => navigateTo('absen')}
              onOpenEditProfile={() => setIsEditProfileOpen(true)}
            />
          )}

          {/* 2. Absen */}
          {currentPage === 'absen' && (
            <AbsenPage
              courses={courses}
              activeSemester={settings.currentSemester}
              onOpenAttendanceModal={(course) => {
                setActiveCourseIdForPresensi(course.id);
                setIsIsiPresensiOpen(true);
              }}
              onOpenCourseDetail={(c) => setSelectedCourseForDetail(c)}
              onStartNewWeek={handleStartNewWeek}
            />
          )}

          {/* 3. Tugas */}
          {currentPage === 'tugas' && (
            <TugasPage
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onOpenCreateTask={() => {
                setTaskToEdit(null);
                setIsTaskFormOpen(true);
              }}
              onEditTask={(task) => {
                setTaskToEdit(task);
                setIsTaskFormOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {/* 4. Mata Kuliah */}
          {currentPage === 'matakuliah' && (
            <MataKuliahPage
              courses={courses}
              activeSemester={settings.currentSemester}
              onSelectCourse={(c) => setSelectedCourseForDetail(c)}
              onOpenAddCourse={() => {
                setCourseToEdit(null);
                setIsCourseFormOpen(true);
              }}
              onDownloadMaterial={handleDownloadMaterial}
            />
          )}

          {/* 5. Setting */}
          {currentPage === 'setting' && (
            <SettingPage
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onToggleDarkMode={() =>
                handleUpdateSettings({ darkMode: !settings.darkMode })
              }
            />
          )}
        </main>

        {/* Fixed Bottom Navbar (Home | Absen | + | Tugas | Mata Kuliah) */}
        <BottomNavbar
          currentPage={currentPage}
          onNavigate={(page) => navigateTo(page)}
          onOpenPlusMenu={() => setIsPlusMenuOpen(true)}
        />

        {/* Plus Menu Modal (3 Actions) */}
        <PlusActionModal
          isOpen={isPlusMenuOpen}
          onClose={() => setIsPlusMenuOpen(false)}
          onSelectAction={handleSelectPlusAction}
        />

        {/* Task Form Modal (Add / Edit) */}
        <TaskFormModal
          isOpen={isTaskFormOpen}
          onClose={() => {
            setIsTaskFormOpen(false);
            setTaskToEdit(null);
          }}
          courses={courses}
          taskToEdit={taskToEdit}
          onSave={handleSaveTask}
        />

        {/* Course Form Modal (Add / Edit) */}
        <CourseFormModal
          isOpen={isCourseFormOpen}
          onClose={() => {
            setIsCourseFormOpen(false);
            setCourseToEdit(null);
          }}
          courseToEdit={courseToEdit}
          currentSemesterNumber={userProfile.semester}
          onSave={handleSaveCourse}
        />

        {/* Material Upload Modal */}
        <TambahMateriModal
          isOpen={isTambahMateriOpen}
          onClose={() => {
            setIsTambahMateriOpen(false);
            setMateriCourseId(undefined);
          }}
          courses={courses}
          initialCourseId={materiCourseId}
          onAddMaterial={handleAddMaterial}
        />

        {/* Attendance Modal (Hadir, Tidak Hadir, Tidak Ada Perkuliahan) */}
        <IsiPresensiModal
          isOpen={isIsiPresensiOpen}
          onClose={() => {
            setIsIsiPresensiOpen(false);
            setActiveCourseIdForPresensi(undefined);
          }}
          courses={courses}
          initialCourseId={activeCourseIdForPresensi}
          onSaveAttendance={handleSaveAttendance}
        />

        {/* Course Detail Modal (Information, DPJ, Lecturer History, Files, GDrive, Attendance) */}
        <CourseDetailModal
          course={selectedCourseForDetail}
          onClose={() => setSelectedCourseForDetail(null)}
          onEditCourse={(c) => {
            setCourseToEdit(c);
            setIsCourseFormOpen(true);
          }}
          onDeleteCourse={handleDeleteCourse}
          onAddLecturerPeriod={handleAddLecturerPeriod}
          onOpenAddMaterial={(cId) => {
            setMateriCourseId(cId);
            setIsTambahMateriOpen(true);
          }}
          onDownloadMaterial={handleDownloadMaterial}
          onDeleteMaterial={handleDeleteMaterial}
        />

        {/* User Profile Avatar Modal */}
        <ProfileAvatarModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          currentAvatar={userProfile.avatarUrl}
          onSaveAvatar={handleSaveAvatar}
        />

        {/* Edit Student Profile & Semester Modal */}
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          userProfile={userProfile}
          onSave={handleSaveStudentProfile}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900/95 text-white dark:bg-white/95 dark:text-slate-900 text-xs font-semibold shadow-lg backdrop-blur-xs transition-opacity animate-in fade-in">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
