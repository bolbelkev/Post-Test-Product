import { config } from 'dotenv';
import { readFile,writeFile } from 'node:fs/promises';
import { database,closeDatabase } from '../server/db.ts';
import { loadConfig } from '../server/repository.ts';
import { validateConfig } from '../server/domain.ts';
import { marketplaceConfig,type MarketplaceSource } from '../db/marketplace.ts';
config({path:'.env.local',quiet:true});
try {
  const source=JSON.parse(await readFile('docs/quiz-archive/marketplace-source.json','utf8')) as MarketplaceSource;
  const db=database();
  const c=validateConfig(marketplaceConfig((await loadConfig(db,'pm')).config,source));
  const result=await db.query('INSERT INTO quiz_configs(slug,config) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING slug',['marketplace-batch-3-4',JSON.stringify(c)]);
  await writeFile('docs/quiz-archive/marketplace-config.json',JSON.stringify(c,null,2));
  console.log(JSON.stringify({created:!!result.rows.length,slug:'marketplace-batch-3-4',active:false,recapQuestions:c.sections.find(s=>s.kind==='recap')!.questions.length,excluded:source.questions.filter(q=>q.red).map(q=>q.number)}));
} catch {console.error('Pembuatan Marketplace gagal; kredensial tidak ditampilkan.');process.exitCode=1;}
finally {await closeDatabase();}
