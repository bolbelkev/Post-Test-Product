/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface RecapProcessingProps {
  onComplete: () => void;
}

export const RecapProcessing: React.FC<RecapProcessingProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full max-w-[400px] mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#F9EDDE] flex items-center justify-center text-[#BD214C] mb-3 shadow-2xs">
        <Loader2 className="w-6 h-6 animate-spin text-[#BD214C]" />
      </div>

      <h3 className="font-heading text-lg font-bold text-[#231F20] mb-1">
        Menghitung pemahaman kamu...
      </h3>
      <p className="text-xs text-gray-500 max-w-xs">
        Mencocokkan jawaban kamu dengan kunci materi Fundamental Performance Marketing
      </p>

      {/* Micro progress bar */}
      <div className="w-40 h-1 bg-[#F9EDDE] rounded-full overflow-hidden mt-4">
        <div className="h-full bg-[#BD214C] rounded-full w-full origin-left recap-progress" />
      </div>
    </div>
  );
};
