import type { IncomingMessage, ServerResponse } from 'node:http';
import { database, type Database } from './db.ts';
import { cookieValue, hash, makeCookie, token, verifyPassword, hashPassword } from './security.ts';
import { HttpError, publicConfig } from './domain.ts';
import { startParticipant, readParticipant, saveAnswer, saveProgress, completeParticipant, sessionRow, loadConfig, updateConfig, listParticipants, exportCsv } from './repository.ts';
import { quizSlug, listQuizzes, duplicateQuiz, setQuizActive } from './repository.ts';

async function readBody(req: IncomingMessage & { body?: unknown }) {
  if (req.body !== undefined) {
    try {
      if (JSON.stringify(req.body).length > 256000) throw new HttpError(413, 'Data terlalu besar.');
      return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch(error) { if (error instanceof HttpError) throw error; throw new HttpError(400, 'Data JSON tidak valid.'); }
  }
  const chunks: Buffer[] = []; let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk); size += buffer.length;
    if (size > 256000) throw new HttpError(413, 'Data terlalu besar.');
    chunks.push(buffer);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); }
  catch { throw new HttpError(400, 'Data JSON tidak valid.'); }
}
const dummyPassword = hashPassword('dummy-password-never-valid');
export function createHandler(getDatabase: () => Database = database) {
  return async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const send = (status: number, data: unknown) => { res.statusCode = status; res.setHeader('Content-Type','application/json; charset=utf-8'); res.end(JSON.stringify(data)); };
    try {
      const url = new URL(req.url || '/', 'http://localhost');
      const route = url.searchParams.get('route') || url.pathname.replace(/^\/api\/?/, '');
      const method = req.method || 'GET';
      if (!['GET','POST','PUT'].includes(method)) throw new HttpError(405, 'Method tidak didukung.');
      if (method !== 'GET') {
        if (req.headers['sec-fetch-site'] === 'cross-site') throw new HttpError(403,'Request lintas situs ditolak.');
        const origin = req.headers.origin;
        const allowed = process.env.APP_ORIGIN || `${process.env.VERCEL || process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${req.headers.host}`;
        if (origin && origin !== allowed) throw new HttpError(403, 'Origin tidak diizinkan.');
        if (!String(req.headers['content-type']).startsWith('application/json')) throw new HttpError(415, 'Gunakan application/json.');
      }
      const db = getDatabase();
      const slug = quizSlug(url.searchParams.get('quiz') || 'pm');
      const participantCookie = slug === 'pm' ? 'bb_participant' : `bb_participant_${slug}`;
      const sessionToken = cookieValue(req.headers.cookie, participantCookie);
      const body = method === 'GET' ? {} : await readBody(req);
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Body request harus berupa object.');
      if (route === 'config' && method === 'GET') return send(200, publicConfig((await loadConfig(db, slug)).config));
      if (['session','answer','answers','progress','complete','cta'].includes(route) && !(route === 'session' && method === 'POST')) {
        const session = await sessionRow(db, sessionToken);
        if (session.quiz_slug !== slug) throw new HttpError(401, 'Sesi tidak sesuai link post test.');
        const live = (await loadConfig(db, slug)).config;
        if (!live.active && session.status !== 'completed') throw new HttpError(403, 'Post test sedang ditutup.');
      }
      if (route === 'session' && method === 'POST') {
        // Shared DB limit applies across Vercel instances; cookies hold only a random identifier.
        const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
        await limit(db, `start:${hash(ip)}`, 2000);
        const result = await startParticipant(db, body.name, slug);
        res.setHeader('Set-Cookie', makeCookie(participantCookie, result.sessionToken, 30*86400));
        return send(201, result.participant);
      }
      if (route === 'session' && method === 'GET') return send(200, await readParticipant(db, sessionToken));
      if (route === 'answer' && method === 'POST') { await saveAnswer(db, sessionToken, body.key, body.answer); return send(200, { saved: true }); }
      if (route === 'answers' && method === 'POST') {
        if (!Array.isArray(body.answers) || body.answers.length > 200) throw new HttpError(400, 'Kumpulan jawaban tidak valid.');
        const save = async (tx: Database) => {
          for (const entry of body.answers) {
            if (!entry || typeof entry.key !== 'string') throw new HttpError(400, 'Jawaban tidak valid.');
            await saveAnswer(tx, sessionToken, entry.key, entry.answer);
          }
          await saveProgress(tx, sessionToken, body.step);
        };
        if (db.transaction) await db.transaction(save); else await save(db);
        return send(200, { saved: true });
      }
      if (route === 'progress' && method === 'POST') { await saveProgress(db, sessionToken, body.step); return send(200, { saved: true }); }
      if (route === 'complete' && method === 'POST') return send(200, await completeParticipant(db, sessionToken, body.email));
      if (route === 'cta' && method === 'POST') {
        const s = await sessionRow(db, sessionToken);
        await db.query('UPDATE participant_sessions SET clicked_cta_at=COALESCE(clicked_cta_at,now()) WHERE id=$1',[s.id]);
        return send(200, { saved: true });
      }
      if (route === 'admin/login' && method === 'POST') {
        if (typeof body.email !== 'string' || typeof body.password !== 'string' || body.password.length > 200) throw new HttpError(400,'Email atau password tidak valid.');
        const email = body.email.trim().toLowerCase();
        const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
        await limit(db, `login-ip:${hash(ip)}`, 15);
        await limit(db, `login-email:${hash(email)}`, 10);
        const admin = (await db.query('SELECT id,password_hash FROM admin_users WHERE email=$1', [email])).rows[0];
        if (!verifyPassword(body.password, admin?.password_hash || dummyPassword) || !admin) throw new HttpError(401,'Email atau password salah.');
        const authToken = token();
        await db.query('INSERT INTO admin_sessions(token_hash,admin_id) VALUES($1,$2)', [hash(authToken),admin.id]);
        res.setHeader('Set-Cookie', makeCookie('bb_admin', authToken, 12*3600));
        return send(200,{ authenticated: true });
      }
      if (route.startsWith('admin/')) {
        const adminToken = cookieValue(req.headers.cookie, 'bb_admin');
        const admin = adminToken && (await db.query('SELECT admin_id FROM admin_sessions WHERE token_hash=$1 AND expires_at>now()',[hash(adminToken)])).rows[0];
        if (!admin) throw new HttpError(401,'Silakan login admin.');
        if (route === 'admin/quizzes' && method === 'GET') return send(200, await listQuizzes(db));
        if (route === 'admin/duplicate' && method === 'POST') return send(201, await duplicateQuiz(db, slug, body));
        if (route === 'admin/active' && method === 'PUT') return send(200, await setQuizActive(db, slug, body.active, body.revision));
        if (route === 'admin/logout' && method === 'POST') {
          await db.query('DELETE FROM admin_sessions WHERE token_hash=$1', [hash(adminToken!)]);
          res.setHeader('Set-Cookie',makeCookie('bb_admin','',0)); return send(200,{ loggedOut:true });
        }
        if (route === 'admin/config' && method === 'GET') return send(200,await loadConfig(db, slug));
        if (route === 'admin/config' && method === 'PUT') return send(200,await updateConfig(db,body.config,body.revision, slug));
        if (route === 'admin/participants' && method === 'GET') {
          const page = Math.max(1,Math.min(10000,Number(url.searchParams.get('page')) || 1));
          return send(200,await listParticipants(db,Math.floor(page),url.searchParams.get('status') || '',url.searchParams.get('search') || '',slug));
        }
        if (route === 'admin/export' && method === 'GET') {
          const csv = await exportCsv(db,url.searchParams.get('status') || '',slug);
          res.statusCode=200;res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition',`attachment; filename="peserta-post-test-${slug}.csv"`); return res.end(csv);
        }
      }
      throw new HttpError(404, 'Endpoint tidak ditemukan.');
    } catch(error) {
      if (error instanceof HttpError) return send(error.status,{ error: error.message });
      // Never expose connection strings, queries, or participant details in error responses/logs.
      const notConfigured = error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED';
      send(503,{ error: notConfigured ? 'Database belum terhubung. Konfigurasikan DATABASE_URL dan jalankan setup database.' : 'Penyimpanan sedang tidak tersedia. Silakan coba lagi.' });
    }
  };
}
async function limit(db: Database, key: string, max: number) {
  const row = (await db.query(`INSERT INTO login_limits(key) VALUES($1) ON CONFLICT(key) DO UPDATE
    SET attempts=CASE WHEN login_limits.window_started<now()-interval '15 minutes' THEN 1 ELSE login_limits.attempts+1 END,
    window_started=CASE WHEN login_limits.window_started<now()-interval '15 minutes' THEN now() ELSE login_limits.window_started END RETURNING attempts`,[key])).rows[0];
  if (row.attempts > max) throw new HttpError(429, 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.');
}
