# User Flow Specification

Document Version: v0.1

Use Case ID: UC-010

Use Case Name: Lihat Dashboard Monitoring

Status: Active

Last Updated: 2026-06-28

Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Pengguna mengakses halaman dashboard untuk melihat ringkasan statistik surat masuk dan posisi terkini surat secara real-time sesuai dengan hak akses role masing-masing.

## 1.2 Goal

Pengguna ingin mendapatkan visibilitas instan terhadap kondisi administrasi surat sekolah — berapa surat yang belum ditindak, sedang dalam proses, sudah selesai, dan di mana posisi surat saat ini — tanpa perlu membuka satu per satu detail surat.

## 1.3 Requirement References

| Requirement ID | Requirement Name |
|---|---|
| F-09 | Dashboard monitoring untuk semua aktor |
| F-11 | Pelacakan posisi terkini surat secara real-time |
| F-16 | Laporan rekapitulasi surat masuk per periode |

## 1.4 Primary Actor

Semua Aktor Internal (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek)

## 1.5 Supporting Actors

Sistem Dashboard, WebSocket (Socket.io)

---

# 2. TRIGGER

Pengguna berhasil login dan diarahkan otomatis ke halaman `/dashboard`, atau menekan menu "Dashboard" pada sidebar.

---

# 3. PRECONDITIONS

| ID | Condition |
|---|---|
| PRE-001 | Pengguna sudah login dengan sesi aktif (UC-001 selesai) |
| PRE-002 | Terdapat data surat masuk di sistem untuk diagregasi |

---

# 4. MAIN FLOW

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna mengakses halaman `/dashboard` | Sistem mengambil data dari API sesuai hak akses aktor |
| 2 | | Sistem menampilkan **kartu ringkasan statistik** |
| 3 | | **Admin TU / Kepala Sekolah**: Total Surat Hari Ini (biru), Belum Selesai (kuning), Overdue (merah), Total Semua (hijau) |
| 4 | | **Wakasek**: Statistik scoped ke bidangnya saja |
| 5 | | **Guru/Staf**: Disposisi Hari Ini (biru), Belum Selesai (kuning), Overdue (merah), Total Disposisi (hijau) — hanya dari surat yang didisposisikan kepadanya |
| 6 | | Sistem menampilkan tabel **"Surat Terbaru"** (atau "Disposisi Terbaru" untuk Guru/Staf) berisi 5 surat terakhir: nomor surat, pengirim, perihal, status (badge), tanggal |
| 7 | Pengguna mengklik link nomor surat pada tabel | Sistem membuka halaman detail `/surat/:id` |
| 8 | Pengguna menekan **"Lihat Semua"** | Sistem membuka halaman `/surat` dengan daftar lengkap |

---

# 5. ALTERNATIVE FLOW

## AF-001: Tidak Ada Data Surat

### Condition

Ketika belum ada data surat masuk sama sekali di sistem.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna mengakses halaman `/dashboard` | Sistem menampilkan kartu statistik dengan nilai 0 |
| 2 | | Tabel menampilkan pesan: "Belum ada surat masuk" |

## AF-002: Guru/Staf Membuka Dashboard

### Condition

Ketika Guru/Staf mengakses dashboard.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Guru/Staf mengakses halaman `/dashboard` | Sistem menampilkan kartu statistik yang dihitung hanya dari surat yang didisposisikan kepadanya |
| 2 | | Tabel menampilkan "Disposisi Terbaru" berisi surat terakhir yang didisposisikan kepadanya |

---

# 6. EXCEPTION FLOW

## EF-001: Data Gagal Dimuat dari Server

### Condition

Ketika terjadi kesalahan server atau koneksi jaringan.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna mengakses halaman `/dashboard` | Sistem menampilkan skeleton loading |
| 2 | | Jika gagal, sistem menampilkan alert error dengan tombol **"Coba Lagi"** |

---

# 7. POSTCONDITIONS

| ID | Condition |
|---|---|
| POST-001 | Pengguna mendapatkan visibilitas terhadap kondisi administrasi surat secara real-time |
| POST-002 | Dashboard memperbarui data secara otomatis melalui WebSocket (`dashboard:refresh` dan `surat:baru`) tanpa perlu refresh manual |

---

# 8. BUSINESS RULES

| Rule ID | Description |
|---|---|
| BR-09 | Laporan rekapitulasi hanya dapat diakses oleh Admin TU dan Kepala Sekolah |
| BR-10 | Wakasek hanya dapat melihat surat yang berhubungan dengan bidangnya |
| BR-11 | Guru/Staf hanya dapat melihat surat yang didisposisikan kepadanya |
| BR-15 | Setiap perubahan data wajib didorong secara realtime via WebSocket |

---

# 9. RELATED PAGES

| Page ID | Page Name |
|---|---|
| PAGE-002 | Dashboard (`/dashboard`) |
| PAGE-003 | Daftar Surat (`/surat`) |
| PAGE-005 | Detail Surat (`/surat/:id`) |

---

# 10. DATA USAGE

## 10.1 Data Read

| Entitas | Description |
|---|---|
| SuratMasuk | Mengambil data surat untuk statistik dan tabel terbaru |
| Disposisi | Mengambil data disposisi untuk Guru/Staf |

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
| Admin TU | AKSI (ALLOWED) — statistik global |
| Kepala Sekolah | AKSI (ALLOWED) — statistik global |
| Wakasek | AKSI (ALLOWED) — statistik per bidang |
| Guru/Staf | AKSI (ALLOWED) — statistik disposisi pribadi |

---

# 12. ACCEPTANCE CRITERIA

| AC ID | Description |
|---|---|
| AC-001 | Pengguna dapat melihat kartu ringkasan statistik sesuai role |
| AC-002 | Admin TU/Kepala Sekolah melihat statistik global (Total Hari Ini, Belum Selesai, Overdue, Total) |
| AC-003 | Wakasek melihat statistik yang scoped ke bidangnya |
| AC-004 | Guru/Staf melihat statistik yang dihitung hanya dari surat yang didisposisikan kepadanya |
| AC-005 | Tabel "Surat Terbaru" menampilkan 5 surat terakhir sesuai hak akses |
| AC-006 | Pengguna dapat mengklik nomor surat untuk membuka detail |
| AC-007 | Data dashboard memperbarui otomatis tanpa refresh manual |

---

# 13. TRACEABILITY

## Requirement Traceability

| Requirement ID |
|---|
| F-09 |
| F-11 |
| F-16 |

## Information Architecture Traceability

| Page ID |
|---|
| PAGE-002 |

---

# 14. REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 0.1 | 2026-06-28 | System Analyst AI | Initial Draft |
