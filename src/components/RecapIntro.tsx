/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';

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

      <div className="bg-[#F9EDDE]/30 border border-[#F9EDDE] rounded-2xl p-3.5 mb-5 text-left space-y-2 text-xs text-gray-700">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#BD214C] shrink-0" />
          <span>10 soal pilihan ganda dari sesi materi</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#BD214C] shrink-0" />
          <span>Satu pertanyaan per layar, santai dan cepat</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#BD214C] shrink-0" />
          <span>Hasil evaluasi pemahaman langsung di akhir</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="w-full py-3 px-5 rounded-xl bg-[#BD214C] hover:bg-[#a61c42] text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-[#BD214C]/25 active:scale-[0.99] transition-all cursor-pointer"
      >
        <span>Mulai Soal 1</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
