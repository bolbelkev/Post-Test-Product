/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RecapQuestion {
  id: number;
  question: string;
  subText?: string;
  options: string[];
  correctAnswer: string;
  optionIcons?: Record<string, string>;
}

export const RECAP_QUESTIONS: RecapQuestion[] = [
  {
    id: 1,
    question: 'Apa fungsi utama Performance Marketing dibanding Traditional Marketing?',
    subText: 'Pilih jawaban yang paling tepat sesuai materi sesi.',
    options: [
      'Hasil kampanye dapat diukur secara presisi berdasarkan data',
      'Memasang banner fisik berukuran besar di jalan raya',
      'Menjangkau audiens tanpa perlu tracking konversi',
      'Mengandalkan perkiraan jumlah penonton TV',
    ],
    correctAnswer: 'Hasil kampanye dapat diukur secara presisi berdasarkan data',
    optionIcons: {
      'Hasil kampanye dapat diukur secara presisi berdasarkan data': '📊',
      'Memasang banner fisik berukuran besar di jalan raya': '🪧',
      'Menjangkau audiens tanpa perlu tracking konversi': '👁️',
      'Mengandalkan perkiraan jumlah penonton TV': '📺',
    },
  },
  {
    id: 2,
    question: 'Apa kepanjangan dan definisi dari metrik CTR?',
    options: [
      'Click-Through Rate: Persentase klik dibanding impresi tayangan',
      'Cost-To-Revenue: Perbandingan biaya promosi terhadap omset',
      'Conversion-Time-Rate: Waktu rata-rata transaksi checkout',
      'Customer-Traffic-Ratio: Jumlah pengunjung baru di website',
    ],
    correctAnswer: 'Click-Through Rate: Persentase klik dibanding impresi tayangan',
    optionIcons: {
      'Click-Through Rate: Persentase klik dibanding impresi tayangan': '🖱️',
      'Cost-To-Revenue: Perbandingan biaya promosi terhadap omset': '💰',
      'Conversion-Time-Rate: Waktu rata-rata transaksi checkout': '⏱️',
      'Customer-Traffic-Ratio: Jumlah pengunjung baru di website': '👥',
    },
  },
  {
    id: 3,
    question: 'Bagaimana rumus dasar menghitung ROAS (Return on Ad Spend)?',
    options: [
      'Pendapatan Iklan (Revenue) / Biaya Iklan (Ad Spend)',
      'Biaya Iklan / Jumlah Klik yang didapat',
      'Jumlah Konversi / Jumlah Impresi Iklan',
      'Total Penjualan - Harga Pokok Penjualan (HPP)',
    ],
    correctAnswer: 'Pendapatan Iklan (Revenue) / Biaya Iklan (Ad Spend)',
    optionIcons: {
      'Pendapatan Iklan (Revenue) / Biaya Iklan (Ad Spend)': '📈',
      'Biaya Iklan / Jumlah Klik yang didapat': '💳',
      'Jumlah Konversi / Jumlah Impresi Iklan': '🎯',
      'Total Penjualan - Harga Pokok Penjualan (HPP)': '🧾',
    },
  },
  {
    id: 4,
    question: 'Apa yang dimaksud dengan "Audience Targeting" pada Ads Manager?',
    options: [
      'Menentukan kriteria audiens spesifik (demografi, minat, perilaku)',
      'Menutup tayangan iklan bagi semua akun kompetitor',
      'Membatasi jam tayang iklan hanya di akhir pekan saja',
      'Menulis copy teks caption iklan secara otomatis',
    ],
    correctAnswer: 'Menentukan kriteria audiens spesifik (demografi, minat, perilaku)',
    optionIcons: {
      'Menentukan kriteria audiens spesifik (demografi, minat, perilaku)': '🎯',
      'Menutup tayangan iklan bagi semua akun kompetitor': '🚫',
      'Membatasi jam tayang iklan hanya di akhir pekan saja': '📅',
      'Menulis copy teks caption iklan secara otomatis': '✍️',
    },
  },
  {
    id: 5,
    question: 'Apa peran utama Meta Pixel / Google Tag pada website bisnis kamu?',
    options: [
      'Merekam aktivitas pengunjung untuk optimasi & retargeting iklan',
      'Mendesain visual banner website agar terlihat estetik',
      'Mempercepat loading koneksi internet pengunjung toko',
      'Menghapus cache dan cookie browser pengguna otomatis',
    ],
    correctAnswer: 'Merekam aktivitas pengunjung untuk optimasi & retargeting iklan',
    optionIcons: {
      'Merekam aktivitas pengunjung untuk optimasi & retargeting iklan': '📡',
      'Mendesain visual banner website agar terlihat estetik': '🎨',
      'Mempercepat loading koneksi internet pengunjung toko': '⚡',
      'Menghapus cache dan cookie browser pengguna otomatis': '🧹',
    },
  },
  {
    id: 6,
    question: 'Audiens yang baru pertama mengenal brand kamu berada di fase funnel:',
    options: [
      'Top of the Funnel (TOFU) / Awareness',
      'Middle of the Funnel (MOFU) / Consideration',
      'Bottom of the Funnel (BOFU) / Conversion',
      'Retention & Loyalty Phase',
    ],
    correctAnswer: 'Top of the Funnel (TOFU) / Awareness',
    optionIcons: {
      'Top of the Funnel (TOFU) / Awareness': '📢',
      'Middle of the Funnel (MOFU) / Consideration': '🤔',
      'Bottom of the Funnel (BOFU) / Conversion': '🛒',
      'Retention & Loyalty Phase': '❤️',
    },
  },
  {
    id: 7,
    question: 'Apa arti dari metrik CPA (Cost Per Acquisition / Cost Per Action)?',
    options: [
      'Rata-rata biaya iklan untuk mendapatkan 1 aksi/konversi',
      'Biaya sewa platform ads manager per bulan',
      'Biaya per seribu tayangan impresi iklan',
      'Persentase pengunjung website yang memasukkan ke cart',
    ],
    correctAnswer: 'Rata-rata biaya iklan untuk mendapatkan 1 aksi/konversi',
    optionIcons: {
      'Rata-rata biaya iklan untuk mendapatkan 1 aksi/konversi': '🏷️',
      'Biaya sewa platform ads manager per bulan': '🏢',
      'Biaya per seribu tayangan impresi iklan': '👁️',
      'Persentase pengunjung website yang memasukkan ke cart': '🛒',
    },
  },
  {
    id: 8,
    question: 'Tujuan utama melakukan A/B Testing dalam beriklan adalah:',
    options: [
      'Menguji 2 variasi materi iklan untuk melihat mana yang performanya lebih baik',
      'Membagi budget iklan secara merata ke dua negara berbeda',
      'Menjalankan iklan di dua akun media sosial secara bersamaan',
      'Menggandakan budget kampanye secara mendadak setiap hari',
    ],
    correctAnswer: 'Menguji 2 variasi materi iklan untuk melihat mana yang performanya lebih baik',
    optionIcons: {
      'Menguji 2 variasi materi iklan untuk melihat mana yang performanya lebih baik': '⚖️',
      'Membagi budget iklan secara merata ke dua negara berbeda': '🌍',
      'Menjalankan iklan di dua akun media sosial secara bersamaan': '📱',
      'Menggandakan budget kampanye secara mendadak setiap hari': '💸',
    },
  },
  {
    id: 9,
    question: 'Strategi iklan Retargeting paling efektif ditujukan kepada:',
    options: [
      'Audiens yang sudah pernah berinteraksi atau mengunjungi website',
      'Orang yang belum pernah mendengar nama brand kamu sama sekali',
      'Pengguna internet yang berada di luar target demografi produk',
      'Kompetitor bisnis sejenis di industri yang sama',
    ],
    correctAnswer: 'Audiens yang sudah pernah berinteraksi atau mengunjungi website',
    optionIcons: {
      'Audiens yang sudah pernah berinteraksi atau mengunjungi website': '🔄',
      'Orang yang belum pernah mendengar nama brand kamu sama sekali': '🆕',
      'Pengguna internet yang berada di luar target demografi produk': '🌐',
      'Kompetitor bisnis sejenis di industri yang sama': '👥',
    },
  },
  {
    id: 10,
    question: 'Jika iklan menghabiskan budget Rp 500.000 dan mendapat 1.000 klik, CPC-nya adalah:',
    options: [
      'Rp 500 per klik',
      'Rp 5.000 per klik',
      'Rp 50.000 per klik',
      'Rp 50 per klik',
    ],
    correctAnswer: 'Rp 500 per klik',
    optionIcons: {
      'Rp 500 per klik': '💡',
      'Rp 5.000 per klik': '💵',
      'Rp 50.000 per klik': '💳',
      'Rp 50 per klik': '🪙',
    },
  },
];

export function getRecapBandNarrative(correctCount: number): string {
  if (correctCount >= 9) {
    return `Kamu jawab ${correctCount} dari 10 pertanyaan dengan benar! Pengetahuan kamu tentang Performance Marketing sudah sangat baik.`;
  }
  if (correctCount >= 6) {
    return `Kamu jawab ${correctCount} dari 10 pertanyaan dengan benar! Dasar-dasar Performance Marketing kamu udah cukup solid.`;
  }
  if (correctCount >= 3) {
    return `Kamu jawab ${correctCount} dari 10 pertanyaan dengan benar! Kamu udah punya modal awal yang bagus buat lanjut belajar lebih dalam.`;
  }
  return `Kamu jawab ${correctCount} dari 10 pertanyaan dengan benar! Kamu masih punya banyak ruang buat berkembang — tenang aja, Boleh Belajar punya learning path yang bisa bantu kamu mulai dari awal.`;
}
