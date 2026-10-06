import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { X, Check } from 'lucide-react';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: Course | null;
  currentSemesterNumber: number;
  onSave: (courseData: Omit<Course, 'id' | 'materi' | 'riwayatPresensi' | 'riwayatDosen'> & { id?: string }) => void;
}

export const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  courseToEdit,
  currentSemesterNumber,
  onSave,
}) => {
  const [nama, setNama] = useState('');
  const [kode, setKode] = useState('');
  const [sks, setSks] = useState<number>(3);
  const [semester, setSemester] = useState<number>(currentSemesterNumber);
  const [dosenPengampu, setDosenPengampu] = useState('');
  const [dpj, setDpj] = useState('');
  const [linkGDrive, setLinkGDrive] = useState('');
  const [hari, setHari] = useState('Senin');
  const [jam, setJam] = useState('08:00 - 10:30');
  const [ruang, setRuang] = useState('Lab 304');

  useEffect(() => {
    if (courseToEdit) {
      setNama(courseToEdit.nama);
      setKode(courseToEdit.kode);
      setSks(courseToEdit.sks);
      setSemester(courseToEdit.semester);
      setDosenPengampu(courseToEdit.dosenPengampu);
      setDpj(courseToEdit.dpj);
      setLinkGDrive(courseToEdit.linkGDrive || '');
      setHari(courseToEdit.hari || 'Senin');
      setJam(courseToEdit.jam || '');
      setRuang(courseToEdit.ruang || '');
    } else {
      setNama('');
      setKode('');
      setSks(3);
      setSemester(currentSemesterNumber || 1);
      setDosenPengampu('');
      setDpj('');
      setLinkGDrive('');
      setHari('Senin');
      setJam('');
      setRuang('');
    }
  }, [courseToEdit, currentSemesterNumber, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !dosenPengampu.trim()) return;

    onSave({
      ...(courseToEdit ? { id: courseToEdit.id } : {}),
      nama,
      kode,
      sks: Number(sks),
      semester: Number(semester),
      dosenPengampu,
      dpj: dpj.trim() || dosenPengampu,
      linkGDrive,
      hari,
      jam,
      ruang,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[420px] max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {courseToEdit ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-3 space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Mata Kuliah
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Rekayasa Perangkat Lunak"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode MK
              </label>
              <input
                type="text"
                required
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                placeholder="IF-3102"
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[#C2410C]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SKS
              </label>
              <input
                type="number"
                min={1}
                max={6}
                required
                value={sks}
                onChange={(e) => setSks(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[#C2410C]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Semester
              </label>
              <input
                type="number"
                min={1}
                max={8}
                required
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[#C2410C]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dosen Pengampu
            </label>
            <input
              type="text"
              required
              value={dosenPengampu}
              onChange={(e) => setDosenPengampu(e.target.value)}
              placeholder="Contoh: Dr. Andi Wijaya"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dosen Penanggung Jawab (DPJ)
            </label>
            <input
              type="text"
              value={dpj}
              onChange={(e) => setDpj(e.target.value)}
              placeholder="Bila beda, contoh: Prof. Joko Susilo"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link Google Drive Materi
            </label>
            <input
              type="url"
              value={linkGDrive}
              onChange={(e) => setLinkGDrive(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hari Kuliah
              </label>
              <select
                value={hari}
                onChange={(e) => setHari(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[#C2410C]"
              >
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ruang
              </label>
              <input
                type="text"
                value={ruang}
                onChange={(e) => setRuang(e.target.value)}
                placeholder="Lab 304"
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[#C2410C]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Jam Kuliah
            </label>
            <input
              type="text"
              value={jam}
              onChange={(e) => setJam(e.target.value)}
              placeholder="08:00 - 10:30"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:border-[#C2410C]"
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
              className="w-1/2 py-2.5 rounded-xl bg-[#BA3808] hover:bg-[#9B2F00] text-white font-medium flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              {courseToEdit ? 'Simpan Perubahan' : 'Tambah Kuliah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
