# Software Requirements Specification (SRS)

Document Version: v1.0

Project: SiDis — Sistem Informasi Disposisi dan Pelacakan Surat Digital

Product: Web-Based Letter Disposition & Tracking System

Status: Validated / Active

Last Updated: 2026-07-16

Author: System Analyst AI

---

# 1. INTRODUCTION

## 1.1 Purpose

Dokumen ini mendefinisikan spesifikasi kebutuhan fungsional dan non-fungsional untuk sistem SiDis (Sistem Informasi Disposisi dan Pelacakan Surat Digital). Dokumen ini berfungsi sebagai *source of truth* tunggal (SoT-1) yang melandasi pembuatan artefak pengembangan berikutnya seperti User Flows, Information Architecture, Design System, Data Model, dan API Contracts.

## 1.2 Scope

### Business Goals

- Digitalisasi seluruh alur persuratan masuk di SMP Muhammadiyah 9 Yogyakarta untuk menghindari kesalahan manual dan keterlambatan tindak lanjut.
- Menyediakan platform disposisi digital yang terstruktur, terlacak, dan transparan bagi Kepala Sekolah, Wakasek, dan Guru/Staf.
- Memungkinkan pelacakan posisi surat secara real-time oleh semua pihak terkait, termasuk pengirim eksternal tanpa login.
- Menyediakan audit trail lengkap untuk setiap perubahan data guna mendukung akuntabilitas dan transparansi.

### In Scope

- Login dan logout berbasis role untuk semua aktor internal (F-01).
- Manajemen akun pengguna oleh Admin TU (tambah, ubah, hapus akun) (F-02).
- Input surat masuk beserta metadata lengkap dan unggah file scan (PDF/gambar) — file disimpan di database Neon sebagai BYTEA (F-03).
- Disposisi digital oleh Kepala Sekolah: memilih penerima, menambah instruksi, menetapkan deadline (F-04).
- Update status surat oleh Guru/Staf: `Tindak Lanjut` (Didisposisi → Diproses) dan `Selesai` (Diproses → Selesai) (F-05).
- Notifikasi otomatis internal: saat ada surat masuk baru, disposisi baru, dan perubahan status (F-06).
- Pencarian dan filter surat berdasarkan nomor, tanggal, pengirim, perihal, dan status — dengan auto-search on keystroke (F-07).
- Timeline/riwayat lengkap alur surat dari diterima hingga selesai (F-08).
- Dashboard monitoring untuk semua aktor: Admin TU/Kepala Sekolah melihat statistik global + Posisi Surat, Wakasek melihat Posisi Surat bidang, Guru/Staf melihat statistik disposisi yang ditujukan kepadanya (F-09).
- Laporan rekapitulasi surat masuk per periode (harian/mingguan/bulanan) — dapat diunduh sebagai PDF (F-10).
- Pelacakan posisi terkini surat secara real-time (di TU / di Kepala Sekolah / sudah didisposisi ke siapa) (F-11).
- Halaman pelacakan publik (`/lacak`) tanpa login: pengirim eksternal memasukkan nomor surat dan melihat status + posisi unit yang sedang menangani secara realtime, mirip melacak paket (F-12).
- Komentar/Catatan pada detail surat: pengguna internal dapat menambah komentar untuk diskusi tim (F-13).
- Pencarian Lanjutan: filter tanggal mulai/akhir, pengirim, perihal di halaman Daftar Surat (F-14).
- Audit Log: pencatatan otomatis semua perubahan (siapa, kapan, ubah apa) — hanya dapat dilihat oleh Admin TU dan Kepala Sekolah (F-15).
- Export Laporan PDF: generate laporan rekapitulasi dalam format PDF untuk diunduh (F-16).

### Out of Scope

- Sistem **tidak** mengelola surat keluar — hanya surat masuk.
- Pengirim eksternal **tidak** dapat membuat akun atau login ke sistem.
- Sistem **tidak** terintegrasi dengan sistem informasi akademik sekolah yang sudah ada.
- Sistem **tidak** memiliki fitur email atau pengiriman surat digital keluar.
- Sistem **tidak** menggunakan kecerdasan buatan (AI) atau machine learning.
- Sistem **tidak** dikembangkan sebagai aplikasi mobile native (Android/iOS).
- Sistem **tidak** memiliki fitur forgot password — reset password hanya dilakukan oleh Admin TU.
- Sistem **tidak** terintegrasi dengan payment gateway atau sistem pembayaran apapun.

## 1.3 Stakeholders

