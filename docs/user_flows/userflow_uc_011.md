# User Flow Specification

Document Version: v0.1

Use Case ID: UC-011

Use Case Name: Sinkronisasi Realtime Multi-Aktor

Status: Active

Last Updated: 2026-06-28

Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Sistem melakukan sinkronisasi data secara real-time ke seluruh pengguna yang sedang aktif melalui koneksi WebSocket (Socket.io), sehingga setiap perubahan data (surat baru, disposisi baru, perubahan status) langsung terlihat oleh aktor yang berwenang tanpa perlu refresh manual.

## 1.2 Goal

Pengguna ingin selalu melihat data terbaru dari sistem tanpa harus melakukan refresh manual, sehingga kolaborasi antar aktor menjadi lebih efisien dan data yang dilihat selalu akurat.

## 1.3 Requirement References

| Requirement ID | Requirement Name |
|---|---|
| F-11 | Pelacakan posisi terkini surat secara real-time |
| BR-15 | Setiap perubahan data wajib didorong secara realtime via WebSocket |
| NF-08 | Realtime Sync — update ≤ 2 detik |
| NF-09 | Resilience — auto-reconnect saat koneksi terputus |

## 1.4 Primary Actor

Semua Aktor Internal (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek)

## 1.5 Supporting Actors

WebSocket Server (Socket.io), Backend Express.js, Database Neon PostgreSQL

---

# 2. TRIGGER

Pengguna berhasil login dan mendapatkan JWT token aktif (UC-001 selesai).

---

# 3. PRECONDITIONS

| ID | Condition |
|---|---|
| PRE-001 | Pengguna sudah login dan memiliki JWT token aktif |
| PRE-002 | Backend Express.js dan database Neon PostgreSQL aktif sebagai sumber data terpusat |

---

# 4. MAIN FLOW

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna berhasil login | Sistem membuka koneksi WebSocket (Socket.io) menggunakan JWT token untuk autentikasi |
| 2 | | Sistem menempatkan klien ke room sesuai identitas dan role: `user:{idPengguna}`, `role:{peran}` |
| 3 | | Khusus Wakasek: juga bergabung ke room `role:WAKASEK_BIDANG:{bidang}` |
| 4 | | Topbar menampilkan **Connection Status Indicator** berwarna hijau ("Tersinkron") |
| 5 | Aktor lain melakukan aksi (input surat / buat disposisi / update status) | Server memproses perubahan ke database Neon PostgreSQL terlebih dahulu |
| 6 | | Server memancarkan event WebSocket terkait ke room yang berhak menerima |
| 7 | | Klien langsung memperbarui tampilan data **tanpa perlu refresh manual** |
| 8 | | Baris/kartu yang baru berubah diberi efek highlight sesaat |
| 9 | | Jika event `notifikasi:baru`, badge notifikasi di Topbar bertambah otomatis |

---

# 5. ALTERNATIVE FLOW

## AF-001: Dua Aktor Mengubah Data yang Sama

### Condition

Ketika dua aktor mengubah data yang sama secara bersamaan.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Dua aktor mengubah data yang sama | Server menjadi satu-satunya sumber kebenaran (single source of truth) |
| 2 | | Perubahan diproses berurutan sesuai waktu request diterima server |
| 3 | | Klien lain otomatis menerima versi terbaru via event WebSocket |

## AF-002: Pengguna Membuka di Banyak Tab/Device

### Condition

Ketika pengguna membuka sistem di lebih dari satu tab atau device secara bersamaan.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna membuka di tab/device berbeda | Setiap tab/device membentuk koneksi WebSocket sendiri di room `user:{idPengguna}` yang sama |
| 2 | | Seluruh tab/device menerima update yang identik secara realtime |

---

# 6. EXCEPTION FLOW

## EF-001: Koneksi WebSocket Terputus

### Condition

Ketika koneksi WebSocket terputus karena jaringan tidak stabil.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | | Connection Status Indicator berubah menjadi oranye berdenyut ("Menyambungkan ulang...") |
| 2 | | Sistem mencoba reconnect otomatis dengan exponential backoff |

## EF-002: Koneksi WebSocket Gagal dalam Waktu Lama

### Condition

Ketika koneksi WebSocket gagal tersambung dalam waktu lama.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | | Connection Status Indicator berubah merah ("Offline") |
| 2 | | Pengguna tetap dapat membaca data terakhir yang sudah dimuat |
| 3 | | Update baru tidak akan masuk sampai koneksi pulih |

