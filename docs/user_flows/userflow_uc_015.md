# User Flow Specification

Document Version: v1.0

Use Case ID: UC-015

Use Case Name: Download File Scan Surat

Status: Active

Last Updated: 2026-06-28

Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Pengguna internal mengunduh file scan surat yang tersimpan di database sebagai BYTEA.

## 1.2 Goal

Pengguna ingin melihat atau mengunduh file scan asli surat untuk keperluan referensi atau pencetakan.

## 1.3 Requirement References

| Requirement ID | Requirement Name |
|---|---|
| F-03 | Input surat masuk beserta metadata dan unggah file scan |
| BR-20 | File scan disimpan sebagai BYTEA di database Neon |

## 1.4 Primary Actor

Semua Aktor Internal (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek)

## 1.5 Supporting Actors

Sistem Autentikasi, Database

---

# 2. TRIGGER

Pengguna menekan tombol **"Download File"** atau **"Lihat File"** pada halaman detail surat.

---

# 3. PRECONDITIONS

| ID | Condition |
|---|---|
| PRE-001 | Pengguna sudah login dengan role apapun |
| PRE-002 | Surat memiliki file scan yang tersimpan sebagai `file_data` (BYTEA) dan `file_mime` di tabel `surat_masuk` |

---

# 4. MAIN FLOW

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna membuka halaman detail surat atau detail disposisi | Sistem menampilkan tombol "Download File" atau "Lihat File" |
| 2 | Pengguna menekan tombol download/view file | Sistem mengirim request `GET /api/surat/:id/download` dengan header Authorization (JWT) |
| 3 | - | Server mengambil `file_data` dan `file_mime` dari tabel `surat_masuk` |
| 4 | - | Server mengembalikan file binary dengan header `Content-Type: {file_mime}` |
| 5 | - | Frontend menggunakan `fetch()` + `response.blob()` + `URL.createObjectURL()` |
| 6 | - | File dibuka di tab baru atau diunduh |
| 7 | - | Object URL dibersihkan dari memory |

---

# 5. ALTERNATIVE FLOW

## AF-001: Lihat File (Preview)

### Condition

Ketika pengguna ingin melihat file scan tanpa mengunduh.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna menekan tombol "Lihat File" | Sistem membuka file di tab baru menggunakan `window.open(blobURL)` |

---

## AF-002: Download File

### Condition

Ketika pengguna ingin mengunduh file scan ke perangkat.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna menekan tombol "Download File" | Sistem membuat anchor element dengan `download` attribute |
| 2 | - | File diunduh ke perangkat pengguna |

---

# 6. EXCEPTION FLOW

## EF-001: Surat Tidak Memiliki File

### Condition

Ketika surat tidak memiliki file scan yang tersimpan.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna membuka detail surat | Tombol download tidak ditampilkan |

---

## EF-002: Token Expired

### Condition

Ketika session token pengguna sudah expired.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna menekan tombol download | Sistem mendeteksi token expired |
| 2 | - | Sistem mengarahkan ke halaman login (`/login`) |

---

## EF-003: Server Error

### Condition

Ketika server mengalami error saat mengambil file.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna menekan tombol download | Server mengembalikan error 500 |
| 2 | - | Sistem menampilkan toast error: "Gagal mengunduh file." |

---

# 7. POSTCONDITIONS

| ID | Condition |
|---|---|
| POST-001 | File scan surat berhasil dibuka atau diunduh ke perangkat pengguna |
| POST-002 | Akses file hanya dapat dilakukan oleh pengguna yang sudah login dengan token JWT yang valid |

---

# 8. BUSINESS RULES

| Rule ID | Description |
|---|---|
| BR-12 | File scan hanya boleh berformat PDF atau gambar (JPG/PNG). Maksimal 10MB |
| BR-20 | File scan disimpan sebagai BYTEA di database Neon, diunduh melalui endpoint dengan autentikasi JWT |

---

# 9. RELATED PAGES

| Page ID | Page Name | Route |
|---|---|---|
| PAGE-005 | Detail Surat | `/surat/:id` |
| PAGE-009 | Detail Disposisi | `/disposisi/:id` |
| PAGE-008 | Buat Disposisi | `/disposisi/buat/:idSurat` |

---

# 10. DATA USAGE

## 10.1 Data Read

| Entitas | Description |
|---|---|
| Surat Masuk | Mengambil `file_data` (BYTEA) dan `file_mime` |

## 10.2 Data Created

| Entitas | Description |
|---|---|
| Tidak ada | Tidak ada data yang dibuat |

## 10.3 Data Updated

| Entitas | Description |
|---|---|
| Tidak ada | Tidak ada data yang diupdate |

## 10.4 Data Deleted

| Entitas | Description |
|---|---|
| Tidak ada | Tidak ada data yang dihapus |

---

# 11. PERMISSIONS

| Role | Access |
|---|---|
| ADMIN_TU | AKSI (ALLOWED) |
| KEPALA_SEKOLAH | AKSI (ALLOWED) |
| GURU_STAF | AKSI (ALLOWED) |
| WAKASEK | AKSI (ALLOWED) |

---

# 12. ACCEPTANCE CRITERIA

| AC ID | Description |
|---|---|
| AC-001 | Tombol "Download File" atau "Lihat File" ditampilkan jika surat memiliki file scan |
| AC-002 | Tombol tidak ditampilkan jika surat tidak memiliki file scan |
| AC-003 | File berhasil dibuka di tab baru atau diunduh ke perangkat |
| AC-004 | Akses file memerlukan token JWT yang valid |
| AC-005 | File dikembalikan dengan Content-Type yang sesuai (application/pdf, image/jpeg, image/png) |

---

# 13. TRACEABILITY

## Requirement Traceability

| Requirement ID |
|---|
| F-03 |
| BR-12 |
| BR-20 |

## Information Architecture Traceability

| Page ID |
|---|
| PAGE-005 |
| PAGE-009 |
| PAGE-008 |

---

# 14. REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 2026-06-28 | System Analyst AI | Initial Draft |
