import React from 'react';
import type { Answer,Question } from '../../shared/model.ts';
import { QuestionCard } from './QuestionCard.tsx';
import { RatingSlider } from './FeedbackScreen.tsx';
export function DatabaseQuestions({ questions, answers, onAnswer, onNext, disabled, grouped, showNext = true, autoAdvance = false, nextLabel = 'Lanjut' }: {
  questions: Question[]; answers: Record<string,Answer>; onAnswer: (key:string,value:Answer) => void;
  onNext: () => void; disabled:boolean; grouped:boolean; showNext?:boolean; autoAdvance?:boolean; nextLabel?:string;
}) {
  const ready = questions.every(q => !q.required || (answers[q.key] !== undefined && (typeof answers[q.key] === 'number' || (Array.isArray(answers[q.key]) ? (answers[q.key] as string[]).length>0 : !!String(answers[q.key]).trim()))));
  const render = (q:Question) => {
    const value = answers[q.key];
    if (q.type==='single' || q.type==='multi') return <QuestionCard key={q.key} questionNumber={1} totalInPart={1} questionText={grouped ? '' : q.text} options={[...q.options,...(q.allowOther ? ['Lainnya'] : [])]} isMultiSelect={false}
      selectedValues={Array.isArray(value) ? value : typeof value==='string' ? q.options.includes(value) ? [value] : ['Lainnya'] : []}
      onSelect={option => {
        if (option === 'Lainnya' && q.allowOther) return;
        if (q.type==='multi') {
          const before=Array.isArray(value) ? value : [];
          const next=option==='Belum pernah satupun' ? [option] : before.includes(option) ? before.filter(v=>v!==option) : [...before.filter(v=>v!=='Belum pernah satupun'),option];
          onAnswer(q.key,next);
        } else {
          onAnswer(q.key,option);
          if (autoAdvance && questions.length === 1 && !grouped) onNext();
        }
      }} customOption={q.allowOther ? { value: typeof value==='string' && !q.options.includes(value) ? value : '', onChange: text=>onAnswer(q.key,text) } : undefined} />;
    if (q.type==='rating') return <div>
      <p className="text-xs text-[#BD214C] font-semibold mb-1" aria-live="polite">{typeof value==='number' ? `${value} / 5 · ${['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'][value-1]}` : 'Klik atau geser untuk memilih nilai'}</p>
      <RatingSlider label={q.text} value={typeof value==='number' ? value : undefined} onSelect={v=>onAnswer(q.key,v)} />
      <div className="flex justify-between text-[11px] text-gray-400 px-1">{[1,2,3,4,5].map(n=><span key={n}>{n}</span>)}</div>
      <div className="flex justify-between text-[10px] text-gray-500 mt-1"><span>Sangat tidak setuju</span><span>Sangat setuju</span></div>
    </div>;
    return <textarea aria-label={q.text} rows={4} maxLength={3000} value={typeof value==='string' ? value : ''} onChange={e=>onAnswer(q.key,e.target.value)} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BD214C]" placeholder="Tulis jawabanmu di sini..." />;
  };
  return <div className="w-full max-w-[420px] mx-auto py-3 flex flex-col gap-8">
    <fieldset disabled={disabled} className="flex flex-col gap-8">
      {questions.map(q=>grouped || q.type==='rating' || q.type==='text' ? <div key={q.key} className="rounded-2xl border border-[#F9EDDE] bg-[#F9EDDE]/20 p-4">
        <p className="font-heading text-sm font-bold border-b border-[#F9EDDE] pb-3 mb-3">{q.text} {!q.required && <span className="text-gray-400 font-normal">(opsional)</span>}</p>{render(q)}
      </div> : <React.Fragment key={q.key}>{render(q)}</React.Fragment>)}
    </fieldset>
    {showNext && <button type="button" onClick={onNext} disabled={!ready || disabled} className="w-full rounded-xl bg-[#BD214C] py-3 text-white font-heading font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed">{nextLabel}</button>}
  </div>;
}
