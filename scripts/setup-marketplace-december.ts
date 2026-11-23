import {config} from 'dotenv';
import {readFile,writeFile} from 'node:fs/promises';
import {database,closeDatabase} from '../server/db.ts';
import {loadConfig} from '../server/repository.ts';
import {validateConfig} from '../server/domain.ts';
import {marketplaceDecemberConfig} from '../db/marketplace-december.ts';
config({path:'.env.local',quiet:true});
try {
  const db=database();
  await db.query(await readFile('db/migrations/002_contact_phone.sql','utf8'));
  const c=validateConfig(marketplaceDecemberConfig((await loadConfig(db,'marketplace-batch-3-4')).config));
  const result=await db.query('INSERT INTO quiz_configs(slug,config) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING slug',['marketplace-desember-2026',JSON.stringify(c)]);
  await writeFile('docs/quiz-archive/marketplace-december-config.json',JSON.stringify(c,null,2));
  console.log(JSON.stringify({created:!!result.rows.length,slug:'marketplace-desember-2026',active:false,recapQuestions:c.sections.find(s=>s.kind==='recap')!.questions.length,contactAtStart:c.contactAtStart,certificateEnabled:c.certificateEnabled}));
}catch{console.error('Setup Marketplace Desember gagal; kredensial tidak ditampilkan.');process.exitCode=1;}
finally{await closeDatabase();}
