/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface QuestionCardProps {
  questionNumber: number;
  totalInPart: number;
  questionText: string;
  subText?: string;
  options: string[];
  isMultiSelect?: boolean;
  selectedValues: string[];
  onSelect: (option: string) => void;
  onNext?: () => void;
  canNext?: boolean;
  children?: React.ReactNode;
  customOption?: { value: string; onChange: (value: string) => void };
  showNext?: boolean;
}

// Icon helper to replicate Kodree's visual option style
function getOptionIcon(option: string, index: number): string {
  const lower = option.toLowerCase();

  // Part 1
  if (lower === 'sudah') return '👍';
  if (lower === 'belum') return '🌱';
  if (option === '19-23') return '🎓';
  if (option === '24-29') return '💼';
  if (option === '30-35') return '📈';
  if (option === '>35') return '👔';
  if (lower.includes('pekerja kantoran')) return '🏢';
  if (lower.includes('freelance')) return '💻';
  if (lower.includes('pemilik bisnis')) return '🏪';
  if (lower.includes('fresh graduate')) return '🎓';
  if (lower.includes('cari pekerjaan')) return '💼';
  if (lower.includes('bikin bisnis')) return '🚀';
  if (lower.includes('switch career')) return '🔄';
  if (lower.includes('upskill')) return '📈';

  // Part 2
  if (lower === 'setuju') return '✨';
  if (lower === 'tidak setuju') return '💭';
  if (lower.includes('pemula banget')) return '🌱';
  if (lower.includes('paham dasar')) return '📘';
  if (lower.includes('cukup mahir')) return '⚡';
  if (lower.includes('sangat mahir')) return '🔥';
  if (lower.includes('meta ads')) return '📱';
  if (lower.includes('google ads')) return '🌐';
  if (lower.includes('tiktok ads')) return '🎵';
  if (lower.includes('belum pernah satupun')) return '⚪';
  if (lower.includes('bisnis sendiri')) return '🚀';
  if (lower.includes('perusahaan tempat')) return '🏢';
  if (lower.includes('klien freelance')) return '💻';
  if (lower.includes('agency')) return '👥';
  if (lower.includes('belum tahu')) return '🧭';

  // Part 3
  if (lower.includes('hands-on')) return '🎯';
  if (lower.includes('analisis data')) return '📊';
  if (lower.includes('study case')) return '📑';
  if (lower.includes('semua di atas')) return '⭐';
  if (lower.includes('live class')) return '🎙️';
  if (lower.includes('rekaman')) return '⏱️';
  if (lower.includes('mentoring')) return '🤝';
  if (lower.includes('kombinasi')) return '🌟';
  if (lower.includes('teori dulu')) return '📚';
  if (lower.includes('langsung praktik')) return '🛠️';
  if (lower.includes('bentrok')) return '⏳';
  if (lower.includes('guru') || lower.includes('mentor')) return '🧭';
  if (lower.includes('mulai dari mana')) return '❓';
  if (lower.includes('semuanya di atas')) return '✨';

  // Default fallback to index letters
  return String.fromCharCode(65 + index);
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionText,
  subText,
  options,
  isMultiSelect = false,
  selectedValues,
  onSelect,
  onNext,
  canNext = false,
  children,
  customOption,
  showNext = false,
}) => {
  return (
    <div className="w-full max-w-[420px] mx-auto px-4 py-2 flex flex-col justify-center">
      {/* Centered Question Heading matching Kodree layout */}
      <h2 className="font-heading text-lg sm:text-xl font-bold text-[#231F20] text-center leading-snug mb-3">
        {questionText}
      </h2>

      {subText && (
        <p className="text-xs text-gray-500 text-center -mt-1 mb-3.5 font-medium leading-normal">
          {subText}
        </p>
      )}

      {/* Options List with compact height to ensure zero scrolling */}
      <div className="space-y-2.5">
        {options.map((option, idx) => {
          const isSelected = selectedValues.includes(option);
          const icon = getOptionIcon(option, idx);

          if (option === 'Lainnya' && customOption) {
            return (
              <input
                key={option}
                type="text"
                aria-label="Tujuan lainnya mengikuti mini class"
                placeholder="Lainnya"
                maxLength={500}
                value={customOption.value}
                onFocus={() => onSelect('Lainnya')}
                onChange={(event) => customOption.onChange(event.target.value)}
                className={`w-full py-4 px-3 rounded-2xl border text-xs sm:text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#BD214C] ${isSelected ? 'border-[#BD214C] bg-[#BD214C]/5' : 'border-gray-200 bg-white'}`}
              />
            );
          }
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`w-full py-2.5 px-3 rounded-2xl border text-left flex items-center justify-between transition-all duration-150 active:scale-[0.99] cursor-pointer shadow-2xs ${
                isSelected
                  ? 'border-[#BD214C] bg-[#BD214C]/5 ring-1.5 ring-[#BD214C]'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70 text-[#231F20]'
              }`}
            >
              {/* Left visual icon badge in soft square container */}
              <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-sm shrink-0 select-none">
                {icon}
              </div>

              {/* Middle option text */}
              <span
                className={`flex-1 px-3 text-xs sm:text-sm leading-snug ${
                  isSelected
                    ? 'font-semibold text-[#BD214C]'
                    : 'font-medium text-gray-800'
                }`}
              >
                {option}
              </span>

              {/* Right circular radio indicator */}
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'border-[#BD214C] bg-[#BD214C] text-white'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {children}

      {/* Next button */}
      {(isMultiSelect || children || showNext) && (
        <div className="mt-3.5 flex justify-center">
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className={`w-full py-3 rounded-xl font-heading font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              canNext
                ? 'bg-[#BD214C] hover:bg-[#a61c42] text-white cursor-pointer shadow-md shadow-[#BD214C]/20 active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Lanjut</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
