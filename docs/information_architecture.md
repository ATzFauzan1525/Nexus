# information_architecture.md — Arsitektur Informasi
# SiDis: Sistem Informasi Disposisi dan Pelacakan Surat Digital

---

## 1. Global Layout

Seluruh halaman yang memerlukan autentikasi (Authenticated) menggunakan layout berikut:

```
┌─────────────────────────────────────────────────────┐
│  TOPBAR: Logo SiDis | Nama Pengguna | Koneksi 🔵 | Notifikasi 🔔 | Logout │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│   SIDEBAR    │         KONTEN UTAMA                 │
│   (kiri)     │         (tengah-kanan)               │
│              │                                      │
│  - Dashboard │                                      │
│  - Surat     │                                      │
│  - Disposisi │                                      │
│  - Laporan   │                                      │
│  - Audit Log │                                      │
│  - Pengguna  │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

- **Topbar** selalu tampil di atas, berwarna biru (`#1D4ED8`), berisi: logo, nama dan role pengguna yang sedang login, indikator koneksi WebSocket, ikon notifikasi dengan badge jumlah notifikasi belum dibaca, dan tombol logout.
- **Sidebar** di sisi kiri berisi menu navigasi yang disesuaikan berdasarkan role pengguna.
- **Konten Utama** mengisi area tengah-kanan, menampilkan halaman aktif.

Halaman tanpa autentikasi (Unauthenticated) hanya menampilkan satu kolom terpusat tanpa Sidebar dan Topbar.

### Layout Khusus: Halaman Publik `/lacak`

Halaman `/lacak` menggunakan layout publik tersendiri yang berbeda dari `/login`:

```
┌─────────────────────────────────────────┐
│   HEADER PUBLIK: Logo SiDis + Nama Sekolah │
├─────────────────────────────────────────┤
│                                           │
│   [ Input: Nomor Surat ]  [Cek Status]   │
│                                           │
│   ┌───────────────────────────────────┐ │
│   │  Hasil Pelacakan (jika ditemukan):  │ │
│   │  - Status: Selesai                  │ │
│   │  - Posisi saat ini: Selesai Diproses│ │
│   │  - Indikator realtime (Live)        │ │
│   │  - Alur Surat (stepper visual)      │ │
│   └───────────────────────────────────┘ │
│                                           │
│   FOOTER: Hak Cipta Dilindungi           │
└─────────────────────────────────────────┘
```

- Tidak ada Sidebar maupun menu navigasi internal.
- Tampilan minimal, fokus pada satu aksi: input nomor surat → lihat status + alur.
- Halaman ini dapat diakses dan dibagikan sebagai link publik (misal dicantumkan pada tanda terima fisik surat).

---

## 2. Route Map

### Unauthenticated Routes

| URL | Nama Halaman | Deskripsi | Akses |
|---|---|---|---|
| `/` | Redirect | Redirect ke `/login` jika belum login, `/dashboard` jika sudah | Semua |
| `/login` | Halaman Login | Form login username & password | Semua (belum login) |
| `/lacak` | Lacak Surat (Publik) | Halaman publik mirip "lacak paket": pengirim eksternal memasukkan nomor surat untuk melihat status, posisi unit, dan alur surat secara realtime, tanpa login. | Publik (tanpa login) |

### Authenticated Routes — Semua Role

| URL | Nama Halaman | Deskripsi | Akses Role |
|---|---|---|---|
| `/dashboard` | Dashboard Utama | Ringkasan statistik surat + Posisi Surat (live) | Semua role |
| `/notifications` | Notifikasi | Daftar seluruh notifikasi masuk milik pengguna, tandai dibaca | Semua role |

### Authenticated Routes — Admin TU

