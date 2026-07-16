# Information Architecture (IA) - Source of Truth #2

Document Version: v1.0

Project: SiDis — Sistem Informasi Disposisi dan Pelacakan Surat Digital

Product: Web-Based Letter Disposition & Tracking System

Status: Validated / Active

Last Updated: 2026-07-16

Author: System Analyst AI

---

## 1. DOCUMENT OVERVIEW

### 1.1 Purpose

Dokumen ini mendefinisikan Arsitektur Informasi (IA) dari SiDis (Sistem Informasi Disposisi dan Pelacakan Surat Digital). IA ini berfungsi sebagai Source of Truth #2 (SoT-2) yang diturunkan secara langsung dari SoT-1 (SRS v1.0).

Dokumen ini digunakan sebagai landasan mutlak untuk:

- Merancang High-Fidelity Prototype (SoT-5).
- Menentukan struktur halaman pada implementasi Frontend.
- Membangun navigasi antarmuka yang konsisten dan responsif.
- Menentukan struktur routing pada aplikasi web (URL mapping).
- Memetakan relasi antar-layar dan aliran informasi yang efisien untuk seluruh aktor.
- Mendefinisikan WebSocket Event Channels untuk sinkronisasi real-time.

### 1.2 Related Sources of Truth

| Artifact | Reference | Description |
|---|---|---|
| SoT-1 | SRS v1.0 | Spesifikasi Kebutuhan Perangkat Lunak dasar. |
| SoT-3 | Design System | Panduan token visual, warna, tipografi, dan komponen UI. |
| SoT-4 | User Flows | Detail langkah operasional per use-case. |
| SoT-5 | System Logic | API contracts dan sequence diagrams. |

---

## 2. PRODUCT STRUCTURE

### 2.1 Product Modules

| Module ID | Module Name | Description |
|---|---|---|
| M001 | Authentication | Mengatur keamanan akses masuk dan keluar sistem untuk seluruh aktor internal. |
| M002 | Surat Masuk | Modul input, pencarian, dan manajemen surat masuk beserta file scan. |
| M003 | Disposisi Digital | Modul pembuatan dan manajemen disposisi oleh Kepala Sekolah. |
| M004 | Update Status | Modul perubahan status surat oleh Guru/Staf (Tindak Lanjut & Selesai). |
| M005 | Dashboard Monitoring | Modul dashboard statistik dan Posisi Surat live table. |
| M006 | Laporan & Audit | Modul laporan rekapitulasi, export PDF, dan audit log. |
| M007 | Manajemen Pengguna | Modul CRUD akun pengguna oleh Admin TU. |
| M008 | Pelacakan Publik | Modul pelacakan surat tanpa login oleh pengirim eksternal. |

### 2.2 Module Hierarchy

```
SiDis (Root)
├── M001: Authentication
│   └── Halaman Login
├── M002: Surat Masuk
│   ├── Daftar Surat (Tabel + Pencarian)
│   ├── Input Surat Baru (Form + Upload File)
│   └── Detail Surat (Timeline + Disposisi + Komentar)
├── M003: Disposisi Digital
│   ├── Daftar Disposisi (Belum Didisposisi)
│   ├── Riwayat Disposisi
│   ├── Buat Disposisi (Form)
│   ├── Disposisi Bidang (Wakasek)
│   ├── Disposisi Saya (Guru/Staf)
│   └── Detail Disposisi (Update Status + Komentar)
├── M004: Update Status
│   └── Detail Disposisi (Tombol Tindak Lanjut / Selesai)
├── M005: Dashboard Monitoring
│   ├── Statistik Global
│   └── Posisi Surat (Live Table)
├── M006: Laporan & Audit
│   ├── Laporan Rekapitulasi
│   ├── Export PDF
│   └── Audit Log
├── M007: Manajemen Pengguna
│   ├── Daftar Pengguna
│   ├── Tambah Pengguna
│   └── Edit Pengguna
├── M008: Pelacakan Publik
│   └── Halaman Lacak (Tanpa Login)
└── Notifikasi
    ├── Dropdown Notifikasi (Topbar)
    └── Halaman Notifikasi
```

---

## 3. SITE MAP

### 3.1 Navigation Tree

- **PAGE-001:** Login (Tanpa Sidebar - Akses Publik / Unauthenticated)
- **PAGE-002:** Dashboard (Halaman Utama setelah Login)
- **PAGE-003:** Daftar Surat
- **PAGE-004:** Input Surat Baru
- **PAGE-005:** Detail Surat
- **PAGE-006:** Disposisi (Kepala Sekolah)
- **PAGE-007:** Riwayat Disposisi
- **PAGE-008:** Buat Disposisi
- **PAGE-009:** Detail Disposisi
- **PAGE-010:** Disposisi Saya (Guru/Staf)
- **PAGE-011:** Disposisi Bidang (Wakasek)
- **PAGE-012:** Notifikasi
- **PAGE-013:** Laporan
- **PAGE-014:** Audit Log
- **PAGE-015:** Manajemen Pengguna
- **PAGE-016:** Tambah Pengguna
- **PAGE-017:** Edit Pengguna
- **PAGE-018:** Lacak Surat (Publik)

