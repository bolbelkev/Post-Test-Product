import type {QuizConfig} from '../shared/model.ts';
import {withoutSeoCertificate} from './seo-flow.ts';
export function marketplaceDecemberConfig(template:QuizConfig):QuizConfig {
  const c=withoutSeoCertificate(template);
  c.title='Post Test Mini Class Marketplace — Desember 2026';
  c.batch='Marketplace Desember 2026';
  c.contactAtStart=true;c.active=false;
  const job=c.sections.find(s=>s.kind==='profile')!.questions.find(q=>q.key==='p1_pekerjaan')!;
  job.detailOptions!['Pekerja kantoran'].placeholder='Contoh: Marketplace Manager, E-commerce Specialist';
  job.detailOptions!['Freelance'].placeholder='Contoh: Admin Marketplace, Desainer';
  return c;
}
