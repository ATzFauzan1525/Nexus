# srs.md — Software Requirements Specification
# SiDis: Sistem Informasi Disposisi dan Pelacakan Surat Digital
# SMP Muhammadiyah 9 Yogyakarta

---

## 1. Tujuan Sistem

SiDis adalah aplikasi web yang berfungsi sebagai platform terpusat untuk mengelola seluruh alur persuratan di SMP Muhammadiyah 9 Yogyakarta secara digital. Sistem ini menggantikan proses manual berbasis buku agenda fisik dan komunikasi via WhatsApp antar staf, dengan alur yang terstruktur, terlacak, dan transparan — mengadopsi konsep pelacakan mirip status pengiriman paket, namun diterapkan pada konteks administrasi surat sekolah.

Masalah utama yang diselesaikan sistem ini adalah: tidak adanya transparansi posisi surat secara real-time, disposisi yang tidak terdokumentasi, keterlambatan tindak lanjut akibat tidak ada notifikasi terpusat, dan tingginya ketergantungan pada Staf TU sebagai pusat informasi manual seluruh pihak.

---

## 2. Akun Pengguna & Role

| Role | Username | Password | Nama Lengkap | Bidang | Keterangan |
|---|---|---|---|---|---|
| ADMIN_TU | admin | admin123 | Admin TU | - | Akun default, tidak bisa dihapus |
| KEPALA_SEKOLAH | kepala | kepala123 | Kepala Sekolah | - | Akun default |
| GURU_STAF | guru1 | guru123 | Guru Kurikulum | Kurikulum | |
| GURU_STAF | guru2 | guru123 | Guru Kesiswaan | Kesiswaan | |
| GURU_STAF | guru3 | guru123 | Guru SaranaPrasarana | SaranaPrasarana | |
| GURU_STAF | guru4 | guru123 | Guru Humas | Humas | |
| GURU_STAF | guru5 | guru123 | Bendahara | Keuangan | Guru/Bendahara di bidang Keuangan |
| WAKASEK | wakasek1 | wakasek123 | Wakasek Kurikulum | Kurikulum | |
| WAKASEK | wakasek2 | wakasek123 | Wakasek Kesiswaan | Kesiswaan | |
| WAKASEK | wakasek3 | wakasek123 | Wakasek SaranaPrasarana | SaranaPrasarana | |
| WAKASEK | wakasek4 | wakasek123 | Wakasek Humas | Humas | |


---

## 3. Aktor Pengguna

| Aktor | Peran | Klasifikasi |
|---|---|---|
| Admin TU | Menginput surat masuk, mengelola akun pengguna, melihat laporan & audit log | Primary Actor |
| Kepala Sekolah | Membuat disposisi digital, memantau status surat via dashboard, melihat laporan & audit log | Primary Actor |
| Guru / Staf | Menerima disposisi, menindaklanjuti surat, memperbarui status penyelesaian. Terdiri dari 5 bidang: Kurikulum, Kesiswaan, Sarana Prasarana, Humas, dan Keuangan (Bendahara) | Primary Actor |
| Wakil Kepala Sekolah | Memantau surat sesuai bidang, menerima notifikasi disposisi. Terdiri dari 4 bidang: Kurikulum, Kesiswaan, Sarana Prasarana, Humas (tidak ada Wakasek Keuangan) | Secondary Actor |
| Pengirim Surat Eksternal | Melacak posisi/status suratnya sendiri menggunakan nomor surat, tanpa login | External Actor (Public, Read-Only) |

---

## 4. Tech Stack

| Layer | Teknologi | Keterangan |
|---|---|---|
| Frontend | React 18 + Vite | Library UI + build tool & dev server, tanpa SSR/SSG |
| Backend | Express.js | REST API server |
| Realtime Sync | Socket.io (WebSocket) | Mendorong (push) update data secara realtime ke seluruh aktor yang terhubung tanpa perlu refresh manual |
| Database | Neon (Cloud PostgreSQL) | Serverless PostgreSQL managed via connection string `DATABASE_URL`, SSL connection |
| File Storage | Neon DB (BYTEA) | File scan surat disimpan langsung di database sebagai kolom `file_data` (BYTEA) + `file_mime` |
| Authentication | JWT (JSON Web Token) | Token-based auth per sesi, juga digunakan untuk autentikasi koneksi WebSocket |
| Styling | Tailwind CSS | Utility-first CSS framework |
| PDF Generation | pdfkit | Generate laporan rekapitulasi dalam format PDF |

**Koneksi Database (Neon):**
```
postgresql://neondb_owner:npg_2CZDJquplAk1@ep-cold-sound-ao6ukhv2-pooler.c-2.ap-southeast-1.aws.neon.tech/SiDs?sslmode=require&channel_binding=require
```

