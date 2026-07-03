# userflow_uc_009.md — UC-009: Kelola Akun Pengguna

---

**Aktor:** Admin TU
**Halaman:** `/pengguna`, `/pengguna/tambah`, `/pengguna/:id/edit`

---

## Pre-condition
- Admin TU sudah login dengan role `ADMIN_TU`. Hanya role ini yang dapat mengakses menu Manajemen Pengguna (BR-02).

---

## Main Flow (Alur Utama) — Tambah Pengguna

1. Admin TU membuka menu **"Manajemen Pengguna"** di sidebar.
2. Sistem menampilkan halaman `/pengguna` berisi tabel seluruh akun pengguna internal beserta role dan bidangnya.
3. Admin TU menekan tombol **"+ Tambah Pengguna"**.
4. Sistem membuka halaman `/pengguna/tambah` dengan form: Username, Password, Nama Lengkap, Peran (dropdown: Admin TU / Kepala Sekolah / Wakil Kepala Sekolah / Guru Staf), Bidang (dropdown: Kurikulum, Kesiswaan, Sarana Prasarana, Humas, Keuangan — khusus jika peran memerlukan). Perhatikan: Wakasek hanya untuk 4 bidang (Kurikulum, Kesiswaan, Sarana Prasarana, Humas), tidak ada Wakasek Keuangan. Guru/Staf Keuangan berperan sebagai Bendahara.
5. Admin TU mengisi seluruh field dan menekan tombol **"Simpan"**.
6. Sistem memvalidasi username belum digunakan dan seluruh field wajib terisi.
7. Sistem menyimpan akun baru ke tabel `Pengguna` (password disimpan dalam bentuk terenkripsi).
8. Sistem menampilkan toast success: **"Akun pengguna berhasil ditambahkan."**
9. Sistem mengarahkan Admin TU kembali ke `/pengguna`.

## Main Flow (Alur Utama) — Edit / Hapus Pengguna

1. Admin TU menekan ikon **"Edit"** pada baris akun yang ingin diubah.
2. Sistem membuka halaman `/pengguna/:id/edit` dengan data akun yang sudah terisi otomatis.
3. Admin TU mengubah data yang diperlukan dan menekan **"Simpan Perubahan"**.
4. Sistem memperbarui data di tabel `Pengguna` dan menampilkan toast success.
5. Untuk menghapus akun, Admin TU menekan ikon **"Hapus"** pada baris akun.
6. Sistem menampilkan dialog konfirmasi: "Apakah Anda yakin ingin menghapus akun [nama]?"
7. Admin TU menekan **"Ya, Hapus"**.
8. Sistem menghapus data akun dari tabel `Pengguna` dan menampilkan toast success.

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Username sudah digunakan akun lain | Sistem menampilkan validasi: "Username sudah digunakan. Pilih username lain." |
| Field wajib tidak diisi | Sistem menampilkan validasi merah di bawah field terkait. |
| Admin TU mencoba menghapus akunnya sendiri | Sistem menampilkan pesan error: "Anda tidak dapat menghapus akun Anda sendiri." Aksi dibatalkan. |
| Admin TU membatalkan dialog konfirmasi hapus | Sistem menutup dialog tanpa melakukan perubahan apapun. |

---

## Post-condition
- Akun pengguna baru tersimpan dan dapat digunakan untuk login (UC-001).
- Perubahan/penghapusan akun langsung berlaku pada sesi berikutnya (akun yang dihapus tidak dapat login lagi, sesi aktif akun tersebut akan diakhiri paksa).