| Stakeholder | Role | Responsibility |
|---|---|---|
| Kepala Sekolah SMP Muhammadiyah 9 YK | Project Sponsor | Memberikan arahan kebutuhan bisnis dan menyetujui hasil akhir sistem. |
| Admin TU | End User | Menginput surat masuk, mengelola akun pengguna, melihat laporan & audit log. |
| Guru / Staf | End User | Menerima disposisi, menindaklanjuti surat, memperbarui status penyelesaian. |
| Wakil Kepala Sekolah | End User | Memantau surat sesuai bidang, menerima notifikasi disposisi. |
| Pengirim Surat Eksternal | External User | Melacak posisi/status suratnya sendiri menggunakan nomor surat, tanpa login. |
| System Analyst | Author | Menyusun dan memperbarui dokumentasi *Source of Truth* (SoT). |

## 1.4 Definitions

| Term | Definition |
|---|---|
| SiDis | Sistem Informasi Disposisi dan Pelacakan Surat Digital — aplikasi web untuk mengelola surat masuk dan disposisi di sekolah. |
| Disposisi | Instruksi dari Kepala Sekolah kepada Guru/Staf untuk menindaklanjuti surat masuk tertentu. |
| Admin TU | Staf Tata Usaha yang bertanggung jawab atas input surat masuk dan manajemen akun pengguna. |
| Guru/Staf | Pegawai sekolah yang menerima disposisi dan menindaklanjuti surat. Terdiri dari 5 bidang: Kurikulum, Kesiswaan, Sarana Prasarana, Humas, dan Keuangan. |
| Wakasek | Wakil Kepala Sekolah yang memantau surat sesuai bidang tugasnya. Terdiri dari 4 bidang: Kurikulum, Kesiswaan, Sarana Prasarana, Humas. |
| BYTEA | Tipe data PostgreSQL untuk menyimpan data biner (binary). Digunakan untuk menyimpan file scan surat di database. |
| Event Sourcing | Pola desain di mana setiap perubahan status surat dicatat sebagai entri baru di tabel `status_surat` untuk membentuk timeline audit. |
| WebSocket | Protokol komunikasi real-time yang memungkinkan push data dari server ke client tanpa perlu refresh halaman. |

## 1.5 References

- Product Vision: Sistem Informasi Disposisi dan Pelacakan Surat Digital untuk SMP Muhammadiyah 9 Yogyakarta.
- `information_architecture.md` — Arsitektur Informasi (SoT-2).
- `design_system.md` — Design System (SoT-3).
- `user_flows/index.md` — Peta Alur Pengguna (SoT-4).
- `system_logics/index.md` — System Logic Specifications (SoT-5).

---

# 2. PRODUCT OVERVIEW

## 2.1 Product Summary

SiDis adalah aplikasi web yang berfungsi sebagai platform terpusat untuk mengelola seluruh alur persuratan di SMP Muhammadiyah 9 Yogyakarta secara digital. Sistem ini menggantikan proses manual berbasis buku agenda fisik dan komunikasi via WhatsApp antar staf, dengan alur yang terstruktur, terlacak, dan transparan — mengadopsi konsep pelacakan mirip status pengiriman paket, namun diterapkan pada konteks administrasi surat sekolah.

Masalah utama yang diselesaikan sistem ini adalah: tidak adanya transparansi posisi surat secara real-time, disposisi yang tidak terdokumentasi, keterlambatan tindak lanjut akibat tidak ada notifikasi terpusat, dan tingginya ketergantungan pada Staf TU sebagai pusat informasi manual seluruh pihak.

## 2.2 User Types

| User Type | Description |
|---|---|
| Admin TU | Pengguna yang bertanggung jawab atas input surat masuk, manajemen akun pengguna, dan melihat laporan serta audit log. |
| Kepala Sekolah | Pengguna yang membuat disposisi digital, memantau status surat via dashboard, dan melihat laporan serta audit log. |
| Guru / Staf | Pengguna yang menerima disposisi, menindaklanjuti surat, dan memperbarui status penyelesaian. Terdiri dari 5 bidang. |
| Wakil Kepala Sekolah | Pengguna yang memantau surat sesuai bidang dan menerima notifikasi disposisi. Terdiri dari 4 bidang. |
| Pengirim Surat Eksternal | Pengguna eksternal yang melacak posisi/status suratnya sendiri menggunakan nomor surat, tanpa login. |

## 2.3 User Goals

### User Type: Admin TU

- Dapat menginput surat masuk baru beserta metadata lengkap dan file scan.
- Dapat mengelola akun pengguna (tambah, ubah, hapus).
- Dapat melihat laporan rekapitulasi surat per periode dan mengunduhnya sebagai PDF.
- Dapat melihat audit log untuk memantau semua perubahan data di sistem.

### User Type: Kepala Sekolah