### 3.2 Navigation Type

| Navigation | Type | Behavior |
|---|---|---|
| Main Menu | Sidebar Navigation | Berada permanen di sisi kiri layar pada resolusi Desktop/Tablet. Dapat diciutkan (collapsible) untuk memaksimalkan area kerja. Disesuaikan berdasarkan role pengguna. |
| User Menu | Top-Right Dropdown | Berisi informasi akun pengguna aktif dan tombol "Keluar" (Logout). |
| Notifikasi | Top-Right Bell Icon | Ikon lonceng dengan badge angka merah jika ada notif belum dibaca. Klik membuka dropdown daftar 5 notif terbaru. |
| Mobile/Tablet Navigation | Top Hamburger Menu | Sidebar akan disembunyikan dan diakses via tombol hamburger jika lebar layar menyusut di bawah 768px. |
| Breadcrumb | Disabled | Tidak diaktifkan karena struktur menu sangat dangkal (maksimal 1 tingkat sub-halaman). |

### 3.3 Navigasi Sidebar per Role

**Admin TU:**
```
📊 Dashboard
📬 Surat Masuk
  └─ Daftar Surat
  └─ Input Surat Baru
📋 Laporan
📜 Audit Log
👤 Manajemen Pengguna
```

**Kepala Sekolah:**
```
📊 Dashboard
📬 Surat Masuk
  └─ Daftar Surat
📤 Disposisi
  └─ Disposisi
  └─ Riwayat Disposisi
📜 Audit Log
```

**Guru / Staf:**
```
📊 Dashboard
📥 Disposisi Saya
```

**Wakil Kepala Sekolah:**
```
📊 Dashboard
📬 Surat Masuk (Bidang Saya)
📤 Disposisi Bidang
```

---

## 4. PAGE INVENTORY

| Page ID | Page Name | Module | Access Role | URL Path |
|---|---|---|---|---|
| PAGE-001 | Login | M001 | Publik | `/login` |
| PAGE-002 | Dashboard | M005 | Semua role | `/dashboard` |
| PAGE-003 | Daftar Surat | M002 | Admin TU, Kepala, Guru, Wakasek | `/surat` |
| PAGE-004 | Input Surat Baru | M002 | Admin TU | `/surat/tambah` |
| PAGE-005 | Detail Surat | M002 | Semua role | `/surat/:id` |
| PAGE-006 | Disposisi | M003 | Kepala Sekolah | `/disposisi` |
| PAGE-007 | Riwayat Disposisi | M003 | Kepala Sekolah | `/disposisi/riwayat` |
| PAGE-008 | Buat Disposisi | M003 | Kepala Sekolah | `/disposisi/buat/:idSurat` |
| PAGE-009 | Detail Disposisi | M003, M004 | Semua role | `/disposisi/:id` |
| PAGE-010 | Disposisi Saya | M003, M004 | Guru/Staf | `/disposisi/saya` |
| PAGE-011 | Disposisi Bidang | M003 | Wakasek | `/disposisi/bidang` |
| PAGE-012 | Notifikasi | - | Semua role | `/notifications` |
| PAGE-013 | Laporan | M006 | Admin TU | `/laporan` |
| PAGE-014 | Audit Log | M006 | Admin TU, Kepala | `/audit-log` |
| PAGE-015 | Manajemen Pengguna | M007 | Admin TU | `/pengguna` |
| PAGE-016 | Tambah Pengguna | M007 | Admin TU | `/pengguna/tambah` |
| PAGE-017 | Edit Pengguna | M007 | Admin TU | `/pengguna/:id/edit` |
| PAGE-018 | Lacak Surat | M008 | Publik | `/lacak` |

---

## 5. PAGE DEFINITIONS

### Page ID: PAGE-001

**Page Name:** Login

**Purpose:** Memverifikasi identitas pengguna untuk mencegah akses tidak sah ke sistem.

**Entry Points:**
- Mengakses URL utama aplikasi / pertama kali tanpa sesi login aktif.
- Mengakses URL `/login` secara langsung.

**Exit Points:**
- Berhasil login → diarahkan otomatis ke `/dashboard` (PAGE-002).

**Related User Flows:** UC-001: Login Pengguna

**Child Pages:** None.

**Required Permissions:** Publik / Tanpa Autentikasi.

