import React, { useState } from 'react';
import { Course, MaterialFile } from '../types';
import {
  Cloud,
  User,
  Shield,
  CheckCircle2,
  ChevronRight,
  LayoutGrid,
  FileText,
  Download,
  Plus,
} from 'lucide-react';
import { calculateAttendancePercentage } from '../services/storage';

interface MataKuliahPageProps {
  courses: Course[];
  activeSemester: string;
  onSelectCourse: (course: Course) => void;
  onOpenAddCourse: () => void;
  onDownloadMaterial: (material: MaterialFile) => void;
}

export const MataKuliahPage: React.FC<MataKuliahPageProps> = ({
  courses,
  activeSemester,
  onSelectCourse,
  onOpenAddCourse,
  onDownloadMaterial,
}) => {
  const [activeTab, setActiveTab] = useState<'daftar' | 'berkas'>('daftar');

  // Total SKS from courses
  const totalSks = courses.reduce((sum, c) => sum + (c.sks || 0), 0);

  return (
    <div className="space-y-3.5 pb-4">
      {/* 1. Header & Title with Add Course button */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-[#BA3808] uppercase tracking-wider block">
          {activeSemester.toUpperCase()}
        </span>
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-xl text-slate-900 dark:text-white">
            Mata Kuliah
          </h1>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-orange-50 dark:bg-orange-950/40 border border-[#BA3808]/20 text-[#BA3808] text-xs font-bold px-2 py-0.5 rounded-md">
              {totalSks} SKS
            </span>
            <button
              onClick={onOpenAddCourse}
              className="flex items-center gap-1 bg-[#BA3808] hover:bg-[#9B2F00] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Segmented Control: Daftar Kuliah vs Detail & Berkas */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          onClick={() => setActiveTab('daftar')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'daftar'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Daftar Kuliah</span>
        </button>

        <button
          onClick={() => setActiveTab('berkas')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'berkas'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Detail & Berkas</span>
        </button>
      </div>

      {/* 3. Tab: Daftar Kuliah */}
      {activeTab === 'daftar' ? (
        <div className="space-y-3">
          {courses.map((course) => {
            const { persen } = calculateAttendancePercentage(course);
            const isPerfect = persen >= 100;

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3 hover:border-[#BA3808]/40 transition-colors"
              >
                {/* Badges + Cloud GDrive icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#BA3808] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded">
                      {course.kode}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {course.sks} SKS
                    </span>
                  </div>

                  <a
                    href={course.linkGDrive || '#'}
                    target="_blank"
                    rel="noreferrer"
                    title="Buka Google Drive"
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-[#BA3808] hover:bg-orange-50 transition-colors"
                  >
                    <Cloud className="w-4 h-4 stroke-[2]" />
                  </a>
                </div>

                {/* Course Name */}
                <h3
                  onClick={() => onSelectCourse(course)}
                  className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer hover:text-[#BA3808] transition-colors"
                >
                  {course.nama}
                </h3>

                {/* DOSEN & DPJ Two Columns */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-start gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">
                        DOSEN
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px] leading-tight block">
                        {course.dosenPengampu}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">
                        DPJ
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px] leading-tight block">
                        {course.dpj}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer: Kehadiran + Action */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-50 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Kehadiran {persen}%</span>
                  </div>

                  <button
                    onClick={() => onSelectCourse(course)}
                    className="font-semibold text-[#BA3808] dark:text-[#ff8a65] text-xs flex items-center gap-1 hover:underline"
                  >
                    {isPerfect ? 'Sempurna' : 'Kelola'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {courses.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              Belum ada mata kuliah terdaftar pada semester ini.
            </div>
          )}
        </div>
      ) : (
        /* Tab: Detail & Berkas Materi */
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Repositori Berkas Mata Kuliah
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                PDF • PPT • PPTX
              </span>
            </div>

            <div className="space-y-2">
              {courses.flatMap((c) =>
                (c.materi || []).map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-2"
                  >
                    <div className="truncate">
                      <span className="text-[9px] font-bold text-[#BA3808] uppercase tracking-wider block">
                        {c.nama}
                      </span>
                      <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate mt-0.5">
                        {m.nama}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>P{m.pertemuan}</span>
                        <span>•</span>
                        <span>{m.format}</span>
                        <span>•</span>
                        <span>{m.ukuran}</span>
                        {m.kategori && (
                          <span className="bg-orange-50 text-[#BA3808] px-1 rounded text-[9px] font-medium">
                            {m.kategori}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onDownloadMaterial(m)}
                        className="p-2 rounded-lg bg-white dark:bg-slate-700 text-[#BA3808] hover:bg-orange-50 border border-slate-200 dark:border-slate-600 shadow-2xs"
                        title="Unduh / Buka Berkas"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {courses.flatMap((c) => c.materi).length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  Belum ada berkas materi tersimpan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
