import React from 'react';
import { PageType } from '../types';
import { GraduationCap, Settings, Sun, Moon } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentPage: PageType;
  onOpenSettings: () => void;
  avatarUrl: string;
  onOpenAvatarModal?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onOpenSettings,
  avatarUrl,
  onOpenAvatarModal,
  darkMode,
  onToggleDarkMode,
}) => {
  const getSubtitle = () => {
    switch (currentPage) {
      case 'home':
        return 'Beranda';
      case 'absen':
        return 'Absen';
      case 'tugas':
        return 'Daftar Tugas';
      case 'matakuliah':
        return 'Mata Kuliah';
      case 'setting':
        return 'Pengaturan';
      default:
        return 'Beranda';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
      {/* Top-left: Brand and page subtitle */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm shrink-0">
          <GraduationCap className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="leading-tight">
          <div className="font-bold text-[17px] text-[#C2410C] dark:text-[#ff8a65] tracking-tight">
            akuKuliah
          </div>
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {getSubtitle()}
          </div>
        </div>
      </div>

      {/* Top-right: Theme Toggle, Settings icon & Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <PWAInstallButton compact />

        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            aria-label="Toggle Dark Mode"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#C2410C] dark:hover:text-[#ff8a65] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5 stroke-[2] text-amber-500" /> : <Moon className="w-5 h-5 stroke-[1.8]" />}
          </button>
        )}

        <button
          onClick={onOpenSettings}
          title="Pengaturan"
          aria-label="Pengaturan"
          className={`p-2 rounded-xl transition-colors ${
            currentPage === 'setting'
              ? 'text-[#C2410C] bg-orange-50 dark:bg-orange-950/40'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          onClick={onOpenAvatarModal}
          title="Ubah Foto Profil Saya"
          className="relative group rounded-full focus:outline-none"
        >
          <img
            src={avatarUrl}
            alt="Foto Profilku"
            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs group-hover:ring-2 group-hover:ring-[#C2410C] transition-all"
          />
        </button>
      </div>
    </header>
  );
};
