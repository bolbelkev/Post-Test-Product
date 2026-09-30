/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ProcessingScreenProps {
  onComplete: () => void;
}

const processingSteps = [
  'Menganalisis latar belakang kamu',
  'Mencocokkan dengan tujuan kamu',
  'Menghitung tingkat kesiapan',
  'Menyusun rekomendasi program',
];

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ onComplete }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(10);

  useEffect(() => {
    // 6-second pacing across all 4 steps
    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 98) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 120);

    const timer1 = setTimeout(() => {
      setCompletedSteps([0]);
      setActiveStep(1);
    }, 1300);

    const timer2 = setTimeout(() => {
      setCompletedSteps([0, 1]);
      setActiveStep(2);
    }, 2700);

    const timer3 = setTimeout(() => {
      setCompletedSteps([0, 1, 2]);
      setActiveStep(3);
    }, 4100);

    const timer4 = setTimeout(() => {
      setCompletedSteps([0, 1, 2, 3]);
      setActiveStep(4);
    }, 5400);

    const timerFinish = setTimeout(() => {
      clearInterval(progressInterval);
      setProgressPercent(100);
      onComplete();
    }, 6000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timerFinish);
    };
  }, [onComplete]);

  return (
    <div className="w-full max-w-[400px] mx-auto px-4 py-4 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-xl bg-[#F9EDDE] flex items-center justify-center text-[#BD214C] mb-3 shadow-2xs">
        <Loader2 className="w-6 h-6 animate-spin text-[#BD214C]" />
      </div>

      <h2 className="font-heading text-lg sm:text-xl font-bold text-[#231F20] mb-1">
        Memproses Hasil Kamu...
      </h2>
      <p className="text-xs text-gray-500 mb-4 max-w-xs">
        Mengevaluasi kesiapan karier dan rekomendasi program belajarmu
      </p>

      {/* Step checklist */}
      <div className="w-full space-y-3 text-left bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs mb-3">
        {processingSteps.map((step, index) => {
          const isDone = completedSteps.includes(index);
          const isCurrent = activeStep === index;

          return (
            <div
              key={step}
              className={`flex items-center gap-2.5 transition-all duration-300 text-xs sm:text-sm ${
                isDone
                  ? 'text-[#231F20]'
                  : isCurrent
                  ? 'text-[#BD214C] font-semibold'
                  : 'text-gray-400 opacity-60'
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#BD214C]" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <span>{step}</span>
            </div>
          );
        })}
      </div>

      {/* Smooth 6-second progress bar */}
      <div className="w-full h-1.5 bg-[#F9EDDE] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#EA5543] to-[#BD214C] transition-all duration-150 ease-linear rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
