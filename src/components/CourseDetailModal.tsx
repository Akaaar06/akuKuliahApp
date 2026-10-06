import React, { useState } from 'react';
import { Course, MaterialFile } from '../types';
import {
  X,
  ExternalLink,
  FileText,
  Download,
  Calendar,
  User,
  Shield,
  History,
  FolderDown,
  Plus,
  Edit2,
  Trash2,
  PlusCircle,
  Tag,
  Check,
} from 'lucide-react';
import { calculateAttendancePercentage } from '../services/storage';

interface CourseDetailModalProps {
  course: Course | null;
  onClose: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onOpenAddMaterial: (courseId: string) => void;
  onDownloadMaterial: (material: MaterialFile) => void;
  onDeleteMaterial: (courseId: string, materialId: string) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  onClose,
  onEditCourse,
  onDeleteCourse,
  onOpenAddMaterial,
  onDownloadMaterial,
  onDeleteMaterial,
}) => {
  if (!course) return null;

  const { hadir, totalActual, persen } = calculateAttendancePercentage(course);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-[430px] max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header with Title and Edit/Delete Actions */}
        <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#BA3808] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded">
                {course.kode} • {course.sks} SKS
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-200/60 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                Sem {course.semester}
              </span>
            </div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
              {course.nama}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onClose();
                onEditCourse(course);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#BA3808] hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors"
              title="Edit Mata Kuliah"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Hapus mata kuliah "${course.nama}"?`)) {
                  onDeleteCourse(course.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
              title="Hapus Mata Kuliah"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* 1. Dosen Pengampu & DPJ (Displayed Separately) */}
          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-[#BA3808] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Dosen Pengampu Saat Ini
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {course.dosenPengampu}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Dosen Penanggung Jawab (DPJ)
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {course.dpj}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Link Google Drive */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Penyimpanan Google Drive
            </span>
            <a
              href={course.linkGDrive || '#'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-orange-50/40 dark:bg-orange-950/20 text-[#BA3808] dark:text-[#ff8a65] font-semibold hover:bg-orange-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FolderDown className="w-4 h-4" />
                <span>Buka Folder GDrive Kuliah</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 4. Materi / File (PDF, PPT, PPTX with Category & Storage location) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Materi & Berkas ({course.materi.length})
              </span>
              <button
                onClick={() => onOpenAddMaterial(course.id)}
                className="text-[11px] font-semibold text-[#BA3808] dark:text-[#ff8a65] flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Berkas
              </button>
            </div>

            <div className="space-y-2">
              {course.materi.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-[#BA3808] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {m.nama}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>P{m.pertemuan}</span>
                        <span>•</span>
                        <span>{m.format}</span>
                        <span>•</span>
                        <span>{m.ukuran}</span>
                        {m.kategori && (
                          <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded text-[9px]">
                            {m.kategori}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onDownloadMaterial(m)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      title="Unduh / Buka berkas"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteMaterial(course.id, m.id)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-600 text-slate-400"
                      title="Hapus berkas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {course.materi.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  Belum ada berkas materi untuk mata kuliah ini.
                </div>
              )}
            </div>
          </div>

          {/* 5. Riwayat Presensi & Persentase Kehadiran */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Riwayat Presensi
              </span>
              <span className="font-bold text-xs text-[#BA3808]">
                {persen}% ({hadir}/{totalActual} Sesi)
              </span>
            </div>

            <div className="rounded-xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 max-h-48 overflow-y-auto">
              {(course.riwayatPresensi || []).map((r, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {r.tanggal}
                    </span>
                    {r.topik && (
                      <span className="text-[10px] text-slate-400 block">{r.topik}</span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      r.status === 'hadir'
                        ? 'bg-emerald-50 text-[#16A34A]'
                        : r.status === 'tidak-hadir'
                        ? 'bg-red-50 text-[#DC2626]'
                        : r.status === 'libur'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {r.status === 'hadir'
                      ? 'Hadir'
                      : r.status === 'tidak-hadir'
                      ? 'Tidak Hadir'
                      : r.status === 'libur'
                      ? 'Tidak Ada Perkuliahan'
                      : 'Belum Diisi'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
