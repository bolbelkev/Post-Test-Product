import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Answer, Participant, QuizConfig, Section, Question } from '../shared/model.ts';
import type { SubmissionRecord, QuizAnswers } from './types.ts';
import { request, ApiError } from './utils/api.ts';
import { Header } from './components/Header.tsx';
import { ProgressBar } from './components/ProgressBar.tsx';
import { DatabaseQuestions } from './components/DatabaseQuestions.tsx';
import { RecapProcessing } from './components/RecapProcessing.tsx';
import { RecapMiniResult } from './components/RecapMiniResult.tsx';
import { ResultScreen } from './components/ResultScreen.tsx';
import { LeadForm } from './components/LeadForm.tsx';
import { Admin } from './components/Admin.tsx';
import { ArrowRight, Award, BookOpen, CheckCircle, Clock, Sparkles } from 'lucide-react';

interface Page { kind: 'questions' | 'confirm' | 'intro' | 'recapResult' | 'result'; section?: Section; questions?: Question[] }
function pagesFor(config: QuizConfig): Page[] {
  const pages: Page[] = [];
  for (const section of config.sections) {
    if (section.kind === 'recap') pages.push({ kind: 'intro', section });
    for (let i = 0; i < section.questions.length; i += section.perPage) pages.push({ kind: 'questions', section, questions: section.questions.slice(i, i + section.perPage) });
    if (section.kind === 'profile') pages.push({ kind: 'confirm', section });
    if (section.kind === 'recap') pages.push({ kind: 'recapResult', section });
  }
  pages.push({ kind: 'result' }); return pages;
}
export default function App() {
  return location.pathname === '/admin' ? <Admin /> : <ParticipantApp />;
}
function ParticipantApp() {
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState('');
  const [processing, setProcessing] = useState(false);
  const dirty = useRef(new Map<string, Answer>());
  const queue = useRef<Promise<void>>(Promise.resolve());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollArea = useRef<HTMLElement>(null);
  const epoch = useRef(0);
  const mounted = useRef(true);
  const busyRef = useRef(false);
  const pages = useMemo(() => config ? pagesFor(config) : [], [config]);
  const page = pages[Math.min(step, Math.max(0, pages.length - 1))];
  const applyParticipant = (p: Participant) => { setParticipant(p); setConfig(p.config); setName(p.name); setAnswers(p.answers); setStep(p.step); };
  const load = async () => {
    setLoading(true); setError('');
    try {
      try { applyParticipant(await request<Participant>('session')); }
      catch (e) { if (e instanceof ApiError && e.status === 401) setConfig(await request<QuizConfig>('config')); else throw e; }
    } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  };
  useEffect(() => { mounted.current = true; void load(); return () => { mounted.current = false; clearTimeout(timer.current); }; }, []);
  useEffect(() => { scrollArea.current?.scrollTo({ top: 0 }); }, [step]);
  const flush = () => {
    clearTimeout(timer.current);
    const currentEpoch = epoch.current;
    const task = queue.current.catch(() => {}).then(async () => {
      if (currentEpoch !== epoch.current) return;
      for (const [key, value] of [...dirty.current.entries()]) {
        await request('answer', 'POST', { key, answer: value });
        if (dirty.current.get(key) === value) dirty.current.delete(key);
      }
      if (mounted.current && currentEpoch === epoch.current) { setSaveState(dirty.current.size ? 'Menunggu penyimpanan…' : 'Tersimpan'); setError(''); }
    });
    queue.current = task; return task;
  };
  const changeAnswer = (key: string, value: Answer) => {
    setAnswers(prev => ({ ...prev, [key]: value })); dirty.current.set(key, value); setSaveState('Menyimpan…');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { void flush().catch(e => { if (mounted.current) { setError(e.message); setSaveState('Belum tersimpan'); } }); }, 500);
  };
  const guarded = async (work: () => Promise<void>) => {
    if (busyRef.current) return; busyRef.current = true; setBusy(true); setError('');
    try { await work(); } catch (e) { setError((e as Error).message); setSaveState('Belum tersimpan'); } finally { busyRef.current = false; setBusy(false); }
  };
  const start = () => guarded(async () => {
    const p = await request<Participant>('session', 'POST', { name: name.trim() });
    epoch.current++; dirty.current.clear(); applyParticipant(p); setSaveState('Tersimpan');
  });
  const move = (direction: number) => guarded(async () => {
    await flush();
    const savedAnswers = (await request<Participant>('session')).answers;
    let next = Math.max(0, Math.min(pages.length - 1, step + direction));
    while (pages[next]?.kind === 'questions' && pages[next].questions!.every(q => q.skipWhen && JSON.stringify(savedAnswers[q.skipWhen.key]) === JSON.stringify(q.skipWhen.value))) {
      for (const q of pages[next].questions!) await request('answer', 'POST', { key: q.key, answer: q.skipWhen!.answer });
      next += direction;
    }
    await request('progress', 'POST', { step: next });
    const p = await request<Participant>('session'); applyParticipant(p);
    if (pages[next]?.kind === 'recapResult') setProcessing(true);
  });
  const complete = async (email: string) => {
    await flush();
    const p = await request<Participant>('complete', 'POST', { email }); applyParticipant(p); setSaveState('Tersimpan');
  };
  const retake = () => guarded(async () => {
    await queue.current.catch(() => {});
    if (dirty.current.size) await flush();
    epoch.current++; dirty.current.clear(); setParticipant(null); setAnswers({}); setStep(0); setSaveState('');
    setConfig(await request<QuizConfig>('config'));
  });

  if (loading) return <div className="p-8 text-center text-sm">Memuat post test…</div>;
  if (!config) return <div className="max-w-lg mx-auto p-6"><p role="alert">{error || 'Post test belum tersedia.'}</p><button className="mt-4 underline" onClick={() => void load()}>Coba lagi</button></div>;
  const sectionNumber = page?.section ? config.sections.findIndex(s => s.key === page.section!.key) + 1 : config.sections.length;
  const sectionPages = pages.filter(p => p.section?.key === page?.section?.key && p.kind === 'questions');
  const sectionPosition = sectionPages.indexOf(page) + 1;
  const recapQuestions = config.sections.filter(s => s.kind === 'recap').flatMap(s => s.questions);
  const legacy: QuizAnswers = { ...Object.fromEntries(Object.entries(answers).filter(([key]) => !key.includes('.'))) };
  const record: SubmissionRecord | null = participant ? {
    id: participant.id, timestamp: '', user: { namaLengkap: participant.name, email: participant.email || '', nomorHp: '', consent: false }, answers: legacy,
    skor: participant.score, recapScore: participant.recapCorrect, goalNarrative: participant.narrative,
    hambatanRingkasan: String(answers.p3_kendala_terbesar || ''), clickedCtaBootcamp: participant.clickedCta,
  } : null;
  const icons = [Clock, Sparkles, BookOpen, Award, CheckCircle];
  return <div className="min-h-screen sm:h-screen flex flex-col bg-white text-[#231F20]">
    {!participant && <Header />}
    {participant && page?.kind !== 'result' && <ProgressBar currentPart={sectionNumber} stepInPart={sectionPosition || sectionPages.length} totalInPart={sectionPages.length || 1} totalParts={config.sections.length} onBack={() => void move(-1)} canGoBack={step > 0 && !busy} />}
    {error && <div role="alert" className="max-w-[420px] mx-auto px-4 py-2 text-xs text-rose-700">{error} {participant && <button className="underline font-bold" disabled={busy} onClick={() => void guarded(async () => { await flush(); })}>Coba simpan lagi</button>}</div>}
    <main ref={scrollArea} className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center px-3 py-3">
      {!participant ? <div className="w-full max-w-[420px] mx-auto py-3">
        <div className="text-center mb-4"><span className="text-[11px] text-[#EA5543] font-bold">Penutup Sesi Mini Class</span><h1 className="font-heading text-lg sm:text-xl font-extrabold mt-2">{config.title}</h1><p className="text-xs text-gray-500 mt-2">{config.welcomeDescription}</p></div>
        <div className="bg-[#F9EDDE]/30 border border-[#F9EDDE] rounded-2xl p-2.5 mb-3 grid grid-cols-2 gap-x-3 gap-y-2">{config.welcomePoints.map((text, i) => { const Icon = icons[i % icons.length]; return <div key={i} className="flex items-center gap-2"><Icon className="w-4 h-4 shrink-0 text-[#BD214C]" /><span className="text-[11px] font-bold">{text}</span></div>; })}</div>
        <label htmlFor="certificate-name" className="block text-xs font-semibold mb-1">Nama untuk sertifikat</label>
        <input id="certificate-name" autoComplete="name" maxLength={150} value={name} onChange={e => setName(e.target.value)} placeholder="Tulis nama yang ingin tercetak di sertifikat" className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs" />
        <p className="text-[10px] text-gray-500 mt-1 mb-3">Isi minimal 3 karakter sesuai nama yang ingin tercetak di sertifikat.</p>
        <button disabled={name.trim().length < 3 || busy || !config.active} onClick={() => void start()} className="w-full py-3 rounded-xl bg-[#BD214C] text-white text-sm font-bold disabled:opacity-40 flex justify-center items-center gap-2">{busy ? 'Menyimpan nama…' : config.active ? 'Mulai Post Test Sekarang' : 'Post test belum dibuka'}<ArrowRight className="w-4 h-4" /></button>
      </div> : <>
        {page?.kind === 'questions' && <><p className="w-full max-w-[420px] text-xs font-semibold text-[#BD214C]">{page.section?.title} · {sectionPosition}/{sectionPages.length}</p><DatabaseQuestions questions={page.questions!} answers={answers} onAnswer={changeAnswer} onNext={() => void move(1)} disabled={busy} grouped={page.section?.kind === 'feedback'} /></>}
        {page?.kind === 'confirm' && <div className="w-full max-w-[420px] py-4"><h2 className="font-heading text-lg font-bold text-center mb-4">Konfirmasi Jawaban Kamu</h2>{page.section!.questions.map(q => <div key={q.key} className="rounded-xl border bg-gray-50 p-3 mb-2"><p className="text-[10px] text-gray-500">{q.text}</p><p className="text-sm font-semibold break-words">{String(answers[q.key] || 'Belum diisi')}</p></div>)}<button disabled={busy} onClick={() => void move(1)} className="w-full bg-[#BD214C] text-white rounded-xl py-3 mt-3">Sudah benar, lanjut</button></div>}
        {page?.kind === 'intro' && <div className="w-full max-w-[420px] text-center py-8"><BookOpen className="w-10 h-10 mx-auto text-[#BD214C] mb-3" /><h2 className="font-heading text-xl font-bold">Yuk, recap materi Mini Class-nya!</h2><p className="text-xs text-gray-500 my-3">Uji seberapa dalam pemahaman materi kamu lewat {recapQuestions.length} pertanyaan pilihan ganda singkat.</p><button disabled={busy} onClick={() => void move(1)} className="w-full bg-[#BD214C] text-white rounded-xl py-3">Mulai recap materi</button></div>}
        {page?.kind === 'recapResult' && (processing ? <RecapProcessing onComplete={() => setProcessing(false)} /> : <RecapMiniResult correctCount={participant.recapCorrect} totalQuestions={participant.recapTotal} onContinue={() => void move(1)} />)}
        {page?.kind === 'result' && record && <ResultScreen submission={record} offer={config.offer} allAnswers={answers}
          certificateForm={<LeadForm initialName={participant.name} initialEmail={participant.email || ''} saved={participant.status === 'completed'} notice={config.certificateNotice} eligibility={config.certificateEligibility} onSubmit={contact => complete(contact.email)} />}
          onCtaClick={() => { void request('cta', 'POST', {}).catch(e => setError(e.message)); }} onRetake={() => void retake()} />}
        {page?.kind !== 'result' && <p role="status" className="text-[10px] text-gray-500 pb-4">{busy ? 'Menyimpan…' : saveState}</p>}
      </>}
    </main>
    <footer className="shrink-0 py-2 text-center text-[10px] text-gray-400 border-t">© {new Date().getFullYear()} Boleh Belajar · {config.batch}</footer>
  </div>;
}
