/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FunnelTracking, SubmissionRecord, QuizAnswers, UserContact } from '../types.ts';

const SUBMISSIONS_KEY = 'bb_mini_class_submissions_v1';
const FUNNEL_KEY = 'bb_mini_class_funnel_v1';

const defaultFunnel: FunnelTracking = {
  totalStarted: 128,
  reachedPart1Confirm: 119,
  startedPart2: 114,
  reachedPart2Interstitial: 108,
  startedPart3: 104,
  reachedPart3Interstitial: 99,
  reachedProcessing: 96,
  reachedLeadForm: 96,
  submittedForm: 87,
  clickedCta: 42,
};

const defaultSeedSubmissions: SubmissionRecord[] = [
  {
    id: 'lead-bb-001',
    timestamp: '2026-09-29T19:42:10.000Z',
    user: {
      namaLengkap: 'Andi Pratama',
      email: 'andi.pratama@gmail.com',
      nomorHp: '081234567890',
      consent: true,
    },
    answers: {
      p1_pernah_iklan: 'Sudah',
      p1_usia: '24-29',
      p1_pekerjaan: 'Pekerja kantoran',
      p1_goal: 'Switch career',
      p2_skill_utama: 'Setuju',
      p2_dampak_penghasilan: 'Setuju',
      p2_kemampuan_sekarang: 'Paham dasar',
      p2_tools: ['Meta Ads', 'Google Ads'],
      p2_tempat_penerapan: 'Perusahaan tempat saya bekerja',
      p3_jenis_latihan: 'Hands-on handle brand langsung di Ads Manager',
      p3_cara_belajar: 'Live class interaktif',
      p3_pendekatan: 'Langsung praktik sambil belajar',
      p3_kendala_terbesar: 'Belum punya sosok guru yang bisa diajak diskusi',
    },
    skor: 92,
    goalNarrative: 'Kamu 92% siap beralih karier jadi Performance Marketer',
    hambatanRingkasan: 'Belum ada mentor untuk berdiskusi',
    clickedCtaBootcamp: true,
    ctaClickTimestamp: '2026-09-29T19:44:22.000Z',
  },
  {
    id: 'lead-bb-002',
    timestamp: '2026-09-29T20:15:33.000Z',
    user: {
      namaLengkap: 'Dewi Lestari',
      email: 'dewi.lestari@yahoo.com',
      nomorHp: '085712345678',
      consent: true,
    },
    answers: {
      p1_pernah_iklan: 'Belum',
      p1_usia: '19-23',
      p1_pekerjaan: 'Fresh graduate',
      p1_goal: 'Cari pekerjaan pertama',
      p2_skill_utama: 'Setuju',
      p2_dampak_penghasilan: 'Setuju',
      p2_kemampuan_sekarang: 'Pemula banget',
      p2_tools: ['Belum pernah satupun'],
      p2_tempat_penerapan: 'Agency',
      p3_jenis_latihan: 'Semua di atas',
      p3_cara_belajar: 'Kombinasi',
      p3_pendekatan: 'Teori dulu, baru praktik',
      p3_kendala_terbesar: 'Tidak tahu mulai dari mana',
    },
    skor: 84,
    goalNarrative: 'Kamu 84% siap memulai karier pertama sebagai Performance Marketer',
    hambatanRingkasan: 'Belum tahu harus mulai dari mana',
    clickedCtaBootcamp: false,
  },
  {
    id: 'lead-bb-003',
    timestamp: '2026-09-29T21:05:12.000Z',
    user: {
      namaLengkap: 'Rizky Firmansyah',
      email: 'rizky.f@bisniskreatif.id',
      nomorHp: '081398765432',
      consent: true,
    },
    answers: {
      p1_pernah_iklan: 'Sudah',
      p1_usia: '30-35',
      p1_pekerjaan: 'Pemilik bisnis',
      p1_goal: 'Bikin bisnis',
      p2_skill_utama: 'Setuju',
      p2_dampak_penghasilan: 'Setuju',
      p2_kemampuan_sekarang: 'Cukup mahir',
      p2_tools: ['Meta Ads', 'TikTok Ads'],
      p2_tempat_penerapan: 'Bisnis sendiri',
      p3_jenis_latihan: 'Hands-on handle brand langsung di Ads Manager',
      p3_cara_belajar: 'Mentoring 1:1',
      p3_pendekatan: 'Langsung praktik sambil belajar',
      p3_kendala_terbesar: 'Bentrok dengan waktu kerja',
    },
    skor: 93,
    goalNarrative: 'Kamu 93% siap menjalankan iklan untuk bisnismu sendiri',
    hambatanRingkasan: 'Waktu belajar yang terbatas',
    clickedCtaBootcamp: true,
    ctaClickTimestamp: '2026-09-29T21:07:45.000Z',
  },
];

