/**
 * Utilitas tanggal terpusat.
 *
 * Semua fitur (absensi, tugas, materi, profil) harus memakai berkas ini agar
 * parsing & formatting konsisten. Dua aturan penting:
 *
 * 1. Tanggal "hari" TANPA jam (mis. `2026-10-07`) SELALU diperlakukan sebagai
 *    waktu LOKAL. `new Date('2026-10-07')` bawaan JS mem-parsingnya sebagai UTC,
 *    sehingga di WIB (UTC+7) tanggal bisa bergeser jadi 8 Oktober.
 * 2. `toISOString()` menghasilkan UTC, sedangkan input deadline dari
 *    `<input type="date">` adalah waktu LOKAL. Mencampur keduanya membuat
 *    selisih hari/reminder meleset beberapa jam.
 */

export const BULAN_PENDEK = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;

/** Alias nama bulan pendek -> indeks (0-11). */
const PETA_BULAN_PENDEK: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  mei: 4,
  may: 4,
  jun: 5,
  jul: 6,
  agu: 7,
  aug: 7,
  sep: 8,
  okt: 9,
  oct: 9,
  nov: 10,
  des: 11,
  dec: 11,
};

/** Alias nama bulan penuh -> indeks (0-11). */
const PETA_BULAN_PENUH: Record<string, number> = {
  januari: 0,
  january: 0,
  februari: 1,
  february: 1,
  maret: 2,
  march: 2,
  april: 3,
  mei: 4,
  may: 4,
  juni: 5,
  june: 5,
  juli: 6,
  july: 6,
  agustus: 7,
  agu: 7,
  august: 7,
  september: 8,
  october: 8,
  oktober: 9,
  november: 10,
  desember: 11,
  december: 11,
};

const RE_TANGGAL_LOKAL = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
const RE_DATETIME_LOKAL =
  /^(\d{4})-(\d{1,2})-(\d{1,2})[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\.\d+)?$/;
/** Offset hanya sah bila ada jam sebelum-nya: "…T16:59:00Z", "…T16:59+07:00". */
const RE_PUNYA_OFFSET = /[T\s]\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/i;
/** "24 Okt 2024", "4 Oktober 2024", "24-10-2024", "24/10/2024" */
const RE_TANGGAL_TEKS =
  /^(\d{1,2})[\s\-/.]+([A-Za-z]{3,10}|\d{1,2})[\s\-/.]+(\d{4})$/;

const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Bangun Date dari komponen waktu lokal (tidak pernah shifting UTC). */
function buatTanggalLokal(
  tahun: number,
  bulan: number,
  tanggal: number,
  jam = 0,
  menit = 0,
  detik = 0
): Date | null {
  if (bulan < 0 || bulan > 11) return null;
  const d = new Date(tahun, bulan, tanggal, jam, menit, detik);
  // Tolak tanggal yang meluap, mis. 31 Feb -> 3 Mar.
  if (d.getFullYear() !== tahun || d.getMonth() !== bulan || d.getDate() !== tanggal) {
    return null;
  }
  return d;
}

/**
 * Parse tanggal secara fleksibel menjadi Date (waktu lokal) atau `null`.
 * Didukung:
 * - `2026-10-07`            -> lokal tengah malam
 * - `2026-10-07T23:59`      -> lokal
 * - `2026-10-07T23:59:00Z`  -> menghormati offset eksplisit
 * - `2026-10-07T23:59+07:00`
 * - `7 Okt 2026`, `7 Oktober 2026`, `7-10-2026`, `7/10/2026`
 * - `2026-10-07 23:59` (spasi)
 */
