# User Flow Specification

Document Version: v1.0

Use Case ID: UC-016

Use Case Name: Lihat Posisi Surat (Live Table)

Status: Active

Last Updated: 2026-06-28

Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Admin TU, Kepala Sekolah, dan Wakasek melihat tabel posisi terkini semua surat secara real-time.

## 1.2 Goal

Admin TU, Kepala Sekolah, dan Wakasek ingin memantau posisi surat secara realtime tanpa perlu refresh halaman.

## 1.3 Requirement References

| Requirement ID | Requirement Name |
|---|---|
| F-11 | Pelacakan posisi terkini surat secara real-time |
| F-16 | Posisi Surat Live Table |
| BR-15 | Perubahan data wajib didorong secara realtime via WebSocket |

## 1.4 Primary Actor

Admin TU, Kepala Sekolah, Wakasek

## 1.5 Supporting Actors

Sistem Autentikasi, Database, WebSocket

---

# 2. TRIGGER

Pengguna membuka halaman Dashboard (`/dashboard`).

---

# 3. PRECONDITIONS

| ID | Condition |
|---|---|
| PRE-001 | Pengguna sudah login dengan role `ADMIN_TU`, `KEPALA_SEKOLAH`, atau `WAKASEK` |
| PRE-002 | Terdapat data surat masuk di database |
| PRE-003 | Koneksi WebSocket aktif |

---

# 4. MAIN FLOW

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna membuka halaman Dashboard | Sistem menampilkan kartu statistik di atas |
| 2 | - | Sistem menampilkan tabel **Posisi Surat** di bawah statistik |
| 3 | - | Tabel menampilkan: Nomor Surat, Pengirim, Perihal, Status (badge), Posisi Saat Ini |
| 4 | - | Status badge warna mengikuti definisi warna status surat |
| 5 | Pengguna memfilter tabel (Semua, Diterima, Didisposisi, Diproses, Selesai) | Sistem memfilter data sesuai pilihan |
| 6 | - | Wakasek hanya melihat surat yang didisposisikan ke bidangnya |
| 7 | - | Admin TU dan Kepala melihat semua surat |

---

# 5. ALTERNATIVE FLOW

## AF-001: Filter Status

### Condition

Ketika pengguna ingin melihat surat dengan status tertentu.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna memilih filter status (Diterima/Didisposisi/Diproses/Selesai) | Sistem menampilkan hanya surat dengan status yang dipilih |

---

## AF-002: Klik Baris Tabel

### Condition

Ketika pengguna ingin melihat detail surat tertentu.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna mengklik baris surat | Sistem navigasi ke halaman Detail Surat (`/surat/:id`) |

---

# 6. EXCEPTION FLOW

## EF-001: Koneksi WebSocket Terputus

### Condition

Ketika koneksi WebSocket terputus.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | - | Indikator "Offline" muncul di Topbar |
| 2 | - | Tabel menampilkan data terakhir yang diketahui |

---

## EF-002: Koneksi Kembali

### Condition

Ketika koneksi WebSocket tersambung kembali.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | - | Indikator berubah "Tersinkron" |
| 2 | - | Data di tabel disinkronkan ulang secara otomatis |
| 3 | - | Toast muncul: "Koneksi tersambung kembali. Data telah diperbarui." |

---

## EF-003: Token Expired

### Condition

Ketika session token pengguna sudah expired.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna membuka Dashboard | Sistem mendeteksi token expired |
| 2 | - | Sistem mengarahkan ke halaman login (`/login`) |

---

# 7. POSTCONDITIONS

| ID | Condition |
|---|---|
| POST-001 | Pengguna dapat melihat posisi terkini semua surat secara real-time tanpa perlu refresh halaman |
| POST-002 | Data posisi surat selalu sinkron dengan status terbaru di database |

---

# 8. BUSINESS RULES

| Rule ID | Description |
|---|---|
| BR-10 | Wakasek hanya dapat melihat surat yang berhubungan dengan bidangnya |
| BR-11 | Guru/Staf hanya dapat melihat surat yang didisposisikan kepadanya |
| BR-15 | Setiap perubahan data wajib didorong secara realtime via WebSocket |
| NF-08 | Update harus diterima klien dalam waktu ≤ 2 detik |
| NF-09 | Auto-reconnect dengan resync saat koneksi pulih |

---

# 9. RELATED PAGES

| Page ID | Page Name | Route |
|---|---|---|
| PAGE-002 | Dashboard | `/dashboard` |
| PAGE-005 | Detail Surat | `/surat/:id` |

---

# 10. DATA USAGE

## 10.1 Data Read

| Entitas | Description |
|---|---|
| Surat Masuk | Mengambil data posisi surat |
| Disposisi | Mengambil data penerima disposisi untuk posisi |

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
| ADMIN_TU | AKSI (ALLOWED) - Semua surat |
| KEPALA_SEKOLAH | AKSI (ALLOWED) - Semua surat |
| WAKASEK | AKSI (ALLOWED) - Surat bidang sendiri |
| GURU_STAF | TIDAK DIIZINKAN |

---

# 12. ACCEPTANCE CRITERIA

| AC ID | Description |
|---|---|
| AC-001 | Tabel menampilkan Nomor Surat, Pengirim, Perihal, Status, Posisi Saat Ini |
| AC-002 | Status badge memiliki warna sesuai definisi |
| AC-003 | Filter status berfungsi dengan benar |
| AC-004 | Wakasek hanya melihat surat yang didisposisikan ke bidangnya |
| AC-005 | Data diperbarui secara real-time tanpa refresh halaman |
| AC-006 | Baris yang diperbarui memiliki highlight kuning selama 2 detik |
| AC-007 | Indikator koneksi WebSocket menampilkan status yang benar |

---

# 13. TRACEABILITY

## Requirement Traceability

| Requirement ID |
|---|
| F-11 |
| F-16 |
| BR-10 |
| BR-11 |
| BR-15 |
| NF-08 |
| NF-09 |

## Information Architecture Traceability

| Page ID |
|---|
| PAGE-002 |
| PAGE-005 |

---

# 14. REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 2026-06-28 | System Analyst AI | Initial Draft |
