export type Answer = string | number | string[];
export interface Question {
  key: string;
  text: string;
  type: 'single' | 'multi' | 'rating' | 'text';
  options: string[];
  required: boolean;
  allowOther?: boolean;
  detailOptions?: Record<string, { label: string; placeholder: string }>;
  detailFor?: string;
  correctAnswer?: string;
  points?: Record<string, number>;
  countPoints?: number[];
  skipWhen?: { key: string; value: Answer; answer: Answer };
}
export interface Section {
  key: string;
  title: string;
  kind: 'profile' | 'feedback' | 'recap' | 'assessment' | 'preferences';
  questions: Question[];
  perPage: number;
}
export interface BenefitRule { key: string; values: string[]; text: string }
export interface QuizConfig {
  title: string;
  batch: string;
  active: boolean;
  certificateEnabled?: boolean;
  contactAtStart?: boolean;
  welcomeDescription: string;
  welcomePoints: string[];
  certificateNotice: string;
  certificateEligibility: string;
  offer: { title: string; image: string; imageAlt: string; ctaText: string; ctaUrl: string; benefits: string[]; rules: BenefitRule[] };
  sections: Section[];
  baseScore: number;
  narratives: Record<string, string>;
  defaultNarrative: string;
}
export interface Participant {
  id: string;
  name: string;
  email: string | null;
  phone?: string | null;
  status: 'in_progress' | 'completed';
  step: number;
  answers: Record<string, Answer>;
  config: QuizConfig;
  recapCorrect: number;
  recapTotal: number;
  score: number;
  narrative: string;
  clickedCta: boolean;
}
