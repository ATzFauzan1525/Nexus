# User Flow Specification

Document Version: v0.1

Use Case ID: UC-012  
Use Case Name: Lacak Surat Publik (Tanpa Login)

Status: Draft  
Last Updated: 2026-06-28  
Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Pengirim surat eksternal melacak posisi dan status surat miliknya secara mandiri melalui halaman publik `/lacak` tanpa perlu login, dengan mengetikkan nomor surat yang diketahui. Hasil pelacakan ditampilkan secara real-time menggunakan mekanisme mirip pelacakan paket.

## 1.2 Goal

Pengirim surat eksternal ingin mengetahui status, posisi, dan alur surat yang dikirimkan ke sekolah secara mandiri tanpa harus menghubungi Admin TU secara langsung.

## 1.3 Requirement References

| Requirement ID | Requirement Name |
|---|---|
| F-12 | Halaman pelacakan publik (`/lacak`) tanpa login |

## 1.4 Primary Actor

Pengirim Surat Eksternal (External Actor, tidak memiliki akun)

## 1.5 Supporting Actors

Sistem Pelacakan Publik, WebSocket (Socket.io)

---

# 2. TRIGGER

Pengirim eksternal membuka URL publik `/lacak` melalui browser (tanpa proses login).

---

# 3. PRECONDITIONS

| ID | Condition |
|---|---|
| PRE-001 | Surat yang ingin dilacak sudah pernah diinput oleh Admin TU ke sistem (UC-002) dan memiliki `nomorSurat` yang sah |
| PRE-002 | Pengirim eksternal mengetahui nomor surat miliknya (biasanya diberikan oleh Admin TU saat surat fisik diserahkan) |
| PRE-003 | Pengirim **tidak perlu** memiliki akun dan **tidak perlu** login |

---

# 4. MAIN FLOW

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengirim eksternal membuka URL `/lacak` | Sistem menampilkan halaman publik berisi Header Publik (logo biru + nama sekolah), Logo SMP Muhammadiyah 9 YK ukuran besar (192px), kotak pencarian nomor surat, dan Footer Publik |
| 2 | Pengirim mengetikkan **nomor surat** pada kolom input | Input diterima |
| 3 | Pengirim menekan tombol **"Cek Status"** | Sistem mengirim request ke endpoint publik (`GET /api/public/lacak?nomorSurat=...`) tanpa token autentikasi |
| 4 | | Server mencari data di tabel `surat_masuk` berdasarkan `nomorSurat` (dengan `TRIM()`) |
| 5 | | Server mengambil: data surat (status, pengirim, perihal, tanggal diterima), timeline dari tabel `status_surat`, posisi saat ini |
| 6 | | Server mengembalikan respons **terbatas**: tanpa file scan, instruksi disposisi, atau nama lengkap orang |
| 7 | | Sistem menampilkan: **Nomor Surat** + badge status besar, info (Pengirim, Perihal, Tanggal Diterima), **Indikator "Live"** dengan titik hijau berdenyut, **Posisi Saat Ini** |
| 8 | | Sistem menampilkan **Alur Surat** (stepper visual horizontal): 4 langkah (Diterima → Didisposisi → Diproses → Selesai) |
| 9 | | Langkah sudah dicapai: lingkaran berwarna + nama role + tanggal |
| 10 | | Langkah belum dicapai: lingkaran abu-abu + teks "Belum" |
| 11 | | Klien bergabung ke room WebSocket publik `lacak:{nomorSurat}` agar hasil pelacakan **otomatis ter-update secara realtime** |

---

# 5. ALTERNATIVE FLOWS

## AF-001: Nomor Surat Kosong

### Condition

Ketika pengirim menekan tombol "Cek Status" tanpa mengisi nomor surat.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengirim menekan tombol "Cek Status" | Sistem menampilkan validasi: "Masukkan nomor surat terlebih dahulu." |
| 2 | | Request tidak dikirim ke server |

## AF-002: Status Surat Berubah Saat Halaman Terbuka

### Condition

Ketika status surat berubah SAAT halaman `/lacak` masih terbuka.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | | Server memancarkan event `lacak:update` ke room `lacak:{nomorSurat}` |
| 2 | | Badge status, posisi, dan alur surat pada klien otomatis memperbarui tanpa perlu refresh |

---

# 6. EXCEPTION FLOWS

