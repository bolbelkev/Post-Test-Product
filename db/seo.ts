import type {QuizConfig,Question} from '../shared/model.ts';
import {withoutSeoCertificate} from './seo-flow.ts';
export interface SeoSource {questions:{number:number;question:string;options:{text:string;yellow:boolean}[]}[]}
export function seoConfig(template:QuizConfig,source:SeoSource):QuizConfig {
  const c=JSON.parse(JSON.stringify(template).replaceAll('Performance Marketing','SEO').replaceAll('performance marketing','SEO').replaceAll('Performance Marketer','SEO Specialist').replaceAll('Marketplace','SEO').replaceAll('marketplace','SEO')) as QuizConfig;
  c.title='Post Test Mini Class SEO';c.batch='SEO Batch 4';c.active=false;
  c.offer.title='Bootcamp SEO — Boleh Belajar';c.offer.ctaText='Lihat Program Bootcamp SEO';
  c.offer.rules=[];
  c.narratives={
    'Cari pekerjaan pertama':'Kamu {score}% siap memulai karier pertama sebagai SEO Specialist',
    'Bikin bisnis':'Kamu {score}% siap menerapkan SEO untuk mengembangkan bisnismu',
    'Switch career':'Kamu {score}% siap beralih karier jadi SEO Specialist',
    'Upskill untuk kebutuhan kerjaan':'Kamu {score}% siap meningkatkan kemampuan SEO untuk pekerjaanmu',
  };
  c.defaultNarrative='Kamu {score}% siap melanjutkan pembelajaran SEO';
  c.offer.benefits=c.offer.benefits.map(text=>/hands.on/i.test(text)?'Praktik hands-on SEO untuk menambah portofolio':text);
  const changes:Record<string,Partial<Question>>={
    p1_pernah_iklan:{text:'Sudah pernah melakukan optimasi SEO sebelumnya?'},
    p1_goal:{text:'Goal utama kamu mengikuti Mini Class SEO?'},
    p2_skill_utama:{text:'Kamu setuju, SEO jadi salah satu skill utama yang dibutuhkan bisnis saat ini?'},
    p2_dampak_penghasilan:{text:'Kamu setuju menguasai SEO bisa berdampak positif ke penghasilan?'},
    p2_kemampuan_sekarang:{text:'Bagaimana kamu menilai kemampuan SEO kamu sekarang?'},
    p2_tools:{text:'Tools SEO apa yang pernah kamu pakai?',options:['Google Search Console','Google Analytics','Ahrefs / Semrush','Belum pernah satupun']},
    p3_jenis_latihan:{options:['Hands-on optimasi SEO website','Analisis data performa SEO','Study case dari agency','Semua di atas']},
    p3_kendala_terbesar:{text:'Apa kendala terbesar kamu saat ini untuk belajar SEO?'},
  };
  for(const section of c.sections) {
    if(section.kind==='recap') {
      section.questions=source.questions.map(q=>{
        const key=q.options.filter(o=>o.yellow);if(key.length!==1||q.options.length!==4)throw new Error('Kunci SEO tidak valid');
        return {key:`recap.seo.${q.number}`,text:q.question,type:'single',required:true,options:q.options.map(o=>o.text),correctAnswer:key[0].text};
      });section.perPage=1;
    } else section.questions=section.questions.map(q=>({...q,...changes[q.key]}));
  }
  return withoutSeoCertificate(c);
}
