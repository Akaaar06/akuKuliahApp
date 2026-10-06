import React from 'react';
import { X, ClipboardPlus, FileUp, QrCode } from 'lucide-react';

interface PlusActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'tugas' | 'materi' | 'presensi') => void;
}

export const PlusActionModal: React.FC<PlusActionModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 z-10 transition-transform">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
            Aksi Cepat
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Exactly 3 actions */}
        <div className="py-3 space-y-2">
          {/* 1. Tambah Tugas */}
          <button
            onClick={() => {
              onClose();
              onSelectAction('tugas');
            }}
            className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-[#C2410C]/40 bg-white/60 dark:bg-slate-800/60 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#C2410C] flex items-center justify-center shrink-0">
              <ClipboardPlus className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-[#C2410C]">
                Tambah Tugas
              </div>
              <div className="text-[11px] text-slate-400">
                Catat tugas baru & atur pengingat
              </div>
            </div>
          </button>

          {/* 2. Tambah Materi */}
          <button
            onClick={() => {
              onClose();
              onSelectAction('materi');
            }}
            className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-[#C2410C]/40 bg-white/60 dark:bg-slate-800/60 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#C2410C] flex items-center justify-center shrink-0">
              <FileUp className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-[#C2410C]">
                Tambah Materi
              </div>
              <div className="text-[11px] text-slate-400">
                Unggah slide PDF/PPTX perkuliahan
              </div>
            </div>
          </button>

          {/* 3. Isi Presensi */}
          <button
            onClick={() => {
              onClose();
              onSelectAction('presensi');
            }}
            className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-[#C2410C]/40 bg-white/60 dark:bg-slate-800/60 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#C2410C] flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-[#C2410C]">
                Isi Presensi
              </div>
              <div className="text-[11px] text-slate-400">
                Konfirmasi kehadiran perkuliahan
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
