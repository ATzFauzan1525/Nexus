# SiDis — Sistem Informasi Disposisi dan Pelacakan Surat Digital

Sistem informasi persuratan digital untuk mendigitalisasi proses pencatatan surat masuk, disposisi, pelacakan status, dan notifikasi otomatis di SMP Muhammadiyah 9 Yogyakarta.

## Anggota Tim

| Nama                   | NIM        | Peran                                 |
|------------------------|------------|---------------------------------------|
| Ahmad Fauzan           | 2400016068 | Project Manager, Backend Developer    |
| Abdul Hakim            | 2400016015 | Backend Developer                     |
| Neil Melikah Fitri SUM | 2400016095 | Frontend Developer                    |
| Suci Sulistyowati      | 2415016102 | UI/UX Designer and Frontend Developer |
| Denta Wijaya           | 2400016103 | Database Engineer                     |

## Tech Stack

- **Backend:** Express.js, Neon PostgreSQL, Socket.io, JWT Authentication
- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Socket.io-client
- **Realtime:** Socket.io (WebSocket) untuk update status, disposisi, notifikasi, dan pelacakan surat
- **Database:** Neon (Cloud PostgreSQL) — tidak perlu install PostgreSQL lokal

## Prerequisites

- Node.js ≥ 18
- npm

## Database Connection

- Menggunakan **Neon (Cloud PostgreSQL)** — tidak perlu install PostgreSQL lokal
- File scan surat disimpan sebagai BYTEA langsung di database (bukan di filesystem lokal)
- Lihat `docs/srs.md` untuk detail `DATABASE_URL` dan konfigurasi database

## Project Structure

```
SiDis/
├── docs/                      # Documentation (SoT)
│   ├── srs.md                 # Software Requirement Specification
│   ├── information_architecture.md
│   ├── design_system.md
│   ├── data_model.md
│   ├── analisis_kebutuhan/    # Dokumen Analisis Kebutuhan
│   ├── data_observasi/        # Data wawancara & observasi
│   ├── user_flows/            # 16 use case flows
│   └── system_logics/         # 16 UCIC files
├── public/                    # Static assets
│   └── logo.png               # Logo aplikasi
├── scripts/                   # Utility scripts
│   └── kill-port.js           # Cross-platform port killer
├── server/                    # Backend (Express + Socket.io)
│   ├── config/                # DB config, init, migrate
│   ├── controllers/           # Route handlers
│   ├── helpers/               # Audit log helper
│   ├── middleware/             # Auth, upload
│   ├── routes/                # API routes
│   └── socket/                # Socket.io server
├── src/                       # Frontend (React + Vite)
│   ├── pages/                 # Page components (18 pages)
│   ├── components/            # UI components
│   ├── context/               # Auth context + WebSocket
│   └── lib/                   # API client
├── .env                       # Config (DATABASE_URL, JWT_SECRET)
├── server.js                  # Unified entry point
├── package.json
└── vercel.json                # Vercel SPA config
```

## Setup

```bash
# 1. Clone repo
git clone https://github.com/ATzFauzan1525/Nexus.git
cd Nexus

# 2. Install dependencies
npm install

# 3. Buat file .env (lihat srs.md untuk isi DATABASE_URL)
#    - macOS/Linux:
echo "DATABASE_URL=..." > .env
echo "JWT_SECRET=sidis-secret-key-2026" >> .env
echo "PORT=3000" >> .env
#    - Windows (PowerShell):
@"
DATABASE_URL=...
JWT_SECRET=sidis-secret-key-2026
PORT=3000
"@ | Out-File -FilePath .env -Encoding utf8 -NoNewline

# 4. Jalankan (satu command, satu port!)
npm run dev
```

> **⚠ `.env` tidak di-commit ke GitHub.** Setiap developer harus buat manual. Lihat `docs/srs.md` untuk isi `DATABASE_URL` yang benar.

> **⚠ PERINGATAN: Karena menggunakan Neon (Cloud PostgreSQL), `npm run db:init` akan MENGHAPUS SEMUA DATA yang sudah ada di database. Jangan jalankan perintah ini kecuali benar-benar diperlukan (misalnya saat pertama kali setup atau saat schema berubah). Data di Neon bersifat persisten dan TIDAK bisa dikembalikan setelah dihapus.**

Buka `http://localhost:3000` — API, Frontend (Vite dev server), dan Socket.io jalan di port yang sama.

> **Penting:** Data surat, disposisi, notifikasi TIDAK akan hilang saat restart `npm run dev`.
> Schema menggunakan `CREATE TABLE IF NOT EXISTS` dan seed menggunakan `ON CONFLICT DO NOTHING`.
> Database hanya perlu di-init sekali (`npm run db:init`), tidak perlu diulang saat restart.

## URL

- **Aplikasi:** https://sidis-nexus.vercel.app
- **Repository:** https://github.com/ATzFauzan1525/Nexus

## Login

Buka `http://localhost:3000`

## Seed Users (11 akun)

