import type {QuizConfig} from '../shared/model.ts';
export function withoutSeoCertificate(config:QuizConfig):QuizConfig {
  const c=structuredClone(config);
  c.certificateEnabled=false;
  c.welcomeDescription='Selesaikan langkah terakhir mini class untuk mengulas materi dan melihat hasil recap kamu';
  c.welcomePoints=c.welcomePoints.filter(p=>!/sertif/i.test(p));
  c.certificateNotice='';c.certificateEligibility='';
  const profile=c.sections.find(s=>s.kind==='profile')!;
  const job=profile.questions.find(q=>q.key==='p1_pekerjaan')!;
  job.detailOptions={
    'Pekerja kantoran':{label:'Kamu bekerja di posisi apa?',placeholder:'Contoh: Marketing Manager, SEO Specialist'},
    'Freelance':{label:'Kamu freelance di bidang apa?',placeholder:'Contoh: Content Writer, SEO Consultant'},
    'Pemilik bisnis':{label:'Apa nama atau jenis bisnis kamu?',placeholder:'Contoh: Toko Kopi Senja, bisnis kuliner'},
    'Fresh graduate':{label:'Apa nama kampus kamu?',placeholder:'Contoh: Universitas Padjadjaran'},
  };
  if(!profile.questions.some(q=>q.key==='p1_pekerjaan.detail'))profile.questions.push({key:'p1_pekerjaan.detail',detailFor:'p1_pekerjaan',text:'Detail pekerjaan atau nama kampus',type:'text',required:true,options:[]});
  return c;
}