Sistem **hanya dapat diakses melalui browser desktop/laptop** (Chrome diutamakan). Tidak dikembangkan sebagai aplikasi mobile native.

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

### Catatan Multi-Aktor & Realtime

Sistem **wajib bersifat multi-user dan tersinkronisasi secara realtime**. Seluruh aktor (Admin TU, Kepala Sekolah, Guru/Staf, Wakil Kepala Sekolah) mengakses **data yang sama dari satu basis data terpusat (Neon PostgreSQL)** melalui REST API, sehingga tidak ada duplikasi atau data yang berbeda antar perangkat. Setiap perubahan data (surat baru, disposisi baru, perubahan status, notifikasi) yang dilakukan oleh satu aktor harus segera terlihat oleh aktor lain yang relevan **tanpa perlu me-refresh halaman**, menggunakan koneksi WebSocket (Socket.io). Lihat Business Rule **BR-14** dan **BR-15** di bawah untuk ketentuan detail.

**Hak Akses Data per Role:**
- **Admin TU**: Melihat semua surat masuk, semua disposisi, semua pengguna, laporan, dan audit log.
- **Kepala Sekolah**: Melihat semua surat masuk, semua disposisi yang dibuatnya, laporan, dan audit log.
- **Wakasek**: Melihat surat dan disposisi yang berhubungan dengan bidangnya (Kurikulum, Kesiswaan, Sarana Prasarana, Humas).
- **Guru/Staf**: Hanya melihat surat yang didisposisikan kepadanya (via tabel `disposisi`, kolom `diberikan_kepada`). Tidak dapat melihat seluruh surat masuk (BR-11).

---

## 5. Database Schema (Neon PostgreSQL)

### Tabel `pengguna`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| username | VARCHAR(50) UNIQUE | Username login |
| password | VARCHAR(255) | Hashed password (bcrypt) |
| nama_lengkap | VARCHAR(100) | Nama lengkap pengguna |
| role | ENUM | `ADMIN_TU`, `KEPALA_SEKOLAH`, `GURU_STAF`, `WAKASEK` |
| bidang | ENUM | `Kurikulum`, `Kesiswaan`, `SaranaPrasarana`, `Humas`, `Keuangan` |
| is_active | BOOLEAN | Status aktif (default: true) |
| created_at | TIMESTAMP | Waktu pembuatan |
| updated_at | TIMESTAMP | Waktu update terakhir |

### Tabel `surat_masuk`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| nomor_surat | VARCHAR(50) UNIQUE | Nomor surat (wajib unik) |
| tanggal_diterima | DATE | Tanggal surat diterima |
| pengirim | VARCHAR(200) | Nama pengirim surat |
| perihal | VARCHAR(300) | Perihal/subject surat |
| file_scan | VARCHAR(500) | Nama file asli (untuk referensi) |
| file_data | BYTEA | Data file scan (PDF/JPG/PNG) disimpan di DB |
| file_mime | VARCHAR(50) | MIME type file (application/pdf, image/jpeg, image/png) |
| status | ENUM | `Diterima`, `Didisposisi`, `Diproses`, `Selesai` |
| created_by | UUID (FK) | ID pengguna yang membuat |
| created_at | TIMESTAMP | Waktu pembuatan |
| updated_at | TIMESTAMP | Waktu update terakhir |

### Tabel `disposisi`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| surat_id | UUID (FK) | ID surat masuk terkait |
| diberikan_oleh | UUID (FK) | ID Kepala Sekolah yang membuat disposisi |
| diberikan_kepada | UUID (FK) | ID Guru/Staf penerima disposisi |
| instruksi | TEXT | Instruksi tindak lanjut |
| deadline | DATE | Batas waktu penyelesaian |
| created_at | TIMESTAMP | Waktu pembuatan |

### Tabel `status_surat`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| surat_id | UUID (FK) | ID surat masuk terkait |
| status | ENUM | Status surat saat perubahan |
| catatan | TEXT | Catatan perubahan (opsional) |
| diubah_oleh | UUID (FK) | ID pengguna yang mengubah |
| created_at | TIMESTAMP | Waktu perubahan |

### Tabel `komentar`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| surat_id | UUID (FK) | ID surat masuk terkait |
| user_id | UUID (FK) | ID pengguna yang menulis komentar |
| isi | TEXT | Isi komentar |
| created_at | TIMESTAMP | Waktu pembuatan |

### Tabel `audit_log`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | ID pengguna yang melakukan aksi |
| aksi | VARCHAR(100) | Jenis aksi (CREATE, UPDATE_STATUS, DELETE) |
| entitas | VARCHAR(50) | Nama tabel yang terpengaruh (surat_masuk, disposisi, pengguna) |
| entitas_id | UUID | ID record yang terpengaruh |
| detail | TEXT | Deskripsi perubahan |
| ip_address | VARCHAR(50) | IP address pengguna |
| created_at | TIMESTAMP | Waktu aksi |

