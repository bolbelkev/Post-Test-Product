/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import brandLogo from '../assets/images/Logo Bolbel 1200x300-01.png';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-[#F9EDDE] sticky top-0 z-30 shadow-xs">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand logo */}
        <div className="flex items-center gap-2.5">
          <img
            src={brandLogo}
            alt="Boleh Belajar"
            className="w-40 sm:w-48 h-auto shrink-0"
          />
            <span className="hidden sm:inline-block ml-2 text-xs text-gray-500 font-medium">
              · Mini Class Post Test
            </span>
        </div>

        {/* Clean right indicator */}
        <div className="text-xs text-gray-400 font-medium hidden xs:block">
          Fundamental Performance Marketing
        </div>
      </div>
    </header>
  );
};
