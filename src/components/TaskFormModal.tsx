import React, { useState, useEffect } from 'react';
import { Course, Task } from '../types';
import { X, Check, Bell } from 'lucide-react';
import { calculateReminders } from '../services/storage';
import {
  dateKey,
  formatWaktu,
  gabungTanggalWaktu,
  splitTanggalWaktuInput,
} from '../utils/date';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  taskToEdit?: Task | null;
  onSave: (taskData: {
    namaTugas: string;
    mataKuliahId: string;
    deadline: string;
    deskripsi: string;
    id?: string;
  }) => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  courses,
  taskToEdit,
  onSave,
}) => {
  const [namaTugas, setNamaTugas] = useState('');
  const [mataKuliahId, setMataKuliahId] = useState(courses[0]?.id || '');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setNamaTugas(taskToEdit.namaTugas);
      setMataKuliahId(taskToEdit.mataKuliahId);
      // Jangan pakai split('T') mentah: deadline dari Supabase berbentuk
      // "...T23:59:00.000Z" sehingga jamnya jadi tidak valid untuk
      // <input type="time"> dan jam tersebut hilang saat disimpan.
      const { date, time } = splitTanggalWaktuInput(taskToEdit.deadline);
      setDeadlineDate(date);
      setDeadlineTime(time);
      setDeskripsi(taskToEdit.deskripsi || '');
    } else {
      setNamaTugas('');
      setMataKuliahId(courses[0]?.id || '');
      setDeadlineDate('');
      setDeadlineTime('');
      setDeskripsi('');
    }
  }, [taskToEdit, courses, isOpen]);

  if (!isOpen) return null;

  // Real-time reminder availability preview
  const currentDeadline = gabungTanggalWaktu(deadlineDate, deadlineTime);
  // "Sekarang" dalam waktu LOKAL (toISOString() = UTC dan membuat selisih
  //  meleset hingga 7 jam di WIB).
  const now = new Date();
  const computedReminders = currentDeadline
    ? calculateReminders(gabungTanggalWaktu(dateKey(now), formatWaktu(now)), currentDeadline)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaTugas.trim()) return;

    onSave({
      ...(taskToEdit ? { id: taskToEdit.id } : {}),
      namaTugas,
      mataKuliahId,
      deadline: currentDeadline,
      deskripsi,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {taskToEdit ? 'Edit Tugas' : 'Tambah Tugas Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-3 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Tugas
            </label>
            <input
              type="text"
              required
              value={namaTugas}
              onChange={(e) => setNamaTugas(e.target.value)}
              placeholder="Contoh: Laporan Praktikum Modul 3"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mata Kuliah
            </label>
            <select
              value={mataKuliahId}
              onChange={(e) => setMataKuliahId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#C2410C]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.kode} - {c.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Tenggat
              </label>
              <input
                type="date"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#C2410C]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Tenggat
              </label>
              <input
                type="time"
                required
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#C2410C]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Rincian petunjuk pengumpulan tugas..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          {/* Automatic reminders calculation preview */}
          <div className="p-2.5 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#BA3808]">
              <Bell className="w-3.5 h-3.5" />
              <span>Sistem Reminder Otomatis Tersedia:</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {computedReminders.length > 0 ? (
                computedReminders.map((r, idx) => (
                  <span
                    key={idx}
                    className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200 dark:border-slate-700"
                  >
                    {r}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-slate-500">
                  Waktu kurang dari 1 hari, reminder telah lewat.
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-[#BA3808] hover:bg-[#9B2F00] text-white font-medium flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              {taskToEdit ? 'Simpan' : 'Buat Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
