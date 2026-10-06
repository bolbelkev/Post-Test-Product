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
    : step === 'duration' ? feedback.interaction !== undefined && !!feedback.duration : !!feedback.insight?.trim();
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
          <fieldset key={key} className="space-y-2">
            <legend className="text-sm font-semibold mb-2">{text}</legend>
            <div className="pt-1">
              <p className="text-xs text-[#BD214C] font-semibold mb-1" aria-live="polite">
                {typeof feedback[key] === 'number' ? `${feedback[key]} / 5 · ${['Sangat tidak setuju', 'Tidak setuju', 'Netral', 'Setuju', 'Sangat setuju'][(feedback[key] as number) - 1]}` : feedback[key] === 'not_attended' ? 'Tidak mengikuti sesi tanya jawab' : 'Geser untuk memilih nilai'}
              </p>
              <input
                type="range" min={1} max={5} step={1}
                aria-label={text}
                aria-valuetext={typeof feedback[key] === 'number' ? `${feedback[key]} dari 5` : 'Belum memilih rating'}
                value={typeof feedback[key] === 'number' ? feedback[key] : 4}
                onChange={(event) => onChange({ ...feedback, [key]: Number(event.target.value) })}
                onPointerUp={(event) => onChange({ ...feedback, [key]: Number(event.currentTarget.value) })}
                onKeyUp={(event) => {
                  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) onChange({ ...feedback, [key]: Number(event.currentTarget.value) });
                }}
                className="w-full h-8 accent-[#BD214C] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#BD214C]"
              />
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
      {step === 'duration' && <fieldset>
        <legend className="text-sm font-semibold mb-3">Bagaimana menurutmu durasi kelas ini?</legend>
        <div className="grid gap-3" role="radiogroup" aria-label="Durasi kelas">
          {(['Terlalu singkat', 'Pas', 'Terlalu panjang'] as const).map((duration) => <button key={duration} type="button" role="radio" aria-checked={feedback.duration === duration} className={optionClass(feedback.duration === duration)} onClick={() => onChange({ ...feedback, duration })}>{duration}</button>)}
        </div>
      </fieldset>}
      {step === 'text' && <>
        <div>
          <label htmlFor="feedback-insight" className="block text-sm font-semibold mb-2">Apa insight atau hal paling bermanfaat yang kamu dapatkan?</label>
          <textarea id="feedback-insight" required rows={4} maxLength={3000} value={feedback.insight || ''} onChange={(event) => onChange({ ...feedback, insight: event.target.value })} placeholder="Ceritakan hal yang paling berkesan buatmu..." className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BD214C]" />
        </div>
        <div>
          <label htmlFor="feedback-suggestions" className="block text-sm font-semibold mb-2">Apa saranmu untuk kelas berikutnya? <span className="text-gray-400 font-normal">(opsional)</span></label>
          <textarea id="feedback-suggestions" rows={4} maxLength={3000} value={feedback.suggestions || ''} onChange={(event) => onChange({ ...feedback, suggestions: event.target.value })} placeholder="Topik, format, atau hal yang bisa kami perbaiki..." className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BD214C]" />
        </div>
      </>}
      <button type="submit" disabled={!ready} className="w-full rounded-xl bg-[#BD214C] py-3 text-white font-heading font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">{step === 'text' ? 'Lanjut ke recap materi' : 'Lanjut'}</button>
    </form>
  );
}
