import { config } from 'dotenv';
import { readFile } from 'node:fs/promises';
import { database, closeDatabase } from '../server/db.ts';
import { initialConfig } from '../db/seed.ts';
import { validateConfig } from '../server/domain.ts';
config({ path: '.env.local', quiet: true });
try {
  const db = database();
  const migration = await readFile(new URL('../db/migrations/001_initial.sql', import.meta.url),'utf8');
  await db.query(migration);
  validateConfig(initialConfig);
  await db.query("INSERT INTO quiz_configs(slug,config) VALUES('pm',$1) ON CONFLICT(slug) DO NOTHING", [JSON.stringify(initialConfig)]);
  console.log('Tabel dan konfigurasi PM siap. Konfigurasi yang sudah ada tidak ditimpa.');
} catch { console.error('Setup gagal. Periksa koneksi DATABASE_URL, SSL, dan akses Railway. Kredensial tidak dicetak.'); process.exitCode=1; }
finally { await closeDatabase(); }