export function getFunnelStats(): FunnelTracking {
  try {
    const raw = localStorage.getItem(FUNNEL_KEY);
    if (!raw) {
      localStorage.setItem(FUNNEL_KEY, JSON.stringify(defaultFunnel));
      return defaultFunnel;
    }
    return JSON.parse(raw);
  } catch {
    return defaultFunnel;
  }
}

export function trackFunnelStep(metric: keyof FunnelTracking): void {
  try {
    const stats = getFunnelStats();
    stats[metric] = (stats[metric] || 0) + 1;
    localStorage.setItem(FUNNEL_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to track funnel:', err);
  }
}

export function getAllSubmissions(): SubmissionRecord[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(defaultSeedSubmissions));
      return defaultSeedSubmissions;
    }
    return JSON.parse(raw);
  } catch {
    return defaultSeedSubmissions;
  }
}

export function saveSubmission(
  user: UserContact,
  answers: QuizAnswers,
  skor: number,
  goalNarrative: string,
  hambatanRingkasan: string
): SubmissionRecord {
  const all = getAllSubmissions();
  const newRecord: SubmissionRecord = {
    id: `lead-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user,
    answers,
    skor,
    goalNarrative,
    hambatanRingkasan,
    clickedCtaBootcamp: false,
  };

  all.unshift(newRecord);
  try {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all));
    trackFunnelStep('submittedForm');
  } catch (err) {
    console.error('Failed to save submission:', err);
  }
  return newRecord;
}

export function markCtaClicked(id: string): void {
  try {
    const all = getAllSubmissions();
    const item = all.find((s) => s.id === id);
    if (item) {
      item.clickedCtaBootcamp = true;
      item.ctaClickTimestamp = new Date().toISOString();
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all));
    }
    trackFunnelStep('clickedCta');
  } catch (err) {
    console.error('Failed to update CTA click:', err);
  }
}

/**
 * Generates CSV content conforming to PRD specifications:
 * "Data peserta harus bisa di-export (CSV atau Google Sheet) karena sertifikat dikirim manual oleh tim."
 */
export function exportSubmissionsToCsv(submissions: SubmissionRecord[]): string {
  const headers = [
    'ID',
    'Timestamp (WIB/UTC)',
    'Nama Lengkap (Sertifikat)',
    'Email',
    'Nomor WhatsApp/HP',
    'Skor Kecocokan (%)',
    'Goal',
    'Hambatan Terbesar',
    'Pernah Pasang Iklan',
    'Usia',
    'Pekerjaan Saat Ini',
    'Platform/Tools',
    'Rencana Penerapan Skill',
    'Jenis Latihan Disukai',
    'Metode Belajar Disukai',
    'Pendekatan Belajar',
    'Klik CTA Bootcamp',
    'Waktu Klik CTA',
  ];

  const escapeCsv = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const cleanStr = String(str).replace(/"/g, '""');
    return `"${cleanStr}"`;
  };

  const rows = submissions.map((s) => [
    escapeCsv(s.id),
    escapeCsv(new Date(s.timestamp).toLocaleString('id-ID')),
    escapeCsv(s.user.namaLengkap),
    escapeCsv(s.user.email),
    escapeCsv(s.user.nomorHp),
    escapeCsv(`${s.skor}%`),
    escapeCsv(s.answers.p1_goal),
    escapeCsv(s.answers.p3_kendala_terbesar),
    escapeCsv(s.answers.p1_pernah_iklan),
    escapeCsv(s.answers.p1_usia),
    escapeCsv(s.answers.p1_pekerjaan),
    escapeCsv(s.answers.p2_tools ? s.answers.p2_tools.join(', ') : '-'),
    escapeCsv(s.answers.p2_tempat_penerapan),
    escapeCsv(s.answers.p3_jenis_latihan),
    escapeCsv(s.answers.p3_cara_belajar),
    escapeCsv(s.answers.p3_pendekatan),
    escapeCsv(s.clickedCtaBootcamp ? 'Ya' : 'Belum'),
    escapeCsv(s.ctaClickTimestamp ? new Date(s.ctaClickTimestamp).toLocaleString('id-ID') : '-'),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

export function triggerCsvDownload(submissions: SubmissionRecord[]): void {
  const csvContent = exportSubmissionsToCsv(submissions);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `data-peserta-post-test-boleh-belajar-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function resetFunnelAndSubmissions(): void {
  localStorage.setItem(FUNNEL_KEY, JSON.stringify(defaultFunnel));
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(defaultSeedSubmissions));
}
