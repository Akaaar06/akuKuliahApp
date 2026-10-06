import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed, show small status badge or hide
  if (isInstalled) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400">
        <Check className="w-4 h-4 shrink-0" />
        <span>Aplikasi telah terinstal di perangkat ini (PWA Standalone)</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
    }
  };

  // Compact version for Header
  if (compact) {
    if (isInstallable) {
      return (
        <button
          onClick={handleInstallClick}
          title="Install Aplikasi akuKuliah"
          aria-label="Install Aplikasi"
          className="p-2 rounded-xl text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Install App</span>
        </button>
      );
    }
    if (isIOS) {
      return (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            title="Install di iOS"
            className="p-2 rounded-xl text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Install iOS</span>
          </button>
          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    Pasang di iPhone / iPad
                  </h3>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-center font-bold text-[11px] leading-5 shrink-0">
                      1
                    </div>
                    <p>
                      Tekan tombol <strong>Share</strong> (ikon kotak dengan panah ke atas) di bilah navigasi Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-center font-bold text-[11px] leading-5 shrink-0">
                      2
                    </div>
                    <p>
                      Gulir ke bawah dan pilih <strong>"Add to Home Screen"</strong> (Tambah ke Layar Utama).
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-center font-bold text-[11px] leading-5 shrink-0">
                      3
                    </div>
                    <p>
                      Ikon logo <strong>akuKuliah</strong> akan langsung muncul di beranda HP Anda layaknya aplikasi asli!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
                >
                  Mengerti
                </button>
              </div>
            </div>
          )}
        </>
      );
    }
    return null;
  }

  // Full banner / card version for SettingPage
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/40 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">
            Install Aplikasi akuKuliah (PWA)
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Pasang langsung di layar utama HP dengan ikon logo resmi, hemat kuota & cepat dibuka.
          </span>
        </div>
      </div>

      {isInstallable && (
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          Pasang ke Layar Utama
        </button>
      )}

      {isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition"
        >
          <Smartphone className="w-4 h-4" />
          Panduan Pasang di iPhone (Safari)
        </button>
      )}

      {!isInstallable && !isIOS && !isInstalled && (
        <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
          Tip: Buka website di browser Chrome/Edge di Android/PC atau Safari di iPhone untuk menginstal aplikasi dengan ikon resmi.
        </div>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                Pasang di iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-center font-bold text-[11px] leading-5 shrink-0">
                  1
                </div>
                <p>
                  Tekan tombol <strong>Share</strong> (ikon kotak dengan panah ke atas) di bilah navigasi Safari.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-center font-bold text-[11px] leading-5 shrink-0">
                  2
                </div>
                <p>
                  Gulir ke bawah dan pilih <strong>"Add to Home Screen"</strong> (Tambah ke Layar Utama).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-center font-bold text-[11px] leading-5 shrink-0">
                  3
                </div>
                <p>
                  Ikon logo <strong>akuKuliah</strong> akan langsung muncul di beranda HP Anda!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
