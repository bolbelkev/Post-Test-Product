/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserContact } from '../types.ts';

interface LeadFormProps {
  initialName?: string;
  onSubmit: (data: UserContact) => void;
  saved?: boolean;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSubmit, saved = false, initialName = '' }) => {
  const namaLengkap = initialName;
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({
    email: false,
  });

  const isNamaValid = namaLengkap.trim().length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid = isNamaValid && isEmailValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError('');
    try {
      onSubmit({
      namaLengkap: namaLengkap.trim(),
      email: email.trim().toLowerCase(),
      nomorHp: '',
      consent: false,
      });
    } catch {
      setError('Email belum tersimpan. Silakan coba lagi.');
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto px-4 py-2 flex flex-col justify-center">
      <div className="text-center mb-3">
        <h2 className="font-heading text-lg sm:text-xl font-bold text-[#231F20] leading-snug">
          Data untuk Sertifikat
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Sertifikat akan dikirim max. 3 hari kerja.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        {/* Field 2: Email */}
        <div>
          <label className="block text-xs font-semibold text-[#231F20] mb-0.5">
            Alamat Email <span className="text-[#BD214C]">*</span>
          </label>
          <input
            type="email"
            readOnly={saved}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            placeholder="nama@email.com (sertifikat dikirim ke sini)"
            className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none ${
              touched.email && !isEmailValid
                ? 'border-rose-400 bg-rose-50/20'
                : 'border-gray-300 focus:border-[#BD214C]'
            }`}
          />
          {touched.email && !isEmailValid && (
            <p className="text-[11px] text-rose-600 mt-0.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Email tidak valid</span>
            </p>
          )}
        </div>

        <p className="text-[11px] text-gray-500 leading-relaxed">
          Sertifikat hanya diberikan kepada peserta yang hadir pada seluruh sesi, day 1–3.
        </p>
        {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}

        {/* Submit button */}
        {saved ? <p role="status" className="email-saved-rise flex items-center justify-center gap-1.5 text-sm font-semibold text-emerald-600"><CheckCircle2 className="w-4 h-4" aria-hidden="true" />Email tersimpan</p> : <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full py-2.5 px-4 rounded-xl font-heading font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
            isFormValid
              ? 'bg-[#BD214C] hover:bg-[#a61c42] text-white shadow-md shadow-[#BD214C]/25 active:scale-[0.99] cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>Simpan Data Sertifikat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>}
      </form>
    </div>
  );
};