- Dapat membuat disposisi digital untuk surat masuk: memilih penerima, menambah instruksi, menetapkan deadline.
- Dapat memantau status surat via dashboard dengan statistik global dan Posisi Surat.
- Dapat melihat laporan rekapitulasi surat per periode dan mengunduhnya sebagai PDF.
- Dapat melihat audit log untuk memantau semua perubahan data di sistem.

### User Type: Guru / Staf

- Dapat melihat disposisi yang ditujukan kepadanya.
- Dapat memperbarui status surat: Tindak Lanjut (Didisposisi → Diproses) dan Selesai (Diproses → Selesai).
- Dapat menambah komentar pada detail surat untuk diskusi tim.

### User Type: Wakil Kepala Sekolah

- Dapat memantau surat yang berhubungan dengan bidangnya.
- Dapat melihat disposisi bidang dan notifikasi terkait.

### User Type: Pengirim Surat Eksternal

- Dapat melacak posisi/status suratnya sendiri menggunakan nomor surat tanpa login.
- Dapat melihat alur surat (stepper visual) dan status terkini.

## 2.4 Operating Environment

- **Frontend:** React 18 + Vite (Library UI + build tool & dev server, tanpa SSR/SSG).
- **Backend:** Express.js (REST API server).
- **Realtime Sync:** Socket.io (WebSocket) — mendorong update data secara realtime ke seluruh aktor yang terhubung.
- **Database:** Neon (Cloud PostgreSQL) — serverless PostgreSQL managed via connection string `DATABASE_URL`, SSL connection.
  ```
  DATABASE_URL=postgresql://neondb_owner:npg_2CZDJquplAk1@ep-cold-sound-ao6ukhv2-pooler.c-2.ap-southeast-1.aws.neon.tech/SiDs?sslmode=require&channel_binding=require
  ```
- **File Storage:** Neon DB (BYTEA) — file scan surat disimpan langsung di database.
- **Authentication:** JWT (JSON Web Token) — token-based auth per sesi, juga digunakan untuk autentikasi koneksi WebSocket.
- **Styling:** Tailwind CSS (utility-first CSS framework).
- **PDF Generation:** pdfkit (generate laporan rekapitulasi dalam format PDF).
- **Browser Support:** Google Chrome (diutamakan), Mozilla Firefox, Microsoft Edge, Safari (versi terbaru).
- **Mobile Support:** Responsive Web Layout (bisa diakses via Tablet/iPad).

### Struktur Folder & Perintah Eksekusi

Proyek menggunakan struktur folder unified dalam satu direktori:
- `server/` — backend Express.js (controllers, routes, middleware, socket, config, helpers)
- `src/` — frontend React + Vite (pages, components, context, lib)
- `public/` — aset statis (logo, gambar)
- `server.js` — entry point terpadu: menjalankan Vite dev server + Express API + Socket.io pada port yang sama (3000)
- `.env` — konfigurasi termasuk `DATABASE_URL` untuk koneksi ke Neon

Perintah eksekusi:
```bash
npm run db:init   # Inisialisasi schema + seed data ke Neon (DROP semua tabel lalu CREATE baru)

> **⚠ PERINGATAN: Karena menggunakan Neon (Cloud PostgreSQL), `npm run db:init` akan MENGHAPUS SEMUA DATA yang sudah ada di database. Jangan jalankan perintah ini kecuali benar-benar diperlukan (misalnya saat pertama kali setup atau saat schema berubah). Data di Neon bersifat persisten dan TIDAK bisa dikembalikan setelah dihapus.**
npm run dev        # Jalankan server + frontend pada http://localhost:3000 (auto-kill port 3000, TANPA reset DB)
npm run dev:reset  # Kill port + db:init + start server (reset DB penuh)
```

## 2.5 Assumptions

- Perangkat akses (komputer/laptop/tablet) selalu terhubung dengan koneksi internet yang stabil.
- Seluruh aktor memiliki akun yang terdaftar di sistem (dibuat oleh Admin TU).
- Browser yang digunakan adalah versi terbaru (Chrome diutamakan).
- File scan surat yang diunggah sudah sesuai format yang diizinkan (PDF, JPG, PNG).

## 2.6 Constraints

- Aplikasi sepenuhnya berbasis web dan tidak dapat diakses sebagai aplikasi mobile native.
- Keamanan data bergantung pada mekanisme autentikasi JWT dan otorisasi berbasis role.
- File scan disimpan sebagai BYTEA di database Neon, bukan di filesystem lokal.
- Sistem harus bersifat multi-user dan tersinkronisasi secara realtime (BR-14, BR-15).

---

# 3. SYSTEM FEATURES

---

## Feature ID: F-01

**Feature Name:** Login dan Logout

### Description

Fitur ini memungkinkan seluruh aktor internal untuk melakukan autentikasi menggunakan username dan password, serta keluar dari sistem dengan aman.

