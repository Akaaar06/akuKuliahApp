import React from 'react';
import { Course, Task } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Bell,
  Check,
  ChevronRight,
  Hourglass,
  CalendarDays,
  FileCheck,
  User,
  Pencil,
} from 'lucide-react';
import { bandingkanDeadline, formatTanggal } from '../utils/date';

interface HomePageProps {
  courses: Course[];
  tasks: Task[];
  userProfile: {
    nama: string;
    semester: number;
    prodi: string;
    bebanSks: number;
    ipk: number;
    tanggal: string;
    status: string;
  };
  onNavigateToTugas: () => void;
  onNavigateToAbsen: () => void;
  onOpenEditProfile?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  courses,
  tasks,
  userProfile,
  onNavigateToTugas,
  onNavigateToAbsen,
  onOpenEditProfile,
}) => {
  // Format dynamic real current date (pakai utilitas tanggal terpusat)
  const todayFormatted = formatTanggal(new Date());

  // 1. Dynamic Attendance Calculation from real course database
  let totalAttended = 0;
  let totalActualSessions = 0;

  courses.forEach((c) => {
    (c.riwayatPresensi || []).forEach((r) => {
      if (r.status === 'hadir') {
        totalAttended++;
        totalActualSessions++;
      } else if (r.status === 'tidak-hadir') {
        totalActualSessions++;
      }
      // 'libur' & 'belum' are not counted in actual completed sessions
    });
  });

  const attendancePercent =
    totalActualSessions > 0
      ? Math.round((totalAttended / totalActualSessions) * 100)
      : 100;

  // 2. Dynamic Unfinished Tasks & Urgent Tasks sorted by nearest deadline
  const unfinishedTasks = tasks.filter((t) => !t.selesai);
  const urgentTasks = [...unfinishedTasks].sort((a, b) =>
    bandingkanDeadline(a.deadline, b.deadline)
  );

  // Calculate total SKS from active semester courses
  const totalSemesterSks = courses.reduce((sum, c) => sum + (c.sks || 0), 0);
  const displaySks = totalSemesterSks > 0 ? totalSemesterSks : (userProfile.bebanSks || 24);

  return (
    <div className="space-y-4 pb-4">
      {/* 1. Student Profile Banner Card (Solid Rust Orange) */}
      <div className="bg-[#BA3808] dark:bg-[#9B2F00] text-white rounded-2xl p-4 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-black/20 text-white/95 text-[11px] font-medium px-2.5 py-1 rounded-md">
            <Calendar className="w-3.5 h-3.5 stroke-[2]" />
            <span>{todayFormatted}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white text-[#BA3808] text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-2xs">
              {userProfile.status}
            </span>
            {onOpenEditProfile && (
              <button
                onClick={onOpenEditProfile}
                title="Ubah Semester & Data Mahasiswa"
                className="p-1 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center gap-1 text-[11px]"
              >
                <Pencil className="w-3 h-3" />
                <span className="text-[10px]">Ubah</span>
              </button>
            )}
          </div>
        </div>

        <div>
          <h1 className="font-bold text-xl tracking-tight text-white">
            {userProfile.nama}
          </h1>
          <p className="text-xs text-white/85 font-medium mt-0.5">
            Semester {userProfile.semester} • {userProfile.prodi}
          </p>
        </div>

        {/* 3-Column Stats Grid */}
        <div
          onClick={onOpenEditProfile}
          className={`bg-black/20 rounded-xl p-3 grid grid-cols-3 text-center divide-x divide-white/15 ${
            onOpenEditProfile ? 'cursor-pointer hover:bg-black/25 transition-colors' : ''
          }`}
          title="Klik untuk mengubah semester, SKS, atau IPK"
        >
          <div className="px-1">
            <span className="block text-[10px] text-white/75 font-medium">Semester</span>
            <span className="font-bold text-base text-white">{userProfile.semester}</span>
          </div>
          <div className="px-1">
            <span className="block text-[10px] text-white/75 font-medium">Beban SKS</span>
            <span className="font-bold text-base text-white">{displaySks} SKS</span>
          </div>
          <div className="px-1">
            <span className="block text-[10px] text-white/75 font-medium">IPK</span>
            <span className="font-bold text-base text-white">{Number(userProfile.ipk || 3.61).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 2. Two Summary Cards Side by Side (Dynamic from Database) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Attendance Summary Card */}
        <div
          onClick={onNavigateToAbsen}
          className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer hover:border-[#BA3808]/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-[#BA3808] flex items-center justify-center">
              <FileCheck className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="bg-[#BA3808] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              {attendancePercent}%
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-xl text-slate-900 dark:text-white">
                {totalAttended}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {totalActualSessions} Sesi
              </span>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-[#BA3808] rounded-full"
                style={{ width: `${Math.min(attendancePercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Task Summary Card */}
        <div
          onClick={onNavigateToTugas}
          className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer hover:border-[#BA3808]/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-[#BA3808] flex items-center justify-center">
              <CalendarDays className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="bg-[#BA3808] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              {unfinishedTasks.length} Aktif
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-xl text-slate-900 dark:text-white">
                {unfinishedTasks.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">Tugas</span>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-[#BA3808] rounded-full"
                style={{
                  width: `${Math.min((unfinishedTasks.length / (tasks.length || 1)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tugas Mendesak (Tugas yang deadline-nya paling dekat) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
            <Bell className="w-4 h-4 text-[#BA3808] stroke-[2.2]" />
            <span>Tugas Mendesak</span>
          </div>
          <button
            onClick={onNavigateToTugas}
            className="text-[11px] font-semibold text-[#BA3808] dark:text-[#ff8a65] flex items-center hover:underline"
          >
            Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {urgentTasks.slice(0, 2).map((t) => (
            <div
              key={t.id}
              onClick={onNavigateToTugas}
              className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer hover:border-[#BA3808]/40 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-[#BA3808] uppercase">
                  {t.mataKuliahNama}
                </span>
                {t.badgeDeadline ? (
                  <span className="flex items-center gap-1 bg-[#BA3808] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3 stroke-[2.2]" />
                    {t.badgeDeadline}
                  </span>
                ) : (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {t.deadlineDisplay}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                {t.namaTugas}
              </h3>
              <div className="flex items-center justify-between pt-1 border-t border-slate-50 dark:border-slate-800/60 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-[#BA3808]">
                  <Clock className="w-3.5 h-3.5 stroke-[2]" /> {t.deadlineDisplay}
                </span>
                {t.reminders && t.reminders.length > 0 && (
                  <span className="text-[10px] font-medium text-slate-400">
                    {t.reminders[0]}
                  </span>
                )}
              </div>
            </div>
          ))}

          {urgentTasks.length === 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
              Tidak ada tugas yang menunggu penyelesaian.
            </div>
          )}
        </div>
      </div>

      {/* 4. Daftar Mata Kuliah Semester Aktif (NO QR, NO Lecturer Photo Avatar) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
            <Clock className="w-4 h-4 text-[#BA3808] stroke-[2.2]" />
            <span>Mata Kuliah Semester Ini</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {courses.length} Kuliah
          </span>
        </div>

        <div className="space-y-2.5">
          {courses.slice(0, 3).map((c) => {
            const lastAttendance =
              c.riwayatPresensi && c.riwayatPresensi.length > 0
                ? c.riwayatPresensi[c.riwayatPresensi.length - 1].status
                : 'belum';

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#BA3808] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded">
                      {c.kode}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {c.sks} SKS
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      lastAttendance === 'hadir'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#16A34A]'
                        : lastAttendance === 'tidak-hadir'
                        ? 'bg-red-50 dark:bg-red-950/40 text-[#DC2626]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {lastAttendance === 'hadir'
                      ? 'Hadir'
                      : lastAttendance === 'tidak-hadir'
                      ? 'Tidak Hadir'
                      : lastAttendance === 'libur'
                      ? 'Tidak Ada Perkuliahan'
                      : 'Belum Presensi'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {c.nama}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3 stroke-[2]" />
                    <span>{c.ruang}</span>
                  </div>
                </div>

                {/* Lecturer without photo avatar - clean typography & initials */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/60 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-medium">{c.dosenPengampu}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {c.jam}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