export function parseTanggal(input: unknown): Date | null {
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (typeof input !== 'string') return null;

  const raw = input.trim();
  if (!raw) return null;

  // 1. Tanggal lokal polos -> JANGAN pakai new Date() (bakal jadi UTC).
  const mTanggal = RE_TANGGAL_LOKAL.exec(raw);
  if (mTanggal) {
    return buatTanggalLokal(
      Number(mTanggal[1]),
      Number(mTanggal[2]) - 1,
      Number(mTanggal[3])
    );
  }

  // 2. Datetime tanpa offset -> waktu lokal.
  const mDateTime = RE_DATETIME_LOKAL.exec(raw);
  if (mDateTime) {
    return buatTanggalLokal(
      Number(mDateTime[1]),
      Number(mDateTime[2]) - 1,
      Number(mDateTime[3]),
      Number(mDateTime[4]),
      Number(mDateTime[5]),
      mDateTime[6] ? Number(mDateTime[6]) : 0
    );
  }

  // 3. String dengan offset/Z -> instant yang benar (WIB/WITA ikut terhitung).
  //    Offset hanya diakui bila didahului komponen jam, supaya "4-10-2024"
  //    tidak salah dianggap sebagai offset -20:24.
  if (RE_PUNYA_OFFSET.test(raw)) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  // 4. Format teks Indonesia / numerik bebas.
  const mTeks = RE_TANGGAL_TEKS.exec(raw);
  if (mTeks) {
    const hari = Number(mTeks[1]);
    const tahun = Number(mTeks[3]);
    const token = mTeks[2].toLowerCase();
    const bulan = /^\d{1,2}$/.test(token)
      ? Number(token) - 1
      : (PETA_BULAN_PENDEK[token] ?? PETA_BULAN_PENUH[token] ?? -1);
    return buatTanggalLokal(tahun, bulan, hari);
  }

  // 5. Fallback.
  const fallback = new Date(raw);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/** Format Date -> "7 Okt 2026". Input tidak valid menghasilkan string kosong. */
export function formatTanggal(d: Date | null | undefined): string {
  if (!d || isNaN(d.getTime())) return '';
  return `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}`;
}

/** Format Date -> "14:30". */
export function formatWaktu(d: Date | null | undefined): string {
  if (!d || isNaN(d.getTime())) return '';
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Format Date -> "7 Okt 2026, 14:30". */
export function formatTanggalWaktu(d: Date | null | undefined): string {
  if (!d || isNaN(d.getTime())) return '';
  return `${formatTanggal(d)}, ${formatWaktu(d)}`;
}

/**
 * Format dari input mentah apa pun (string deadline lokal, ISO, dsb).
 * Kalau tidak bisa diparse, string aslinya dikembalikan supaya UI tetap
 * menampilkan sesuatu daripada "Invalid Date".
 */
export function formatTanggalWaktuRaw(input: unknown): string {
  const d = parseTanggal(input);
  if (d) return formatTanggalWaktu(d);
  return typeof input === 'string' ? input.trim() : '';
}

/** Tanggal hari ini dalam format Indonesia, waktu lokal. */
export function getTanggalHariIni(): string {
  return formatTanggal(new Date());
}

/**
 * Kunci perbandingan "hari yang sama" -> "YYYY-MM-DD" (waktu lokal).
 *
 * Ini yang dipakai untuk mencocokkan record absensi, supaya
 * "24 Okt 2024", "24-10-2024", dan `2024-10-24` dianggap SESI YANG SAMA
 * (sebelumnya memakai perbandingan string persis sehingga tercipta record duplikat).
 * Nilai yang tidak bisa diparse di-fallback ke string ternormalisasi.
 */
export function dateKey(input: unknown): string {
  const d = parseTanggal(input);
  if (d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }
  return typeof input === 'string' ? input.trim().toLowerCase().replace(/\s+/g, ' ') : '';
}

/** -> "2026-10-07" untuk `<input type="date">`. */
export function toDateInputValue(d: Date | null | undefined): string {
  if (!d || isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** -> "14:30" untuk `<input type="time">`. */
export function toTimeInputValue(d: Date | null | undefined): string {
  return formatWaktu(d);
}

/**
 * Pecah deadline menjadi nilai untuk input date & time.
 * Menangani deadline ISO dari Supabase (`...Z`) tanpa kehilangan jam,
 * serta deadline lama bertipe "YYYY-MM-DDTHH:mm".
 */
export function splitTanggalWaktuInput(input: unknown): {
  date: string;
  time: string;
} {
  const d = parseTanggal(input);
  if (!d) {
    // Fallback: ambil potongan teks apa adanya.
    const parts = typeof input === 'string' ? input.trim().split(/[T ]/) : [];
    return { date: parts[0] || '', time: (parts[1] || '').slice(0, 5) };
  }
  return { date: toDateInputValue(d), time: toTimeInputValue(d) };
}

/** Gabungkan input date & time -> "2026-10-07T23:59" (waktu lokal). */
export function gabungTanggalWaktu(dateStr: string, timeStr: string): string {
  if (!dateStr) return '';
  const time = /^\d{1,2}:\d{2}/.test(timeStr) ? timeStr.slice(0, 5) : '23:59';
  return `${dateStr}T${time}`;
}

/**
 * Sisa hari menuju deadline ( pecahan ). Negatif = sudah lewat.
 * Tidak pernah NaN: deadline tidak valid -> 0.
 */
export function sisaHari(deadline: unknown, now: Date = new Date()): number {
  const d = parseTanggal(deadline);
  if (!d) return 0;
  const MS_PER_HARI = 1000 * 60 * 60 * 24;
  return (d.getTime() - now.getTime()) / MS_PER_HARI;
}

/**
 * Badge tenggat untuk UI: "Terlambat", "Hari ini", "Besok", "3 hari lagi".
 * Mengembalikan `undefined` bila masih longgar (>7 hari) atau tidak valid,
 * supaya badge tidak muncul di mana-mana.
 */
export function getBadgeDeadline(
  deadline: unknown,
  now: Date = new Date()
): string | undefined {
  const d = parseTanggal(deadline);
  if (!d) return undefined;

  const MS_PER_HARI = 1000 * 60 * 60 * 24;

  // Sudah lewat (bukan tepat pada detik 0).
  if (d.getTime() < now.getTime()) return 'Terlambat';

  // Selisih HARI KALENDER (bukan sisa 24 jam), supaya deadline 9 Okt dari
  // 7 Okt dibaca "3 hari lagi" walau hanya 2 hari 23 jam, dan deadline
  // besok pagi dibaca "Besok".
  const tengahHariIni = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const tengahHariDeadline = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const selisihHari = Math.round((tengahHariDeadline - tengahHariIni) / MS_PER_HARI);

  if (selisihHari <= 0) return 'Hari ini';
  if (selisihHari === 1) return 'Besok';
  if (selisihHari > 7) return undefined;
  return `${selisihHari} hari lagi`;
}

/**
 * Comparator aman untuk sorting deadline. Nilai tidak valid / kosong
 * selalu ditempatkan di paling akhir (sebelumnya `new Date('').getTime()`
 * menghasilkan NaN dan urutan seluruh tabel menjadi kacau).
 */
export function bandingkanDeadline(a: unknown, b: unknown): number {
  const da = parseTanggal(a);
  const db = parseTanggal(b);
  if (da && db) return da.getTime() - db.getTime();
  if (da) return -1;
  if (db) return 1;
  return 0;
}

/**
 * Daftar titik pengingat yang masih relevan untuk sebuah deadline.
 *
 * Semua perhitungan memakai waktu LOKAL. Mencampur `toISOString()` (UTC)
 * dengan deadline lokal pernah membuat selisih meleset hingga 7 jam di WIB,
 * sehingga reminder "7 hari sebelum" hilang tepat di batasnya.
 *
 * @param dibuatKapan waktu pembuatan tugas (string/Date apa pun)
 * @param deadlineStr deadline tugas
 */
export function calculateReminders(dibuatKapan: unknown, deadlineStr: unknown): string[] {
  const dibuat = parseTanggal(dibuatKapan) ?? new Date();
  const deadline = parseTanggal(deadlineStr);
  if (!deadline) return [];

  const diffDays = (deadline.getTime() - dibuat.getTime()) / (1000 * 60 * 60 * 24);

  // Deadline sudah lewat / kurang dari sehari -> tidak ada reminder berguna.
  if (diffDays < 1) return [];

  // Pembulatan ke bawah: sisa 2,5 hari masih relevan punya "1 hari sebelum".
  const hariTersisa = Math.floor(diffDays);

  const opsi: { hari: number; label: string }[] = [
    { hari: 7, label: '7 hari sebelum' },
    { hari: 5, label: '5 hari sebelum' },
    { hari: 3, label: '3 hari sebelum' },
    { hari: 1, label: '1 hari sebelum' },
  ];

  return opsi.filter((o) => hariTersisa >= o.hari).map((o) => o.label);
}

/**
 * ID unik per-kelas. `Date.now()` saja bisa bentrok kalau dua item dibuat
 * pada milidetik yang sama (rapid click / import massal) sehingga satu
 * menimpa yang lain.
 */
let penghitung = 0;
export function buatIdUnik(prefix: string): string {
  penghitung = (penghitung + 1) % 100000;
  return `${prefix}-${Date.now().toString(36)}${penghitung.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}