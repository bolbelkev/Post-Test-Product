import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';
import { database,closeDatabase } from '../server/db.ts';
import { hashPassword } from '../server/security.ts';
config({ path: '.env.local',quiet:true });
try {
  const email=process.env.ADMIN_EMAIL?.trim().toLowerCase(); const password=process.env.ADMIN_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length<12) throw new Error('invalid');
  await database().query('INSERT INTO admin_users(id,email,password_hash) VALUES($1,$2,$3) ON CONFLICT(email) DO NOTHING',[randomUUID(),email,hashPassword(password)]);
  console.log('Akun admin siap. Akun yang sudah ada tidak diubah.');
} catch { console.error('Gagal membuat admin. Isi ADMIN_EMAIL dan ADMIN_PASSWORD minimal 12 karakter, lalu periksa database.');process.exitCode=1; }
finally { await closeDatabase(); }
