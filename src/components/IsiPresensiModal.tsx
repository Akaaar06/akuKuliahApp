import React, { useState, useEffect, useRef } from 'react';
import { Course, AttendanceRecordStatus } from '../types';
import { X, Check } from 'lucide-react';
import {
  dateKey,
  formatTanggal,
  getTanggalHariIni,
  parseTanggal,
  toDateInputValue,
} from '../utils/date';

interface IsiPresensiModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  initialCourseId?: string;
  onSaveAttendance: (
    courseId: string,
    tanggal: string,
    status: AttendanceRecordStatus,
    topik?: string
  ) => void;
}

const STATUS_LABEL: Record<AttendanceRecordStatus, string> = {
  hadir: 'Hadir',
  'tidak-hadir': 'Tidak Hadir',
  belum: 'Belum Diisi',
  libur: 'Tidak Ada Perkuliahan',
};

export const IsiPresensiModal: React.FC<IsiPresensiModalProps> = ({
  isOpen,
  onClose,
  courses,
  initialCourseId,
  onSaveAttendance,
}) => {
  const [courseId, setCourseId] = useState(initialCourseId || courses[0]?.id || '');
  // Nilai disimpan sebagai "YYYY-MM-DD" agar input tanggal native selalu valid
  // dan perbandingan antar sesi bisa dilakukan lewat dateKey().
  const [tanggal, setTanggal] = useState('');
  const [status, setStatus] = useState<AttendanceRecordStatus>('hadir');
  const [topik, setTopik] = useState('');

  // Referensi untuk mendeteksi transisi buka / ganti Courses tanpa
  // bergantung pada referensi `courses` yang selalu berubah setiap render
  // (sebelumnya form di-reset setiap kali courses berubah, sehingga ketikan
  //  pengguna hilang di tengah pengisian).
  const prevOpen = useRef(false);
  const prevInitialId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const baruDibuka = isOpen && !prevOpen.current;
    const gantiMataKuliah = isOpen && initialCourseId !== prevInitialId.current;
    prevOpen.current = isOpen;
    prevInitialId.current = initialCourseId;

    if (!baruDibuka && !gantiMataKuliah) return;

    const activeId = initialCourseId || courses[0]?.id || '';
    setCourseId(activeId);

    const course = courses.find((c) => c.id === activeId);
    // Penting: riwayatPresensi bisa undefined pada data lama.
    const records = course?.riwayatPresensi || [];
    const last = records.length > 0 ? records[records.length - 1] : undefined;

    if (last) {
      const d = parseTanggal(last.tanggal);
      setTanggal(d ? toDateInputValue(d) : toDateInputValue(new Date()));
      setStatus(last.status === 'belum' ? 'hadir' : last.status);
    } else {
      setTanggal(toDateInputValue(new Date()));
      setStatus('hadir');
    }
    setTopik('');
    // Sengaja `courses` tidak ikut dependensi — lihat catatan di atas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialCourseId]);

  if (!isOpen) return null;

  const activeCourse = courses.find((c) => c.id === courseId);
  const activeRecords = activeCourse?.riwayatPresensi || [];
  const lastRecord = activeRecords.length > 0 ? activeRecords[activeRecords.length - 1] : undefined;

  // Sesi yang sedang diisi = yang tanggalnya sama persis dengan input.
  const sesiTerpilih = activeRecords.find((r) => dateKey(r.tanggal) === dateKey(tanggal));
  const sesiBaru = !sesiTerpilih;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !tanggal) return;

    // Kirim format Indonesia agar konsisten dengan data absensi yang tersimpan.
    const tanggalTerformat = formatTanggal(parseTanggal(tanggal)) || getTanggalHariIni();
    onSaveAttendance(courseId, tanggalTerformat, status, topik.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Isi Presensi Perkuliahan
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-3 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mata Kuliah
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#C2410C]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.kode} - {c.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Pertemuan
            </label>
            <input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:border-[#C2410C]"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              {sesiBaru ? (
                <>
                  Sesi baru pada{' '}
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {formatTanggal(parseTanggal(tanggal)) || '-'}
                  </span>{' '}
                  akan ditambahkan.
                </>
              ) : (
                <>
                  Mengubah sesi{' '}
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Minggu ke-{sesiTerpilih!.mingguKe}
                  </span>{' '}
                  ({STATUS_LABEL[sesiTerpilih!.status]} saat ini).
                </>
              )}
            </span>
          </div>

          {/* Status Options: Hadir, Tidak Hadir, Tidak Ada Perkuliahan */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Pilihan Status Kehadiran
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Hadir */}
              <button
                type="button"
                onClick={() => setStatus('hadir')}
                className={`p-2.5 rounded-xl border font-bold text-center transition-colors ${
                  status === 'hadir'
                    ? 'border-[#16A34A] bg-[#16A34A] text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                Hadir
              </button>

              {/* Tidak Hadir */}
              <button
                type="button"
                onClick={() => setStatus('tidak-hadir')}
                className={`p-2.5 rounded-xl border font-bold text-center transition-colors ${
                  status === 'tidak-hadir'
                    ? 'border-[#DC2626] bg-[#DC2626] text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                Tidak Hadir
              </button>

              {/* Tidak Ada Perkuliahan */}
              <button
                type="button"
                onClick={() => setStatus('libur')}
                className={`p-2 rounded-xl border font-bold text-center transition-colors leading-tight ${
                  status === 'libur'
                    ? 'border-[#64748B] bg-[#64748B] text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-[10px] block">Tidak Ada Kuliah</span>
              </button>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1.5">
              * "Tidak Ada Perkuliahan" tidak dihitung ke persentase kehadiran total.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topik / Catatan Materi (Opsional)
            </label>
            <input
              type="text"
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder={lastRecord?.topik || 'Contoh: Pembahasan Query Optimization'}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:border-[#C2410C]"
            />
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
              disabled={!courseId || !tanggal}
              className="w-1/2 py-2.5 rounded-xl bg-[#BA3808] hover:bg-[#9B2F00] disabled:opacity-50 disabled:hover:bg-[#BA3808] text-white font-medium flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};