# userflow_uc_014.md — UC-014: Lihat Audit Log

---

**Aktor:** Admin TU, Kepala Sekolah
**Halaman:** `/audit-log`

---

## Pre-condition
- Pengguna sudah login dengan role `ADMIN_TU` atau `KEPALA_SEKOLAH`.

---

## Main Flow (Alur Utama)

1. Admin TU atau Kepala membuka menu **"Audit Log"** di sidebar.
2. Sistem menampilkan halaman `/audit-log` berisi daftar log perubahan sistem.
3. Tabel menampilkan: Waktu, Nama User, Role, Aksi (badge warna), Entitas, Detail.
4. Admin TU/Kepala dapat memfilter:
   - **Aksi**: Semua, CREATE, UPDATE_STATUS, DELETE
   - **Entitas**: Semua, surat_masuk, disposisi, pengguna
5. Sistem mengirim request `GET /api/audit-log` dengan query parameter `aksi` dan `entitas` ke server.
6. Server mengembalikan data audit log yang sudah difilter, diurutkan dari yang terbaru.
7. Sistem menampilkan hasil filter dalam tabel dengan badge warna per aksi:
   - CREATE = hijau
   - UPDATE_STATUS = kuning
   - DELETE = merah

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Token expired | Sistem mengarahkan ke halaman login. |
| Tidak ada data audit log | Sistem menampilkan Empty State: "Belum ada catatan audit." |
| Role tidak diizinkan | Sistem menampilkan halaman 403 Forbidden. |

---

## Post-condition
- Admin TU dan Kepala dapat melacak semua perubahan data di sistem secara transparan.
- Log mencakup: pembuatan surat, pembuatan disposisi, update status surat, dan hapus komentar.
