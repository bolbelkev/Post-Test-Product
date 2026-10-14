# Post Test PM: Railway PostgreSQL dan Vercel

## Yang sudah disiapkan

- Frontend React/Vite, API Node di Vercel, PostgreSQL di Railway.
- Semua nama, jawaban, email, progres, dan klik CTA dikirim ke database. Tidak ada penyimpanan jawaban di localStorage, sessionStorage, atau IndexedDB.
- Cookie HttpOnly hanya berisi token acak untuk mengenali sesi, tanpa nama, email, atau jawaban. Sesi peserta berlaku 30 hari; sesi admin 12 jam.
- Jawaban ditampung sementara di memori halaman, lalu dikirim berkelompok setelah jeda 2 detik tanpa navigasi/perubahan. Perpindahan antarpertanyaan dalam satu bagian langsung berjalan. Perpindahan bagian dan halaman hasil menunggu penyimpanan selesai. Tidak ada indikator sukses penyimpanan per pertanyaan; kegagalan tetap ditampilkan dengan opsi coba lagi. Refresh/menutup halaman sebelum pengiriman selesai dapat menghilangkan isian yang belum terkirim.
- Jawaban dan kunci divalidasi di server. Kunci recap tidak dikirim ke browser. Pengiriman email baru dinyatakan berhasil setelah transaksi database selesai.
- Admin di `/admin`: login, daftar peserta, editor pertanyaan/kunci/urutan, konten awal, voucher/benefit/link, dan CSV.
- Salinan konfigurasi pada setiap sesi melindungi data lama ketika admin mengedit. Admin dapat menduplikasi post test, menyalin link, mengaktifkan/nonaktifkan pengisian, dan mengekspor data per post test. Setiap duplikat menyalin struktur/pertanyaan/penawaran tanpa peserta, dimulai nonaktif, dan dapat diedit untuk kelas atau batch lain. Tidak ada jadwal otomatis atau UI pengelolaan versi.
- Nama dan email dalam CSV digunakan tim Bolbel untuk sertifikat manual. Kehadiran day 1–3 tidak diverifikasi otomatis.

## 1. Konfigurasi koneksi lokal

Project PostgreSQL Railway sudah dibuat. Gunakan **DATABASE_PUBLIC_URL**, atau URL PgBouncer publik jika tersedia. URL `*.railway.internal` tidak bisa digunakan dari laptop atau Vercel.

Salin `.env.example` menjadi `.env.local`, lalu isi `DATABASE_URL` secara pribadi melalui editor. File `.env.local` diabaikan Git. Jangan memberi prefix `VITE_` pada kredensial database.

Gunakan pengaturan TLS yang sesuai endpoint Railway. Jika Railway menyediakan sertifikat CA, masukkan PEM-nya ke `DATABASE_CA_CERT` agar sertifikat diverifikasi. Jika SSL gagal, periksa CA/connection string; jangan menonaktifkan verifikasi TLS sebagai jalan pintas.

`APP_ORIGIN` boleh kosong untuk localhost. Jika diisi, harus sama dengan origin browser, termasuk port. `localhost` dan `127.0.0.1` adalah origin berbeda.

## 2. Buat tabel dan muat pertanyaan PM

Jalankan dari root project setelah dependency dipasang:

```powershell
npm run db:setup
```

Perintah ini menjalankan `db/migrations/001_initial.sql` dan mengisi konfigurasi dari `db/seed.ts`, termasuk 20 soal Batch 6 dan kunci yang sudah dikonfirmasi. Mengulang perintah tidak menghapus peserta atau menimpa konfigurasi admin.

Alternatif tabel manual: jalankan isi file SQL migration pada koneksi SQL Railway, lalu jalankan setup untuk seed. Cara utama yang direkomendasikan tetap `db:setup`, sehingga tabel dan konten siap bersamaan.

Tabel:

| Tabel | Kegunaan |
|---|---|
| quiz_configs | Konfigurasi PM, sections, pertanyaan, scoring, dan penawaran |
| participant_sessions | Nama, email, progres, status, skor, dan snapshot konfigurasi |
| participant_answers | Satu jawaban per sesi/ID pertanyaan, dengan snapshot teks/opsi |
| admin_users | Akun admin dan password hash |
| admin_sessions | Token login admin hash dan kedaluwarsa |
| login_limits | Batas percobaan login/start yang berlaku antar-instance |
| app_migrations | Penanda migration yang diterapkan |

## 3. Buat admin

Isi `ADMIN_EMAIL` dan `ADMIN_PASSWORD` di `.env.local`. Password minimal 12 karakter. Lalu:

```powershell
npm run admin:create
```

Password disimpan sebagai hash scrypt dengan salt acak. Akun yang sudah ada tidak ditimpa. Hapus `ADMIN_PASSWORD` dari `.env.local` setelah pembuatan akun; jangan memasukkannya ke Vercel. Password login admin tetap disimpan oleh pengguna melalui password manager.

