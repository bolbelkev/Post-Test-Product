import {config} from 'dotenv';
import {readFile,writeFile} from 'node:fs/promises';
import {database,closeDatabase} from '../server/db.ts';
import {loadConfig} from '../server/repository.ts';
import {validateConfig} from '../server/domain.ts';
import {seoConfig} from '../db/seo.ts';
config({path:'.env.local',quiet:true});
try {
  const source=JSON.parse(await readFile('docs/quiz-archive/seo-source.json','utf8'));
  const db=database();const c=validateConfig(seoConfig((await loadConfig(db,'pm')).config,source));
  // Keep the existing contact destination and voucher; remove PM-specific URL values.
  const contact=new URL(c.offer.ctaUrl);
  if(contact.hostname==='wa.me') {contact.searchParams.set('text','halo Minbel, saya mau klaim promo post test mini class SEO!');c.offer.ctaUrl=contact.toString();}
  if(/performance-marketing|marketplace/i.test(c.offer.ctaUrl))throw new Error('Review SEO offer destination');
  const r=await db.query('INSERT INTO quiz_configs(slug,config) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING slug',['seo-batch-4',JSON.stringify(c)]);
  await writeFile('docs/quiz-archive/seo-config.json',JSON.stringify(c,null,2));
  console.log(JSON.stringify({created:!!r.rows.length,slug:'seo-batch-4',active:false,questions:20}));
}catch {console.error('Setup SEO gagal; kredensial tidak ditampilkan.');process.exitCode=1;}
finally {await closeDatabase();}