| URL | Nama Halaman | Deskripsi | Akses Role |
|---|---|---|---|
| `/surat` | Daftar Surat Masuk | Tabel semua surat masuk dengan pencarian lanjutan (tanggal, pengirim, perihal, status) | Admin TU |
| `/surat/tambah` | Input Surat Masuk | Form input surat masuk baru + unggah file scan ke database | Admin TU |
| `/surat/:id` | Detail Surat | Detail surat + timeline riwayat status + download file scan + komentar | Admin TU, Kepala Sekolah, Wakasek, Guru/Staf |
| `/laporan` | Laporan Rekapitulasi | Generate & download laporan surat per periode sebagai PDF | Admin TU |
| `/audit-log` | Audit Log | Daftar semua perubahan sistem (siapa, kapan, ubah apa) | Admin TU, Kepala Sekolah |
| `/pengguna` | Manajemen Pengguna | Tabel daftar akun pengguna internal | Admin TU |
| `/pengguna/tambah` | Tambah Pengguna | Form tambah akun pengguna baru | Admin TU |
| `/pengguna/:id/edit` | Edit Pengguna | Form ubah data akun pengguna | Admin TU |

### Authenticated Routes — Kepala Sekolah

| URL | Nama Halaman | Deskripsi | Akses Role |
|---|---|---|---|
| `/surat` | Daftar Surat Masuk | Tabel semua surat masuk dengan pencarian lanjutan | Kepala Sekolah |
| `/surat/:id` | Detail Surat | Detail surat + tombol buat disposisi + komentar | Kepala Sekolah |
| `/disposisi/buat/:idSurat` | Buat Disposisi | Form disposisi: pilih penerima, instruksi, deadline | Kepala Sekolah |
| `/disposisi` | Disposisi | Surat belum didisposisi + statistik (Total, Dalam Proses, Selesai, Overdue) | Kepala Sekolah |
| `/disposisi/riwayat` | Riwayat Disposisi | Daftar semua disposisi + statistik | Kepala Sekolah |
| `/disposisi/:id` | Detail Disposisi | Detail instruksi disposisi + download file scan + komentar | Kepala Sekolah |
| `/audit-log` | Audit Log | Daftar semua perubahan sistem | Kepala Sekolah |

### Authenticated Routes — Guru / Staf

| URL | Nama Halaman | Deskripsi | Akses Role |
|---|---|---|---|
| `/disposisi/saya` | Disposisi Saya | Daftar disposisi yang diterima + tombol aksi (Tindak Lanjut / Selesai) | Guru / Staf |
| `/disposisi/:id` | Detail Disposisi | Detail instruksi disposisi + download file scan + komentar + tombol update status | Guru / Staf |
| `/surat/:id` | Detail Surat | Detail surat + komentar (read-only) | Guru / Staf |

### Authenticated Routes — Wakil Kepala Sekolah

| URL | Nama Halaman | Deskripsi | Akses Role |
|---|---|---|---|
| `/surat` | Daftar Surat Masuk | Tabel surat masuk yang relevan dengan bidangnya + pencarian lanjutan | Wakasek |
| `/surat/:id` | Detail Surat | Detail surat + timeline (read-only) | Wakasek |
| `/disposisi/bidang` | Disposisi Bidang | Daftar disposisi yang berkaitan dengan bidang Wakasek | Wakasek |

---

## 3. Navigasi Sidebar per Role

### Admin TU
```
📊 Dashboard
📬 Surat Masuk
  └─ Daftar Surat
  └─ Input Surat Baru
📋 Laporan
📜 Audit Log
👤 Manajemen Pengguna
```

### Kepala Sekolah
```
📊 Dashboard
📬 Surat Masuk
  └─ Daftar Surat
📤 Disposisi
  └─ Disposisi
  └─ Riwayat Disposisi
📜 Audit Log
```

### Guru / Staf
```
📊 Dashboard
📥 Disposisi Saya
```

### Wakil Kepala Sekolah
```
📊 Dashboard
📬 Surat Masuk (Bidang Saya)
📤 Disposisi Bidang
```

---

## 4. Hierarki Objek Data

```
Pengguna
├── membuat → SuratMasuk
│              ├── composition → Disposisi
│              │                 └── trigger → Notifikasi (ke penerima)
│              ├── aggregation → StatusSurat (timeline)
│              │                 └── trigger → Notifikasi (ke Kepala Sekolah)
│              ├── composition → Komentar (diskusi tim)
│              └── digunakan oleh → Laporan
├── menghasilkan → AuditLog (pencatatan perubahan)
```