## EF-001: Nomor Surat Tidak Ditemukan

### Condition

Ketika nomor surat yang dimasukkan tidak ditemukan di database.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengirim menekan tombol "Cek Status" | Sistem menampilkan Not Found State: "Nomor surat tidak ditemukan. Pastikan nomor surat sudah benar." |

## EF-002: Rate Limit Terlampaui

### Condition

Ketika pengirim melakukan banyak percobaan pencarian berturut-turut.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengirim melakukan banyak percobaan | Server menerapkan rate-limit per IP |
| 2 | | Jika melebihi batas, sistem menampilkan: "Terlalu banyak percobaan. Silakan coba lagi beberapa saat lagi." |

## EF-003: Pengirim Mencoba Akses Halaman Internal

### Condition

Ketika pengirim mencoba mengakses `/surat/:id` langsung.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengirim mengakses `/surat/:id` | Sistem menolak akses dan mengarahkan ke `/login` |

---

# 7. POSTCONDITIONS

| ID | Condition |
|---|---|
| POST-001 | Pengirim eksternal mengetahui status, posisi, dan alur surat miliknya secara mandiri dan realtime |
| POST-002 | Tidak ada data sensitif sekolah (file scan, instruksi internal, nama staf) yang terekspos ke pihak eksternal |
| POST-003 | Nama yang ditampilkan adalah **role** (Kepala Sekolah, Admin TU, Guru/Staf, Wakasek), bukan nama orang |

---

# 8. BUSINESS RULES

| Rule ID | Description |
|---|---|
| BR-16 | Pelacakan publik (`/lacak`) hanya menampilkan: status surat, posisi/unit yang sedang menangani, alur surat (timeline), dan nama role (bukan nama orang). Tidak menampilkan: file scan, instruksi disposisi, nama lengkap penerima, catatan tindak lanjut |
| BR-17 | Endpoint pelacakan publik tidak memerlukan JWT/login, tetapi harus di-rate-limit per IP untuk mencegah penyalahgunaan (brute-force menebak nomor surat) |
| BR-21 | Input nomor surat akan di-trim spasi di depan dan belakang sebelum disimpan untuk mencegah masalah pencarian |

---

# 9. RELATED PAGES

| Page ID | Page Name |
|---|---|
| PAGE-LACAK | Lacak Surat Publik (`/lacak`) |

---

# 10. DATA USAGE

## 10.1 Data Read

| Entity | Description |
|---|---|
| SuratMasuk | Mengambil data surat (status, pengirim, perihal, tanggal diterima) — tanpa file scan |
| StatusSurat | Mengambil timeline perubahan status untuk ditampilkan sebagai stepper |

## 10.2 Data Created

| Entity | Description |
|---|---|
| None | Tidak ada data baru yang dibuat |

## 10.3 Data Updated

| Entity | Description |
|---|---|
| None | Tidak ada data yang diupdate |

## 10.4 Data Deleted

| Entity | Description |
|---|---|
| None | Tidak ada data yang dihapus |

---

# 11. PERMISSIONS

| Role | Access |
|---|---|
| Pengirim Surat Eksternal | AKSI (ALLOWED) — akses publik read-only, tidak perlu login |

---

# 12. ACCEPTANCE CRITERIA

| AC ID | Description |
|---|---|
| AC-001 | Pengirim dapat membuka halaman `/lacak` tanpa login |
| AC-002 | Pengirim dapat memasukkan nomor surat dan menekan tombol "Cek Status" |
| AC-003 | Sistem menampilkan badge status, info surat, dan indikator "Live" |
| AC-004 | Sistem menampilkan Alur Surat (stepper visual) dengan 4 langkah |
| AC-005 | Data yang ditampilkan terbatas — tidak ada file scan, instruksi, atau nama orang |
| AC-006 | Nama yang ditampilkan adalah role, bukan nama orang |
| AC-007 | Hasil pelacakan otomatis ter-update secara realtime jika status berubah |
| AC-008 | Rate limit diterapkan untuk mencegah penyalahgunaan |

---

# 13. TRACEABILITY

## Requirement Traceability

| Requirement ID |
|---|
| F-12 |
| BR-16 |
| BR-17 |

## Information Architecture Traceability

| Page ID |
|---|
| PAGE-LACAK |

---

# 15. REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 0.1 | 2026-06-28 | System Analyst AI | Initial Draft |
