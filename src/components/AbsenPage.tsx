import React from 'react';
import { Course, AttendanceRecordStatus } from '../types';
import {
  Check,
  X,
  Minus,
  Ban,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { calculateAttendancePercentage } from '../services/storage';

interface AbsenPageProps {
  courses: Course[];
  activeSemester: string;
  onOpenAttendanceModal: (course: Course) => void;
  onOpenCourseDetail: (course: Course) => void;
  onStartNewWeek: () => void;
}

export const AbsenPage: React.FC<AbsenPageProps> = ({
  courses,
  activeSemester,
  onOpenAttendanceModal,
  onOpenCourseDetail,
  onStartNewWeek,
}) => {
  return (
    <div className="space-y-4 pb-4">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#BA3808] uppercase tracking-wider">
            {activeSemester.toUpperCase()}
          </span>
          <button
            onClick={onStartNewWeek}
            className="flex items-center gap-1 text-[10px] font-semibold text-[#BA3808] hover:text-[#9B2F00] bg-orange-50 dark:bg-orange-950/40 px-2 py-1 rounded-md transition-colors"
            title="Mulai minggu baru dengan status Belum Diisi"
          >
            <PlusCircle className="w-3 h-3" />
            <span>+ Minggu Baru</span>
          </button>
        </div>

        <h1 className="font-bold text-lg text-slate-900 dark:text-white">
          Presensi Mahasiswa
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Klik mata kuliah untuk mencatat kehadiran periode aktif.
        </p>

        {/* Status Legend */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#16A34A] rounded-xs" />
            <span>Hadir</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#DC2626] rounded-xs" />
            <span>Tidak Hadir</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#94A3B8] rounded-xs" />
            <span>Belum Diisi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#64748B] rounded-xs" />
            <span>Tidak Ada Kuliah</span>
          </div>
        </div>
      </div>

      {/* Course Attendance List */}
      <div className="space-y-3">
        {courses.map((course) => {
          const { hadir, totalActual, persen } = calculateAttendancePercentage(course);
          const isWarning = persen < 75;

          // Current active session record (the latest recorded week/date)
          const records = course.riwayatPresensi || [];
          const currentRecord = records.length > 0 ? records[records.length - 1] : null;
          const currentStatus: AttendanceRecordStatus = currentRecord
            ? currentRecord.status
            : 'belum';
          const currentDate = currentRecord ? currentRecord.tanggal : '24 Okt 2024';

          return (
            <div
              key={course.id}
              onClick={() => onOpenAttendanceModal(course)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3 cursor-pointer hover:border-[#BA3808]/40 transition-colors"
            >
              {/* Top Row: Code, SKS, Percentage */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#BA3808] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded">
                    {course.kode}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {course.sks} SKS
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isWarning ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#DC2626] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3" />
                      {persen}%
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      {persen}%
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({hadir}/{totalActual} Sesi)
                  </span>
                </div>
              </div>

              {/* Title & Lecturer */}
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {course.nama}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dosen: <span className="font-medium text-slate-700 dark:text-slate-300">{course.dosenPengampu}</span>
                </div>
              </div>

              {/* Current Active Week Status Pill */}
              <div className="pt-2 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Periode Aktif: {currentDate}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded mt-0.5 ${
                      currentStatus === 'hadir'
                        ? 'bg-[#16A34A] text-white'
                        : currentStatus === 'tidak-hadir'
                        ? 'bg-[#DC2626] text-white'
                        : currentStatus === 'libur'
                        ? 'bg-[#64748B] text-white'
                        : 'bg-[#94A3B8] text-white'
                    }`}
                  >
                    {currentStatus === 'hadir' && <Check className="w-3 h-3 stroke-[3]" />}
                    {currentStatus === 'tidak-hadir' && <X className="w-3 h-3 stroke-[3]" />}
                    {currentStatus === 'belum' && <Minus className="w-3 h-3 stroke-[3]" />}
                    {currentStatus === 'libur' && <Ban className="w-3 h-3 stroke-[2]" />}
                    <span>
                      {currentStatus === 'hadir'
                        ? 'Hadir'
                        : currentStatus === 'tidak-hadir'
                        ? 'Tidak Hadir'
                        : currentStatus === 'libur'
                        ? 'Tidak Ada Perkuliahan'
                        : 'Belum Diisi'}
                    </span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCourseDetail(course);
                  }}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium text-xs"
                >
                  Riwayat <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {courses.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            Tidak ada mata kuliah pada semester ini.
          </div>
        )}
      </div>
    </div>
  );
};
