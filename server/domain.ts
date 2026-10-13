import type { Answer, QuizConfig, Question } from '../shared/model.ts';
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export const allQuestions = (c: QuizConfig) => c.sections.flatMap(s => s.questions);
export function publicConfig(config: QuizConfig): QuizConfig {
  return { ...config, sections: config.sections.map(s => ({ ...s, questions: s.questions.map(({ correctAnswer, points, countPoints, ...q }) => q) })) };
}
export function validAnswer(q: Question, value: unknown): Answer {
  if (q.type === 'rating' && Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5) return value as number;
  if (q.type === 'multi' && Array.isArray(value) && value.length <= q.options.length && value.every(v => typeof v === 'string' && q.options.includes(v)) && new Set(value).size === value.length) {
    if (value.includes('Belum pernah satupun') && value.length > 1) throw new HttpError(400, 'Pilihan tools tidak valid.');
    if (q.required && !value.length) throw new HttpError(400, 'Pilih minimal satu jawaban.');
    return value;
  }
  if (typeof value === 'string' && value.length <= (q.type === 'text' ? 3000 : 500)) {
    const trimmed = value.trim();
    if (q.required && !trimmed) throw new HttpError(400, 'Jawaban wajib diisi.');
    if (q.type === 'text' || (q.type === 'single' && (q.allowOther || q.options.includes(trimmed)))) return trimmed;
  }
  throw new HttpError(400, 'Jawaban tidak sesuai tipe pertanyaan.');
}
export function effectiveAnswers(config: QuizConfig, answers: Record<string, Answer>) {
  const result = { ...answers };
  for (const q of allQuestions(config)) if (q.skipWhen && JSON.stringify(result[q.skipWhen.key]) === JSON.stringify(q.skipWhen.value)) result[q.key] = q.skipWhen.answer;
  return result;
}
export function scores(config: QuizConfig, raw: Record<string, Answer>) {
  const answers = effectiveAnswers(config, raw);
  const recap = config.sections.filter(s => s.kind === 'recap').flatMap(s => s.questions);
  let score = config.baseScore;
  for (const q of allQuestions(config)) {
    const a = answers[q.key];
    if (typeof a === 'string' && q.points && Object.hasOwn(q.points, a)) score += q.points[a];
    if (Array.isArray(a) && q.countPoints) score += q.countPoints[a.includes('Belum pernah satupun') ? 0 : a.length] ?? 0;
  }
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  const goal = String(answers.p1_goal);
  const narrative = (Object.hasOwn(config.narratives, goal) ? config.narratives[goal] : config.defaultNarrative).replaceAll('{score}', String(finalScore));
  return { score: finalScore, recapCorrect: recap.filter(q => q.correctAnswer === answers[q.key]).length, recapTotal: recap.length, narrative };
}
export function validateConfig(raw: unknown): QuizConfig {
  if (!raw || typeof raw !== 'object') throw new HttpError(400, 'Konfigurasi tidak valid.');
  const c = raw as QuizConfig;
  const requiredStrings = [c.title, c.batch, c.welcomeDescription, c.certificateNotice, c.certificateEligibility, c.defaultNarrative, c.offer?.title, c.offer?.ctaText];
  if (requiredStrings.some(v => typeof v !== 'string' || !v.trim() || v.length > 2000) || typeof c.active !== 'boolean' || !Number.isFinite(c.baseScore) || c.baseScore < 0 || c.baseScore > 100) throw new HttpError(400, 'Lengkapi judul, batch, informasi sertifikat, dan penawaran.');
  if (!Array.isArray(c.sections) || c.sections.length !== 5 || new Set(c.sections.map(s => s.kind)).size !== 5 || c.sections.some(s => !['profile','feedback','recap','assessment','preferences'].includes(s.kind))) throw new HttpError(400, 'Pertahankan lima jenis section PM.');
  if (new Set(c.sections.map(s => s.key)).size !== 5 || c.sections.some(s => !/^[a-z][a-z0-9_-]*$/.test(s.key) || !s.title || !Number.isInteger(s.perPage) || s.perPage < 1 || s.perPage > 2 || !Array.isArray(s.questions) || !s.questions.length)) throw new HttpError(400, 'Section harus berisi pertanyaan dan 1–2 pertanyaan per layar.');
  const qs = allQuestions(c);
  if (qs.length > 200 || new Set(qs.map(q => q.key)).size !== qs.length) throw new HttpError(400, 'ID pertanyaan harus unik, maksimal 200 soal.');
  for (const q of qs) {
    if (!/^[a-z][a-z0-9_.-]{0,79}$/.test(q.key) || ['__proto__','constructor','prototype'].includes(q.key) || typeof q.text !== 'string' || !q.text.trim() || q.text.length > 2000 || !['single','multi','rating','text'].includes(q.type) || typeof q.required !== 'boolean' || !Array.isArray(q.options) || q.options.length > 20 || q.options.some(o => typeof o !== 'string' || !o.trim() || o.length > 500) || new Set(q.options).size !== q.options.length) throw new HttpError(400, 'ID, teks, tipe, atau opsi pertanyaan tidak valid.');
    if (['single','multi'].includes(q.type) && !q.options.length) throw new HttpError(400, 'Pertanyaan pilihan harus punya opsi.');
    if (c.sections.find(s => s.questions.includes(q))?.kind === 'recap' && (q.type !== 'single' || !q.correctAnswer || !q.options.includes(q.correctAnswer))) throw new HttpError(400, 'Soal recap harus memiliki satu kunci yang ada dalam opsi.');
    if (q.points && (Array.isArray(q.points) || Object.values(q.points).some(n => !Number.isFinite(n) || Math.abs(n) > 100))) throw new HttpError(400, 'Poin penilaian tidak valid.');
    if (q.countPoints && (!Array.isArray(q.countPoints) || q.countPoints.length > 21 || q.countPoints.some(n => !Number.isFinite(n) || Math.abs(n) > 100))) throw new HttpError(400, 'Poin multi-select tidak valid.');
    if (q.skipWhen && (!qs.some(p => p.key === q.skipWhen!.key && p.key !== q.key) || !['single','multi'].includes(q.type))) throw new HttpError(400, 'Aturan skip tidak valid.');
    if (q.skipWhen) validAnswer(q, q.skipWhen.answer);
  }
  for (const key of ['p1_goal','p3_kendala_terbesar']) if (!qs.some(q => q.key === key)) throw new HttpError(400, `Pertahankan pertanyaan ${key} untuk ringkasan hasil.`);
  if (!c.narratives || typeof c.narratives !== 'object' || Array.isArray(c.narratives) || Object.values(c.narratives).some(v => typeof v !== 'string' || v.length > 2000)) throw new HttpError(400, 'Narasi hasil tidak valid.');
  for (const list of [c.welcomePoints, c.offer.benefits]) if (!Array.isArray(list) || list.length > 20 || list.some(v => typeof v !== 'string' || v.length > 1000)) throw new HttpError(400, 'Daftar benefit tidak valid.');
  if (typeof c.offer.image !== 'string' || !(c.offer.image.startsWith('/images/') || c.offer.image.startsWith('https://')) || !c.offer.ctaUrl?.startsWith('https://')) throw new HttpError(400, 'Gambar harus /images/... atau HTTPS, link CTA harus HTTPS.');
  try { new URL(c.offer.ctaUrl); if (c.offer.image.startsWith('https://')) new URL(c.offer.image); } catch { throw new HttpError(400, 'URL tidak valid.'); }
  if (!Array.isArray(c.offer.rules) || c.offer.rules.length > 100 || c.offer.rules.some(r => !qs.some(q => q.key === r.key) || !Array.isArray(r.values) || r.values.some(v => typeof v !== 'string') || typeof r.text !== 'string' || r.text.length > 1000)) throw new HttpError(400, 'Aturan benefit tidak valid.');
  return c;
}
export function csvCell(value: unknown) {
  let text = value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