**Notes:** Layar minimalis tanpa sidebar menu. Menampilkan form input username, password, dan tombol masuk. Logo sekolah di bawah form.

---

### Page ID: PAGE-002

**Page Name:** Dashboard

**Purpose:** Menampilkan ringkasan statistik surat dan Posisi Surat live table untuk monitoring.

**Entry Points:**
- Setelah sukses login dari PAGE-001.
- Klik menu "Dashboard" pada Sidebar.

**Exit Points:**
- Klik menu lain di Sidebar.
- Klik "Keluar" di User Menu → diarahkan ke `/login` (PAGE-001).

**Related User Flows:** UC-010: Lihat Dashboard Monitoring, UC-016: Lihat Posisi Surat

**Child Pages:** None.

**Required Permissions:** Semua role (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek).

**Notes:** Menampilkan kartu statistik di atas, lalu di bawahnya tabel Posisi Surat. Data diperbarui secara realtime via WebSocket. Wakasek hanya melihat surat bidangnya. Guru/Staf melihat statistik disposisinya.

---

### Page ID: PAGE-003

**Page Name:** Daftar Surat

**Purpose:** Menampilkan tabel seluruh surat masuk dengan pencarian dan filter.

**Entry Points:**
- Klik menu "Daftar Surat" pada Sidebar.

**Exit Points:**
- Klik menu lain di Sidebar.
- Klik baris surat → navigasi ke Detail Surat (PAGE-005).

**Related User Flows:** UC-006: Pencarian Lanjutan, UC-014: Pencarian Lanjutan

**Child Pages:** None.

**Required Permissions:** Admin TU (semua surat), Kepala Sekolah (semua surat), Wakasek (surat bidang), Guru/Staf (surat disposisi).

**Notes:** Tabel dengan kolom: Nomor Surat, Pengirim, Perihal, Status, Tanggal. Filter: Semua, Diterima, Didisposisi, Diproses, Selesai. Pencarian lanjutan: tanggal, pengirim, perihal.

---

### Page ID: PAGE-004

**Page Name:** Input Surat Baru

**Purpose:** Form input surat masuk baru beserta upload file scan.

**Entry Points:**
- Klik menu "Input Surat Baru" pada Sidebar.

**Exit Points:**
- Berhasil simpan → navigasi ke Daftar Surat (PAGE-003).
- Klik "Batal" → navigasi ke Daftar Surat (PAGE-003).

**Related User Flows:** UC-002: Input Surat Masuk

**Child Pages:** None.

**Required Permissions:** Admin TU.

**Notes:** Form fields: Nomor Surat (unique, trimmed), Tanggal Diterima, Pengirim, Perihal, File Scan (PDF/JPG/PNG, max 10MB). File disimpan sebagai BYTEA di database.

---

### Page ID: PAGE-005

**Page Name:** Detail Surat

**Purpose:** Menampilkan detail lengkap surat, timeline, disposisi, dan komentar.

**Entry Points:**
- Klik baris surat di Daftar Surat (PAGE-003).
- Klik dari notifikasi terkait.

**Exit Points:**
- Klik "Kembali" → navigasi ke halaman sebelumnya.
- Klik "Buat Disposisi" (Kepala) → navigasi ke Buat Disposisi (PAGE-008).

**Related User Flows:** UC-007: Lihat Timeline Surat, UC-013: Tambah Komentar, UC-015: Download File Scan

**Child Pages:** None.

**Required Permissions:** Semua role (dengan hak akses berbeda).

**Notes:** Bagian: Informasi Surat, Tombol Download File, Timeline (Alur Surat), Disposisi, Komentar. Kepala Sekolah dapat membuat disposisi. Guru/Staf hanya melihat komentar.

---

### Page ID: PAGE-006

**Page Name:** Disposisi

**Purpose:** Menampilkan surat yang belum didisposisi oleh Kepala Sekolah.

**Entry Points:**
- Klik menu "Disposisi" pada Sidebar.

**Exit Points:**
- Klik "Buat Disposisi" → navigasi ke Buat Disposisi (PAGE-008).
- Klik baris surat → navigasi ke Detail Surat (PAGE-005).

**Related User Flows:** UC-003: Buat Disposisi Digital

**Child Pages:** PAGE-008: Buat Disposisi.

**Required Permissions:** Kepala Sekolah.

**Notes:** Menampilkan surat dengan status "Diterima" yang belum didisposisi. Tombol "Buat Disposisi" di setiap baris.

---

### Page ID: PAGE-007

**Page Name:** Riwayat Disposisi

**Purpose:** Menampilkan daftar semua disposisi yang sudah dibuat oleh Kepala Sekolah.

**Entry Points:**
- Klik menu "Riwayat Disposisi" pada Sidebar.

