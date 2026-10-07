import React, { useState } from 'react';
import { Course, Task } from '../types';
import { X, Calendar, PlusCircle } from 'lucide-react';
import { formatTanggalWaktu, getBadgeDeadline, parseTanggal } from '../utils/date';

interface TambahTugasModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onAddTask: (task: Omit<Task, 'id' | 'tanggalDibuat'>) => void;
}

export const TambahTugasModal: React.FC<TambahTugasModalProps> = ({
  isOpen,
  onClose,
  courses,
  onAddTask,
}) => {
  const [namaTugas, setNamaTugas] = useState('');
  const [mataKuliahId, setMataKuliahId] = useState(courses[0]?.id || '');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [reminders, setReminders] = useState<{ [key: string]: boolean }>({
    '7 hari sebelum': true,
    '5 hari sebelum': true,
    '3 hari sebelum': true,
    '1 hari sebelum': true,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaTugas.trim()) return;

    const course = courses.find((c) => c.id === mataKuliahId) || courses[0];

    // Compute active reminders
    const selectedReminders = Object.entries(reminders)
      .filter(([_, checked]) => checked)
      .map(([label]) => label);

    // Format display date — selalu divalidasi supaya tidak pernah tampil
    // "NaN NaN NaN" saat input tanggal tidak terbaca.
    const d = parseTanggal(`${deadlineDate}T${deadlineTime}`);
    const displayDate = formatTanggalWaktu(d) || `${deadlineDate} ${deadlineTime}`.trim();

    onAddTask({
      namaTugas,
      mataKuliahId: course.id,
      mataKuliahNama: course.nama.toUpperCase(),
      deadline: `${deadlineDate}T${deadlineTime}`,
      deadlineDisplay: displayDate,
      badgeDeadline: getBadgeDeadline(`${deadlineDate}T${deadlineTime}`),
      deskripsi,
      selesai: false,
      reminders: selectedReminders,
    });

    setNamaTugas('');
    setDeskripsi('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Tambah Tugas
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
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mata Kuliah
            </label>
            <select
              value={mataKuliahId}
              onChange={(e) => setMataKuliahId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[#C2410C]"
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
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[#C2410C]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam
              </label>
              <input
                type="time"
                required
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[#C2410C]"
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
              placeholder="Instruksi atau catatan tugas..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Titik Pengingat (Reminder)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['7 hari sebelum', '5 hari sebelum', '3 hari sebelum', '1 hari sebelum'].map((label) => (
                <label
                  key={label}
                  className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={reminders[label] ?? true}
                    onChange={(e) =>
                      setReminders((prev) => ({ ...prev, [label]: e.target.checked }))
                    }
                    className="accent-[#C2410C]"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-medium flex items-center justify-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
