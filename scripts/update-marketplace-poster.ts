import {config} from 'dotenv';
import {writeFile} from 'node:fs/promises';
import {database,closeDatabase} from '../server/db.ts';
import {loadConfig} from '../server/repository.ts';
import {marketplaceDecemberBenefits,marketplaceDecemberCtaUrl} from '../db/marketplace-december.ts';
config({path:'.env.local',quiet:true});
const image='/images/voucher-marketplace-desember.png';
const imageAlt='Diskon tambahan 5% Marketplace Specialist Bootcamp khusus peserta Mini Class; tidak dapat digabung dengan promo lainnya';
try {
  const db=database();
  if(process.argv.includes('--apply')) {
    const response=await fetch('https://post-test-product.vercel.app'+image);
    if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw new Error('Image not deployed');
    await db.transaction!(async tx=>{
      await tx.query("UPDATE quiz_configs SET config=jsonb_set(jsonb_set(config,'{offer,image}',$2::jsonb),'{offer,imageAlt}',$3::jsonb),revision=revision+1,updated_at=now() WHERE slug=$1",['marketplace-desember-2026',JSON.stringify(image),JSON.stringify(imageAlt)]);
      await tx.query("UPDATE participant_sessions SET config_snapshot=jsonb_set(jsonb_set(config_snapshot,'{offer,image}',$2::jsonb),'{offer,imageAlt}',$3::jsonb) WHERE quiz_slug=$1",['marketplace-desember-2026',JSON.stringify(image),JSON.stringify(imageAlt)]);
      await tx.query("UPDATE quiz_configs SET config=jsonb_set(config,'{offer,benefits}',$2::jsonb) WHERE slug=$1",['marketplace-desember-2026',JSON.stringify(marketplaceDecemberBenefits)]);
      await tx.query("UPDATE participant_sessions SET config_snapshot=jsonb_set(config_snapshot,'{offer,benefits}',$2::jsonb) WHERE quiz_slug=$1",['marketplace-desember-2026',JSON.stringify(marketplaceDecemberBenefits)]);
      await tx.query("UPDATE quiz_configs SET config=jsonb_set(config,'{offer,ctaUrl}',$2::jsonb) WHERE slug=$1",['marketplace-desember-2026',JSON.stringify(marketplaceDecemberCtaUrl)]);
      await tx.query("UPDATE participant_sessions SET config_snapshot=jsonb_set(config_snapshot,'{offer,ctaUrl}',$2::jsonb) WHERE quiz_slug=$1",['marketplace-desember-2026',JSON.stringify(marketplaceDecemberCtaUrl)]);
    });
  }
  const c=(await loadConfig(db,'marketplace-desember-2026')).config;
  c.offer.image=image;c.offer.imageAlt=imageAlt;
  c.offer.benefits=[...marketplaceDecemberBenefits];
  c.offer.ctaUrl=marketplaceDecemberCtaUrl;
  await writeFile('docs/quiz-archive/marketplace-december-config.json',JSON.stringify(c,null,2));
  console.log(process.argv.includes('--apply')?'Poster Marketplace Desember diperbarui.':'Poster siap secara lokal. Terapkan setelah gambar tersedia di Vercel.');
}catch{console.error('Poster belum diperbarui. Periksa deployment gambar dan koneksi database.');process.exitCode=1;}
finally{await closeDatabase();}