**Exit Points:**
- Klik baris disposisi → navigasi ke Detail Disposisi (PAGE-009).

**Related User Flows:** UC-003: Buat Disposisi Digital

**Child Pages:** None.

**Required Permissions:** Kepala Sekolah.

**Notes:** Tabel dengan kolom: Nomor Surat, Penerima, Instruksi, Deadline, Status. Filter status.

---

### Page ID: PAGE-008

**Page Name:** Buat Disposisi

**Purpose:** Form pembuatan disposisi digital oleh Kepala Sekolah.

**Entry Points:**
- Klik "Buat Disposisi" di Detail Surat (PAGE-005) atau Disposisi (PAGE-006).

**Exit Points:**
- Berhasil simpan → navigasi ke Disposisi (PAGE-006).
- Klik "Batal" → navigasi ke halaman sebelumnya.

**Related User Flows:** UC-003: Buat Disposisi Digital

**Child Pages:** None.

**Required Permissions:** Kepala Sekolah.

**Notes:** Form: Info Surat (read-only), Pilih Penerima (Guru/Staf), Instruksi, Deadline. File scan dapat diunduh dari halaman ini.

---

### Page ID: PAGE-009

**Page Name:** Detail Disposisi

**Purpose:** Menampilkan detail instruksi disposisi, update status, dan komentar.

**Entry Points:**
- Klik baris disposisi di Riwayat Disposisi (PAGE-007) atau Disposisi Saya (PAGE-010).

**Exit Points:**
- Klik "Kembali" → navigasi ke halaman sebelumnya.

**Related User Flows:** UC-004: Update Status Surat, UC-013: Tambah Komentar

**Child Pages:** None.

**Required Permissions:** Semua role (dengan hak akses berbeda).

**Notes:** Bagian: Informasi Surat, Instruksi Disposisi, Status Update (Guru/Staf), Komentar, Timeline. Guru/Staf dapat mengklik "Mulai Diproses" atau "Tandai Selesai".

---

### Page ID: PAGE-010

**Page Name:** Disposisi Saya

**Purpose:** Menampilkan daftar disposisi yang ditujukan kepada Guru/Staf.

**Entry Points:**
- Klik menu "Disposisi Saya" pada Sidebar.

**Exit Points:**
- Klik "Tindak Lanjut" → navigasi ke Detail Disposisi (PAGE-009).
- Klik "Lihat Detail" → navigasi ke Detail Disposisi (PAGE-009).

**Related User Flows:** UC-004: Update Status Surat

**Child Pages:** PAGE-009: Detail Disposisi.

**Required Permissions:** Guru/Staf.

**Notes:** Tabel dengan kolom: Nomor Surat, Pengirim, Instruksi, Deadline, Status. Tombol aksi: "Tindak Lanjut" (untuk Didisposisi) atau "Lihat Detail" (untuk Diproses/Selesai).

---

### Page ID: PAGE-011

**Page Name:** Disposisi Bidang

**Purpose:** Menampilkan daftar disposisi yang berkaitan dengan bidang Wakasek.

**Entry Points:**
- Klik menu "Disposisi Bidang" pada Sidebar.

**Exit Points:**
- Klik baris disposisi → navigasi ke Detail Disposisi (PAGE-009).

**Related User Flows:** UC-003: Buat Disposisi Digital

**Child Pages:** None.

**Required Permissions:** Wakasek.

**Notes:** Wakasek hanya melihat disposisi yang didisposisikan ke bidangnya (Kurikulum, Kesiswaan, Sarana Prasarana, Humas).

---

### Page ID: PAGE-012

**Page Name:** Notifikasi

**Purpose:** Menampilkan daftar seluruh notifikasi masuk milik pengguna.

**Entry Points:**
- Klik ikon notifikasi di Topbar.
- Klik "Lihat Semua" di dropdown notifikasi.

**Exit Points:**
- Klik notifikasi → navigasi ke halaman terkait.
- Klik "Tandai Semua Dibaca" → semua notifikasi ditandai dibaca.

**Related User Flows:** UC-005: Terima & Lihat Notifikasi

**Child Pages:** None.

**Required Permissions:** Semua role.

**Notes:** Daftar notifikasi dengan indikator belum dibaca. Notifikasi baru muncul via WebSocket tanpa refresh.

---

### Page ID: PAGE-013

**Page Name:** Laporan

**Purpose:** Generate dan download laporan rekapitulasi surat per periode.

**Entry Points:**
- Klik menu "Laporan" pada Sidebar.

**Exit Points:**
- Klik "Download PDF" → file PDF diunduh.

**Related User Flows:** UC-008: Download Laporan PDF

**Child Pages:** None.

**Required Permissions:** Admin TU.

