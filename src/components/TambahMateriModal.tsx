import React, { useState } from 'react';
import { Course, MaterialFile } from '../types';
import { X, Upload, FileText, Check } from 'lucide-react';

interface TambahMateriModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  initialCourseId?: string;
  onAddMaterial: (
    courseId: string,
    fileData: {
      nama: string;
      pertemuan: number;
      format: 'PDF' | 'PPT' | 'PPTX';
      ukuran: string;
      kategori: 'Materi' | 'Tugas' | 'Lainnya';
      lokasiPenyimpanan: string;
    }
  ) => void;
}

export const TambahMateriModal: React.FC<TambahMateriModalProps> = ({
  isOpen,
  onClose,
  courses,
  initialCourseId,
  onAddMaterial,
}) => {
  const [courseId, setCourseId] = useState(initialCourseId || courses[0]?.id || '');
  const [pertemuan, setPertemuan] = useState<number>(1);
  const [namaFile, setNamaFile] = useState('');
  const [format, setFormat] = useState<'PDF' | 'PPT' | 'PPTX'>('PDF');
  const [ukuran, setUkuran] = useState('');
  const [kategori, setKategori] = useState<'Materi' | 'Tugas' | 'Lainnya'>('Materi');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaFile.trim()) return;

    const formattedName = namaFile.endsWith(`.${format.toLowerCase()}`)
      ? namaFile
      : `${namaFile}.${format.toLowerCase()}`;

    // Firebase Storage reference path
    const storageLocation = `gs://akukuliah-app.appspot.com/courses/${courseId}/materials/${formattedName}`;

    onAddMaterial(courseId, {
      nama: formattedName,
      pertemuan,
      format,
      ukuran: ukuran || '2.5 MB',
      kategori,
      lokasiPenyimpanan: storageLocation,
    });

    setNamaFile('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Upload Berkas Materi
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Berkas
              </label>
              <select
                value={kategori}
                onChange={(e) =>
                  setKategori(e.target.value as 'Materi' | 'Tugas' | 'Lainnya')
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#C2410C]"
              >
                <option value="Materi">Materi</option>
                <option value="Tugas">Tugas</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pertemuan Ke-
              </label>
              <select
                value={pertemuan}
                onChange={(e) => setPertemuan(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#C2410C]"
              >
                {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    Pertemuan {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis File
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'PDF' | 'PPT' | 'PPTX')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#C2410C]"
              >
                <option value="PDF">PDF (.pdf)</option>
                <option value="PPTX">PowerPoint (.pptx)</option>
                <option value="PPT">PowerPoint (.ppt)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ukuran File
              </label>
              <input
                type="text"
                value={ukuran}
                onChange={(e) => setUkuran(e.target.value)}
                placeholder="2.4 MB"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:border-[#C2410C]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama File
            </label>
            <input
              type="text"
              required
              value={namaFile}
              onChange={(e) => setNamaFile(e.target.value)}
              placeholder="Contoh: 05_Modul_Query_Optimization"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 text-[10px] text-slate-500">
            Penyimpanan: Firebase Storage bucket terintegrasi & referensi metadata disimpan ke Firestore.
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
              <Upload className="w-4 h-4" />
              Upload Berkas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
