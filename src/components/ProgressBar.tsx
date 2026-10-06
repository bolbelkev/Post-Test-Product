/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ProgressBarProps {
  currentPart: number; // 1 (Profiling), 2 (Recap), 3 (Belief), 4 (Gaya Belajar)
  stepInPart: number;
  totalInPart: number;
  onBack?: () => void;
  canGoBack?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentPart,
  stepInPart,
  totalInPart,
  onBack,
  canGoBack = false,
}) => {
  // Calculate percentage fill for each of the 4 questionnaire parts
  const getPartPercentage = (partNum: number) => {
    if (currentPart > partNum) return 100;
    if (currentPart === partNum) {
      return Math.min(100, Math.round((stepInPart / totalInPart) * 100));
    }
    return 0;
  };


  return (
    <div className="w-full max-w-[420px] mx-auto pt-3 pb-1 px-4 flex items-center justify-between">
      {/* Left Back Arrow */}
      {canGoBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#BD214C] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
          aria-label="Kembali"
          title="Kembali"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
        </button>
      ) : (
        <div className="w-7 h-7 shrink-0" />
      )}

      <div className="w-36 sm:w-44 grid grid-cols-5 gap-1.5 mx-auto" aria-label="Progres post test">
        {[1, 2, 3, 4, 5].map((part) => (
          <div key={part} className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#BD214C] transition-all duration-300 ease-out rounded-full" style={{ width: `${getPartPercentage(part)}%` }} />
          </div>
        ))}
      </div>

      {/* Right Spacer for balance */}
      <div className="w-7 h-7 shrink-0" />
    </div>
  );
};