**Notes:** Form: Periode (harian/mingguan/bulanan), Tanggal Mulai, Tanggal Akhir. Saat periode dipilih, rentang tanggal otomatis disesuaikan (harian = hari ini, mingguan = 7 hari terakhir, bulanan = 30 hari terakhir). Pengguna dapat mengubah tanggal secara manual. Ringkasan: Total Surat, per Status, per Bidang. Tombol "Generate" dan "Download PDF".

---

### Page ID: PAGE-014

**Page Name:** Audit Log

**Purpose:** Menampilkan daftar pencatatan otomatis semua perubahan data.

**Entry Points:**
- Klik menu "Audit Log" pada Sidebar.

**Exit Points:**
- Klik menu lain di Sidebar.

**Related User Flows:** UC-014: Lihat Audit Log

**Child Pages:** None.

**Required Permissions:** Admin TU, Kepala Sekolah.

**Notes:** Tabel: Waktu, User, Role, Aksi (badge warna), Entitas, Detail. Filter: Aksi (CREATE/UPDATE_STATUS/DELETE), Entitas (surat_masuk/disposisi/pengguna).

---

### Page ID: PAGE-015

**Page Name:** Manajemen Pengguna

**Purpose:** Menampilkan daftar akun pengguna internal.

**Entry Points:**
- Klik menu "Manajemen Pengguna" pada Sidebar.

**Exit Points:**
- Klik "Tambah Pengguna" → navigasi ke Tambah Pengguna (PAGE-016).
- Klik baris pengguna → navigasi ke Edit Pengguna (PAGE-017).

**Related User Flows:** UC-009: Kelola Akun Pengguna

**Child Pages:** PAGE-016: Tambah Pengguna, PAGE-017: Edit Pengguna.

**Required Permissions:** Admin TU.

**Notes:** Tabel: Username, Nama Lengkap, Role, Bidang, Status. Tombol "Tambah Pengguna".

---

### Page ID: PAGE-016

**Page Name:** Tambah Pengguna

**Purpose:** Form tambah akun pengguna baru.

**Entry Points:**
- Klik "Tambah Pengguna" di Manajemen Pengguna (PAGE-015).

**Exit Points:**
- Berhasil simpan → navigasi ke Manajemen Pengguna (PAGE-015).
- Klik "Batal" → navigasi ke Manajemen Pengguna (PAGE-015).

**Related User Flows:** UC-009: Kelola Akun Pengguna

**Child Pages:** None.

**Required Permissions:** Admin TU.

**Notes:** Form: Username (unique), Password, Nama Lengkap, Role, Bidang (jika GURU_STAF/WAKASEK).

---

### Page ID: PAGE-017

**Page Name:** Edit Pengguna

**Purpose:** Form edit data akun pengguna.

**Entry Points:**
- Klik baris pengguna di Manajemen Pengguna (PAGE-015).

**Exit Points:**
- Berhasil update → navigasi ke Manajemen Pengguna (PAGE-015).
- Klik "Batal" → navigasi ke Manajemen Pengguna (PAGE-015).

**Related User Flows:** UC-009: Kelola Akun Pengguna

**Child Pages:** None.

**Required Permissions:** Admin TU.

**Notes:** Form: Nama Lengkap, Role, Bidang, Status Aktif. Tidak dapat mengubah username.

---

### Page ID: PAGE-018

**Page Name:** Lacak Surat (Publik)

**Purpose:** Halaman publik untuk melacak posisi/status surat tanpa login.

**Entry Points:**
- Mengakses URL `/lacak` secara langsung.

**Exit Points:**
- Tidak ada (halaman publik, read-only).

**Related User Flows:** UC-012: Lacak Surat Publik

**Child Pages:** None.

**Required Permissions:** Publik (tanpa login).

**Notes:** Layout khusus tanpa sidebar. Input nomor surat → tampilkan status, posisi, alur surat (stepper visual). Realtime update via WebSocket room `lacak:{nomorSurat}`.

---

## 6. USER NAVIGATION FLOWS

### Flow NF-001: Alur Utama Input Surat & Disposisi

**Entry Page:** PAGE-002 (Dashboard)

**Navigation Path:**
1. PAGE-002 (Dashboard) → Klik "Input Surat Baru"
2. PAGE-004 (Form Input Surat) → Isi form + upload file
3. PAGE-003 (Daftar Surat) → Surat baru muncul
4. Notifikasi realtime ke Kepala Sekolah
5. Kepala Sekolah buka PAGE-006 (Disposisi) → Klik "Buat Disposisi"
6. PAGE-008 (Form Disposisi) → Pilih penerima, instruksi, deadline
7. PAGE-006 (Disposisi) → Disposisi tersimpan
8. Notifikasi realtime ke Guru/Staf

**Exit Page:** PAGE-006 (Disposisi)

