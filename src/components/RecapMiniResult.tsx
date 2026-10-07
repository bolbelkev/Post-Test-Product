/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Award, CheckCircle2, Sparkles } from 'lucide-react';
import { getRecapBandNarrative } from '../data/recapQuestions.ts';

interface RecapMiniResultProps {
  correctCount: number;
  totalQuestions: number;
  onContinue: () => void;
}

export const RecapMiniResult: React.FC<RecapMiniResultProps> = ({
  correctCount,
  totalQuestions,
  onContinue,
}) => {
  const narrative = getRecapBandNarrative(correctCount, totalQuestions);

  // Badge icon or color based on band
  const getBadgeStyle = () => {
    if (correctCount / totalQuestions >= 0.9) {
      return {
        badgeText: 'Sangat Baik',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        ring: 'text-emerald-600',
      };
    }
    if (correctCount / totalQuestions >= 0.6) {
      return {
        badgeText: 'Cukup Solid',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        ring: 'text-blue-600',
      };
    }
    if (correctCount / totalQuestions >= 0.3) {
      return {
        badgeText: 'Modal Awal Bagus',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        ring: 'text-amber-600',
      };
    }
    return {
      badgeText: 'Siap Berkembang',
      bg: 'bg-[#F9EDDE] text-[#BD214C] border-[#F9EDDE]',
      ring: 'text-[#BD214C]',
    };
  };

  const style = getBadgeStyle();

  return (
    <div className="w-full max-w-[420px] mx-auto px-4 py-3 flex flex-col justify-center text-center">
      {/* Score Badge */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-[#F9EDDE]/30 via-white to-white p-5 mb-4 shadow-2xs">
        <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border mb-3 select-none ${style.bg}">
          <Sparkles className="w-3 h-3" />
          <span>Hasil Recap Materi</span>
        </div>

        {/* Big Number Score */}
        <div className="flex items-baseline justify-center gap-1 mb-2">
          <span className="font-heading text-4xl sm:text-5xl font-extrabold text-[#BD214C] tabular-nums">
            {correctCount}
          </span>
          <span className="font-heading text-lg font-bold text-gray-400">
            / {totalQuestions}
          </span>
        </div>

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Pertanyaan Benar
        </p>

        {/* Narrative text based on exact user specification */}
        <p className="font-heading text-sm sm:text-base font-bold text-[#231F20] leading-snug px-2">
          {narrative}
        </p>
      </div>

      {/* Button to proceed to Part 3 */}
      <button
        type="button"
        onClick={onContinue}
        className="w-full py-3.5 px-5 rounded-xl bg-[#BD214C] hover:bg-[#a61c42] text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-[#BD214C]/25 active:scale-[0.99] transition-all cursor-pointer"
      >
        <span>Lanjut ke Tahap Berikutnya</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
