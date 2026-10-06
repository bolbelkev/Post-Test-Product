/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

interface RecapIntroProps {
  onStart: () => void;
}

export const RecapIntro: React.FC<RecapIntroProps> = ({ onStart }) => {
  return (
    <div className="w-full max-w-[420px] mx-auto px-4 py-3 flex flex-col justify-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#BD214C]/10 text-[#BD214C] flex items-center justify-center mx-auto mb-3 shadow-2xs">
        <BookOpen className="w-6 h-6 stroke-[2.2]" />
      </div>

      <h2 className="font-heading text-lg sm:text-xl font-bold text-[#231F20] leading-snug mb-1.5">
        Yuk, recap materi Mini Class-nya!
      </h2>

      <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto leading-relaxed">
        Uji seberapa dalam pemahaman materi kamu lewat 10 pertanyaan pilihan ganda singkat.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="w-full py-3 px-5 rounded-xl bg-[#BD214C] hover:bg-[#a61c42] text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-[#BD214C]/25 active:scale-[0.99] transition-all cursor-pointer"
      >
        <span>Mulai recap materi</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