### Koneksi Database (Neon Cloud PostgreSQL)

```
DATABASE_URL=postgresql://neondb_owner:npg_2CZDJquplAk1@ep-cold-sound-ao6ukhv2-pooler.c-2.ap-southeast-1.aws.neon.tech/SiDs?sslmode=require&channel_binding=require
```

- **Provider:** Neon (Cloud PostgreSQL)
- **Connection:** via `DATABASE_URL` environment variable di `.env`
- **SSL:** wajib (`sslmode=require`)
- **Inisialisasi:** `npm run db:init` (DROP semua tabel lalu CREATE baru + seed data)

> **⚠ PERINGATAN: `npm run db:init` akan MENGHAPUS SEMUA DATA di Neon Cloud PostgreSQL. Jangan jalankan kecuali benar-benar diperlukan. Data bersifat persisten dan tidak bisa dikembalikan.**

### Nama Tabel Database (Neon PostgreSQL)

| Nama Tabel | Keterangan |
|---|---|
| `pengguna` | Data akun pengguna (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek) |
| `surat_masuk` | Data surat masuk beserta file scan (BYTEA) |
| `disposisi` | Data disposisi surat dari Kepala Sekolah ke Guru/Staf |
| `status_surat` | Riwayat perubahan status surat (event sourcing) |
| `komentar` | Komentar/catatan diskusi pada surat |
| `audit_log` | Pencatatan otomatis semua perubahan data |
| `notifikasi` | Notifikasi internal untuk pengguna |

---

## 5. WebSocket Event Channels (Realtime Sync)

Sesuai BR-14, BR-15, dan NF-08 di srs.md, sistem menggunakan koneksi WebSocket (Socket.io) yang aktif selama pengguna login, untuk mendorong update data secara realtime. Berikut event yang dipertukarkan:

| Event Name | Dipicu Saat | Dikirim ke (Room/Target) | Payload |
|---|---|---|---|
| `surat:baru` | Admin TU berhasil input surat masuk (UC-002) | Room `role:KEPALA_SEKOLAH` | Object SuratMasuk lengkap |
| `disposisi:baru` | Kepala Sekolah membuat disposisi (UC-003) | Room `user:{idPenerima}` (Guru/Staf terkait) | Object Disposisi lengkap |
| `status:update` | Guru/Staf update status surat (UC-004) | Room `role:KEPALA_SEKOLAH`, room `user:{idAdminTU}` (jika relevan), dan room `role:WAKASEK_BIDANG:{bidang}` | Object StatusSurat baru + status SuratMasuk terbaru |
| `notifikasi:baru` | Setiap kali entri Notifikasi baru dibuat (mengikuti event di atas) | Room `user:{idPenerima}` | Object Notifikasi |
| `dashboard:refresh` | Setiap kali terjadi perubahan yang mempengaruhi agregat dashboard (surat baru/status berubah) | Room `role:KEPALA_SEKOLAH`, room `role:WAKASEK` | Ringkasan angka dashboard terbaru |
| `lacak:update` | Status surat berubah (UC-004) atau surat didisposisi (UC-003) | Room publik `lacak:{nomorSurat}` | `{ status, posisiSaatIni }` — **tanpa** data sensitif lain |

### Aturan Khusus Room Publik `/lacak`

- Klien `/lacak` **tidak login**, sehingga tidak bergabung ke room `user:{id}` atau `role:{peran}` manapun.
- Saat pengirim eksternal berhasil mencari nomor surat yang valid, klien bergabung sementara ke room `lacak:{nomorSurat}` agar menerima update `lacak:update` secara realtime selama halaman tersebut terbuka (BR-16, BR-17).
- Room ini hanya memancarkan payload terbatas: `status` dan `posisiSaatIni` — server **wajib memfilter** field sensitif (file scan, instruksi, catatan tindak lanjut, nama Guru/Staf) sebelum broadcast ke room publik ini.

### Aturan Room/Channel

