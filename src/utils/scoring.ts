/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuizAnswers } from '../types.ts';

/**
 * PRD Bagian 6: Logika Skor (murni self-report)
 * Skor = 70 (dasar) + total poin. Part 3 tidak dihitung.
 * Range yang dihasilkan: 78% - 95%. Selalu bilangan bulat, minimal 70%.
 */
export function calculateMatchScore(answers: QuizAnswers): {
  score: number;
  breakdown: Record<string, number>;
} {
  let totalPoints = 0;
  const breakdown: Record<string, number> = {};

  // Part 1 #1 — Pernah menjalankan iklan: Sudah +4 / Belum +2
  let p1_1_pts = 2; // default
  if (answers.p1_pernah_iklan === 'Sudah') {
    p1_1_pts = 4;
  } else if (answers.p1_pernah_iklan === 'Belum') {
    p1_1_pts = 2;
  }
  breakdown['Part 1 #1 (Pernah iklan)'] = p1_1_pts;
  totalPoints += p1_1_pts;

  // Part 2 #1 — Skill utama bisnis: Setuju +4 / Tidak setuju +1
  let p2_1_pts = 4;
  if (answers.p2_skill_utama === 'Tidak setuju') {
    p2_1_pts = 1;
  }
  breakdown['Part 2 #1 (Skill utama)'] = p2_1_pts;
  totalPoints += p2_1_pts;

  // Part 2 #2 — Berdampak ke penghasilan: Setuju +4 / Tidak setuju +1
  let p2_2_pts = 4;
  if (answers.p2_dampak_penghasilan === 'Tidak setuju') {
    p2_2_pts = 1;
  }
  breakdown['Part 2 #2 (Berdampak penghasilan)'] = p2_2_pts;
  totalPoints += p2_2_pts;

  // Part 2 #3 — Level kemampuan: Pemula banget +2 / Paham dasar +4 / Cukup mahir +5 / Sangat mahir +6
  let p2_3_pts = 2;
  if (answers.p2_kemampuan_sekarang === 'Sangat mahir') {
    p2_3_pts = 6;
  } else if (answers.p2_kemampuan_sekarang === 'Cukup mahir') {
    p2_3_pts = 5;
  } else if (answers.p2_kemampuan_sekarang === 'Paham dasar') {
    p2_3_pts = 4;
  } else {
    p2_3_pts = 2;
  }
  breakdown['Part 2 #3 (Level kemampuan)'] = p2_3_pts;
  totalPoints += p2_3_pts;

  // Part 2 #4 — Tools yang pernah dipakai:
  // Catatan Aturan: Jika Part 1 #1 = "Belum", di-skip dan otomatis bernilai "Belum pernah satupun" (+1).
  // Belum pernah satupun +1 / 1 tools +2 / 2 tools +3 / 3 tools +4
  let p2_4_pts = 1;
  if (answers.p1_pernah_iklan === 'Belum') {
    p2_4_pts = 1;
  } else {
    const tools = answers.p2_tools || [];
    if (tools.includes('Belum pernah satupun') || tools.length === 0) {
      p2_4_pts = 1;
    } else {
      const activeTools = tools.filter((t) => t !== 'Belum pernah satupun');
      if (activeTools.length >= 3) {
        p2_4_pts = 4;
      } else if (activeTools.length === 2) {
        p2_4_pts = 3;
      } else if (activeTools.length === 1) {
        p2_4_pts = 2;
      } else {
        p2_4_pts = 1;
      }
    }
  }
  breakdown['Part 2 #4 (Tools dipakai)'] = p2_4_pts;
  totalPoints += p2_4_pts;

  // Part 2 #5 — Tempat menerapkan:
  // Opsi 1-4 (Bisnis sendiri / Perusahaan tempat bekerja / Klien freelance / Agency) +3 / Belum tahu +1
  let p2_5_pts = 1;
  if (
    answers.p2_tempat_penerapan &&
    answers.p2_tempat_penerapan !== 'Belum tahu'
  ) {
    p2_5_pts = 3;
  } else {
    p2_5_pts = 1;
  }
  breakdown['Part 2 #5 (Tempat penerapan)'] = p2_5_pts;
  totalPoints += p2_5_pts;

  // Skor = 70 + total poin (batas pengaman minimum 70)
  const finalScore = Math.max(70, Math.round(70 + totalPoints));

  return {
    score: finalScore,
    breakdown,
  };
}

/**
 * PRD Bagian 5: Narasi dinamis dari goal Part 1 #4
 */
export function getGoalNarrative(goal: string | undefined, score: number): string {
  switch (goal) {
    case 'Cari pekerjaan pertama':
      return `Kamu ${score}% siap memulai karier pertama sebagai Performance Marketer`;
    case 'Bikin bisnis':
      return `Kamu ${score}% siap menjalankan iklan untuk bisnismu sendiri`;
    case 'Switch career':
      return `Kamu ${score}% siap beralih karier jadi Performance Marketer`;
    case 'Upskill untuk kebutuhan kerjaan':
      return `Kamu ${score}% siap naik level jadi Performance Marketer yang lebih strategis`;
    default:
      return `Kamu ${score}% siap melangkah ke level berikutnya di Performance Marketing`;
  }
}

/**
 * PRD Bagian 5: Teks tampilan "Hambatan sebelumnya" dari Part 3 #4
 */
export function getHambatanText(kendala: string | undefined): string {
  switch (kendala) {
    case 'Bentrok dengan waktu kerja':
      return 'Waktu belajar yang terbatas';
    case 'Belum punya sosok guru yang bisa diajak diskusi':
      return 'Belum ada mentor untuk berdiskusi';
    case 'Tidak tahu mulai dari mana':
      return 'Belum tahu harus mulai dari mana';
    case 'Semuanya di atas':
      return 'Waktu terbatas, belum ada mentor, dan belum tahu arah belajar';
    default:
      return 'Butuh kurikulum terstruktur dan bimbingan praktisi';
  }
}

/**
 * UTM URL Generator for Bootcamp Performance Marketing CTA
 */
export function getBootcampCtaUrl(userId?: string): string {
  const baseUrl = 'https://bolehbelajar.com/bootcamp-performance-marketing';
  const params = new URLSearchParams({
    utm_source: 'mini_class_post_test',
    utm_medium: 'referral',
    utm_campaign: 'fundamental_pm_upsell',
    utm_content: 'results_page_cta',
  });
  if (userId) {
    params.set('lead_ref', userId);
  }
  return `${baseUrl}?${params.toString()}`;
}
