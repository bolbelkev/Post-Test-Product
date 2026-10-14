# Skor kesiapan akhir

Rentang akhir: 40–85, dibulatkan ke bilangan bulat.

`40 + 45 × (70% × proporsi recap benar + 30% × kesiapan ternormalisasi)`

Proporsi recap benar = jumlah benar / jumlah soal recap pada konfigurasi sesi. Jumlah soal dapat berubah tanpa perlu mengubah rumus. Kunci dan perhitungan dilakukan server.

Kesiapan ternormalisasi = (total poin kesiapan − minimum poin yang mungkin) / (maksimum poin yang mungkin − minimum poin yang mungkin), dibatasi 0–1. Hanya pertanyaan di luar recap yang memiliki aturan poin menyumbang; feedback tidak diberi poin. Jika tidak ada rentang poin, kontribusi kesiapan adalah nol.

Contoh untuk 20 soal:

| Recap | Jawaban kesiapan | Skor akhir |
|---|---|---|
| 0 benar | Poin minimum | 40 |
| 0 benar | Poin maksimum | 54 |
| 10 benar | Poin maksimum | 69 |
| 20 benar | Poin minimum | 72 |
| 20 benar | Poin maksimum | 85 |

Rumus berlaku konsisten pada hasil peserta, daftar admin, dan CSV. Sesi lama dihitung ulang ketika dibaca; jawaban peserta tidak diubah. Skor ini adalah indikator internal post test, bukan persentase kesiapan karier yang telah divalidasi secara ilmiah.
