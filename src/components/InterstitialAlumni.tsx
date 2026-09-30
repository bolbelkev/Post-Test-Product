/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Users, Sparkles } from 'lucide-react';
import alumniShowcaseImg from '../assets/images/alumni_community_showcase_1790751661933.jpg';

interface InterstitialAlumniProps {
  onNext: () => void;
}

export const InterstitialAlumni: React.FC<InterstitialAlumniProps> = ({ onNext }) => {
  return (
    <div className="w-full max-w-[420px] mx-auto px-4 py-2 flex flex-col justify-center">
      <div className="rounded-2xl border border-[#F9EDDE] bg-white overflow-hidden shadow-xs">
        {/* Visual photo */}
        <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-gray-100">
          <img
            src={alumniShowcaseImg}
            alt="Komunitas Alumni Boleh Belajar di Jakarta"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
            <span className="text-[11px] font-semibold flex items-center gap-1">
              <Users className="w-3 h-3 text-[#EA5543]" />
              Komunitas Marketer
            </span>
            <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full font-mono">
              300+ Alumni
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 text-center">
          <h2 className="font-heading text-base sm:text-lg font-bold text-[#231F20] leading-snug mb-1.5">
            Kuasai Performance Marketing Lebih Cepat
          </h2>

          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Bergabung dengan 300+ alumni Boleh Belajar. Belajar langsung dari studi kasus nyata dan bimbingan mentor praktisi.
          </p>

          <div className="grid grid-cols-3 gap-1.5 py-2 px-2 rounded-xl bg-gray-50 border border-gray-100 mb-3.5 text-center">
            <div>
              <div className="font-heading font-bold text-sm text-[#BD214C]">300+</div>
              <div className="text-[10px] text-gray-500">Alumni</div>
            </div>
            <div className="border-x border-gray-200">
              <div className="font-heading font-bold text-sm text-[#BD214C]">100%</div>
              <div className="text-[10px] text-gray-500">Real Ads</div>
            </div>
            <div>
              <div className="font-heading font-bold text-sm text-[#BD214C]">1:1</div>
              <div className="text-[10px] text-gray-500">Mentoring</div>
            </div>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={onNext}
            className="w-full py-2.5 px-4 rounded-xl bg-[#BD214C] hover:bg-[#a61c42] text-white font-heading font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#BD214C]/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Lanjut ke Pertanyaan Berikutnya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
