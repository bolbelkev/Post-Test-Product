import React from 'react';
import { ClassFeedback } from '../types.ts';

interface Props {
  step: 'ratings' | 'duration' | 'text';
  feedback: ClassFeedback;
  onChange: (value: ClassFeedback) => void;
  onNext: () => void;
}

const questions = [
  { key: 'clarity', text: 'Materi disampaikan dengan jelas, terstruktur, dan mudah dipahami.' },
  { key: 'expectations', text: 'Materi kelas sesuai dengan ekspektasi saya.' },
  { key: 'interaction', text: 'Interaksi dan sesi tanya jawab berjalan dengan baik.' },
] as const;

export function FeedbackScreen({ step, feedback, onChange, onNext }: Props) {
  const ready = step === 'ratings'
    ? questions.slice(0, 2).every(({ key }) => feedback[key] !== undefined)
    : step === 'duration' ? feedback.interaction !== undefined && !!feedback.duration : true;
  const optionClass = (selected: boolean) => `rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${selected ? 'border-[#BD214C] bg-[#F9EDDE] text-[#BD214C]' : 'border-gray-200 bg-white text-gray-600 hover:border-[#BD214C]'}`;

  return (
    <form className="w-full max-w-[420px] mx-auto py-4 flex flex-col gap-8" onSubmit={(event) => {
      event.preventDefault();
      if (ready) {
        onChange({ ...feedback, insight: feedback.insight?.trim(), suggestions: feedback.suggestions?.trim() });
        onNext();
      }
    }}>
      <div>
        <p className="text-xs font-semibold text-[#BD214C] mb-1">Feedback mini class · {step === 'ratings' ? 1 : step === 'duration' ? 2 : 3}/3</p>
      </div>
      {step !== 'text' && <>
        {(step === 'ratings' ? questions.slice(0, 2) : questions.slice(2)).map(({ key, text }) => (
          <fieldset key={key} className="min-w-0 rounded-2xl border border-[#F9EDDE] bg-[#F9EDDE]/20 p-4 space-y-3">
            <legend className="sr-only">{text}</legend>
            <p className="font-heading text-sm font-bold text-[#231F20] leading-relaxed border-b border-[#F9EDDE] pb-3">{text}</p>
            <div className="pt-1">
              <p className="text-xs text-[#BD214C] font-semibold mb-1" aria-live="polite">
                {typeof feedback[key] === 'number' ? `${feedback[key]} / 5 · ${['Sangat tidak setuju', 'Tidak setuju', 'Netral', 'Setuju', 'Sangat setuju'][(feedback[key] as number) - 1]}` : feedback[key] === 'not_attended' ? 'Tidak mengikuti sesi tanya jawab' : 'Klik atau geser untuk memilih nilai'}
              </p>
              <RatingSlider label={text} value={typeof feedback[key] === 'number' ? feedback[key] as number : undefined} onSelect={(value) => onChange({ ...feedback, [key]: value })} />
              <div className="flex justify-between text-[11px] text-gray-400 px-1" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((rating) => <span key={rating}>{rating}</span>)}
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>Sangat tidak setuju</span><span>Sangat setuju</span>
              </div>
            </div>
          </fieldset>
        ))}
      </>}
      {step === 'duration' && <fieldset className="min-w-0 rounded-2xl border border-[#F9EDDE] bg-[#F9EDDE]/20 p-4">
        <legend className="sr-only">Bagaimana menurutmu durasi kelas ini?</legend>
        <p className="font-heading text-sm font-bold text-[#231F20] leading-relaxed border-b border-[#F9EDDE] pb-3 mb-3">Bagaimana menurutmu durasi kelas ini?</p>
        <div className="grid gap-2" role="radiogroup" aria-label="Durasi kelas">
          {(['Terlalu singkat', 'Pas', 'Terlalu panjang'] as const).map((duration) => <button key={duration} type="button" role="radio" aria-checked={feedback.duration === duration} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${feedback.duration === duration ? 'border-[#BD214C] bg-[#F9EDDE] text-[#BD214C]' : 'border-gray-200 bg-white text-gray-600 hover:border-[#BD214C]'}`} onClick={() => onChange({ ...feedback, duration })}>{duration}</button>)}
        </div>
      </fieldset>}
      {step === 'text' && <>
        <div className="rounded-2xl border border-[#F9EDDE] bg-[#F9EDDE]/20 p-4">
          <label htmlFor="feedback-insight" className="block font-heading text-sm font-bold text-[#231F20] leading-relaxed border-b border-[#F9EDDE] pb-3 mb-3">Apa insight atau hal paling bermanfaat yang kamu dapatkan? <span className="text-gray-400 font-normal">(opsional)</span></label>
          <textarea id="feedback-insight" rows={4} maxLength={3000} value={feedback.insight || ''} onChange={(event) => onChange({ ...feedback, insight: event.target.value })} placeholder="Ceritakan hal yang paling berkesan buatmu..." className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BD214C]" />
        </div>
        <div className="rounded-2xl border border-[#F9EDDE] bg-[#F9EDDE]/20 p-4">
          <label htmlFor="feedback-suggestions" className="block font-heading text-sm font-bold text-[#231F20] leading-relaxed border-b border-[#F9EDDE] pb-3 mb-3">Apa saranmu untuk kelas berikutnya? <span className="text-gray-400 font-normal">(opsional)</span></label>
          <textarea id="feedback-suggestions" rows={4} maxLength={3000} value={feedback.suggestions || ''} onChange={(event) => onChange({ ...feedback, suggestions: event.target.value })} placeholder="Topik, format, atau hal yang bisa kami perbaiki..." className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BD214C]" />
        </div>
      </>}
      <button type="submit" disabled={!ready} className="w-full rounded-xl bg-[#BD214C] py-3 text-white font-heading font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">{step === 'text' ? 'Lanjut ke recap materi' : 'Lanjut'}</button>
    </form>
  );
}

function RatingSlider({ label, value, onSelect }: { label: string; value?: number; onSelect: (value: number) => void }) {
  const ratio = ((value ?? 3) - 1) / 4;
  const position = `calc(${ratio * 100}% + ${8 - ratio * 16}px)`;
  return (
    <div className="relative h-8">
      <div className="absolute left-2 right-2 top-3.5 h-1 rounded-full bg-gray-200" aria-hidden="true" />
      {value !== undefined && <>
        <div className="rating-fill absolute left-2 top-3.5 h-1 rounded-full bg-[#BD214C]" style={{ width: `calc(${ratio * 100}% - ${ratio * 16}px)` }} aria-hidden="true" />
        <div className="rating-thumb absolute top-2 h-4 w-4 rounded-full bg-[#BD214C] shadow-sm pointer-events-none" style={{ left: position }} aria-hidden="true" />
      </>}
      <input
        type="range" min={1} max={5} step={1}
        aria-label={label}
        aria-valuetext={value === undefined ? 'Belum memilih rating' : `${value} dari 5`}
        value={value ?? 3}
        onChange={(event) => onSelect(Number(event.target.value))}
        onPointerDown={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left - 8) / (bounds.width - 16)));
          onSelect(Math.round(1 + ratio * 4));
        }}
        className="feedback-rating relative w-full h-8 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#BD214C]"
      />
    </div>
  );
}
