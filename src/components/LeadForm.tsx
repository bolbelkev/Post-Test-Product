/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Lock, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { UserContact } from '../types.ts';

interface LeadFormProps {
  initialName?: string;
  onSubmit: (data: UserContact) => void;
  onOpenPrivacy: () => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSubmit, onOpenPrivacy, initialName = '' }) => {
  const [namaLengkap, setNamaLengkap] = useState(initialName);
  const [email, setEmail] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState({
    nama: false,
    email: false,
    hp: false,
  });

  const isNamaValid = namaLengkap.trim().length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const cleanHp = nomorHp.replace(/[\s-]/g, '');
  const isHpValid = /^(?:\+62|62|0)8[1-9][0-9]{7,11}$/.test(cleanHp);

  const isFormValid = isNamaValid && isEmailValid && isHpValid && consent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    onSubmit({
      namaLengkap: namaLengkap.trim(),
      email: email.trim().toLowerCase(),
      nomorHp: cleanHp,
      consent,
    });
  };

  return (
    <div className="w-full max-w-[420px] mx-auto px-4 py-2 flex flex-col justify-center">
      <div className="text-center mb-3">
        <h2 className="font-heading text-lg sm:text-xl font-bold text-[#231F20] leading-snug">
          Data Diri untuk Sertifikat & Hasil
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Lengkapi data untuk melihat skor kecocokan dan pengiriman e-sertifikat
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        {/* Field 1: Nama Lengkap */}
        <div>
          <label className="block text-xs font-semibold text-[#231F20] mb-0.5">
            Nama Lengkap <span className="text-[#BD214C]">*</span>
          </label>
          <input
            type="text"
            value={namaLengkap}
            onChange={(e) => setNamaLengkap(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, nama: true }))}
            placeholder="Tulis sesuai nama di sertifikat"
            className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none ${
              touched.nama && !isNamaValid
                ? 'border-rose-400 bg-rose-50/20'
                : 'border-gray-300 focus:border-[#BD214C]'
            }`}
          />
          {touched.nama && !isNamaValid && (
            <p className="text-[11px] text-rose-600 mt-0.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Harap masukkan nama minimal 3 karakter</span>
            </p>
          )}
        </div>

        {/* Field 2: Email */}
        <div>
          <label className="block text-xs font-semibold text-[#231F20] mb-0.5">
            Alamat Email <span className="text-[#BD214C]">*</span>
          </label>
          <input
            type="email"
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

        {/* Field 3: Nomor HP */}
        <div>
          <label className="block text-xs font-semibold text-[#231F20] mb-0.5">
            Nomor WhatsApp / HP <span className="text-[#BD214C]">*</span>
          </label>
          <input
            type="tel"
            value={nomorHp}
            onChange={(e) => setNomorHp(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, hp: true }))}
            placeholder="08xxxxxxxxxx atau +628xxxxxxxxxx"
            className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none ${
              touched.hp && !isHpValid
                ? 'border-rose-400 bg-rose-50/20'
                : 'border-gray-300 focus:border-[#BD214C]'
            }`}
          />
          {touched.hp && !isHpValid && (
            <p className="text-[11px] text-rose-600 mt-0.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Gunakan format nomor HP 08xx / +62</span>
            </p>
          )}
        </div>

        {/* Field 4: Consent Checkbox */}
        <div className="pt-0.5">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                  consent
                    ? 'bg-[#BD214C] border-[#BD214C] text-white'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                {consent && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
            <span className="text-[11px] text-gray-500 leading-snug">
              Saya menyetujui data digunakan untuk penerbitan sertifikat dan info program Boleh Belajar sesuai{' '}
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="text-[#BD214C] underline hover:text-[#a61c42] font-semibold inline cursor-pointer"
              >
                Kebijakan Privasi
              </button>
              .
            </span>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full py-2.5 px-4 rounded-xl font-heading font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
            isFormValid
              ? 'bg-[#BD214C] hover:bg-[#a61c42] text-white shadow-md shadow-[#BD214C]/25 active:scale-[0.99] cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>Lihat Hasil & Kirim Sertifikat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
