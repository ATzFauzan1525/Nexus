# User Flow Specification

Document Version: v1.0

Use Case ID: UC-014

Use Case Name: Lihat Audit Log

Status: Active

Last Updated: 2026-06-28

Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Admin TU dan Kepala Sekolah melihat daftar pencatatan otomatis semua perubahan data di sistem.

## 1.2 Goal

Admin TU dan Kepala Sekolah ingin melacak semua perubahan data (siapa, kapan, ubah apa) secara transparan.

## 1.3 Requirement References

| Requirement ID | Requirement Name |
|---|---|
| F-15 | Audit Log: pencatatan otomatis semua perubahan |

## 1.4 Primary Actor

Admin TU, Kepala Sekolah

## 1.5 Supporting Actors

Sistem Autentikasi, Database

---

# 2. TRIGGER

Admin TU atau Kepala Sekolah mengklik menu **"Audit Log"** di sidebar.

---

# 3. PRECONDITIONS

| ID | Condition |
|---|---|
| PRE-001 | Pengguna sudah login dengan role `ADMIN_TU` atau `KEPALA_SEKOLAH` |
| PRE-002 | Terdapat data audit log di database |

---

# 4. MAIN FLOW

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin TU/Kepala membuka menu "Audit Log" di sidebar | Sistem menampilkan halaman `/audit-log` |
| 2 | - | Tabel menampilkan: Waktu, Nama User, Role, Aksi (badge warna), Entitas, Detail |
| 3 | Admin TU/Kepala memfilter berdasarkan **Aksi** (Semua, CREATE, UPDATE_STATUS, DELETE) | Sistem memfilter data sesuai pilihan |
| 4 | Admin TU/Kepala memfilter berdasarkan **Entitas** (Semua, surat_masuk, disposisi, pengguna) | Sistem memfilter data sesuai pilihan |
| 5 | - | Sistem mengirim request `GET /api/audit-log` dengan query parameter filter |
| 6 | - | Server mengembalikan data audit log yang sudah difilter, diurutkan dari yang terbaru |
| 7 | - | Sistem menampilkan hasil filter dalam tabel dengan badge warna per aksi |

---

# 5. ALTERNATIVE FLOW

## AF-001: Filter Aksi

### Condition

Ketika Admin TU/Kepala ingin melihat log berdasarkan jenis aksi tertentu.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin TU/Kepala memilih filter aksi (CREATE/UPDATE_STATUS/DELETE) | Sistem menampilkan hanya log dengan aksi yang dipilih |
| 2 | - | Badge warna: CREATE = hijau, UPDATE_STATUS = kuning, DELETE = merah |

---

## AF-002: Filter Entitas

### Condition

Ketika Admin TU/Kepala ingin melihat log berdasarkan tabel tertentu.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin TU/Kepala memilih filter entitas (surat_masuk/disposisi/pengguna) | Sistem menampilkan hanya log untuk entitas yang dipilih |

---

# 6. EXCEPTION FLOW

## EF-001: Token Expired

### Condition

Ketika session token pengguna sudah expired.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin TU/Kepala membuka halaman Audit Log | Sistem mendeteksi token expired |
| 2 | - | Sistem mengarahkan ke halaman login (`/login`) |

---

## EF-002: Tidak Ada Data

### Condition

Ketika tidak ada data audit log yang cocok dengan filter.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin TU/Kepala menerapkan filter | Sistem menampilkan Empty State: "Belum ada catatan audit." |

---

## EF-003: Role Tidak Diizinkan

### Condition

Ketika pengguna dengan role selain Admin TU atau Kepala Sekolah mencoba mengakses halaman.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna mengakses `/audit-log` | Sistem menampilkan halaman 403 Forbidden |

---

# 7. POSTCONDITIONS

| ID | Condition |
|---|---|
| POST-001 | Admin TU dan Kepala dapat melacak semua perubahan data di sistem |
| POST-002 | Log mencakup: pembuatan surat, pembuatan disposisi, update status surat |

---

# 8. BUSINESS RULES

| Rule ID | Description |
|---|---|
| BR-19 | Audit Log hanya dapat dilihat oleh Admin TU dan Kepala Sekolah |

---

# 9. RELATED PAGES

| Page ID | Page Name | Route |
|---|---|---|
| PAGE-014 | Audit Log | `/audit-log` |

---

# 10. DATA USAGE

## 10.1 Data Read

| Entitas | Description |
|---|---|
| Audit Log | Menampilkan daftar pencatatan perubahan |
| Pengguna | Menampilkan nama dan role user yang melakukan aksi |

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
| GURU_STAF | TIDAK DIIZINKAN |
| WAKASEK | TIDAK DIIZINKAN |

---

# 12. ACCEPTANCE CRITERIA

| AC ID | Description |
|---|---|
| AC-001 | Admin TU/Kepala dapat melihat daftar audit log |
| AC-002 | Admin TU/Kepala dapat memfilter berdasarkan aksi (CREATE/UPDATE_STATUS/DELETE) |
| AC-003 | Admin TU/Kepala dapat memfilter berdasarkan entitas (surat_masuk/disposisi/pengguna) |
| AC-004 | Tabel menampilkan badge warna: CREATE = hijau, UPDATE_STATUS = kuning, DELETE = merah |
| AC-005 | Data diurutkan dari yang terbaru |
| AC-006 | Pengguna dengan role lain tidak dapat mengakses halaman ini |

---

# 13. TRACEABILITY

## Requirement Traceability

| Requirement ID |
|---|
| F-15 |
| BR-19 |

## Information Architecture Traceability

| Page ID |
|---|
| PAGE-014 |

---

# 14. REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 2026-06-28 | System Analyst AI | Initial Draft |
