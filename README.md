# SiDis - Sistem Informasi Disposisi dan Pelacakan Surat Digital

Prototype full-stack untuk Sistem Informasi Disposisi dan Pelacakan Surat Digital di SMP Muhammadiyah 9 Yogyakarta.

## Tech Stack

- **Backend:** Express.js, Neon PostgreSQL, Socket.io, JWT Authentication
- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Socket.io-client
- **Realtime:** Socket.io (WebSocket) untuk update status, disposisi, notifikasi, dan pelacakan surat
- **Database:** Neon (Cloud PostgreSQL) — tidak perlu install PostgreSQL lokal

## Prerequisites

- Node.js ≥ 18
- npm

## Database Connection (Neon Cloud PostgreSQL)

```
DATABASE_URL=postgresql://neondb_owner:npg_2CZDJquplAk1@ep-cold-sound-ao6ukhv2-pooler.c-2.ap-southeast-1.aws.neon.tech/SiDs?sslmode=require&channel_binding=require
```

- Tidak perlu install PostgreSQL lokal — semua data tersimpan di Neon Cloud
- File scan surat disimpan sebagai BYTEA langsung di database (bukan di filesystem lokal)
- `.env` berisi `DATABASE_URL` + `JWT_SECRET` + `PORT`

## Project Structure

```
SiDs/
├── server/              # Backend (Express + Socket.io)
│   ├── config/          # DB config & init
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, upload
│   ├── routes/          # API routes
│   └── socket/          # Socket.io server
├── src/                 # Frontend (React + Vite)
│   ├── pages/           # Page components
│   ├── components/      # UI components
│   ├── context/         # Auth context + WebSocket
│   └── lib/             # API client
├── server.js            # Unified entry point
├── vite.config.js       # Vite config
├── .env                 # Config (DATABASE_URL Neon)
└── uploads/             # File uploads
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Init DB (tabel + seed user) — hanya perlu sekali atau saat schema berubah
npm run db:init

# 3. Jalankan (satu command, satu port!)
npm run dev
```

> **⚠ PERINGATAN: Karena menggunakan Neon (Cloud PostgreSQL), `npm run db:init` akan MENGHAPUS SEMUA DATA yang sudah ada di database. Jangan jalankan perintah ini kecuali benar-benar diperlukan (misalnya saat pertama kali setup atau saat schema berubah). Data di Neon bersifat persisten dan TIDAK bisa dikembalikan setelah dihapus.**

Buka `http://localhost:3000` — API, Frontend (Vite dev server), dan Socket.io jalan di port yang sama.

> **Penting:** Data surat, disposisi, notifikasi TIDAK akan hilang saat restart `npm run dev`.
> Schema menggunakan `CREATE TABLE IF NOT EXISTS` dan seed menggunakan `ON CONFLICT DO NOTHING`.
> Database hanya perlu di-init sekali (`npm run db:init`), tidak perlu diulang saat restart.

## Login

Buka **https://sidis-nexus.vercel.app**

| Role | Username | Password |
|---|---|---|
| Admin TU | `admin` | `admin123` |
| Kepala Sekolah | `kepala` | `kepala123` |
| Guru/Staf | `guru1` - `guru5` | `guru123` |
| Wakasek | `wakasek1` - `wakasek4` | `wakasek123` |

## Seed Users (11 akun)

| Username  | Password   | Role             | Bidang          | Nama           |
|-----------|------------|------------------|-----------------|----------------|
| admin     | admin123   | ADMIN_TU         | —               | Admin TU       |
| kepala    | kepala123  | KEPALA_SEKOLAH   | —               | Dr. Ahmad Dahlan |
| guru1     | guru123    | GURU_STAF        | Kurikulum       | Budi Santoso   |
| guru2     | guru123    | GURU_STAF        | Kesiswaan       | Siti Rahayu    |
| guru3     | guru123    | GURU_STAF        | SaranaPrasarana | Andi Pratama   |
| guru4     | guru123    | GURU_STAF        | Humas           | Dewi Lestari   |
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

- `srs.md` — Scope, fitur, business rules, NFR
- `information_architecture.md` — Routes, layout, WebSocket channels
- `design_system.md` — Colors, typography, components
- `user_flows/` — 16 use case flows

Lihat [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md) untuk detail decisions dan known issues.
