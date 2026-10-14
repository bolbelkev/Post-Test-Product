# Kelola post test

Di `/admin`, bagian **Kelola link post test** menyediakan pemilihan post test, Salin link, Aktifkan/Nonaktifkan, dan Duplikasi.

1. Pilih post test sumber lalu klik **Duplikasi**.
2. Isi judul, batch, dan nama link unik, contoh `pm-batch-7`.
3. Salinan dibuat **nonaktif**, berisi pertanyaan dan penawaran sumber, tanpa data peserta.
4. Edit konten, pertanyaan/kunci, serta penawaran menggunakan tab admin yang sudah ada. Simpan sebelum berpindah post test.
5. Klik **Aktifkan**, lalu **Salin link** untuk dibagikan.
6. Tab Data peserta dan Export CSV hanya berisi data post test yang dipilih. Filter status tetap tersedia.

Link setiap post test berbentuk `/test/nama-link`. Link utama `/` tetap menunjuk post test PM awal (`pm`); `/test/pm` mengarah ke post test yang sama dan menggunakan sesi lama yang sama.

Sesi peserta memakai cookie terpisah per post test. Satu browser dapat mengerjakan beberapa post test tanpa tertukar.

**Nonaktifkan** langsung menolak pengisian baru dan pengiriman jawaban/email sesi yang belum selesai. Jawaban yang sudah masuk tetap tersimpan. Peserta yang sudah selesai tetap dapat membuka hasil. Jika link diaktifkan kembali, sesi yang belum kedaluwarsa dapat dilanjutkan. Tidak ada jadwal buka/tutup otomatis.

Struktur salinan mengikuti lima bagian template yang sudah ada. Judul pertanyaan dan konten dapat diubah, tetapi duplikasi tidak otomatis membuat materi atau kunci baru untuk kelas Marketplace. Tinjau isi sebelum mengaktifkan link.

Fitur memakai tabel `quiz_configs` dan `participant_sessions.quiz_slug` yang sudah tersedia. Tidak perlu migrasi data, dan data PM lama tidak dihapus.
