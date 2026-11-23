import type {QuizConfig} from '../shared/model.ts';
import {withoutSeoCertificate} from './seo-flow.ts';
export const marketplaceDecemberBenefits=['Agency-based curriculum','Hands-on store audit & optimization','Learn from active practitioners','Lifetime access to class recording','Bisa dicicil hingga 3x'];
export const marketplaceDecemberCtaUrl='https://wa.me/6281912345786?text=halo%20Minbel%2C%20saya%20mau%20klaim%20promo%20post%20test%20mini%20class%20Marketplace%21';
export function marketplaceDecemberConfig(template:QuizConfig):QuizConfig {
  const c=withoutSeoCertificate(template);
  c.title='Post Test Mini Class Marketplace — Desember 2026';
  c.batch='Marketplace Desember 2026';
  c.contactAtStart=true;c.active=false;
  c.offer.image='/images/voucher-marketplace-desember.png';
  c.offer.imageAlt='Diskon tambahan 5% Marketplace Specialist Bootcamp khusus peserta Mini Class; tidak dapat digabung dengan promo lainnya';
  c.offer.benefits=[...marketplaceDecemberBenefits];
  c.offer.ctaUrl=marketplaceDecemberCtaUrl;
  const job=c.sections.find(s=>s.kind==='profile')!.questions.find(q=>q.key==='p1_pekerjaan')!;
  job.detailOptions!['Pekerja kantoran'].placeholder='Contoh: Marketplace Manager, E-commerce Specialist';
  job.detailOptions!['Freelance'].placeholder='Contoh: Admin Marketplace, Desainer';
  return c;
}
