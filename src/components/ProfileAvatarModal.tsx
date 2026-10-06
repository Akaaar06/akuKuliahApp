import React, { useState } from 'react';
import { X, Camera, Check, Upload } from 'lucide-react';

interface ProfileAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSaveAvatar: (newAvatarUrl: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
];

export const ProfileAvatarModal: React.FC<ProfileAvatarModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSaveAvatar,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveAvatar(customUrl.trim() || selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[380px] bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Ubah Foto Profil Saya
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          {/* Current preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <img
                src={customUrl.trim() || selectedAvatar}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#BA3808] shadow-sm"
              />
              <label className="absolute bottom-0 right-0 p-1.5 bg-[#BA3808] text-white rounded-full cursor-pointer shadow-xs hover:bg-[#9B2F00]">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <span className="text-[11px] text-slate-400 mt-2">
              Klik ikon kamera untuk unggah foto dari galeri/perangkat
            </span>
          </div>

          {/* Preset Options */}
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Pilih Avatar Cepat:
            </span>
            <div className="flex items-center justify-center gap-2.5">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(url);
                    setCustomUrl('');
                  }}
                  className={`relative rounded-full transition-transform ${
                    selectedAvatar === url && !customUrl
                      ? 'ring-2 ring-[#BA3808] scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Avatar ${idx + 1}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedAvatar === url && !customUrl && (
                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* URL Input */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Atau Tautan Gambar (URL):
            </label>
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:border-[#BA3808]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="w-1/2 py-2.5 rounded-xl bg-[#BA3808] hover:bg-[#9B2F00] text-white font-medium shadow-xs"
            >
              Simpan Foto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