- Setiap klien yang login bergabung otomatis ke room `user:{idPengguna}` (notifikasi personal) dan `role:{peran}` (broadcast sesuai role).
- Wakil Kepala Sekolah bergabung ke room tambahan `role:WAKASEK_BIDANG:{bidang}` sesuai bidang tugasnya (Kurikulum, Kesiswaan, Sarana Prasarana, Humas — tidak ada Wakasek Keuangan), agar hanya menerima update surat/disposisi yang relevan dengan bidangnya (BR-10).
- Saat koneksi WebSocket terputus dan tersambung kembali (NF-09), klien wajib memanggil ulang REST API terkait halaman yang sedang aktif untuk menyamakan data (resync), bukan hanya mengandalkan event yang mungkin terlewat saat offline.

### Indikator Visual Realtime di UI

- Setiap halaman yang menampilkan data live (tabel `/surat`, `/dashboard`, dropdown notifikasi) menampilkan indikator kecil status koneksi: titik hijau ("Tersinkron") atau titik abu-abu/oranye ("Menyambungkan ulang...") di Topbar.
- Saat data baru diterima via WebSocket dan halaman sedang terbuka, baris/kartu terkait diberi efek highlight sesaat (transisi warna) agar pengguna sadar ada perubahan tanpa harus refresh manual.

---

## 6. API Endpoints

### Auth
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| POST | `/api/auth/login` | Login pengguna | Publik |
| GET | `/api/auth/profile` | Dapatkan profil pengguna yang sedang login | Semua role |

### Surat Masuk
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/api/surat` | Daftar surat dengan filter & pencarian | Semua role |
| GET | `/api/surat/stats` | Statistik dashboard | Semua role |
| GET | `/api/surat/posisi` | Posisi surat (live table) | Admin, Kepala, Wakasek |
| GET | `/api/surat/:id` | Detail surat + timeline + disposisi | Semua role |
| GET | `/api/surat/:id/download` | Download file scan dari database | Semua role |
| POST | `/api/surat` | Input surat masuk baru | Admin TU |

### Disposisi
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/api/disposisi` | Daftar disposisi | Semua role |
| GET | `/api/disposisi/riwayat` | Riwayat disposisi (Kepala) | Kepala Sekolah |
| GET | `/api/disposisi/:id` | Detail disposisi | Semua role |
| POST | `/api/disposisi` | Buat disposisi baru | Kepala Sekolah |

### Status
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| POST | `/api/status` | Update status surat | Guru/Staf |

### Komentar
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/api/surat/:suratId/komentar` | Ambil komentar surat | Semua role |
| POST | `/api/surat/:suratId/komentar` | Tambah komentar | Semua role |
| DELETE | `/api/surat/:suratId/komentar/:id` | Hapus komentar | Penulis / Admin / Kepala |

### Notifikasi
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/api/notifikasi` | Daftar notifikasi | Semua role |
| GET | `/api/notifikasi/unread-count` | Jumlah notifikasi belum dibaca | Semua role |
| PUT | `/api/notifikasi/:id/read` | Tandai notifikasi dibaca | Semua role |
| PUT | `/api/notifikasi/read-all` | Tandai semua notifikasi dibaca | Semua role |

### Laporan
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| POST | `/api/laporan/generate` | Generate data laporan | Admin TU |
| GET | `/api/laporan/pdf` | Download laporan sebagai PDF | Admin TU |

### Audit Log
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/api/audit-log` | Daftar audit log | Admin TU, Kepala Sekolah |

### Pengguna
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/api/pengguna` | Daftar pengguna | Admin TU |
| GET | `/api/pengguna/guru-staf` | Daftar Guru/Staf (untuk dropdown) | Semua role |
| POST | `/api/pengguna` | Tambah pengguna baru | Admin TU |
| PUT | `/api/pengguna/:id` | Update data pengguna | Admin TU |
| DELETE | `/api/pengguna/:id` | Hapus pengguna | Admin TU |

### Public
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/api/public/lacak` | Lacak status surat publik (dengan timeline + role) | Publik (tanpa login) |
