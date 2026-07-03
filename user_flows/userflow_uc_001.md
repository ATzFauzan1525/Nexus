# userflow_uc_001.md — UC-001: Login Pengguna

---

**Aktor:** Admin TU / Kepala Sekolah / Guru Staf (5 bidang) / Wakil Kepala Sekolah (4 bidang)  
**Halaman:** `/login`

---

## Pre-condition
- Pengguna belum dalam status login (sesi belum aktif).
- Akun pengguna sudah dibuat oleh Admin TU dan tersimpan di database.

---

## Main Flow (Alur Utama)

1. Pengguna membuka browser dan mengakses URL sistem SiDis.
2. Sistem mendeteksi bahwa pengguna belum login dan menampilkan halaman `/login`.
3. Pengguna mengisi kolom **Username** dan **Password**.
4. Pengguna menekan tombol **"Masuk"**.
5. Sistem mengirimkan data kredensial ke server melalui API.
6. Server memvalidasi username dan password terhadap data di database.
7. Jika valid, server mengembalikan JWT token dan data profil pengguna (nama, role).
8. Sistem menyimpan JWT token di sesi browser.
9. Sistem mengarahkan pengguna ke halaman `/dashboard`.

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Username atau password salah | Sistem menampilkan pesan error merah di bawah form: "Password atau email salah." Form tidak dikosongkan. |
| Salah satu kolom dibiarkan kosong | Sistem menampilkan pesan validasi merah di bawah kolom yang kosong: "Kolom ini wajib diisi." Tombol Masuk tidak mengirim request ke server. |
| Server tidak merespons / error jaringan | Sistem menampilkan alert error: "Gagal terhubung ke server. Periksa koneksi Anda dan coba lagi." |
| Pengguna sudah login (token masih aktif) dan mengakses `/login` | Sistem langsung mengarahkan pengguna ke `/dashboard` tanpa menampilkan halaman login. |

---

## Post-condition
- Pengguna berhasil masuk ke dalam sistem dan berada di halaman `/dashboard`.
- JWT token tersimpan di sesi browser dan akan digunakan pada setiap request API selanjutnya.
- Topbar menampilkan nama dan role pengguna yang sedang aktif.
