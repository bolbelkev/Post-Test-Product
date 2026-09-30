/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Quote, Star } from 'lucide-react';
import alumniAvatarImg from '../assets/images/alumni_avatar_1790751675379.jpg';

interface InterstitialTestimonialProps {
  onNext: () => void;
}

export const InterstitialTestimonial: React.FC<InterstitialTestimonialProps> = ({ onNext }) => {
  return (
    <div className="w-full max-w-[420px] mx-auto px-4 py-2 flex flex-col justify-center">
      <div className="rounded-2xl border border-[#F9EDDE] bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-0.5 text-[#EA5543]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Cerita Alumni
          </span>
        </div>

        {/* Testimonial Quote */}
        <div className="relative pl-4 mb-3">
          <Quote className="w-3.5 h-3.5 text-[#BD214C]/30 absolute -top-0.5 left-0 transform -scale-x-100" />
          <p className="text-xs sm:text-sm text-[#231F20] font-medium leading-relaxed italic">
            &ldquo;Dulu bingung mau mulai dari mana dan takut salah bakar budget iklan. Di Boleh Belajar, kami praktek langsung di Ads Manager sungguhan dan dibimbing mentor sampai paham optimasi ROAS. Hasil project portofolio di bootcamp ini yang bikin saya berhasil switch career!&rdquo;
          </p>
        </div>

        {/* Alumni Profile Lockup */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-3">
          <img
            src={alumniAvatarImg}
            alt="Amanda Putri - Alumni Boleh Belajar"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#BD214C]/20"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="font-heading font-bold text-xs text-[#231F20]">
              Amanda Putri
            </h3>
            <p className="text-[10px] text-gray-500">
              Alumni Bootcamp · Performance Marketer
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onNext}
          className="w-full py-2.5 px-4 rounded-xl bg-[#BD214C] hover:bg-[#a61c42] text-white font-heading font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#BD214C]/20 active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>Lanjut ke Tahap Terakhir</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
