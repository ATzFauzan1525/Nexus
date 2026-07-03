# IMPLEMENTATION_NOTES.md

Dokumentasi decision, deviation, dan known issues dari implementasi prototype.

---

## Project Structure

```
SiDs/
├── server/              # Backend (Express + Socket.io)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── socket/
├── src/                 # Frontend (React + Vite + React Router)
│   ├── pages/
│   ├── components/
│   ├── context/
│   └── lib/
├── server.js            # Unified entry point
├── vite.config.js
├── .env
├── uploads/
└── user_flows/
```

**Quick start:** `npm run db:init && npm run dev`

> **⚠ PERINGATAN: `npm run db:init` akan MENGHAPUS SEMUA DATA di Neon Cloud PostgreSQL. Jangan jalankan kecuali benar-benar diperlukan. Data bersifat persisten dan tidak bisa dikembalikan.**

---

## Decisions

### 1. React + Vite instead of Next.js

srs.md specifies Vite + React Router. The initial prototype used Next.js but was migrated to React + Vite + React Router to align with srs.md.

### 2. Public /lacak returns `pengirim` and `perihal`

**BR-16** states the public endpoint should only return `status` and `posisiSaatIni`. The implementation also returns `pengirim` and `perihal` as they are non-sensitive metadata. Sensitive data (file scans, disposition instructions, staff names, follow-up notes) are NOT exposed.

### 3. Unified server with Vite middleware

In development, `server.js` runs Vite's dev server as Express middleware. In production, it serves the pre-built `dist/` folder. API routes and Socket.io share the same HTTP server.

### 4. Neon Cloud PostgreSQL as single source of truth (BR-14)

JWT token is stored in localStorage (as specified by BR-14). All application data is fetched exclusively from Neon Cloud PostgreSQL via the REST API. Connection string in `.env`:

```
DATABASE_URL=postgresql://neondb_owner:npg_2CZDJquplAk1@ep-cold-sound-ao6ukhv2-pooler.c-2.ap-southeast-1.aws.neon.tech/SiDs?sslmode=require&channel_binding=require
```

---

## WebSocket Events Reference

| Event            | Trigger                         | Room(s)                                    | Payload                                    |
|------------------|---------------------------------|--------------------------------------------|--------------------------------------------|
| `surat:baru`     | Admin TU creates surat          | `role:KEPALA_SEKOLAH`                      | Surat object                               |
| `disposisi:baru` | Kepala Sekolah creates disposisi| `user:{penerima_id}`                       | Disposisi object                           |
| `status:update`  | Status surat updated            | `role:KEPALA_SEKOLAH`, all `role:WAKASEK_BIDANG:{bidang}` | `{ surat_id, status, nomorSurat }` |
| `notifikasi:baru`| Any notification created        | `user:{target_id}`                          | Notifikasi object                          |
| `dashboard:refresh`| Status updated (any)          | `role:KEPALA_SEKOLAH`, `role:WAKASEK`      | `{}`                                       |
| `lacak:update`   | Status updated (any)            | `lacak:{nomorSurat}` (public)              | `{ status, posisiSaatIni }`                |
