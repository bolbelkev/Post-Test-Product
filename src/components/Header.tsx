/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-[#F9EDDE] sticky top-0 z-30 shadow-xs">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand Zone: Single element wordmark & mark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#BD214C] flex items-center justify-center text-white font-bold text-sm tracking-wider font-heading shadow-xs">
            BB
          </div>
          <div>
            <span className="font-heading font-bold text-base tracking-tight text-[#231F20]">
              Boleh Belajar
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-gray-500 font-medium">
              · Mini Class Post Test
            </span>
          </div>
        </div>

        {/* Clean right indicator */}
        <div className="text-xs text-gray-400 font-medium hidden xs:block">
          Fundamental Performance Marketing
        </div>
      </div>
    </header>
  );
};