**Related User Flows:** UC-002, UC-003

---

### Flow NF-002: Alur Update Status Surat

**Entry Page:** PAGE-010 (Disposisi Saya)

**Navigation Path:**
1. PAGE-010 (Disposisi Saya) → Klik "Tindak Lanjut"
2. PAGE-009 (Detail Disposisi) → Klik "Mulai Diproses"
3. Konfirmasi → Status berubah ke "Diproses"
4. Notifikasi realtime ke Kepala Sekolah & Wakasek
5. PAGE-009 (Detail Disposisi) → Klik "Tandai Selesai"
6. Isi catatan → Konfirmasi → Status berubah ke "Selesai"
7. Notifikasi realtime ke Kepala Sekolah & Wakasek

**Exit Page:** PAGE-009 (Detail Disposisi)

**Related User Flows:** UC-004

---

### Flow NF-003: Alur Pelacakan Publik

**Entry Page:** PAGE-018 (Lacak Surat)

**Navigation Path:**
1. PAGE-018 (Lacak Surat) → Input nomor surat
2. Klik "Cek Status"
3. Tampilkan: Status, Posisi, Alur Surat (Stepper)
4. Bergabung ke room WebSocket `lacak:{nomorSurat}`
5. Update realtime tanpa refresh

**Exit Page:** PAGE-018 (Lacak Surat)

**Related User Flows:** UC-012

---

### Flow NF-004: Alur Login & Akses Dashboard

**Entry Page:** PAGE-001 (Login)

**Navigation Path:**
1. PAGE-001 (Login) → Input username & password
2. Klik "Masuk"
3. PAGE-002 (Dashboard) → Tampil sesuai role
4. Sidebar navigation sesuai role
5. Klik "Keluar" → PAGE-001 (Login)

**Exit Page:** PAGE-001 (Login)

**Related User Flows:** UC-001

---

## 7. CONTENT HIERARCHY

### 7.1 Module: Surat Masuk

**Level 1 (Daftar & Input):**
- Tabel Surat (Nomor, Pengirim, Perihal, Status, Tanggal).
- Form Input Surat Baru.

**Level 2 (Detail & Aksi):**
- Informasi Surat Lengkap.
- Tombol Download File Scan.
- Timeline (Alur Surat).
- Daftar Disposisi.

**Level 3 (Kolaborasi):**
- Komentar/Diskusi Tim.
- Tombol Buat Disposisi (Kepala).

### 7.2 Module: Disposisi Digital

**Level 1 (Daftar & Monitoring):**
- Tabel Disposisi (Nomor Surat, Penerima, Deadline, Status).
- Statistik: Total, Dalam Proses, Selesai, Overdue.

**Level 2 (Pembuatan):**
- Form Disposisi (Pilih Penerima, Instruksi, Deadline).
- Info Surat (read-only).

**Level 3 (Eksekusi):**
- Tombol Update Status (Mulai Diproses / Tandai Selesai).
- Komentar.

### 7.3 Module: Dashboard Monitoring

**Level 1 (Statistik Global):**
- Kartu Statistik: Total Surat, Diterima, Didisposisi, Diproses, Selesai, Overdue.

**Level 2 (Posisi Surat Live):**
- Tabel Posisi Surat (Nomor, Pengirim, Perihal, Status, Posisi).
- Filter Status.
- Realtime Update via WebSocket.

### 7.4 Module: Laporan & Audit

**Level 1 (Generate Laporan):**
- Form Periode (Harian/Mingguan/Bulanan).
- Ringkasan Statistik.

**Level 2 (Export):**
- Tombol Download PDF.

**Level 3 (Audit Trail):**
- Tabel Audit Log (Waktu, User, Aksi, Entitas, Detail).
- Filter Aksi & Entitas.

---

## 8. ROUTING CONVENTIONS

Sistem menggunakan Client-Side Routing yang bersih dan ramah pengguna (human-readable URLs).

