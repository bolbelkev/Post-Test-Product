import { randomUUID } from 'node:crypto';
import type { Database } from './db.ts';
import type { Answer, Participant, QuizConfig } from '../shared/model.ts';
import { hash, token } from './security.ts';
import { allQuestions, effectiveAnswers, HttpError, publicConfig, scores, validAnswer, validateConfig, csvCell } from './domain.ts';

export async function loadConfig(db: Database, slug = 'pm') {
  const row = (await db.query('SELECT config,revision FROM quiz_configs WHERE slug=$1', [slug])).rows[0];
  if (!row) throw new HttpError(404, 'Link post test tidak ditemukan.');
  return row as { config: QuizConfig; revision: number };
}
export async function sessionRow(db: Database, sessionToken?: string) {
  if (!sessionToken || !/^[A-Za-z0-9_-]{43}$/.test(sessionToken)) throw new HttpError(401, 'Sesi tidak ditemukan. Mulai post test terlebih dahulu.');
  const row = (await db.query('SELECT * FROM participant_sessions WHERE token_hash=$1 AND expires_at>now()', [hash(sessionToken)])).rows[0];
  if (!row) throw new HttpError(401, 'Sesi sudah berakhir. Mulai post test kembali.');
  return row;
}
export async function readParticipant(db: Database, sessionToken?: string): Promise<Participant> {
  const row = await sessionRow(db, sessionToken);
  const entries = (await db.query('SELECT question_key,answer FROM participant_answers WHERE session_id=$1', [row.id])).rows;
  const answers = effectiveAnswers(row.config_snapshot, Object.fromEntries(entries.map(e => [e.question_key, e.answer])));
  const computed = scores(row.config_snapshot, answers);
  return { id: row.id, name: row.name, email: row.email, phone:row.phone, status: row.status, step: row.step, answers, config: publicConfig(row.config_snapshot), ...computed, clickedCta: !!row.clicked_cta_at };
}
export async function startParticipant(db: Database, name: unknown, slug = 'pm', contact?:{email?:unknown;phone?:unknown}) {
  const { config } = await loadConfig(db, slug);
  if ((config.certificateEnabled !== false || config.contactAtStart) && (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 150)) throw new HttpError(400, 'Nama harus 3–150 karakter.');
  const participantName = config.certificateEnabled === false && !config.contactAtStart ? '' : (name as string).trim();
  let email:string|null=null;let phone:string|null=null;
  if(config.contactAtStart){
    if(typeof contact?.email!=='string'||contact.email.trim().length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim()))throw new HttpError(400,'Isi alamat email yang valid.');
    if(typeof contact.phone!=='string'||contact.phone.length>30)throw new HttpError(400,'Isi nomor HP yang valid.');
    phone=contact.phone.replace(/[\s()-]/g,'');
    if(!/^\+?[0-9]{9,15}$/.test(phone))throw new HttpError(400,'Nomor HP harus terdiri dari 9–15 digit.');
    email=contact.email.trim().toLowerCase();
  }
  if (!config.active) throw new HttpError(403, 'Post test belum dibuka.');
  const sessionToken = token();
  if(config.contactAtStart) await db.query('INSERT INTO participant_sessions(id,token_hash,quiz_slug,name,config_snapshot,email,phone) VALUES($1,$2,$3,$4,$5,$6,$7)', [randomUUID(), hash(sessionToken), slug, participantName, JSON.stringify(config),email,phone]);
  else await db.query('INSERT INTO participant_sessions(id,token_hash,quiz_slug,name,config_snapshot) VALUES($1,$2,$3,$4,$5)', [randomUUID(), hash(sessionToken), slug, participantName, JSON.stringify(config)]);
  return { sessionToken, participant: await readParticipant(db, sessionToken) };
}
export async function saveAnswer(db: Database, sessionToken: string | undefined, key: unknown, raw: unknown) {
  const session = await sessionRow(db, sessionToken);
  if (session.status === 'completed') throw new HttpError(409, 'Pengerjaan ini sudah selesai. Mulai ulang untuk jawaban baru.');
  const q = allQuestions(session.config_snapshot).find(q => q.key === key);
  if (!q) throw new HttpError(400, 'Pertanyaan tidak ditemukan dalam sesi ini.');
  const answer = validAnswer(q.detailFor ? {...q, required:false} : q, raw);
  // The parent update obtains a row lock; completion cannot race this upsert.
  const result = await db.query(`WITH active AS (
    UPDATE participant_sessions SET updated_at=now() WHERE id=$1 AND status='in_progress' RETURNING id
  ) INSERT INTO participant_answers(session_id,question_key,question_snapshot,answer)
    SELECT id,$2,$3,$4 FROM active ON CONFLICT(session_id,question_key)
    DO UPDATE SET answer=EXCLUDED.answer,updated_at=now() RETURNING question_key`,
    [session.id, q.key, JSON.stringify(q), JSON.stringify(answer)]);
  if (!result.rows.length) throw new HttpError(409, 'Pengerjaan ini sudah selesai.');
}
export async function saveProgress(db: Database, sessionToken: string | undefined, step: unknown) {
  if (!Number.isInteger(step) || Number(step) < 0 || Number(step) > 500) throw new HttpError(400, 'Progres tidak valid.');
  const s = await sessionRow(db, sessionToken);
  await db.query("UPDATE participant_sessions SET step=$2,updated_at=now() WHERE id=$1 AND status='in_progress'", [s.id, step]);
}
export async function completeParticipant(db: Database, sessionToken: string | undefined, email: unknown): Promise<Participant> {
  if (db.transaction) return db.transaction(tx => completeParticipant(tx, sessionToken, email));
  const row = await sessionRow(db, sessionToken);
  const requiresEmail = row.config_snapshot.certificateEnabled !== false;
  if (requiresEmail && (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) throw new HttpError(400, 'Email tidak valid.');
  const contactEmail = requiresEmail ? (email as string).trim().toLowerCase() : row.email;
  if (row.status === 'completed') {
    if (row.email !== contactEmail) throw new HttpError(409, 'Email untuk sesi ini sudah tersimpan.');
    return readParticipant(db, sessionToken);
  }
  const locked = (await db.query('SELECT * FROM participant_sessions WHERE id=$1 FOR UPDATE', [row.id])).rows[0];
  if (locked.status === 'completed') {
    if (locked.email !== contactEmail) throw new HttpError(409, 'Email untuk sesi ini sudah tersimpan.');
    return readParticipant(db, sessionToken);
  }
  const saved = (await db.query('SELECT question_key,answer FROM participant_answers WHERE session_id=$1',[row.id])).rows;
  const answers = effectiveAnswers(locked.config_snapshot, Object.fromEntries(saved.map(a=>[a.question_key,a.answer])));
  for (const q of allQuestions(locked.config_snapshot)) {
    if (q.detailFor && !answers[q.detailFor]) continue;
    if (q.required && answers[q.key] === undefined) throw new HttpError(400, 'Lengkapi seluruh pertanyaan wajib sebelum menyelesaikan post test.');
    if (answers[q.key] !== undefined) validAnswer(q, answers[q.key]);
  }
  const computed = scores(locked.config_snapshot, answers);
  await db.query(`UPDATE participant_sessions SET email=$2,status='completed',completed_at=COALESCE(completed_at,now()),updated_at=now(),recap_correct=$3,recap_total=$4,match_score=$5 WHERE id=$1`, [row.id, contactEmail, computed.recapCorrect, computed.recapTotal, computed.score]);
  return readParticipant(db, sessionToken);
}
export async function updateConfig(db: Database, raw: unknown, revision: unknown, slug = 'pm') {
  const config = validateConfig(raw);
  if (!Number.isInteger(revision)) throw new HttpError(400, 'Revision tidak valid.');
  const row = (await db.query('UPDATE quiz_configs SET config=$1,revision=revision+1,updated_at=now() WHERE slug=$3 AND revision=$2 RETURNING revision', [JSON.stringify(config), revision, slug])).rows[0];
  if (!row) throw new HttpError(409, 'Konfigurasi sudah diubah admin lain. Muat ulang sebelum menyimpan.');
  return row;
}
export async function listParticipants(db: Database, page: number, status: string, search: string, slug = 'pm') {
  const filter = status === 'completed' || status === 'in_progress' ? status : '';
  const rows = (await db.query(`SELECT id,name,email,phone,status,step,recap_correct,recap_total,match_score,created_at,completed_at,config_snapshot,config_snapshot->>'batch' AS batch,
    (SELECT COALESCE(jsonb_object_agg(question_key,answer),'{}'::jsonb) FROM participant_answers WHERE session_id=participant_sessions.id) AS saved_answers
    FROM participant_sessions WHERE quiz_slug=$4 AND ($1='' OR status=$1) AND ($2='' OR name ILIKE $2 OR email ILIKE $2)
    ORDER BY created_at DESC,id LIMIT 50 OFFSET $3`, [filter, search ? `%${search.slice(0,150)}%` : '', (page - 1) * 50, slug])).rows;
  return rows.map(({ config_snapshot, saved_answers, ...row }) => ({ ...row, match_score: row.status === 'completed' ? scores(config_snapshot, saved_answers).score : row.match_score }));
}
export async function exportCsv(db: Database, status: string, slug = 'pm') {
  const rows = (await db.query(`SELECT s.*,COALESCE(jsonb_object_agg(a.question_key,jsonb_build_object('question',a.question_snapshot,'answer',a.answer)) FILTER(WHERE a.question_key IS NOT NULL),'{}'::jsonb) AS responses
    FROM participant_sessions s LEFT JOIN participant_answers a ON a.session_id=s.id
    WHERE s.quiz_slug=$2 AND ($1='' OR s.status=$1) GROUP BY s.id ORDER BY s.created_at DESC LIMIT 10000`, [status === 'completed' || status === 'in_progress' ? status : '', slug])).rows;
  const columns = new Map<string,string>();
  for (const row of rows) for (const [key, entry] of Object.entries(row.responses) as [string,any][]) {
    const label = `${key}: ${entry.question.text}`;
    columns.set(label, key);
  }
  const labels = [...columns.keys()];
  const headers = ['ID sesi','Nama sertifikat','Email','Nomor HP','Batch','Status','Mulai (UTC)','Selesai (UTC)','Progres layar','Recap benar','Total soal recap','Skor asesmen','Klik CTA', ...labels];
  const data = rows.map(row => {
    const answers = Object.fromEntries(Object.entries(row.responses).map(([key,e]: [string,any]) => [key,e.answer]));
    const computed = scores(row.config_snapshot, answers);
    return [row.id,row.name,row.email,row.phone,row.config_snapshot.batch,row.config_snapshot.certificateEnabled===false ? (row.status==='completed'?'Selesai':'Belum selesai') : row.status === 'completed' ? 'Email tersimpan' : 'Belum melengkapi email',row.created_at.toISOString(),row.completed_at?.toISOString(),row.step,computed.recapCorrect,computed.recapTotal,computed.score,!!row.clicked_cta_at,...labels.map(label => {
      const key = columns.get(label)!; const entry = row.responses[key];
      return entry && `${key}: ${entry.question.text}` === label ? entry.answer : '';
    })];
  });
  return '\uFEFF' + [headers,...data].map(r => r.map(csvCell).join(',')).join('\r\n');
}

export function quizSlug(value: unknown) {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(value) || ['admin','api'].includes(value)) throw new HttpError(400, 'Link harus 1–64 huruf kecil, angka, atau tanda hubung.');
  return value;
}
export async function listQuizzes(db: Database) {
  return (await db.query("SELECT slug,config->>'title' AS title,config->>'batch' AS batch,(config->>'active')::boolean AS active,revision FROM quiz_configs ORDER BY updated_at DESC,slug")).rows;
}
export async function duplicateQuiz(db: Database, source: string, raw: any) {
  const slug = quizSlug(raw.slug);
  const { config } = await loadConfig(db, source);
  const copy = validateConfig({ ...config, title: raw.title, batch: raw.batch, active: false });
  const row = (await db.query('INSERT INTO quiz_configs(slug,config) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING slug', [slug, JSON.stringify(copy)])).rows[0];
  if (!row) throw new HttpError(409, 'Link sudah dipakai. Pilih link lain.');
  return row;
}
export async function setQuizActive(db: Database, slug: string, active: unknown, revision: unknown) {
  if (typeof active !== 'boolean' || !Number.isInteger(revision)) throw new HttpError(400, 'Status tidak valid.');
  const row = (await db.query("UPDATE quiz_configs SET config=jsonb_set(config,'{active}',$2::jsonb),revision=revision+1,updated_at=now() WHERE slug=$1 AND revision=$3 RETURNING revision", [slug, JSON.stringify(active), revision])).rows[0];
  if (!row) throw new HttpError(409, 'Data berubah. Muat ulang daftar post test.');
  return row;
}