### Requirements

- Sistem harus menampilkan halaman login dengan form input username dan password.
- Sistem harus memvalidasi input (tidak kosong).
- Sistem harus mengirimkan kredensial ke backend untuk validasi.
- Sistem harus menghasilkan JWT token setelah login berhasil.
- Sistem harus menyimpan token di localStorage (BR-14).
- Sistem harus mengarahkan pengguna ke halaman yang sesuai berdasarkan role.
- Sistem harus menyediakan tombol logout yang menghapus token dan mengarahkan ke halaman login.

### Business Rules

- BR-01: Setiap pengguna wajib login menggunakan username dan password sebelum mengakses sistem.
- BR-14: localStorage hanya boleh dipakai untuk menyimpan token sesi.

---

## Feature ID: F-02

**Feature Name:** Manajemen Akun Pengguna

### Description

Fitur ini memungkinkan Admin TU untuk mengelola akun pengguna (tambah, ubah, hapus).

### Requirements

- Sistem harus menampilkan daftar seluruh pengguna.
- Sistem harus menyediakan formulir tambah pengguna baru (username, password, nama lengkap, role, bidang).
- Sistem harus menyediakan formulir edit data pengguna.
- Sistem harus menyediakan tombol hapus pengguna.
- Sistem harus memvalidasi input untuk mencegah username duplikat.

### Business Rules

- BR-02: Akun pengguna hanya dapat dibuat oleh Admin TU — tidak ada fitur registrasi publik.

---

## Feature ID: F-03

**Feature Name:** Input Surat Masuk

### Description

Fitur ini memungkinkan Admin TU untuk menginput surat masuk baru beserta metadata lengkap dan unggah file scan.

### Requirements

- Sistem harus menyediakan formulir input surat masuk (nomor surat, tanggal diterima, pengirim, perihal).
- Sistem harus menyediakan fitur unggah file scan (PDF/JPG/PNG, maksimal 10MB).
- Sistem harus menyimpan file scan sebagai BYTEA di database Neon (BR-20).
- Sistem harus menambahkan entri awal di tabel `status_surat` dengan status "Diterima" (BR-08).
- Sistem harus mengirim notifikasi realtime ke Kepala Sekolah (BR-06).
- Sistem harus memotong spasi di depan dan belakang nomor surat (BR-21).

### Business Rules

- BR-06: Notifikasi otomatis dikirim ke Kepala Sekolah setiap ada surat masuk baru.
- BR-08: Setiap perubahan status harus tercatat di tabel `status_surat` (event sourcing).
- BR-12: File scan hanya boleh berformat PDF atau gambar (JPG/PNG). Maksimal 10MB.
- BR-15: Perubahan data wajib didorong secara realtime via WebSocket.
- BR-20: File scan disimpan sebagai BYTEA di database Neon.
- BR-21: Input nomor surat akan di-trim spasi di depan dan belakang.

---

## Feature ID: F-04

**Feature Name:** Buat Disposisi Digital

### Description

Fitur ini memungkinkan Kepala Sekolah untuk membuat disposisi digital kepada Guru/Staf.

### Requirements

- Sistem harus menampilkan formulir disposisi: pilih penerima, instruksi, deadline.
- Sistem harus memperbarui status surat menjadi "Didisposisi" (BR-03).
- Sistem harus menambahkan entri di tabel `status_surat` (BR-08).
- Sistem harus mengirim notifikasi realtime ke Guru penerima (BR-07).
- Sistem harus mengirim notifikasi realtime ke Wakasek sesuai bidang.

### Business Rules

- BR-03: Status surat berubah: Diterima → Didisposisi.
- BR-04: Disposisi hanya dibuat oleh Kepala Sekolah.
- BR-05: Satu surat dapat memiliki lebih dari satu disposisi.
- BR-07: Notifikasi otomatis dikirim ke Guru/Staf setiap ada disposisi baru.
- BR-08: Perubahan status tercatat di tabel `status_surat`.

---

## Feature ID: F-05

**Feature Name:** Update Status Surat

### Description

Fitur ini memungkinkan Guru/Staf untuk memperbarui status surat: Tindak Lanjut (Didisposisi → Diproses) dan Selesai (Diproses → Selesai).

### Requirements

- Sistem harus menampilkan tombol "Mulai Diproses" jika status Didisposisi.
- Sistem harus menampilkan tombol "Tandai Selesai" jika status Diproses.
- Sistem harus menambahkan entri di tabel `status_surat` untuk setiap perubahan (BR-08).
- Sistem harus mengirim notifikasi realtime ke Kepala Sekolah dan Wakasek (BR-15).
- Sistem tidak mengizinkan perubahan status kembali setelah Selesai (BR-13).