| Page ID | Route | Access Type | Fallback/Redirect Rules |
|---|---|---|---|
| PAGE-001 | `/login` | Public / Guest | Jika sudah login, redirect ke `/dashboard`. |
| PAGE-002 | `/dashboard` | Authenticated | Jika sesi habis, redirect ke `/login`. |
| PAGE-003 | `/surat` | Authenticated | Jika sesi habis, redirect ke `/login`. |
| PAGE-004 | `/surat/tambah` | Authenticated (Admin TU) | Jika sesi habis, redirect ke `/login`. |
| PAGE-005 | `/surat/:id` | Authenticated | Jika sesi habis, redirect ke `/login`. |
| PAGE-006 | `/disposisi` | Authenticated (Kepala) | Jika sesi habis, redirect ke `/login`. |
| PAGE-007 | `/disposisi/riwayat` | Authenticated (Kepala) | Jika sesi habis, redirect ke `/login`. |
| PAGE-008 | `/disposisi/buat/:idSurat` | Authenticated (Kepala) | Jika sesi habis, redirect ke `/login`. |
| PAGE-009 | `/disposisi/:id` | Authenticated | Jika sesi habis, redirect ke `/login`. |
| PAGE-010 | `/disposisi/saya` | Authenticated (Guru/Staf) | Jika sesi habis, redirect ke `/login`. |
| PAGE-011 | `/disposisi/bidang` | Authenticated (Wakasek) | Jika sesi habis, redirect ke `/login`. |
| PAGE-012 | `/notifications` | Authenticated | Jika sesi habis, redirect ke `/login`. |
| PAGE-013 | `/laporan` | Authenticated (Admin TU) | Jika sesi habis, redirect ke `/login`. |
| PAGE-014 | `/audit-log` | Authenticated (Admin/Kepala) | Jika sesi habis, redirect ke `/login`. |
| PAGE-015 | `/pengguna` | Authenticated (Admin TU) | Jika sesi habis, redirect ke `/login`. |
| PAGE-016 | `/pengguna/tambah` | Authenticated (Admin TU) | Jika sesi habis, redirect ke `/login`. |
| PAGE-017 | `/pengguna/:id/edit` | Authenticated (Admin TU) | Jika sesi habis, redirect ke `/login`. |
| PAGE-018 | `/lacak` | Public | Tidak ada redirect. |
| - | `/` | - | Redirect ke `/login` jika belum login, `/dashboard` jika sudah. |
| - | `*` | Catch-all | Redirect ke `/dashboard` (tidak ada halaman 404 khusus). |

---

## 9. WEBSOCKET EVENT CHANNELS

Sesuai BR-14, BR-15, dan NF-08 di SRS, sistem menggunakan koneksi WebSocket (Socket.io) untuk sinkronisasi real-time.

### 9.1 Event Definition

| Event Name | Dipicu Saat | Dikirim ke (Room/Target) | Payload |
|---|---|---|---|
| `surat:baru` | Admin TU input surat (UC-002) | `role:KEPALA_SEKOLAH` | Object SuratMasuk |
| `disposisi:baru` | Kepala buat disposisi (UC-003) | `user:{idPenerima}` | Object Disposisi |
| `status:update` | Guru update status (UC-004) | `role:KEPALA_SEKOLAH`, `role:WAKASEK_BIDANG:{bidang}`, `user:{idCreatorSurat}` | Status terbaru |
| `notifikasi:baru` | Notifikasi dibuat | `user:{idPenerima}` | Object Notifikasi |
| `dashboard:refresh` | Perubahan data | `role:KEPALA_SEKOLAH`, `role:WAKASEK` | `{}` |
| `lacak:update` | Status berubah | `lacak:{nomorSurat}` (public) | `{ status, posisiSaatIni }` |

### 9.2 Room Structure

| Room | Description | Joined By |
|---|---|---|
| `user:{id}` | Notifikasi personal | Semua user login |
| `role:{peran}` | Broadcast sesuai role | Semua user login |
| `role:WAKASEK_BIDANG:{bidang}` | Khusus Wakasek per bidang | Wakasek only |
| `lacak:{nomorSurat}` | Publik (tanpa login) | User di `/lacak` |

### 9.3 Aturan Room Publik `/lacak`

- Klien `/lacak` **tidak login**, sehingga tidak bergabung ke room `user:{id}` atau `role:{peran}`.
- Saat nomor surat valid, klien bergabung ke room `lacak:{nomorSurat}`.
- Room hanya memancarkan: `status` dan `posisiSaatIni` — **tanpa** data sensitif (BR-16).

### 9.4 Indikator Visual Realtime

- Topbar menampilkan indikator koneksi: Titik hijau ("Tersinkron") atau oranye ("Menyambungkan ulang...").
- Saat data baru diterima, baris/kartu diberi highlight kuning (`#FEF9C3`) selama 2 detik.

---

## 10. API ENDPOINTS

### Auth
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| POST | `/api/auth/login` | Login pengguna | Publik |
| GET | `/api/auth/profile` | Profil pengguna login | Semua role |

> **Catatan:** Logout ditangani di sisi client — token JWT dihapus dari localStorage. Tidak ada endpoint server-side untuk logout (stateless JWT).

