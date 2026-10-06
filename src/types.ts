/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClassFeedback {
  clarity?: number;
  expectations?: number;
  interaction?: number | "not_attended";
  duration?: "Terlalu singkat" | "Pas" | "Terlalu panjang";
  insight?: string;
  suggestions?: string;
}

export interface QuizAnswers {
  feedback?: ClassFeedback;
  // Part 1: Profiling
  p1_pernah_iklan?: 'Sudah' | 'Belum';
  p1_usia?: '19-23' | '24-29' | '30-35' | '>35';
  p1_pekerjaan?: 'Pekerja kantoran' | 'Freelance' | 'Pemilik bisnis' | 'Fresh graduate';
  p1_goal?: string;

  // Part 2: Recap Materi (10 Soal Pilihan Ganda)
  recap_answers?: Record<number, string>;
  recap_correct_count?: number;

  // Part 3 (formerly Part 2): Belief Priming & Level Check
  p2_skill_utama?: 'Setuju' | 'Tidak setuju';
  p2_dampak_penghasilan?: 'Setuju' | 'Tidak setuju';
  p2_kemampuan_sekarang?: 'Pemula banget' | 'Paham dasar' | 'Cukup mahir' | 'Sangat mahir';
  p2_tools?: string[]; // 'Meta Ads' | 'Google Ads' | 'TikTok Ads' | 'Belum pernah satupun'
  p2_tempat_penerapan?:
    | 'Bisnis sendiri'
    | 'Perusahaan tempat saya bekerja'
    | 'Klien freelance'
    | 'Agency'
    | 'Belum tahu';

  // Part 4 (formerly Part 3): Gaya Belajar
  p3_jenis_latihan?:
    | 'Hands-on handle brand langsung di Ads Manager'
    | 'Analisis data performance'
    | 'Study case dari agency'
    | 'Semua di atas';
  p3_cara_belajar?:
    | 'Live class interaktif'
    | 'Rekaman fleksibel'
    | 'Mentoring 1:1'
    | 'Kombinasi';
  p3_pendekatan?: 'Teori dulu, baru praktik' | 'Langsung praktik sambil belajar';
  p3_kendala_terbesar?:
    | 'Bentrok dengan waktu kerja'
    | 'Belum punya sosok guru yang bisa diajak diskusi'
    | 'Tidak tahu mulai dari mana'
    | 'Semuanya di atas';
}

export interface UserContact {
  namaLengkap: string;
  email: string;
  nomorHp: string;
  consent: boolean;
}

export interface SubmissionRecord {
  id: string;
  timestamp: string;
  user: UserContact;
  answers: QuizAnswers;
  skor: number;
  recapScore?: number;
  goalNarrative: string;
  hambatanRingkasan: string;
  clickedCtaBootcamp: boolean;
  ctaClickTimestamp?: string;
}

export interface FunnelTracking {
  totalStarted: number;
  reachedPart1Confirm: number;
  startedPart2: number;
  reachedPart2Interstitial: number;
  startedPart3: number;
  reachedPart3Interstitial: number;
  reachedProcessing: number;
  reachedLeadForm: number;
  submittedForm: number;
  clickedCta: number;
}