### Business Rules

- BR-03: Status hanya boleh berubah: Didisposisi → Diproses → Selesai.
- BR-08: Perubahan status tercatat di tabel `status_surat` (event sourcing).
- BR-11: Guru/Staf hanya dapat melihat surat yang didisposisikan kepadanya.
- BR-13: Surat yang sudah Selesai tidak dapat diubah statusnya kembali.
- BR-15: Perubahan data didorong secara realtime via WebSocket.

---

## Feature ID: F-06

**Feature Name:** Notifikasi Otomatis

### Description

Fitur ini menyediakan notifikasi otomatis internal saat ada perubahan data penting.

### Requirements

- Sistem harus mengirim notifikasi ke Kepala Sekolah saat ada surat masuk baru.
- Sistem harus mengirim notifikasi ke Guru/Staf saat ada disposisi baru yang ditujukan kepadanya.
- Sistem harus mengirim notifikasi ke Kepala Sekolah dan Wakasek saat status surat berubah.
- Sistem harus menampilkan ikon notifikasi dengan badge jumlah belum dibaca.
- Sistem harus menampilkan dropdown notifikasi dengan 5 notif terbaru.
- Sistem harus menyediakan halaman notifikasi lengkap di `/notifications`.

### Business Rules

- BR-06: Notifikasi otomatis dikirim ke Kepala Sekolah setiap ada surat masuk baru.
- BR-07: Notifikasi otomatis dikirim ke Guru/Staf setiap ada disposisi baru.
- BR-15: Perubahan data didorong secara realtime via WebSocket.

---

## Feature ID: F-07

**Feature Name:** Pencarian dan Filter Surat

### Description

Fitur ini memungkinkan pengguna untuk mencari dan memfilter surat berdasarkan berbagai kriteria.

### Requirements

- Sistem harus menyediakan kolom pencarian dengan auto-search on keystroke.
- Sistem harus menyediakan filter berdasarkan status (Diterima, Didisposisi, Diproses, Selesai).
- Sistem harus menampilkan hasil pencarian secara realtime.
- Sistem harus menerapkan filter berdasarkan role pengguna (BR-11).

### Business Rules

- BR-11: Guru/Staf hanya melihat surat yang didisposisikan kepadanya.

---

## Feature ID: F-08

**Feature Name:** Timeline Surat

### Description

Fitur ini menampilkan riwayat lengkap alur surat dari diterima hingga selesai.

### Requirements

- Sistem harus menampilkan timeline urutan perubahan status surat.
- Sistem harus menampilkan siapa yang mengubah status dan kapan.
- Sistem harus menampilkan catatan perubahan (opsional).
- Sistem harus menggunakan data dari tabel `status_surat` (event sourcing).

### Business Rules

- BR-08: Setiap perubahan status tercatat di tabel `status_surat` (event sourcing).

---

## Feature ID: F-09

**Feature Name:** Dashboard Monitoring

### Description

Fitur ini menyediakan dashboard monitoring untuk semua aktor.

### Requirements

- Sistem harus menampilkan kartu statistik: Total Surat, Diterima, Didisposisi, Diproses, Selesai, Overdue.
- Sistem harus menampilkan tabel Posisi Surat (live table).
- Wakasek hanya melihat surat yang didisposisikan ke bidangnya (BR-10).
- Guru/Staf melihat statistik disposisi yang ditujukan kepadanya (BR-11).
- Data harus diperbarui secara realtime via WebSocket (BR-15).

### Business Rules

- BR-10: Wakasek hanya melihat surat yang berhubungan dengan bidangnya.
- BR-11: Guru/Staf hanya melihat surat yang didisposisikan kepadanya.
- BR-15: Perubahan data didorong secara realtime via WebSocket.

---

## Feature ID: F-10

**Feature Name:** Laporan Rekapitulasi

### Description

Fitur ini menyediakan laporan rekapitulasi surat masuk per periode.

### Requirements

- Sistem harus menyediakan form periode (harian/mingguan/bulanan).
- Sistem harus otomatis menyesuaikan rentang tanggal saat periode dipilih:
  - **Harian:** Tanggal mulai dan tanggal akhir = hari ini.
  - **Mingguan:** Tanggal mulai = 6 hari sebelum hari ini, tanggal akhir = hari ini.
  - **Bulanan:** Tanggal mulai = 29 hari sebelum hari ini, tanggal akhir = hari ini.
- Pengguna tetap dapat mengubah tanggal mulai dan tanggal akhir secara manual setelah periode dipilih.
- Sistem harus menampilkan ringkasan: total surat, surat per status, surat per bidang.
- Sistem harus membatasi akses hanya untuk Admin TU dan Kepala Sekolah (BR-09).

### Business Rules

