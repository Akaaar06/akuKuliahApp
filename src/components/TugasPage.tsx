import React, { useState } from 'react';
import { Task } from '../types';
import { Check, Clock, Calendar, ArrowUpDown, Plus, Bell, Edit2, Trash2 } from 'lucide-react';

interface TugasPageProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onOpenCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TugasPage: React.FC<TugasPageProps> = ({
  tasks,
  onToggleTask,
  onOpenCreateTask,
  onEditTask,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<'semua' | 'mendekati' | 'selesai'>('semua');
  const [sortBy, setSortBy] = useState<'deadline' | 'nama'>('deadline');

  const pendingCount = tasks.filter((t) => !t.selesai).length;
  const selesaiCount = tasks.filter((t) => t.selesai).length;
  const mendekatiCount = tasks.filter((t) => !t.selesai && t.badgeDeadline).length;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'mendekati') return !t.selesai && Boolean(t.badgeDeadline);
    if (filter === 'selesai') return t.selesai;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return a.namaTugas.localeCompare(b.namaTugas);
  });

  return (
    <div className="space-y-3.5 pb-20">
      {/* 1. Header Card: Manajemen Tugas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#BA3808] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Check className="w-5 h-5 stroke-[2.8]" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 dark:text-white">
              Manajemen Tugas
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Semester Ganjil 2024/2025
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreateTask}
          className="bg-[#BA3808] hover:bg-[#9B2F00] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setFilter('semua')}
          className={`px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            filter === 'semua'
              ? 'bg-[#BA3808] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <span>Semua</span>
          <span className="opacity-90">{tasks.length}</span>
        </button>

        <button
          onClick={() => setFilter('mendekati')}
          className={`px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            filter === 'mendekati'
              ? 'bg-[#BA3808] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <span>Mendekati Deadline</span>
          <span className="opacity-90">{mendekatiCount}</span>
        </button>

        <button
          onClick={() => setFilter('selesai')}
          className={`px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            filter === 'selesai'
              ? 'bg-[#BA3808] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <span>Selesai</span>
          <span className="opacity-90">{selesaiCount}</span>
        </button>
      </div>

      {/* 3. Sort line */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium px-1">
        <ArrowUpDown className="w-3.5 h-3.5 stroke-[2]" />
        <span>Urutan:</span>
        <button
          onClick={() => setSortBy(sortBy === 'deadline' ? 'nama' : 'deadline')}
          className="font-bold text-[#BA3808] dark:text-[#ff8a65] hover:underline"
        >
          {sortBy === 'deadline' ? 'Tenggat Waktu' : 'Nama Tugas'} ▾
        </button>
      </div>

      {/* 4. Task Cards List */}
      <div className="space-y-2.5">
        {sortedTasks.map((t) => {
          const isDone = t.selesai;
          return (
            <div
              key={t.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-colors ${
                isDone ? 'opacity-70' : 'hover:border-[#BA3808]/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  {/* Top row: Course Name + Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t.mataKuliahNama}
                    </span>
                    {t.badgeDeadline && !isDone && (
                      <span className="text-[10px] font-semibold text-[#BA3808] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
                        {t.badgeDeadline}
                      </span>
                    )}
                    {isDone && (
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        Selesai
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className={`font-semibold text-sm ${
                      isDone
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {t.namaTugas}
                  </h3>

                  {t.deskripsi && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {t.deskripsi}
                    </p>
                  )}

                  {/* Deadline & Reminder Info */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      {t.badgeDeadline ? (
                        <Clock className="w-3.5 h-3.5 text-[#BA3808] stroke-[2]" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5 stroke-[2]" />
                      )}
                      <span className={t.badgeDeadline && !isDone ? 'text-[#BA3808] dark:text-[#ff8a65] font-semibold' : ''}>
                        {t.deadlineDisplay}
                      </span>
                    </div>

                    {t.reminders && t.reminders.length > 0 && !isDone && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Bell className="w-3 h-3 text-slate-400" />
                        <span>{t.reminders.join(' • ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right controls: Checkbox + Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0 mt-1">
                  <button
                    onClick={() => onToggleTask(t.id)}
                    aria-label={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-[#BA3808] text-white shadow-2xs'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-[#BA3808]'
                    }`}
                  >
                    {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditTask(t)}
                      className="p-1 rounded text-slate-400 hover:text-[#BA3808] hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Tugas"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus tugas "${t.namaTugas}"?`)) {
                          onDeleteTask(t.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Hapus Tugas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {sortedTasks.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            Tidak ada tugas pada kategori ini.
          </div>
        )}
      </div>

      {/* Floating Action Button: + Tugas Baru */}
      <div className="fixed bottom-20 right-4 max-w-[400px] z-30">
        <button
          onClick={onOpenCreateTask}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#BA3808] hover:bg-[#9B2F00] text-white font-bold text-xs shadow-lg transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.8]" />
          <span>Tugas Baru</span>
        </button>
      </div>
    </div>
  );
};