### Tabel `notifikasi`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | ID penerima notifikasi |
| judul | VARCHAR(200) | Judul notifikasi |
| pesan | TEXT | Isi pesan notifikasi |
| tipe | VARCHAR(50) | Jenis notifikasi (surat_baru, disposisi_baru, status_update) |
| reference_id | UUID | ID record terkait |
| dibaca | BOOLEAN | Status sudah dibaca (default: false) |
| created_at | TIMESTAMP | Waktu pembuatan |

---

## 6. In-Scope Features (Fitur yang Wajib Dibuat)

- **F-01** Login dan logout berbasis role untuk semua aktor internal
- **F-02** Manajemen akun pengguna oleh Admin TU (tambah, ubah, hapus akun)
- **F-03** Input surat masuk beserta metadata lengkap dan unggah file scan (PDF/gambar) — file disimpan di database Neon sebagai BYTEA
- **F-04** Disposisi digital oleh Kepala Sekolah: memilih penerima, menambah instruksi, menetapkan deadline
- **F-05** Update status surat oleh Guru/Staf: `Tindak Lanjut` (Didisposisi → Diproses) dan `Selesai` (Diproses → Selesai)
- **F-06** Notifikasi otomatis internal: saat ada surat masuk baru, disposisi baru, dan perubahan status
- **F-07** Pencarian dan filter surat berdasarkan nomor, tanggal, pengirim, perihal, dan status — dengan auto-search on keystroke
- **F-08** Timeline/riwayat lengkap alur surat dari diterima hingga selesai
- **F-09** Dashboard monitoring untuk semua aktor: Admin TU/Kepala Sekolah melihat statistik global + Posisi Surat, Wakasek melihat Posisi Surat bidang, Guru/Staf melihat statistik disposisi yang ditujukan kepadanya
- **F-10** Laporan rekapitulasi surat masuk per periode (harian/mingguan/bulanan) — dapat diunduh sebagai PDF
- **F-11** Pelacakan posisi terkini surat secara real-time (di TU / di Kepala Sekolah / sudah didisposisi ke siapa)
- **F-12** Halaman pelacakan publik (`/lacak`) tanpa login: pengirim eksternal memasukkan nomor surat dan melihat status + posisi unit yang sedang menangani secara realtime, mirip melacak paket. Menampilkan **Alur Surat** (stepper visual) dan nama role (bukan nama orang)
- **F-13** Komentar/Catatan pada detail surat: pengguna internal dapat menambah komentar untuk diskusi tim
- **F-14** Pencarian Lanjutan: filter tanggal mulai/akhir, pengirim, perihal di halaman Daftar Surat
- **F-15** Audit Log: pencatatan otomatis semua perubahan (siapa, kapan, ubah apa) — hanya dapat dilihat oleh Admin TU dan Kepala Sekolah
- **F-16** Export Laporan PDF: generate laporan rekapitulasi dalam format PDF untuk diunduh

---

## 7. Out-of-Scope Features (Fitur yang Dilarang Dibuat)

- Sistem **tidak** mengelola surat keluar — hanya surat masuk
- Pengirim eksternal **tidak** dapat membuat akun atau login ke sistem
- Sistem **tidak** terintegrasi dengan sistem informasi akademik sekolah yang sudah ada
- Sistem **tidak** memiliki fitur email atau pengiriman surat digital keluar
- Sistem **tidak** menggunakan kecerdasan buatan (AI) atau machine learning
- Sistem **tidak** dikembangkan sebagai aplikasi mobile native (Android/iOS)
- Sistem **tidak** memiliki fitur forgot password — reset password hanya dilakukan oleh Admin TU
- Sistem **tidak** terintegrasi dengan payment gateway atau sistem pembayaran apapun

---

## 8. Business Rules

