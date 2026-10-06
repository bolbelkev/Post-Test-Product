/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ExternalLink,
  Target,
  AlertTriangle,
  Mail,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { SubmissionRecord } from '../types.ts';
import { getBootcampCtaUrl } from '../utils/scoring.ts';
import bootcampHeroImg from '../assets/images/bootcamp_preview_hero_1790751689095.jpg';

interface ResultScreenProps {
  submission: SubmissionRecord;
  onCtaClick: () => void;
  onRetake: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  submission,
  onCtaClick,
  onRetake,
}) => {
  const [clicked, setClicked] = useState(submission.clickedCtaBootcamp);
  const ctaUrl = getBootcampCtaUrl(submission.id);

  const handleCta = () => {
    setClicked(true);
    onCtaClick();
    window.open(ctaUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-[420px] shrink-0 mx-auto px-4 py-3 space-y-3.5">
      {/* 1. Header & Title */}
      <div className="text-center">
        <h1 className="font-heading text-lg sm:text-xl font-bold text-[#231F20]">
          Hasil kecocokan kamu sudah siap
        </h1>
      </div>

      {/* 2. Score & Dynamic Narrative Card */}
      <div className="rounded-2xl border border-[#BD214C]/20 bg-gradient-to-b from-[#F9EDDE]/40 via-white to-white p-4 text-center relative shadow-2xs">
        <div className="inline-flex flex-col items-center justify-center mb-2">
          <div className="relative flex items-center justify-center">
            {/* SVG Circle Gauge */}
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                className="text-gray-100"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                className="text-[#BD214C] transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - submission.skor / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-2xl font-extrabold text-[#BD214C] tabular-nums">
                {submission.skor}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic narrative */}
        <h2 className="font-heading text-sm sm:text-base font-bold text-[#231F20] leading-snug">
          {submission.goalNarrative}
        </h2>
      </div>

      {/* 3. Kartu Ringkasan (Tujuan & Hambatan) */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2 shadow-2xs text-xs">
        <div className="flex items-start gap-2">
          <Target className="w-3.5 h-3.5 text-[#EA5543] shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Tujuan Kamu:</span>
            <p className="font-semibold text-gray-800">{submission.answers.p1_goal}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-1.5 border-t border-gray-100">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Hambatan Sebelumnya:</span>
            <p className="font-semibold text-gray-800">{submission.hambatanRingkasan}</p>
          </div>
        </div>
      </div>

      {/* 4. Benefit Bootcamp Card with CTA */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-2xs">
        <div className="relative h-28 w-full bg-gray-100">
          <img
            src={bootcampHeroImg}
            alt="Workstation Performance Marketing Boleh Belajar"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 text-white">
            <h4 className="font-heading text-xs sm:text-sm font-bold leading-tight">
              Bootcamp Performance Marketing — Boleh Belajar
            </h4>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="space-y-1.5 mb-3 text-xs text-gray-700">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Praktik langsung iklan sungguhan & budget campaign</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Dibimbing mentor praktisi top tech & agency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Project portofolio nyata siap kerja</span>
            </div>
          </div>

          {/* Primary Highlighted CTA Button with UTM */}
          <button
            type="button"
            onClick={handleCta}
            className="w-full py-3 px-4 rounded-xl bg-[#BD214C] hover:bg-[#a61c42] text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-[#BD214C]/30 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Lihat Program Bootcamp Performance Marketing</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {clicked && (
            <p className="text-center text-[11px] text-emerald-700 font-semibold mt-1.5 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Membuka halaman pendaftaran bootcamp...</span>
            </p>
          )}
        </div>
      </div>

      {/* 5. Info Sertifikat */}
      <div className="rounded-xl border border-[#F9EDDE] bg-[#F9EDDE]/40 p-2.5 flex items-center gap-2.5 text-xs">
        <Mail className="w-4 h-4 text-[#BD214C] shrink-0" />
        <div className="text-[11px] text-gray-600 leading-tight">
          Sertifikat akan dikirim ke email kamu dalam <span className="font-semibold text-[#BD214C]">3 hari kerja</span> ({submission.user.email}).
        </div>
      </div>

      {/* 6. Footer actions */}
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onRetake}
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#BD214C] font-semibold py-1 px-2 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Ulangi Tes</span>
        </button>
      </div>
    </div>
  );
};
