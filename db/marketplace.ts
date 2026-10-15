import type { QuizConfig, Question } from '../shared/model.ts';

export interface MarketplaceSource {
  questions: {number:number;red:boolean;question:string;options:{text:string;yellow:boolean}[]}[];
}
export function marketplaceConfig(sourceConfig: QuizConfig, source: MarketplaceSource): QuizConfig {
  const c = JSON.parse(JSON.stringify(sourceConfig).replaceAll('Performance Marketing','Marketplace').replaceAll('performance marketing','marketplace').replaceAll('Performance Marketer','Marketplace Specialist')) as QuizConfig;
  c.title = 'Post Test Mini Class Marketplace';
  c.batch = 'Marketplace Batch 3–4';
  c.active = false;
  c.offer.title = 'Bootcamp Marketplace — Boleh Belajar';
  c.offer.ctaText = 'Lihat Program Bootcamp Marketplace';
  const changes: Record<string,Partial<Question>> = {
    p1_pernah_iklan: {text:'Sudah pernah mengelola toko di marketplace sebelumnya?'},
    p1_goal: {text:'Goal utama kamu mengikuti Mini Class Marketplace?'},
    p2_skill_utama: {text:'Kamu setuju, pengelolaan marketplace jadi salah satu skill utama yang dibutuhkan bisnis saat ini?'},
    p2_dampak_penghasilan: {text:'Kamu setuju menguasai pengelolaan marketplace bisa berdampak positif ke penghasilan?'},
    p2_kemampuan_sekarang: {text:'Bagaimana kamu menilai kemampuan mengelola marketplace kamu sekarang?'},
    p2_tools: {text:'Platform marketplace apa yang pernah kamu kelola?',options:['Shopee','Tokopedia','TikTok Shop','Belum pernah satupun']},
    p3_jenis_latihan: {options:['Hands-on mengelola toko marketplace','Analisis data performa toko','Study case dari agency','Semua di atas']},
    p3_kendala_terbesar: {text:'Apa kendala terbesar kamu saat ini untuk belajar mengelola marketplace?'},
  };
  for (const section of c.sections) {
    if(section.kind==='recap') {
      section.questions=source.questions.filter(q=>!q.red).map(q=>{
        const keys=q.options.filter(o=>o.yellow);
        if(keys.length!==1 || q.options.length!==4 || !q.question) throw new Error('Invalid source question');
        return {key:`recap.marketplace.${q.number}`,text:q.question,options:q.options.map(o=>o.text),correctAnswer:keys[0].text,type:'single',required:true};
      });
      section.perPage=1;
    } else section.questions=section.questions.map(q=>({...q,...changes[q.key]}));
  }
  c.offer.rules=[];
  // Copied as a draft; class-specific benefits must be reviewed before activation.
  return c;
}
