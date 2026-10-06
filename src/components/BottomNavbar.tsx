import React from 'react';
import { PageType } from '../types';
import { Home, CalendarCheck, Plus, ClipboardList, GraduationCap } from 'lucide-react';

interface BottomNavbarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onOpenPlusMenu: () => void;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenPlusMenu,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 px-3 py-1.5 flex items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      {/* 1. Home / Beranda */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          currentPage === 'home'
            ? 'text-[#C2410C] dark:text-[#ff8a65]'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        <Home className="w-5 h-5 stroke-[1.8]" />
        <span className="text-[10px] font-medium mt-1">Beranda</span>
      </button>

      {/* 2. Absen */}
      <button
        onClick={() => onNavigate('absen')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          currentPage === 'absen'
            ? 'text-[#C2410C] dark:text-[#ff8a65]'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        <CalendarCheck className="w-5 h-5 stroke-[1.8]" />
        <span className="text-[10px] font-medium mt-1">Absen</span>
      </button>

      {/* 3. Central Plus Action Button */}
      <div className="flex flex-col items-center justify-center flex-1 -mt-5">
        <button
          onClick={onOpenPlusMenu}
          aria-label="Aksi Tambah"
          className="w-12 h-12 rounded-full bg-[#C2410C] hover:bg-[#9A3412] text-white flex items-center justify-center shadow-md border-4 border-white dark:border-slate-900 transition-transform active:scale-95"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* 4. Tugas */}
      <button
        onClick={() => onNavigate('tugas')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          currentPage === 'tugas'
            ? 'text-[#C2410C] dark:text-[#ff8a65]'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        <ClipboardList className="w-5 h-5 stroke-[1.8]" />
        <span className="text-[10px] font-medium mt-1">Tugas</span>
      </button>

      {/* 5. Mata Kuliah */}
      <button
        onClick={() => onNavigate('matakuliah')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          currentPage === 'matakuliah'
            ? 'text-[#C2410C] dark:text-[#ff8a65]'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        <GraduationCap className="w-5 h-5 stroke-[1.8]" />
        <span className="text-[10px] font-medium mt-1">Mata Kuliah</span>
      </button>
    </nav>
  );
};