| Username  | Password   | Role             | Bidang          | Nama           |
|-----------|------------|------------------|-----------------|----------------|
| admin     | admin123   | ADMIN_TU         | —               | Admin TU       |
| kepala    | kepala123  | KEPALA_SEKOLAH   | —               | Dr. Ahmad Dahlan |
| guru1     | guru123    | GURU_STAF        | Kurikulum       | Guru Kurikulum   |
| guru2     | guru123    | GURU_STAF        | Kesiswaan       | Guru Kesiswaan    |
| guru3     | guru123    | GURU_STAF        | SaranaPrasarana | Guru SaranaPrasarana   |
| guru4     | guru123    | GURU_STAF        | Humas           | Guru Humas   |
| guru5     | guru123    | GURU_STAF        | Keuangan        | Bendahara      |
| wakasek1  | wakasek123 | WAKASEK          | Kurikulum       | Wakil Kurikulum |
| wakasek2  | wakasek123 | WAKASEK          | Kesiswaan       | Wakil Kesiswaan |
| wakasek3  | wakasek123 | WAKASEK          | SaranaPrasarana | Wakil Sarpras  |
| wakasek4  | wakasek123 | WAKASEK          | Humas           | Wakil Humas    |

## Hak Akses per Role

| Role | Lihat Surat | Lihat Disposisi | Fitur Lain |
|------|-------------|-----------------|------------|
| ADMIN_TU | Semua surat | Semua disposisi | Input surat, kelola pengguna, cetak laporan |
| KEPALA_SEKOLAH | Semua surat | Disposisi yang dibuatnya | Buat disposisi |
| GURU_STAF | **Hanya surat yang didisposisikan kepadanya** | Disposisi yang ditujukan kepadanya | Update status + catatan |
| WAKASEK | Surat sesuai bidang (4 bidang) | Disposisi sesuai bidang | Monitor bidang |

> **Catatan:** Guru/Staf **tidak dapat** melihat seluruh surat masuk — hanya surat yang memiliki disposisi ditujukan kepadanya (BR-11). Keuangan tidak memiliki Wakasek.

## Pages & Features

| Route                 | Akses                     | Fitur                                          |
|-----------------------|---------------------------|------------------------------------------------|
| `/login`              | Public                    | Login                                           |
| `/dashboard`          | Semua role                | Dashboard stat (scoped per role) + surat terbaru |
| `/surat`              | Admin TU, Kepala, Guru, Wakasek | Daftar surat (filtered per role)         |
| `/surat/:id`          | Semua role                | Detail surat + status timeline                  |
| `/surat/tambah`       | ADMIN_TU                  | Form tambah surat masuk                         |
| `/disposisi`          | Kepala Sekolah            | Riwayat disposisi yang dibuat                   |
| `/disposisi/bidang`   | WAKASEK                   | Disposisi untuk bidang tertentu                 |
| `/disposisi/saya`     | GURU_STAF                 | Disposisi yang ditujukan kepada user            |
| `/disposisi/buat/:id` | KEPALA_SEKOLAH            | Form buat disposisi untuk surat tertentu        |
| `/disposisi/:id`      | Semua role                | Detail disposisi + update status                |
| `/notifications`      | Semua role                | Daftar notifikasi + tanda baca                  |
| `/pengguna`           | ADMIN_TU                  | Manajemen pengguna                              |
| `/pengguna/tambah`    | ADMIN_TU                  | Tambah pengguna baru                            |
| `/pengguna/:id/edit`  | ADMIN_TU                  | Edit profil pengguna                            |
| `/laporan`            | ADMIN_TU                  | Laporan/rekap surat                             |
| `/lacak`              | Public (tanpa login)      | Pelacakan surat berdasarkan nomor               |

## Realtime Sync (WebSocket Events)

| Event | Trigger | Room(s) | Payload |
|-------|---------|---------|---------|
| `surat:baru` | Admin TU input surat | `role:KEPALA_SEKOLAH` | Surat object |
| `disposisi:baru` | Kepala Sekolah buat disposisi | `user:{penerima_id}` | Disposisi object |
| `status:update` | Guru/Staf update status | `role:KEPALA_SEKOLAH`, `role:WAKASEK_BIDANG:{bidang}` | `{ surat_id, status, nomorSurat }` |
| `notifikasi:baru` | Notifikasi baru dibuat | `user:{target_id}` | Notifikasi object |
| `dashboard:refresh` | Perubahan data | `role:KEPALA_SEKOLAH`, `role:WAKASEK` | `{}` |
| `lacak:update` | Status berubah | `lacak:{nomorSurat}` (public) | `{ status, posisiSaatIni }` |

## Testing Realtime Sync

1. Buka 2 browser window/tab — login sebagai Admin TU di window A, Kepala Sekolah di window B
2. Di window A: input surat baru → window B otomatis menerima update dalam ~2 detik
3. Di window B: buat disposisi → window A (atau Guru/Staf) menerima notifikasi realtime
4. Buka window C: akses `/lacak` tanpa login, masukkan nomor surat → lihat status realtime

## Source of Truth

Semua detail konfigurasi, spesifikasi, dan business rules ada di `docs/`:

- `docs/srs.md` — Scope, fitur, business rules, NFR, koneksi database
- `docs/information_architecture.md` — Routes, layout, WebSocket channels
- `docs/design_system.md` — Colors, typography, components
- `docs/data_model.md` — Database schema, ERD, indexes
- `docs/analisis_kebutuhan/` — Dokumen Analisis Kebutuhan (Fase 1)
- `docs/data_observasi/` — Data wawancara, transkrip, bukti foto
- `docs/user_flows/` — 16 use case flows
- `docs/system_logics/` — API contracts, sequence diagrams, data flow