- BR-09: Laporan hanya dapat diakses oleh Admin TU dan Kepala Sekolah.

---

## Feature ID: F-11

**Feature Name:** Pelacakan Posisi Real-time

### Description

Fitur ini memungkinkan pelacakan posisi terkini surat secara real-time.

### Requirements

- Sistem harus menampilkan posisi terkini semua surat di dashboard.
- Sistem harus memperbarui data secara realtime tanpa refresh halaman (BR-15, NF-08).
- Sistem harus menampilkan indikator koneksi WebSocket (Tersinkron/Menyambungkan ulang/Offline).
- Sistem harus melakukan auto-reconnect dengan resync saat koneksi pulih (NF-09).

### Business Rules

- BR-15: Perubahan data didorong secara realtime via WebSocket.
- NF-08: Update harus diterima klien dalam waktu ≤ 2 detik.
- NF-09: Auto-reconnect dengan resync saat koneksi pulih.

---

## Feature ID: F-12

**Feature Name:** Pelacakan Publik

### Description

Fitur ini memungkinkan pengirim eksternal untuk melacak posisi/status surat tanpa login.

### Requirements

- Sistem harus menyediakan halaman `/lacak` tanpa login.
- Sistem harus menerima input nomor surat dan menampilkan status + posisi.
- Sistem harus menampilkan Alur Surat (stepper visual) dengan nama role (bukan nama orang).
- Sistem harus memfilter data sensitif (file scan, instruksi, nama lengkap) (BR-16).
- Sistem harus membatasi rate-limit per IP (BR-17).

### Business Rules

- BR-16: Pelacakan publik hanya menampilkan status, posisi, alur, nama role.
- BR-17: Endpoint publik tidak memerlukan JWT, tetapi harus di-rate-limit.

---

## Feature ID: F-13

**Feature Name:** Komentar

### Description

Fitur ini memungkinkan pengguna internal untuk menambah komentar pada detail surat.

### Requirements

- Sistem harus menyediakan kolom input komentar di halaman detail surat.
- Sistem harus menampilkan daftar komentar dengan nama penulis, badge role, waktu.
- Sistem harus menyediakan tombol hapus komentar (hanya untuk penulis, Admin TU, Kepala Sekolah) (BR-18).

### Business Rules

- BR-18: Komentar hanya dapat dihapus oleh penulis, Admin TU, atau Kepala Sekolah.

---

## Feature ID: F-14

**Feature Name:** Pencarian Lanjutan

### Description

Fitur ini memungkinkan pengguna untuk memfilter surat berdasarkan tanggal, pengirim, dan perihal.

### Requirements

- Sistem harus menyediakan filter tanggal mulai dan tanggal akhir.
- Sistem harus menyediakan filter pengirim (ILIKE).
- Sistem harus menyediakan filter perihal (ILIKE).
- Sistem harus menampilkan hasil filter dalam tabel.

### Business Rules

- BR-11: Guru/Staf hanya melihat surat yang didisposisikan kepadanya.

---

## Feature ID: F-15

**Feature Name:** Audit Log

### Description

Fitur ini menyediakan pencatatan otomatis semua perubahan data di sistem.

### Requirements

- Sistem harus mencatat setiap perubahan data: siapa, kapan, ubah apa.
- Sistem harus menampilkan tabel audit log dengan filter aksi dan entitas.
- Sistem harus membatasi akses hanya untuk Admin TU dan Kepala Sekolah (BR-19).

### Business Rules

- BR-19: Audit Log hanya dapat dilihat oleh Admin TU dan Kepala Sekolah.

---

## Feature ID: F-16

**Feature Name:** Export Laporan PDF

### Description

Fitur ini memungkinkan Admin TU untuk mengunduh laporan rekapitulasi dalam format PDF.

### Requirements

- Sistem harus menyediakan tombol "Download PDF" di halaman laporan.
- Sistem harus menghasilkan PDF menggunakan pdfkit.
- Sistem harus mengunduh file PDF ke perangkat pengguna.

### Business Rules

- BR-09: Laporan hanya dapat diakses oleh Admin TU dan Kepala Sekolah.

---

# 4. DATA REQUIREMENTS

## 4.1 Core Business Objects

| Object | Description |
|---|---|
| Pengguna | Menyimpan data akun pengguna meliputi ID, username, password (hashed), nama lengkap, role, bidang, status aktif. |
| Surat Masuk | Menyimpan data surat masuk meliputi ID, nomor surat, tanggal diterima, pengirim, perihal, file scan (BYTEA), status. |
| Disposisi | Menyimpan data disposisi meliputi ID, surat_id, diberikan_oleh, diberikan_kepada, instruksi, deadline. |
| Status Surat | Menyimpan riwayat perubahan status surat meliputi ID, surat_id, status, catatan, diubah_oleh. |
| Komentar | Menyimpan komentar diskusi tim meliputi ID, surat_id, user_id, isi. |
| Audit Log | Menyimpan pencatatan perubahan data meliputi ID, user_id, aksi, entitas, entitas_id, detail, ip_address. |
| Notifikasi | Menyimpan notifikasi internal meliputi ID, user_id, judul, pesan, tipe, reference_id, status dibaca. |

