# User Flow Specification

Document Version: v1.0

Use Case ID: UC-013

Use Case Name: Tambah Komentar pada Surat

Status: Active

Last Updated: 2026-06-28

Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Pengguna internal menambahkan komentar atau catatan pada detail surat untuk keperluan diskusi tim.

## 1.2 Goal

Pengguna ingin berkomunikasi dengan tim terkait surat tertentu melalui komentar yang terintegrasi dalam sistem.

## 1.3 Requirement References

| Requirement ID | Requirement Name |
|---|---|
| F-13 | Komentar/Catatan pada detail surat |

## 1.4 Primary Actor

Semua Aktor Internal (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek)

## 1.5 Supporting Actors

Sistem Autentikasi, Database

---

# 2. TRIGGER

Pengguna membuka halaman Detail Surat (`/surat/:id`) atau Detail Disposisi (`/disposisi/:id`).

---

# 3. PRECONDITIONS

| ID | Condition |
|---|---|
| PRE-001 | Pengguna sudah login dengan role apapun |
| PRE-002 | Pengguna sedang melihat halaman Detail Surat atau Detail Disposisi |
| PRE-003 | Surat sudah tersimpan di database |

---

# 4. MAIN FLOW

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna membuka halaman Detail Surat (`/surat/:id`) | Sistem menampilkan informasi surat, timeline, disposisi, dan bagian **Komentar** |
| 2 | Pengguna mengetikkan komentar pada kolom input teks | Tombol kirim (ikon Send) aktif |
| 3 | Pengguna menekan tombol kirim | Sistem mengirim request `POST /api/surat/:suratId/komentar` dengan isi komentar |
| 4 | - | Server menyimpan komentar ke tabel `komentar` dengan `user_id` dari token JWT |
| 5 | - | Sistem menampilkan komentar baru di daftar komentar (tanpa perlu refresh) |
| 6 | - | Komentar menampilkan: nama penulis, badge role, waktu, dan isi komentar |

---

# 5. ALTERNATIVE FLOW

## AF-001: Hapus Komentar

### Condition

Ketika pengguna adalah penulis komentar, Admin TU, atau Kepala Sekolah.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna menekan ikon trash (🗑️) pada komentar | Sistem menampilkan konfirmasi: "Hapus komentar ini?" |
| 2 | Pengguna menekan "OK" | Sistem mengirim request `DELETE /api/surat/:suratId/komentar/:id` |
| 3 | - | Server menghapus komentar dari tabel `komentar` |
| 4 | - | Komentar hilang dari daftar |

---

## AF-002: Input Kosong

### Condition

Ketika pengguna mengklik tombol kirim tanpa mengisi komentar.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna menekan tombol kirim | Tombol kirim dinonaktifkan, request tidak dikirim |

---

# 6. EXCEPTION FLOW

## EF-001: Token Expired

### Condition

Ketika session token pengguna sudah expired.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna menekan tombol kirim | Sistem mendeteksi token expired |
| 2 | - | Sistem mengarahkan ke halaman login (`/login`) |

---

## EF-002: Server Error

### Condition

Ketika server mengalami error saat menyimpan komentar.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna menekan tombol kirim | Server mengembalikan error 500 |
| 2 | - | Sistem menampilkan toast error: "Gagal menambah komentar." |

---

# 7. POSTCONDITIONS

| ID | Condition |
|---|---|
| POST-001 | Komentar baru tersimpan di tabel `komentar` dengan referensi `surat_id` dan `user_id` |
| POST-002 | Komentar terlihat oleh semua pengguna yang mengakses detail surat yang sama |
| POST-003 | Komentar dapat dihapus oleh penulis, Admin TU, atau Kepala Sekolah (BR-18) |

---

# 8. BUSINESS RULES

| Rule ID | Description |
|---|---|
| BR-18 | Komentar hanya dapat dihapus oleh penulis komentar itu sendiri, Admin TU, atau Kepala Sekolah |

---

# 9. RELATED PAGES

| Page ID | Page Name | Route |
|---|---|---|
| PAGE-005 | Detail Surat | `/surat/:id` |
| PAGE-009 | Detail Disposisi | `/disposisi/:id` |

---

# 10. DATA USAGE

## 10.1 Data Read

| Entitas | Description |
|---|---|
| Pengguna | Mengambil data penulis komentar |
| Komentar | Menampilkan daftar komentar yang sudah ada |

## 10.2 Data Created

| Entitas | Description |
|---|---|
| Komentar | Membuat komentar baru dengan `surat_id`, `user_id`, `isi` |

## 10.3 Data Updated

| Entitas | Description |
|---|---|
| Tidak ada | Tidak ada data yang diupdate |

## 10.4 Data Deleted

| Entitas | Description |
|---|---|
| Komentar | Menghapus komentar (hanya oleh penulis/Admin/Kepala) |

---

# 11. PERMISSIONS

| Role | Access |
|---|---|
| ADMIN_TU | AKSI (ALLOWED) + HAPUS (ALLOWED) |
| KEPALA_SEKOLAH | AKSI (ALLOWED) + HAPUS (ALLOWED) |
| GURU_STAF | AKSI (ALLOWED) + HAPUS (OWN ONLY) |
| WAKASEK | AKSI (ALLOWED) + HAPUS (OWN ONLY) |

---

# 12. ACCEPTANCE CRITERIA

| AC ID | Description |
|---|---|
| AC-001 | Pengguna dapat mengetikkan komentar pada kolom input teks |
| AC-002 | Pengguna dapat mengirim komentar dengan menekan tombol kirim |
| AC-003 | Komentar baru muncul di daftar komentar tanpa perlu refresh halaman |
| AC-004 | Komentar menampilkan nama penulis, badge role, waktu, dan isi komentar |
| AC-005 | Pengguna hanya dapat menghapus komentar yang ditulis sendiri (kecuali Admin/Kepala) |
| AC-006 | Tombol kirim dinonaktifkan jika kolom komentar kosong |

---

# 13. TRACEABILITY

## Requirement Traceability

| Requirement ID |
|---|
| F-13 |
| BR-18 |

## Information Architecture Traceability

| Page ID |
|---|
| PAGE-005 |
| PAGE-009 |

---

# 14. REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 2026-06-28 | System Analyst AI | Initial Draft |
