# User Flows Index

Document Version: v1.0

Project: SiDis — Sistem Informasi Disposisi dan Pelacakan Surat Digital

Product: Web-Based Letter Disposition & Tracking System

Status: Validated / Active

Last Updated: 2026-07-16

Author: System Analyst AI

## 1. PURPOSE

Dokumen ini berfungsi sebagai indeks utama untuk seluruh Spesifikasi Alur Pengguna.

Setiap Alur Pengguna dikelola dalam dokumen terpisah.

## 2. FILE STRUCTURE

```text
user_flows/
├── index.md
├── userflow_uc_001.md
├── userflow_uc_002.md
├── userflow_uc_003.md
├── userflow_uc_004.md
├── userflow_uc_005.md
├── userflow_uc_006.md
├── userflow_uc_007.md
├── userflow_uc_008.md
├── userflow_uc_009.md
├── userflow_uc_010.md
├── userflow_uc_011.md
├── userflow_uc_012.md
├── userflow_uc_013.md
├── userflow_uc_014.md
├── userflow_uc_015.md
└── userflow_uc_016.md
```

## 3. USER FLOW CATALOG

| Use Case ID | Use Case Name | Aktor Utama | File Detail | Status |
|---|---|---|---|---|
| UC-001 | Login Pengguna | Semua Aktor | ./userflow_uc_001.md | Draf |
| UC-002 | Input Surat Masuk | Admin TU | ./userflow_uc_002.md | Draf |
| UC-003 | Buat Disposisi Digital | Kepala Sekolah | ./userflow_uc_003.md | Draf |
| UC-004 | Update Status Surat | Guru/Staf (5 bidang) | ./userflow_uc_004.md | Draf |
| UC-005 | Terima & Lihat Notifikasi | Semua Aktor | ./userflow_uc_005.md | Draf |
| UC-006 | Cari & Filter Surat | Semua Aktor | ./userflow_uc_006.md | Draf |
| UC-007 | Lihat Timeline Surat | Semua Aktor Internal | ./userflow_uc_007.md | Draf |
| UC-008 | Unduh Laporan PDF | Admin TU | ./userflow_uc_008.md | Draf |
| UC-009 | Kelola Akun Pengguna | Admin TU | ./userflow_uc_009.md | Draf |
| UC-010 | Lihat Dashboard Monitoring | Semua Aktor | ./userflow_uc_010.md | Draf |
| UC-011 | Sinkronisasi Realtime Multi-Aktor | Semua Aktor | ./userflow_uc_011.md | Draf |
| UC-012 | Lacak Surat Publik (Tanpa Login) | Pengirim Eksternal | ./userflow_uc_012.md | Draf |
| UC-013 | Tambah Komentar pada Surat | Semua Aktor Internal | ./userflow_uc_013.md | Draf |
| UC-014 | Lihat Audit Log | Admin TU, Kepala Sekolah | ./userflow_uc_014.md | Draf |
| UC-015 | Unduh File Scan Surat | Semua Aktor Internal | ./userflow_uc_015.md | Draf |
| UC-016 | Lihat Posisi Surat (Live Table) | Admin TU, Kepala Sekolah, Wakasek | ./userflow_uc_016.md | Draf |

---

## 4. REQUIREMENT → USER FLOW MAPPING

| Feature ID | Feature Name | Use Case |
|---|---|---|
| F001 | Autentikasi & Otorisasi Pengguna | UC-001 |
| F002 | Pencatatan Surat Masuk | UC-002 |
| F003 | Manajemen Disposisi Digital | UC-003 |
| F004 | Pelacakan Status Surat | UC-004 |
| F005 | Sistem Notifikasi Realtime | UC-005 |
| F006 | Pencarian & Filter Surat | UC-006 |
| F007 | Timeline Riwayat Surat | UC-007 |
| F008 | Ekspor Laporan PDF | UC-008 |
| F009 | Manajemen Akun Pengguna | UC-009 |
| F010 | Dashboard Monitoring | UC-010 |
| F011 | Sinkronisasi Multi-Aktor | UC-011 |
| F012 | Pelacakan Surat Publik | UC-012 |
| F013 | Komentar pada Surat | UC-013 |
| F014 | Audit Log | UC-014 |
| F015 | Unduh File Scan | UC-015 |
| F016 | Posisi Surat Live | UC-016 |

---

## 5. PAGE → USER FLOW MAPPING

| Page ID | Page Name | Use Case |
|---|---|---|
| HAL-001 | Login | UC-001 |
| HAL-002 | Dashboard Utama | UC-010 |
| HAL-003 | Form Input Surat Masuk | UC-002 |
| HAL-004 | Form Buat Disposisi | UC-003 |
| HAL-005 | Daftar Surat / Inbox | UC-004, UC-006, UC-016 |
| HAL-006 | Detail Surat & Timeline | UC-007, UC-013, UC-015 |
| HAL-007 | Form Update Status Surat | UC-004 |
| HAL-008 | Laporan PDF | UC-008 |
| HAL-009 | Manajemen Akun | UC-009 |
| HAL-010 | Pelacakan Publik | UC-012 |
| HAL-011 | Audit Log | UC-014 |
| HAL-012 | Panel Notifikasi | UC-005 |

---

## 6. USER FLOW DEPENDENCIES

| Use Case | Depends On |
|---|---|
| UC-001 | Tidak ada |
| UC-002 | UC-001 |
| UC-003 | UC-001, UC-002 |
| UC-004 | UC-001, UC-003 |
| UC-005 | UC-001 |
| UC-006 | UC-001 |
| UC-007 | UC-001, UC-002 |
| UC-008 | UC-001, UC-002 |
| UC-009 | UC-001 |
| UC-010 | UC-001 |
| UC-011 | UC-001 |
| UC-012 | Tidak ada |
| UC-013 | UC-001, UC-002 |
| UC-014 | UC-001 |
| UC-015 | UC-001, UC-002 |
| UC-016 | UC-001, UC-002 |

---

## 7. REVISION HISTORY

| Versi | Tanggal | Penulis | Description |
|---|---|---|---|
| 0.1 | 2026-07-16 | System Analyst AI | Draf Awal |