## 4.2 Ownership Rules

| Object | Owner |
|---|---|
| Pengguna | Admin TU (memiliki akses kelola penuh). |
| Surat Masuk | Admin TU (membuat), Kepala Sekolah (melihat semua), Guru/Staf (melihat yang didisposisikan). |
| Disposisi | Kepala Sekolah (membuat), Guru/Staf (melihat yang ditujukan). |
| Status Surat | Guru/Staf (mengubah), semua (melihat). |
| Komentar | Penulis (membuat/hapus), Admin TU/Kepala (hapus semua). |
| Audit Log | Admin TU/Kepala Sekolah (melihat). |
| Notifikasi | Penerima (melihat/menandai dibaca). |

## 4.3 Data Retention Rules

- Data surat masuk, disposisi, status surat, komentar, dan audit log disimpan secara permanen di database Neon.
- Data notifikasi dapat dibersihkan secara berkala setelah 1 tahun.
- File scan disimpan sebagai BYTEA di database Neon (bukan di filesystem lokal).

## 4.4 Data Validation Rules

- Nomor surat wajib unik dan akan di-trim spasi (BR-21).
- File scan hanya boleh berformat PDF, JPG, atau PNG dengan maksimal 10MB (BR-12).
- Status surat hanya boleh berubah mengikuti urutan: Diterima → Didisposisi → Diproses → Selesai (BR-03).
- Username wajib unik dan tidak boleh kosong.
- Password wajib di-hash menggunakan bcrypt.

---

# 5. EXTERNAL INTERFACES

## 5.1 User Interface Requirements

- Layout responsif (dioptimalkan untuk resolusi Desktop PC dan layar Tablet).
- Navigasi konsisten menggunakan sidebar menu yang disesuaikan berdasarkan role.
- Topbar selalu tampil di atas: logo, nama pengguna, indikator koneksi, notifikasi, logout.
- Formulir input dengan penanda field yang jelas (required fields).
- Badge status surat dengan warna yang konsisten.
- Indikator real-time update dengan highlight kuning selama 2 detik.

## 5.2 External Systems

| System | Purpose |
|---|---|
| Neon Cloud PostgreSQL | Database serverless untuk penyimpanan data dan file scan (BYTEA). |
| Socket.io | WebSocket server untuk sinkronisasi real-time data antar klien. |

## 5.3 Communication Requirements

### Protocols

- HTTPS (untuk menjamin keamanan transmisi data).
- REST API (komunikasi utama frontend ke backend).
- WebSocket/Socket.io (komunikasi real-time).

### Formats

- JSON (untuk pertukaran data objek).
- Multipart/form-data (untuk unggah file scan).
- Binary (untuk download file scan dari database).

---

# 6. NON-FUNCTIONAL REQUIREMENTS

## 6.1 Performance

- Sistem harus menampilkan data surat dan dashboard dalam waktu ≤ 5 detik (NF-01).
- Sistem harus dapat menangani minimal 20 koneksi pengguna aktif secara bersamaan tanpa penurunan performa signifikan (NF-10).

## 6.2 Security

- Sistem menggunakan autentikasi JWT dan otorisasi berbasis role, termasuk pada koneksi WebSocket (NF-02).
- Password di-hash menggunakan bcrypt dengan salt rounds >= 10.
- File scan disimpan sebagai BYTEA di database, bukan di filesystem lokal (BR-20).
- Endpoint publik (`/lacak`) harus di-rate-limit per IP (BR-17).

## 6.3 Availability

- Sistem harus memiliki tingkat ketersediaan minimal 95% (NF-06).
- Data tersimpan di Neon Cloud PostgreSQL yang bersifat serverless dan managed.

## 6.4 Reliability

- Sistem harus melakukan backup data secara berkala (NF-04).
- Jika koneksi WebSocket terputus, klien harus otomatis mencoba menyambung kembali (auto-reconnect) dan menyinkronkan ulang data terbaru dari server saat koneksi pulih (NF-09).

## 6.5 Scalability

- Struktur database harus mampu menangani pertumbuhan data surat dan disposisi tanpa penurunan performa yang signifikan.
- Neon Cloud PostgreSQL bersifat serverless dan dapat diskalakan otomatis.

## 6.6 Maintainability

