/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#BD214C]" />
            <h3 className="font-heading font-bold text-base text-[#231F20]">
              Kebijakan Privasi & Persetujuan Data
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
          <p>
            Boleh Belajar menghormati dan melindungi privasi data pribadi peserta Free Mini Class Fundamental Performance Marketing sesuai dengan regulasi perlindungan data yang berlaku di Indonesia.
          </p>

          <h4 className="font-heading font-bold text-gray-900 text-xs uppercase tracking-wider">
            1. Data yang Dikumpulkan
          </h4>
          <p>
            Kami mengumpulkan <strong>Nama Lengkap</strong>, <strong>Alamat Email</strong>, dan <strong>Nomor WhatsApp / HP</strong> yang Anda masukkan pada formulir post test ini.
          </p>

          <h4 className="font-heading font-bold text-gray-900 text-xs uppercase tracking-wider">
            2. Tujuan Penggunaan Data
          </h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>Penerbitan e-sertifikat resmi partisipasi Free Mini Class atas nama Anda.</li>
            <li>Pengiriman berkas sertifikat dan materi rekaman ke alamat email terdaftar.</li>
            <li>Pemberian rekomendasi belajar dan penawaran khusus program lanjutan Bootcamp Performance Marketing Boleh Belajar.</li>
          </ul>

          <h4 className="font-heading font-bold text-gray-900 text-xs uppercase tracking-wider">
            3. Keamanan Data
          </h4>
          <p>
            Data Anda disimpan secara aman dan tidak akan diperjualbelikan kepada pihak ketiga manapun tanpa persetujuan Anda.
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#BD214C] hover:bg-[#a61c42] text-white font-heading font-semibold text-xs transition-colors cursor-pointer"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
