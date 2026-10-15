# Import Mini Class Marketplace

Sumber: `Silabus Mini Class Marketplace.xlsx`, tab `Soal Quiz Batch 3-4`.

Ada 20 soal asli dalam dua kelompok kolom: B–E (nomor 1–10) dan G–J (nomor 11–20).

Nomor dengan latar merah muda `EA9999` dikecualikan sesuai permintaan:

| Nomor asli | Sel nomor |
|---|---|
| 5 | B19 |
| 7 | B27 |
| 14 | G15 |
| 17 | G27 |
| 19 | G35 |

15 soal dimasukkan dalam urutan nomor asli: 1, 2, 3, 4, 6, 8, 9, 10, 11, 12, 13, 15, 16, 18, 20. Teks soal/opsi dipertahankan; masing-masing satu opsi berwarna kuning `FFFF00` menjadi kunci jawaban. ID internal mempertahankan nomor sumber; tampilan peserta menomori ulang 1–15.

Slug: `marketplace-batch-3-4`. Status awal nonaktif. PM tidak diubah. Profiling/asesmen/preferensi diadaptasi untuk pengelolaan marketplace, dan tools diganti menjadi Shopee, Tokopedia, TikTok Shop. Feedback, sertifikat, desain voucher, nomor WhatsApp serta benefit diwarisi dari template PM; benefit perlu ditinjau untuk kelas Marketplace sebelum aktivasi. Aturan personalisasi penawaran dikosongkan agar tidak membawa pemetaan jawaban PM.

Skor menggunakan rumus aplikasi yang sama: 70% recap dan 30% kesiapan, rentang 40–85. Denominator recap otomatis 15.

`marketplace-source.json` menyimpan ekstraksi termasuk soal yang dikecualikan dan penanda sel; `marketplace-config.json` menyimpan konfigurasi awal yang diimpor. File tersebut berisi kunci jawaban dan hanya untuk tim/admin.