- Source code aplikasi wajib ditulis menggunakan standar penamaan yang bersih dan modular guna memudahkan pengembangan fitur baru di masa mendatang.
- Dokumentasi SoT (SRS, IA, DS, User Flows, System Logics) harus diperbarui setiap ada perubahan.

## 6.7 Usability

- Antarmuka harus dapat digunakan oleh pengguna non-teknis (staf TU dan guru) (NF-03).
- Waktu pelatihan maksimal 15 menit untuk pengguna baru.

## 6.8 Compatibility

- Sistem harus dapat diakses melalui browser Chrome pada perangkat desktop/laptop (NF-05).
- Responsive web layout untuk tablet/iPad.

## 6.9 Realtime Sync

- Update data (surat/disposisi/status/notifikasi) harus diterima klien dalam waktu ≤ 2 detik sejak perubahan terjadi di server, melalui koneksi WebSocket (NF-08).

## 6.10 Authorization

- Data surat hanya dapat diakses oleh pengguna yang berwenang sesuai role-nya (NF-07).
- Guru/Staf hanya melihat surat yang didisposisikan kepadanya (BR-11).
- Wakasek hanya melihat surat yang berhubungan dengan bidangnya (BR-10).

---

# 7. PERMISSIONS AND ACCESS CONTROL

| Capability | Admin TU | Kepala Sekolah | Guru/Staf | Wakasek | Publik |
|---|---|---|---|---|---|
| Login & Logout | **AKSI** | **AKSI** | **AKSI** | **AKSI** | **AKSI** |
| Input Surat Masuk | **AKSI** | - | - | - | - |
| Buat Disposisi | - | **AKSI** | - | - | - |
| Update Status Surat | - | - | **AKSI** | - | - |
| Lihat Semua Surat | **AKSI** | **AKSI** | - | - | - |
| Lihat Surat Bidang | - | - | - | **AKSI** | - |
| Lihat Surat Disposisi | - | - | **AKSI** | - | - |
| Lihat Dashboard | **AKSI** | **AKSI** | **AKSI** | **AKSI** | - |
| Lihat Laporan | **AKSI** | **AKSI** | - | - | - |
| Export PDF | **AKSI** | **AKSI** | - | - | - |
| Lihat Audit Log | **AKSI** | **AKSI** | - | - | - |
| Kelola Pengguna | **AKSI** | - | - | - | - |
| Tambah Komentar | **AKSI** | **AKSI** | **AKSI** | **AKSI** | - |
| Hapus Komentar | **AKSI** | **AKSI** | **OWN** | **OWN** | - |
| Lacak Publik | - | - | - | - | **AKSI** |
| Download File Scan | **AKSI** | **AKSI** | **AKSI** | **AKSI** | - |

---

# 8. FEATURE INVENTORY

| Feature ID | Feature Name | Priority |
|---|---|---|
| F-01 | Login dan Logout | High |
| F-02 | Manajemen Akun Pengguna | High |
| F-03 | Input Surat Masuk | High |
| F-04 | Buat Disposisi Digital | High |
| F-05 | Update Status Surat | High |
| F-06 | Notifikasi Otomatis | High |
| F-07 | Pencarian dan Filter Surat | Medium |
| F-08 | Timeline Surat | Medium |
| F-09 | Dashboard Monitoring | High |
| F-10 | Laporan Rekapitulasi | Medium |
| F-11 | Pelacakan Posisi Real-time | High |
| F-12 | Pelacakan Publik | High |
| F-13 | Komentar | Medium |
| F-14 | Pencarian Lanjutan | Medium |
| F-15 | Audit Log | Medium |
| F-16 | Export Laporan PDF | Medium |

---

# 9. OPEN QUESTIONS

- *Belum ada pertanyaan terbuka saat ini.*

---

# 10. FUTURE CONSIDERATIONS

- Pengembangan fitur surat keluar (Out of Scope saat ini).
- Integrasi dengan sistem email sekolah untuk notifikasi otomatis via email.
- Fitur forgot password dengan email reset.
- Fitur mobile native (Android/iOS).
- Integrasi dengan sistem informasi akademik sekolah.
- Fitur AI untuk klasifikasi otomatis surat masuk.

---

# 11. REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 1.2 | 2026-07-16 | System Analyst AI | F-10: Tambahkan perilaku otomatis rentang tanggal saat periode dipilih (harian = hari ini, mingguan = 7 hari terakhir, bulanan = 30 hari terakhir). |
| 1.1 | 2026-07-12 | System Analyst AI | Fixed Export PDF permission: Kepala Sekolah juga dapat mengunduh PDF (sesuai BR-09). |
| 1.0 | 2026-06-28 | System Analyst AI | Initial Draft (Dokumen Dasar SoT-1). |
