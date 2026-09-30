/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Edit3, ArrowRight } from 'lucide-react';
import { QuizAnswers } from '../types.ts';

interface Part1ConfirmationProps {
  answers: QuizAnswers;
  onConfirm: () => void;
  onEdit: (questionIndex?: number) => void;
}

export const Part1Confirmation: React.FC<Part1ConfirmationProps> = ({
  answers,
  onConfirm,
  onEdit,
}) => {
  const items = [
    {
      index: 1,
      label: 'Pernah Pasang Iklan',
      value: answers.p1_pernah_iklan || 'Belum diisi',
    },
    {
      index: 2,
      label: 'Rentang Usia',
      value: answers.p1_usia || 'Belum diisi',
    },
    {
      index: 3,
      label: 'Pekerjaan Saat Ini',
      value: answers.p1_pekerjaan || 'Belum diisi',
    },
    {
      index: 4,
      label: 'Goal Mini Class',
      value: answers.p1_goal || 'Belum diisi',
    },
  ];

  return (
    <div className="w-full max-w-[420px] mx-auto px-4 py-2 flex flex-col justify-center">
      <div className="text-center mb-3">
        <h2 className="font-heading text-lg sm:text-xl font-bold text-[#231F20]">
          Konfirmasi Jawaban Kamu
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Pastikan ringkasan profilmu sudah sesuai sebelum lanjut
        </p>
      </div>

      {/* Answers summary cards */}
      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <div
            key={item.index}
            className="py-2 px-3 rounded-xl border border-gray-200 bg-gray-50/60 flex items-center justify-between gap-2"
          >
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block">
                {item.label}
              </span>
              <p className="font-heading font-semibold text-xs sm:text-sm text-[#231F20] truncate">
                {item.value}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onEdit(item.index)}
              className="text-[11px] font-semibold text-[#BD214C] hover:text-[#a61c42] p-1 rounded-md hover:bg-white flex items-center gap-0.5 transition-colors shrink-0"
              title={`Ubah ${item.label}`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Ubah</span>
            </button>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onEdit(1)}
          className="w-1/3 py-2.5 px-3 rounded-xl border border-gray-300 hover:border-gray-400 font-heading font-semibold text-xs text-gray-700 bg-white transition-colors cursor-pointer"
        >
          Ubah
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="w-2/3 py-2.5 px-4 rounded-xl bg-[#BD214C] hover:bg-[#a61c42] text-white font-heading font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#BD214C]/20 active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>Sudah benar, Lanjut</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
