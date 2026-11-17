import {config} from 'dotenv';
import {writeFile} from 'node:fs/promises';
import {database,closeDatabase} from '../server/db.ts';
import {loadConfig,updateConfig} from '../server/repository.ts';
import {withoutSeoCertificate} from '../db/seo-flow.ts';
config({path:'.env.local',quiet:true});
try {
  const db=database();const row=await loadConfig(db,'seo-batch-4');
  const c=withoutSeoCertificate(row.config);
  if(process.argv.includes('--apply'))await updateConfig(db,c,row.revision,'seo-batch-4');
  await writeFile('docs/quiz-archive/seo-config.json',JSON.stringify(c,null,2));
  console.log(process.argv.includes('--apply')?'Alur SEO diperbarui untuk sesi baru. PM dan Marketplace tidak diubah.':'Draft SEO siap. Database belum diubah; terapkan setelah kode baru aktif.');
}catch{console.error('Pembaruan SEO gagal; kredensial tidak ditampilkan.');process.exitCode=1;}
finally{await closeDatabase();}
