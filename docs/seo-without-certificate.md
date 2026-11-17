# SEO Batch 4 tanpa sertifikat

Hanya konfigurasi `seo-batch-4` yang diberi `certificateEnabled: false`. PM dan Marketplace tetap memakai default alur sertifikat. Nama peserta baru SEO disimpan sebagai string kosong; email tetap null. Identifikasi data melalui ID sesi.

Pada awal SEO tidak ada kolom nama/poin sertifikat. Pada hasil tidak ada form email atau sapaan nama. Status `completed` disimpan otomatis saat menuju hasil, setelah semua jawaban wajib berhasil tersimpan.

Pilihan pekerjaan memiliki kolom detail wajib: posisi, bidang freelance, nama/jenis usaha, atau nama kampus. Contoh berupa placeholder, bukan jawaban terisi. Mengubah pilihan pekerjaan mengosongkan detail sebelumnya. Jawaban detail disimpan sebagai `p1_pekerjaan.detail` dan ikut CSV. Detail tidak membuat layar pertanyaan tambahan.

## Penerapan

1. Deploy kode baru terlebih dahulu.
2. Jalankan `node node_modules/tsx/dist/cli.mjs scripts/update-seo-flow.ts --apply` untuk memperbarui konfigurasi SEO di Railway. Tanpa `--apply`, perintah hanya membuat draft lokal.
3. Sesi baru menggunakan alur tanpa sertifikat; sesi lama mempertahankan snapshot awal. Untuk menguji alur baru gunakan Mulai ulang atau sesi browser baru. Nama/email historis tidak dihapus.

Jangan menerapkan konfigurasi baru sebelum kode baru aktif: aplikasi lama belum mendukung penyelesaian tanpa email dan detail pertanyaan inline.