## 4. Coba aplikasi lokal

```powershell
npm run dev
```

Endpoint lokal `/api/...` dijalankan melalui middleware Vite dengan kode yang sama seperti API Vercel. Buka aplikasi, isi nama, jawab sebagian soal, lalu refresh. Jawaban harus dimuat kembali dari Railway. Lihat nama sesi yang belum selesai di `/admin`.

Selesaikan kuis, simpan email, dan cek nama/email/semua jawaban di CSV. Matikan koneksi untuk menguji error: pesan sukses tidak boleh muncul dan halaman tidak lanjut saat jawaban gagal disimpan. Jika halaman ditutup sebelum database mengonfirmasi, isian yang belum terkirim bisa hilang; tidak ada fallback penyimpanan lokal.

Jika database belum dikonfigurasi, aplikasi menampilkan pesan "Database belum terhubung". Tidak ada mode demo lokal yang menyimpan jawaban.

## 5. Deploy Vercel

Import repository GitHub di Vercel. Framework Vite, build `npm run build`, output `dist`. Routing frontend `/admin` dan API diatur melalui `vercel.json`.

Environment variables backend:

| Variable | Isi |
|---|---|
| DATABASE_URL | Public PostgreSQL/PgBouncer URL Railway |
| DATABASE_CA_CERT | CA PEM jika dibutuhkan endpoint |
| APP_ORIGIN | Origin HTTPS domain produksi, tanpa slash terakhir |

Jangan menaruh admin password di hosting. Buat admin lewat perintah bootstrap sebelum deploy. API membutuhkan tabel yang sudah dibuat pada tahap 2. Redeploy setelah perubahan environment variables.

Gunakan database terpisah untuk staging/preview agar data pengujian tidak tercampur data peserta. `APP_ORIGIN` pada preview harus sesuai domain preview tersebut; jika kosong, origin request dibandingkan dengan host deployment.

## 6. Konten admin

Konten, opsi, tipe pertanyaan (single/multi/rating/text), wajib/opsional, urutan, jumlah soal, kunci, voucher, CTA, dan benefit bisa diedit melalui admin. ID pertanyaan harus stabil dan unik. `p1_goal` dan `p3_kendala_terbesar` digunakan untuk ringkasan akhir; server akan menolak penghapusannya.

Editor lanjutan berbentuk JSON untuk poin asesmen, narasi, dan aturan skip. Simpan mengaktifkan konfigurasi bagi peserta baru; peserta yang sedang mengerjakan mempertahankan konfigurasi ketika mulai.

Gambar menggunakan URL HTTPS atau `/images/...`. Gambar voucher saat ini ada di `public/images/`. Admin awal menyediakan penggantian URL, belum upload file. Mengubah teks/angka yang dicetak di dalam gambar memerlukan file gambar baru.

Aturan personalisasi benefit ada di tab Penawaran, format:

```json
[
  { "key": "p3_cara_belajar", "values": ["Rekaman fleksibel"], "text": "Akses rekaman sesuai waktu belajarmu." }
]
```

Poin yang cocok ditampilkan lebih dahulu, diikuti benefit umum, maksimal empat poin tanpa duplikasi teks. Seed tidak menambahkan klaim baru yang belum disetujui tim program.

CSV menggunakan satu baris per sesi, termasuk peserta belum selesai dan email kosong. Kolom pertanyaan menyertakan ID + teks saat dijawab. Status bisa difilter. Export maksimal 10.000 sesi terbaru untuk menjaga waktu respons; untuk volume lebih besar tambahkan export streaming/background sebelum limit ini tercapai. Data CSV yang diawali karakter formula dinetralkan agar tidak dieksekusi spreadsheet.

## 7. Sebelum menerima peserta

Tes integrasi menggunakan PostgreSQL embedded sementara (PGlite), hanya untuk pengujian. Aplikasi sebenarnya selalu membutuhkan Railway. Belum ada uji Railway/Vercel asli sebelum connection string diisi.

- Jalankan lint, build, dan tes (`npm run lint`, `npm run build`, `npm test`).
- Verifikasi login admin, submit email, resume, dan export pada deployment produksi.
- Pasang connection pooler seperti PgBouncer bila menerima banyak peserta bersamaan. Pool kecil per instance Vercel tidak membatasi total koneksi antar-instance. Uji sekitar 100 peserta bersamaan di staging sebelum mengklaim kapasitas tersebut.
- Pilih region API Vercel dekat region database Railway untuk mengurangi latensi.
- Aktifkan backup Railway dan uji pemulihannya. Export CSV bukan pengganti backup database.
- Atur pemeliharaan token kedaluwarsa dan kebijakan retensi data sesuai kebutuhan tim.

Referensi: [Railway PostgreSQL](https://docs.railway.com/databases/postgresql), [Vercel Node Functions](https://vercel.com/docs/functions/runtimes/node-js), [Pooling Vercel](https://vercel.com/kb/guide/connection-pooling-with-functions).
