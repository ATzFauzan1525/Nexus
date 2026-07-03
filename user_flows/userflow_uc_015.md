# userflow_uc_015.md — UC-015: Download File Scan Surat

---

**Aktor:** Semua Aktor Internal (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek)
**Halaman:** Detail Surat (`/surat/:id`), Detail Disposisi (`/disposisi/:id`), atau Buat Disposisi (`/disposisi/buat`)

---

## Pre-condition
- Pengguna sudah login dengan role apapun.
- Surat memiliki file scan yang tersimpan sebagai `file_data` (BYTEA) dan `file_mime` di tabel `surat_masuk`.

---

## Main Flow (Alur Utama)

1. Pengguna membuka halaman detail surat atau detail disposisi.
2. Jika surat memiliki file scan, tombol **"Download File"** atau **"Lihat File"** ditampilkan (bergantung halaman):
   - `/surat/:id` → tombol "Download File"
   - `/disposisi/:id` → tombol "Lihat File"
   - `/disposisi/buat` → tombol "Lihat File"
3. Pengguna menekan tombol download/view file.
4. Sistem mengirim request `GET /api/surat/:id/download` ke server dengan header Authorization (JWT).
5. Server mengambil `file_data` dan `file_mime` dari tabel `surat_masuk`.
6. Server mengembalikan file binary dengan header `Content-Type: {file_mime}`.
7. Frontend menggunakan `fetch()` + `response.blob()` + `URL.createObjectURL()` untuk membuka file di tab baru.
8. Setelah file dibuka, object URL dibersihkan dari memory.

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Surat tidak memiliki file scan | Tombol download tidak ditampilkan. |
| Token expired | Sistem mengarahkan ke halaman login. |
| Server error | Sistem menampilkan toast error: "Gagal mengunduh file." |

---

## Post-condition
- File scan surat berhasil dibuka atau diunduh ke perangkat pengguna.
- Akses file hanya dapat dilakukan oleh pengguna yang sudah login dengan token JWT yang valid.
