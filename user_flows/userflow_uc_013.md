# userflow_uc_013.md — UC-013: Tambah Komentar pada Surat

---

**Aktor:** Semua Aktor Internal (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek)
**Halaman:** `/surat/:id` (Detail Surat) atau `/disposisi/:id` (Detail Disposisi)

---

## Pre-condition
- Pengguna sudah login dengan role apapun (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek).
- Pengguna sedang melihat halaman Detail Surat atau Detail Disposisi.

---

## Main Flow (Alur Utama)

1. Pengguna membuka halaman Detail Surat (`/surat/:id`).
2. Sistem menampilkan informasi surat, timeline, disposisi, dan bagian **Komentar** di bawahnya.
3. Pengguna mengetikkan komentar pada kolom input teks.
4. Pengguna menekan tombol kirim (ikon Send).
5. Sistem mengirim request `POST /api/surat/:suratId/komentar` dengan isi komentar.
6. Server menyimpan komentar ke tabel `komentar` dengan `user_id` dari token JWT.
7. Sistem menampilkan komentar baru di daftar komentar (tanpa perlu refresh).
8. Komentar menampilkan: nama penulis, badge role, waktu, dan isi komentar.

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Isi komentar kosong | Tombol kirim dinonaktifkan, request tidak dikirim. |
| Token expired | Sistem mengarahkan ke halaman login. |
| Server error | Sistem menampilkan toast error: "Gagal menambah komentar." |

---

## Post-condition
- Komentar baru tersimpan di tabel `komentar` dengan referensi `surat_id` dan `user_id`.
- Komentar terlihat oleh semua pengguna yang mengakses detail surat yang sama.
- Komentar dapat dihapus oleh penulis, Admin TU, atau Kepala Sekolah.

---

## Hapus Komentar

1. Pengguna (penulis / Admin TU / Kepala Sekolah) menekan ikon trash (🗑️) pada komentar.
2. Sistem menampilkan konfirmasi: "Hapus komentar ini?"
3. Pengguna menekan "OK".
4. Sistem mengirim request `DELETE /api/surat/0/komentar/:id`.
5. Server menghapus komentar dari tabel `komentar` (hanya jika user adalah penulis, Admin TU, atau Kepala Sekolah).
6. Komentar hilang dari daftar.