## EF-003: Koneksi WebSocket Berhasil Tersambung Kembali

### Condition

Ketika koneksi WebSocket berhasil tersambung kembali setelah terputus.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | | Sistem otomatis memanggil ulang REST API untuk halaman yang sedang aktif guna menyamakan data (resync) |
| 2 | | Sistem menampilkan toast: "Koneksi tersambung kembali. Data telah diperbarui." |

---

# 7. POSTCONDITIONS

| ID | Condition |
|---|---|
| POST-001 | Seluruh aktor yang berwenang melihat data selalu melihat versi data terbaru dari database terpusat |
| POST-002 | Tidak ada aktor yang bekerja dengan data usang (stale data) lebih dari beberapa detik (≤ 2 detik) |
| POST-003 | Kebutuhan pelacakan posisi surat secara real-time terpenuhi — mirip melacak paket |

---

# 8. BUSINESS RULES

| Rule ID | Description |
|---|---|
| BR-14 | Seluruh aktor mengakses basis data terpusat yang sama (Neon PostgreSQL) — localStorage hanya untuk token sesi |
| BR-15 | Setiap perubahan data wajib didorong (push) secara realtime via WebSocket ke seluruh klien aktor yang berwenang |
| NF-08 | Update data harus diterima klien dalam waktu ≤ 2 detik sejak perubahan terjadi di server |
| NF-09 | Jika koneksi WebSocket terputus, klien harus otomatis mencoba menyambung kembali (auto-reconnect) dan menyinkronkan ulang data terbaru |

---

# 9. RELATED PAGES

| Page ID | Page Name |
|---|---|
| PAGE-002 | Dashboard (`/dashboard`) |
| PAGE-003 | Daftar Surat (`/surat`) |
| PAGE-005 | Detail Surat (`/surat/:id`) |
| PAGE-010 | Disposisi Saya (`/disposisi/saya`) |
| PAGE-006 | Daftar Disposisi (`/disposisi`) |
| PAGE-012 | Notifikasi (`/notifications`) |

---

# 10. DATA USAGE

## 10.1 Data Read

| Entitas | Description |
|---|---|
| All Entities | Data dibaca dari database Neon PostgreSQL sebagai single source of truth |

## 10.2 Data Created

| Entitas | Description |
|---|---|
| Tidak ada | Tidak ada data baru yang dibuat oleh mekanisme sinkronisasi |

## 10.3 Data Updated

| Entitas | Description |
|---|---|
| Tidak ada | Tidak ada data yang diupdate oleh mekanisme sinkronisasi |

## 10.4 Data Deleted

| Entitas | Description |
|---|---|
| Tidak ada | Tidak ada data yang dihapus oleh mekanisme sinkronisasi |

---

# 11. PERMISSIONS

| Role | Access |
|---|---|
| Admin TU | AKSI (ALLOWED) — menerima semua event |
| Kepala Sekolah | AKSI (ALLOWED) — menerima semua event |
| Wakasek | AKSI (ALLOWED) — menerima event sesuai bidang |
| Guru/Staf | AKSI (ALLOWED) — menerima event untuk disposisi pribadi |

---

# 12. ACCEPTANCE CRITERIA

| AC ID | Description |
|---|---|
| AC-001 | Connection Status Indicator menampilkan status koneksi (hijau = tersinkron, oranye = menyambungkan ulang, merah = offline) |
| AC-002 | Perubahan data oleh satu aktor langsung terlihat oleh aktor lain dalam ≤ 2 detik |
| AC-003 | Efek highlight ditampilkan pada baris/kartu yang baru berubah |
| AC-004 | Badge notifikasi di Topbar bertambah otomatis saat ada notifikasi baru |
| AC-005 | Koneksi otomatis reconnect saat terputus, dengan resync data terbaru |
| AC-006 | Pengguna dapat membuka sistem di beberapa tab/device dan menerima update yang sama |

---

# 13. TRACEABILITY

## Requirement Traceability

| Requirement ID |
|---|
| F-11 |
| BR-15 |
| NF-08 |
| NF-09 |

## Information Architecture Traceability

| Page ID |
|---|
| Berlaku global di seluruh halaman ber-autentikasi |

---

# 14. REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 0.1 | 2026-06-28 | System Analyst AI | Initial Draft |
