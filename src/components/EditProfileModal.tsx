import React, { useState } from 'react';
import { X, Check, GraduationCap } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: {
    nama: string;
    semester: number;
    prodi: string;
    bebanSks: number;
    ipk: number;
    status: string;
  };
  onSave: (updated: {
    nama: string;
    semester: number;
    prodi: string;
    bebanSks: number;
    ipk: number;
  }) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSave,
}) => {
  const [nama, setNama] = useState(userProfile.nama);
  const [semester, setSemester] = useState(userProfile.semester);
  const [bebanSks, setBebanSks] = useState(userProfile.bebanSks || 24);
  const [ipk, setIpk] = useState(userProfile.ipk || 3.61);
  const [prodi, setProdi] = useState(userProfile.prodi || 'Teknik Informatika');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nama: nama.trim() || userProfile.nama,
      semester: Number(semester) || 1,
      bebanSks: Number(bebanSks) || 0,
      ipk: Number(ipk) || 0,
      prodi: prodi.trim() || userProfile.prodi,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-[380px] bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#BA3808]" />
            Ubah Data & Semester
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
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Semester Aktif
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-[#BA3808]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Beban SKS
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={bebanSks}
                onChange={(e) => setBebanSks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-[#BA3808]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                IPK Saat Ini
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                max={4}
                value={ipk}
                onChange={(e) => setIpk(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-[#BA3808]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nama Mahasiswa
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#BA3808]"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Program Studi
            </label>
            <input
              type="text"
              value={prodi}
              onChange={(e) => setProdi(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#BA3808]"
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
              className="w-1/2 py-2.5 rounded-xl bg-[#BA3808] hover:bg-[#9B2F00] text-white font-medium shadow-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
