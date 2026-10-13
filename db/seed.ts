import { RECAP_QUESTIONS } from '../src/data/recapQuestions.ts';
import type { Question, QuizConfig } from '../shared/model.ts';
const single = (key: string, text: string, options: string[], extra: Partial<Question> = {}): Question => ({ key, text, options, type: 'single', required: true, ...extra });
export const initialConfig: QuizConfig = {
  title: 'Post Test Fundamental Performance Marketing', batch: 'PM Batch 6', active: true,
  welcomeDescription: 'Selesaikan langkah terakhir mini class untuk mengulas materi dan mendapatkan sertifikat',
  welcomePoints: ['+- 10 menit pengerjaan', 'Feedback', 'Quiz recap materi mini class', 'Mini asesmen', 'Sertiffikat'],
  certificateNotice: 'Sertifikat akan dikirim max. 3 hari kerja.',
  certificateEligibility: 'Sertifikat hanya diberikan kepada peserta yang hadir pada seluruh sesi, day 1–3.',
  offer: {
    title: 'Bootcamp Performance Marketing — Boleh Belajar',
    image: '/images/tambahan-diskon-5-persen-mini-class.png', imageAlt: 'Tambahan diskon 5% khusus peserta Mini Class',
    ctaText: 'Lihat Program Bootcamp Performance Marketing',
    ctaUrl: 'https://bolehbelajar.com/bootcamp-performance-marketing',
    benefits: ['Praktik hands on handle real brand untuk tambah porfolio', 'dibimbing instruktur praktisi', 'Agency based curriculum', 'bisa dicicil 4x'],
    rules: [],
  },
  baseScore: 70,
  narratives: {
    'Cari pekerjaan pertama': 'Kamu {score}% siap memulai karier pertama sebagai Performance Marketer',
    'Bikin bisnis': 'Kamu {score}% siap menjalankan iklan untuk bisnismu sendiri',
    'Switch career': 'Kamu {score}% siap beralih karier jadi Performance Marketer',
    'Upskill untuk kebutuhan kerjaan': 'Kamu {score}% siap naik level jadi Performance Marketer yang lebih strategis',
  },
  defaultNarrative: 'Kamu {score}% siap melangkah ke level berikutnya di Performance Marketing',
  sections: [
    { key: 'profile', title: 'Profiling singkat', kind: 'profile', perPage: 1, questions: [
      single('p1_pernah_iklan', 'Sudah pernah menjalankan iklan digital sebelumnya?', ['Sudah', 'Belum'], { points: { Sudah: 4, Belum: 2 } }),
      single('p1_usia', 'Berapa rentang usia kamu saat ini?', ['19-23', '24-29', '30-35', '>35']),
      single('p1_pekerjaan', 'Pekerjaan kamu saat ini?', ['Pekerja kantoran', 'Freelance', 'Pemilik bisnis', 'Fresh graduate']),
      single('p1_goal', 'Goal utama kamu mengikuti Mini Class Performance Marketing?', ['Cari pekerjaan pertama', 'Bikin bisnis', 'Switch career', 'Upskill untuk kebutuhan kerjaan'], { allowOther: true }),
    ] },
    { key: 'feedback', title: 'Feedback mini class', kind: 'feedback', perPage: 2, questions: [
      { key: 'feedback.clarity', text: 'Materi disampaikan dengan jelas, terstruktur, dan mudah dipahami.', type: 'rating', required: true, options: [] },
      { key: 'feedback.expectations', text: 'Materi kelas sesuai dengan ekspektasi saya.', type: 'rating', required: true, options: [] },
      { key: 'feedback.interaction', text: 'Interaksi dan sesi tanya jawab berjalan dengan baik.', type: 'rating', required: true, options: [] },
      single('feedback.duration', 'Bagaimana menurutmu durasi kelas ini?', ['Terlalu singkat', 'Pas', 'Terlalu panjang']),
      { key: 'feedback.insight', text: 'Apa insight atau hal paling bermanfaat yang kamu dapatkan?', type: 'text', required: false, options: [] },
      { key: 'feedback.suggestions', text: 'Apa saranmu untuk kelas berikutnya?', type: 'text', required: false, options: [] },
    ] },
    { key: 'recap', title: 'Recap materi', kind: 'recap', perPage: 1, questions: RECAP_QUESTIONS.map(q => single(`recap.${q.id}`, q.question, q.options, { correctAnswer: q.correctAnswer })) },
    { key: 'assessment', title: 'Mini asesmen', kind: 'assessment', perPage: 1, questions: [
      single('p2_skill_utama', 'Kamu setuju, performance marketing jadi salah satu skill utama yang dibutuhkan bisnis saat ini?', ['Setuju', 'Tidak setuju'], { points: { Setuju: 4, 'Tidak setuju': 1 } }),
      single('p2_dampak_penghasilan', 'Kamu setuju menguasai performance marketing bisa berdampak positif ke penghasilan?', ['Setuju', 'Tidak setuju'], { points: { Setuju: 4, 'Tidak setuju': 1 } }),
      single('p2_kemampuan_sekarang', 'Bagaimana kamu menilai kemampuan performance marketing kamu sekarang?', ['Pemula banget', 'Paham dasar', 'Cukup mahir', 'Sangat mahir'], { points: { 'Pemula banget': 2, 'Paham dasar': 4, 'Cukup mahir': 5, 'Sangat mahir': 6 } }),
      single('p2_tools', 'Platform atau tools apa yang pernah kamu pakai?', ['Meta Ads', 'Google Ads', 'TikTok Ads', 'Belum pernah satupun'], { type: 'multi', countPoints: [1, 2, 3, 4], skipWhen: { key: 'p1_pernah_iklan', value: 'Belum', answer: ['Belum pernah satupun'] } }),
      single('p2_tempat_penerapan', 'Di mana kamu ingin menerapkan skill ini?', ['Bisnis sendiri', 'Perusahaan tempat saya bekerja', 'Klien freelance', 'Agency', 'Belum tahu'], { points: { 'Bisnis sendiri': 3, 'Perusahaan tempat saya bekerja': 3, 'Klien freelance': 3, Agency: 3, 'Belum tahu': 1 } }),
    ] },
    { key: 'preferences', title: 'Preferensi dan kendala belajar', kind: 'preferences', perPage: 1, questions: [
      single('p3_jenis_latihan', 'Jenis latihan apa yang paling kamu suka?', ['Hands-on handle brand langsung di Ads Manager', 'Analisis data performance', 'Study case dari agency', 'Semua di atas']),
      single('p3_cara_belajar', 'Kamu lebih suka belajar dengan cara apa?', ['Live class interaktif', 'Rekaman fleksibel', 'Mentoring 1:1', 'Kombinasi']),
      single('p3_pendekatan', 'Pendekatan mana yang lebih cocok buat kamu?', ['Teori dulu, baru praktik', 'Langsung praktik sambil belajar']),
      single('p3_kendala_terbesar', 'Apa kendala terbesar kamu saat ini untuk belajar performance marketing?', ['Bentrok dengan waktu kerja', 'Belum punya sosok guru yang bisa diajak diskusi', 'Tidak tahu mulai dari mana', 'Semuanya di atas']),
    ] },
  ],
};
