# userflow_uc_007.md — UC-007: Lihat Timeline Surat

---

**Aktor:** Semua Aktor Internal (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek)
**Halaman:** `/surat/:id`

---

## Pre-condition
- Aktor sudah login dan memiliki hak akses terhadap surat yang dituju.
- Guru/Staf hanya dapat mengakses surat yang memiliki disposisi ditujukan kepadanya (BR-11).
- Wakasek hanya dapat mengakses surat yang berhubungan dengan bidangnya.
- Surat sudah memiliki minimal satu entri di tabel `StatusSurat` (status awal `Diterima`).

---

## Main Flow (Alur Utama)

1. Aktor membuka detail surat melalui tabel `/surat` atau melalui notifikasi terkait.
2. Sistem menampilkan halaman `/surat/:id` berisi: informasi surat (nomor, tanggal, pengirim, perihal, file scan) dan posisi status terkini (badge berwarna).
3. Aktor men-scroll ke bagian **"Timeline / Riwayat Surat"**.
4. Sistem menampilkan seluruh entri dari tabel `StatusSurat` yang berkaitan dengan surat tersebut, diurutkan berdasarkan `waktuUpdate` dari yang paling awal ke yang terbaru, dalam bentuk vertical timeline.
5. Setiap entri pada timeline menampilkan: status, nama pengguna yang melakukan perubahan, waktu, dan catatan tindak lanjut (jika ada).
6. Jika surat sudah memiliki disposisi, sistem juga menampilkan ringkasan disposisi (penerima, instruksi, deadline) terkait pada bagian yang sama.

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Surat tidak ditemukan (ID tidak valid) | Sistem menampilkan halaman 404 dengan pesan: "Surat tidak ditemukan." |
| Guru/Staf mencoba mengakses surat yang tidak memiliki disposisi kepadanya | Sistem menampilkan pesan: "Anda tidak memiliki akses ke surat ini." (403). |
| Wakasek mencoba mengakses surat di luar bidangnya | Sistem menampilkan pesan: "Anda tidak memiliki akses ke surat ini." dan mengarahkan kembali ke `/surat`. |
| Surat belum memiliki disposisi | Sistem tidak menampilkan bagian ringkasan disposisi, hanya menampilkan timeline status. |

---

## Post-condition
- Aktor dapat melihat posisi surat secara transparan tanpa harus bertanya ke Admin TU (menjawab kebutuhan utama dari hasil wawancara Staf Humas).
