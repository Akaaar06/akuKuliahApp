import React, { useState } from 'react';
import { AppSettings } from '../types';
import {
  Moon,
  Sun,
  Bell,
  Calendar,
  VolumeX,
  Info,
  Check,
  Database,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { SupabaseService, isSupabaseConfigured } from '../services/supabase';

interface SettingPageProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onToggleDarkMode: () => void;
}

export const SettingPage: React.FC<SettingPageProps> = ({
  settings,
  onUpdateSettings,
  onToggleDarkMode,
}) => {
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem('akukuliah_supabase_url') || '' : '')
  );
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem('akukuliah_supabase_key') || '' : '')
  );
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<string | null>(null);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      SupabaseService.clearCredentials();
      setSupabaseStatusMsg('Koneksi Supabase direset ke penyimpanan lokal.');
      return;
    }
    SupabaseService.setCredentials(supabaseUrlInput.trim(), supabaseKeyInput.trim());
  };
  return (
    <div className="space-y-4 pb-4">
      {/* Title Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-1">
        <h1 className="font-bold text-lg text-slate-900 dark:text-white">
          Pengaturan Aplikasi
        </h1>
        <p className="text-xs text-slate-400">
          Preferensi tampilan, notifikasi, dan semester aktif.
        </p>
      </div>

      {/* 1. Appearance / Theme */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
        <span className="text-[10px] font-bold text-[#BA3808] uppercase tracking-wider block">
          TAMPILAN
        </span>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#BA3808] flex items-center justify-center">
              {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 block">
                Mode Gelap (Dark Mode)
              </span>
              <span className="text-[11px] text-slate-400">
                {settings.darkMode ? 'Aktif' : 'Nonaktif (Terang)'}
              </span>
            </div>
          </div>

          <button
            onClick={onToggleDarkMode}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.darkMode ? 'bg-[#BA3808] justify-end' : 'bg-slate-200 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
          </button>
        </div>
      </div>

      {/* 2. Current Semester Selection */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
        <span className="text-[10px] font-bold text-[#BA3808] uppercase tracking-wider block">
          SEMESTER AKTIF
        </span>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#BA3808] flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <select
            value={settings.currentSemester}
            onChange={(e) => onUpdateSettings({ currentSemester: e.target.value })}
            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#BA3808]"
          >
            <option value="Semester Ganjil 2024/2025">Semester 3 (Ganjil 2024/2025) - Aktif</option>
            <option value="Semester Genap 2023/2024">Semester 2 (Genap 2023/2024)</option>
            <option value="Semester Ganjil 2023/2024">Semester 1 (Ganjil 2023/2024)</option>
            <option value="Semester Genap 2024/2025">Semester 4 (Genap 2024/2025)</option>
            <option value="Semester Ganjil 2025/2026">Semester 5 (Ganjil 2025/2026)</option>
          </select>
        </div>
      </div>

      {/* 3. Notification & Reminder Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
        <span className="text-[10px] font-bold text-[#BA3808] uppercase tracking-wider block">
          NOTIFIKASI & PENGINGAT
        </span>

        {/* Global Deadline Notification */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#BA3808] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 block">
                Notifikasi Tenggat Tugas
              </span>
              <span className="text-[11px] text-slate-400">
                Peringatan dini sebelum batas pengumpulan
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              onUpdateSettings({ notifikasiDeadline: !settings.notifikasiDeadline })
            }
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.notifikasiDeadline ? 'bg-[#BA3808] justify-end' : 'bg-slate-200 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
          </button>
        </div>

        {/* Reminder Points Checklist */}
        <div className="space-y-2 pt-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
            Jadwal Pengingat Tugas Otomatis:
          </span>

          {[
            { key: 'tujuhHari', label: '7 Hari Sebelum Tenggat' },
            { key: 'limaHari', label: '5 Hari Sebelum Tenggat' },
            { key: 'tigaHari', label: '3 Hari Sebelum Tenggat' },
            { key: 'satuHari', label: '1 Hari Sebelum Tenggat' },
          ].map((item) => {
            const isChecked = settings.reminderPoints[item.key as keyof typeof settings.reminderPoints];
            return (
              <label
                key={item.key}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer"
              >
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {item.label}
                </span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    onUpdateSettings({
                      reminderPoints: {
                        ...settings.reminderPoints,
                        [item.key]: e.target.checked,
                      },
                    })
                  }
                  className="accent-[#BA3808] w-4 h-4"
                />
              </label>
            );
          })}
        </div>

        {/* Auto Silent Mode */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#BA3808] flex items-center justify-center">
              <VolumeX className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 block">
                Mode Senyap Saat Kuliah
              </span>
              <span className="text-[11px] text-slate-400">
                Otomatis heningkan perangkat sesuai jam kuliah
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              onUpdateSettings({ autoSilentKuliah: !settings.autoSilentKuliah })
            }
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.autoSilentKuliah ? 'bg-[#BA3808] justify-end' : 'bg-slate-200 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
          </button>
        </div>
      </div>

      {/* 4. PWA Installation Section */}
      <PWAInstallButton />

      {/* 5. Supabase Database Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            DATABASE SUPABASE (POSTGRESQL)
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isSupabaseConfigured
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {isSupabaseConfigured ? 'Terhubung' : 'Penyimpanan Lokal'}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Tabel Supabase dibuat dengan skrip <code className="text-[#C2410C] font-mono bg-orange-50 dark:bg-orange-950/40 px-1 py-0.5 rounded">supabase_schema.sql</code> di menu SQL Editor Supabase.
        </p>

        <form onSubmit={handleSaveSupabase} className="space-y-2.5 pt-1">
          <div>
            <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrlInput}
              onChange={(e) => setSupabaseUrlInput(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Anon Public Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={supabaseKeyInput}
              onChange={(e) => setSupabaseKeyInput(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {supabaseStatusMsg && (
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg">
              {supabaseStatusMsg}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
            >
              Simpan & Hubungkan
            </button>
            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={() => {
                  SupabaseService.clearCredentials();
                }}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
              >
                Putuskan
              </button>
            )}
          </div>
        </form>
      </div>

      {/* App Info */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <Info className="w-4 h-4" />
          <span>akuKuliah Mobile Engine</span>
        </div>
        <span className="font-mono text-slate-400 font-medium">v2.4.0</span>
      </div>
    </div>
  );
};