### Surat Masuk
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/api/surat` | Daftar surat + filter | Semua role |
| GET | `/api/surat/stats` | Statistik dashboard | Semua role |
| GET | `/api/surat/posisi` | Posisi surat (live) | Admin, Kepala, Wakasek |
| GET | `/api/surat/:id` | Detail surat + timeline | Semua role |
| GET | `/api/surat/:id/download` | Download file scan | Semua role |
| POST | `/api/surat` | Input surat baru | Admin TU |

### Disposisi
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/api/disposisi` | Daftar disposisi (termasuk riwayat untuk Kepala) | Semua role |
| GET | `/api/disposisi/:id` | Detail disposisi + timeline | Semua role |
| POST | `/api/disposisi` | Buat disposisi | Kepala Sekolah |

> **Catatan:** Riwayat disposisi menggunakan endpoint `GET /api/disposisi` yang secara otomatis memfilter berdasarkan role pengguna (Kepala melihat semua disposisi yang dibuatnya).

### Status
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| POST | `/api/status` | Update status surat | Guru/Staf |

### Komentar
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/api/surat/:suratId/komentar` | Ambil komentar | Semua role |
| POST | `/api/surat/:suratId/komentar` | Tambah komentar | Semua role |
| DELETE | `/api/surat/:suratId/komentar/:id` | Hapus komentar | Penulis/Admin/Kepala |

### Notifikasi
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/api/notifikasi` | Daftar notifikasi | Semua role |
| GET | `/api/notifikasi/unread-count` | Jumlah belum dibaca | Semua role |
| PUT | `/api/notifikasi/:id/read` | Tandai dibaca | Semua role |
| PUT | `/api/notifikasi/read-all` | Tandai semua dibaca | Semua role |

### Laporan
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| POST | `/api/laporan/generate` | Generate data laporan | Admin TU |
| GET | `/api/laporan/pdf` | Download PDF | Admin TU |

### Audit Log
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/api/audit-log` | Daftar audit log | Admin TU, Kepala |

### Pengguna
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/api/pengguna` | Daftar pengguna | Admin TU |
| GET | `/api/pengguna/:id` | Detail pengguna | Admin TU |
| GET | `/api/pengguna/guru-staf` | Daftar Guru/Staf | Semua role |
| POST | `/api/pengguna` | Tambah pengguna | Admin TU |
| PUT | `/api/pengguna/:id` | Update pengguna | Admin TU |
| PUT | `/api/pengguna/:id/password` | Reset password pengguna | Admin TU |
| DELETE | `/api/pengguna/:id` | Hapus pengguna | Admin TU |

### Public
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/api/public/lacak` | Lacak surat publik | Publik |
| GET | `/api/health` | Health check endpoint | Publik |

---

## 11. TRACEABILITY MATRIX (SRS v1.0 → IA v1.0)

| Feature ID | Feature Name | Mapped Page ID | Mapped Route |
|---|---|---|---|
| F-01 | Login dan Logout | PAGE-001 | `/login` |
| F-02 | Manajemen Akun Pengguna | PAGE-015, PAGE-016, PAGE-017 | `/pengguna`, `/pengguna/tambah`, `/pengguna/:id/edit` |
| F-03 | Input Surat Masuk | PAGE-004 | `/surat/tambah` |
| F-04 | Buat Disposisi Digital | PAGE-008 | `/disposisi/buat/:idSurat` |
| F-05 | Update Status Surat | PAGE-009, PAGE-010 | `/disposisi/:id`, `/disposisi/saya` |
| F-06 | Notifikasi Otomatis | PAGE-012 | `/notifications` |
| F-07 | Pencarian dan Filter Surat | PAGE-003 | `/surat` |
| F-08 | Timeline Surat | PAGE-005 | `/surat/:id` |
| F-09 | Dashboard Monitoring | PAGE-002 | `/dashboard` |
| F-10 | Laporan Rekapitulasi | PAGE-013 | `/laporan` |
| F-11 | Pelacakan Posisi Real-time | PAGE-002 | `/dashboard` |
| F-12 | Pelacakan Publik | PAGE-018 | `/lacak` |
| F-13 | Komentar | PAGE-005, PAGE-009 | `/surat/:id`, `/disposisi/:id` |
| F-14 | Pencarian Lanjutan | PAGE-003 | `/surat` |
| F-15 | Audit Log | PAGE-014 | `/audit-log` |
| F-16 | Export Laporan PDF | PAGE-013 | `/laporan` |

---

## 12. REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 1.2 | 2026-07-16 | System Analyst AI | PAGE-013: Tambahkan perilaku otomatis rentang tanggal saat periode dipilih. |
| 1.1 | 2026-07-12 | System Analyst AI | Fixed discrepancies with implementation: removed logout endpoint (client-side only), removed /api/disposisi/riwayat (handled by getAll), added pengguna/:id and pengguna/:id/password, added /api/health, updated catch-all route, added status:update to surat creator. |
| 1.0 | 2026-06-28 | System Analyst AI | Initial Draft (Dokumen Dasar SoT-2). |