| Kode | Aturan Bisnis |
|---|---|
| BR-01 | Setiap pengguna wajib login menggunakan username dan password sebelum mengakses sistem. Pesan error jika gagal: "Password atau email salah". |
| BR-02 | Akun pengguna hanya dapat dibuat oleh Admin TU — tidak ada fitur registrasi publik. |
| BR-03 | Status surat hanya boleh berubah mengikuti urutan alur: `Diterima` → `Didisposisi` → `Diproses` → `Selesai`. Status tidak boleh melompat atau mundur. |
| BR-04 | Disposisi hanya dapat dibuat oleh Kepala Sekolah dan harus menyertakan: penerima, instruksi, dan deadline. |
| BR-05 | Satu surat masuk dapat memiliki lebih dari satu disposisi (disposisi ke banyak penerima). |
| BR-06 | Notifikasi otomatis dikirim ke Kepala Sekolah setiap ada surat masuk baru yang diinput Admin TU. |
| BR-07 | Notifikasi otomatis dikirim ke Guru/Staf setiap ada disposisi baru yang ditujukan kepadanya. |
| BR-08 | Setiap perubahan status surat harus tercatat sebagai entri baru di tabel `status_surat` (event sourcing) untuk membentuk timeline audit. |
| BR-09 | Laporan rekapitulasi hanya dapat diakses oleh Admin TU dan Kepala Sekolah. |
| BR-10 | Wakil Kepala Sekolah hanya dapat melihat surat yang berhubungan dengan bidangnya (Kurikulum, Kesiswaan, Sarana Prasarana, Humas). Bidang Keuangan tidak memiliki Wakasek. |
| BR-11 | Guru/Staf hanya dapat melihat surat yang didisposisikan kepadanya (via tabel `disposisi`). Guru/Staf tidak dapat melihat seluruh surat masuk — hanya surat yang memiliki disposisi dengan `diberikan_kepada` sesuai ID pengguna yang bersangkutan. |
| BR-12 | File scan surat yang diunggah hanya boleh berformat PDF atau gambar (JPG/PNG). Maksimal 10MB. |
| BR-13 | Surat yang sudah berstatus `Selesai` tidak dapat diubah statusnya kembali. |
| BR-14 | Seluruh aktor yang sedang login mengakses **basis data terpusat yang sama (Neon PostgreSQL)**. Tidak boleh ada penyimpanan data lokal per-perangkat (misal localStorage) yang menjadi sumber kebenaran utama — localStorage hanya boleh dipakai untuk menyimpan token sesi, bukan data surat/disposisi/status. |
| BR-15 | Setiap perubahan data yang relevan (surat masuk baru, disposisi baru, perubahan status surat, notifikasi baru) **wajib didorong (push) secara realtime via WebSocket** ke seluruh klien aktor yang berwenang melihat data tersebut, tanpa memerlukan refresh manual oleh pengguna. |
| BR-16 | Pelacakan publik (`/lacak`) hanya dapat diakses menggunakan **nomorSurat** yang valid dan harus bersifat **read-only**. Endpoint ini tidak boleh mengembalikan data sensitif (file scan, instruksi disposisi, nama lengkap penerima disposisi, catatan tindak lanjut) — hanya **status surat**, **posisi/unit yang sedang menangani**, **alur surat (timeline)**, dan **nama role** (bukan nama orang). |
| BR-17 | Endpoint pelacakan publik **tidak memerlukan JWT/login**, namun tetap harus dibatasi rate-limit per IP untuk mencegah penyalahgunaan (brute-force menebak nomor surat). |
| BR-18 | Komentar pada surat hanya dapat dihapus oleh penulis komentar itu sendiri, Admin TU, atau Kepala Sekolah. |
| BR-19 | Audit Log hanya dapat dilihat oleh Admin TU dan Kepala Sekolah. Data yang dicatat meliputi: create surat, create disposisi, dan update status. |
| BR-20 | File scan surat disimpan sebagai BYTEA di database Neon (bukan di filesystem lokal). File dapat diunduh melalui endpoint `/api/surat/:id/download` dengan autentikasi JWT. |
| BR-21 | Input nomor surat akan di-trim spasi di depan dan belakang sebelum disimpan untuk mencegah masalah pencarian. |

---

## 9. Kebutuhan Non-Fungsional

| Kode | Kategori | Ketentuan |
|---|---|---|
| NF-01 | Performance | Sistem harus menampilkan data surat dan dashboard dalam waktu ≤ 5 detik |
| NF-02 | Security | Sistem menggunakan autentikasi JWT dan otorisasi berbasis role, termasuk pada koneksi WebSocket |
| NF-03 | Usability | Antarmuka harus dapat digunakan oleh pengguna non-teknis (staf TU dan guru) |
| NF-04 | Reliability | Sistem harus melakukan backup data secara berkala |
| NF-05 | Compatibility | Sistem harus dapat diakses melalui browser Chrome pada perangkat desktop/laptop |
| NF-06 | Availability | Sistem harus memiliki tingkat ketersediaan minimal 95% |
| NF-07 | Authorization | Data surat hanya dapat diakses oleh pengguna yang berwenang sesuai role-nya |
| NF-08 | Realtime Sync | Update data (surat/disposisi/status/notifikasi) harus diterima klien dalam waktu ≤ 2 detik sejak perubahan terjadi di server, melalui koneksi WebSocket |
| NF-09 | Resilience | Jika koneksi WebSocket terputus, klien harus otomatis mencoba menyambung kembali (auto-reconnect) dan menyinkronkan ulang data terbaru dari server saat koneksi pulih |
| NF-10 | Concurrency | Sistem harus dapat menangani minimal 20 koneksi pengguna aktif secara bersamaan tanpa penurunan performa signifikan |
