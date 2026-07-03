# PROMPTS — SiDis Prototype Development Workflow

---

## PROMPT 1: PHASE 1 — MENENTUKAN SCOPE DARI SRS

You are an agentic AI software developer.
We will build a runnable FULL-STACK prototype for SiDis (Sistem Informasi Disposisi dan
Pelacakan Surat Digital) — a digital incoming-letter & disposition tracking system for
SMP Muhammadiyah 9 Yogyakarta — using a Source of Truth workflow.

This system MUST support multiple concurrent actors (Admin TU, Kepala Sekolah, Guru/Staf,
Wakil Kepala Sekolah) working on a SHARED, CENTRALIZED dataset, with REALTIME
synchronization — meaning a change made by one actor (e.g. Admin TU inputs a new letter)
must appear automatically for other relevant actors (e.g. Kepala Sekolah) WITHOUT a
manual page refresh.

Additionally, the system MUST support a PUBLIC, LOGIN-FREE tracking page (`/lacak`) for
external letter senders (Pengirim Surat Eksternal) — they are not registered users and
never log in, but can enter a `nomorSurat` to see the letter's current status and
handling position in realtime, similar to a package-tracking experience.

### Key Scope Constraints

- **Database**: Neon (Cloud PostgreSQL) via connection string `DATABASE_URL` with SSL.
  NOT local PostgreSQL. The connection string is stored in `.env`.
- **Folder Structure**: Single unified directory — `server/` (backend) + `src/` (frontend)
  + `server.js` (unified entry point) in one root. NOT separate frontend/backend projects.
- **Single Command**: `npm run dev` runs everything on port 3000 (Vite dev server +
  Express API + Socket.io in one process).
- **5 Bidang**: Kurikulum, Kesiswaan, SaranaPrasarana, Humas, Keuangan.
  "Umum" does NOT exist. Keuangan has NO Wakasek — only a Guru/Staf named "Bendahara".
- **Guru/Staf Access**: Guru/Staf can ONLY see surat that have a disposisi addressed to
  them (BR-11). They CANNOT see all surat masuk. Dashboard stats are scoped to their
  disposisi only.
- **Wakasek Access**: Wakasek covers 4 bidang only (Kurikulum, Kesiswaan,
  SaranaPrasarana, Humas). No Wakasek for Keuangan.

### Source of Truth

Read this document first: `srs.md`
Use srs.md as Source of Truth #1.
Use it to determine: system scope, user actors (including the External Actor "Pengirim
Surat Eksternal" who never logs in), in-scope features (including F-12, the public
no-login tracking page), business rules (including BR-11 on Guru/Staf scoped access,
BR-14 on centralized realtime data, and BR-16/BR-17 on the public tracking endpoint's
limited, read-only, rate-limited exposure), validation rules, data objects, non-functional
requirements (including NF-08 realtime latency ≤2s and NF-09 auto-reconnect), and
out-of-scope items.

Do not invent features outside srs.md. Strictly follow the Out-of-Scope list in srs.md:
do not implement surat keluar (outgoing letter) management, public self-registration,
forgot-password self-service, integration with the school's existing academic system,
email features, AI/machine learning features, or a native mobile app.

IMPORTANT: Do not use localStorage as the primary data store for SuratMasuk, Disposisi,
StatusSurat, Notifikasi, or Laporan — per BR-14, all actors must read/write the same
centralized database. localStorage may only be used to store the session JWT token.

### Database Connection

```
postgresql://neondb_owner:npg_2CZDJquplAk1@ep-cold-sound-ao6ukhv2-pooler.c-2.ap-southeast-1.aws.neon.tech/SiDs?sslmode=require&channel_binding=require
```

After reading srs.md, continue preparing the full-stack prototype implementation based
only on the allowed scope and business rules defined in srs.md.

---

## PROMPT 2: PHASE 2A — INFORMATION ARCHITECTURE UNTUK ROUTE, HALAMAN & REALTIME CHANNELS

Continue to Phase 2A.
Read this document: `information_architecture.md`
Use information_architecture.md as Source of Truth #2.
Use it to determine: application pages, route structure (e.g. `/login`, `/lacak`,
`/dashboard`, `/surat`, `/surat/tambah`, `/surat/:id`, `/disposisi/buat/:idSurat`,
`/disposisi/saya`, `/disposisi/bidang`, `/laporan`, `/pengguna`, `/notifications`),
sidebar navigation per role, the SEPARATE PUBLIC LAYOUT for `/lacak` (no Sidebar/Topbar —
its own minimal public header/footer), page hierarchy, entry/exit points,
authenticated/unauthenticated/public pages, AND the WebSocket Event Channels section
(section 5): event names (`surat:baru`, `disposisi:baru`, `status:update`,
`notifikasi:baru`, `dashboard:refresh`, `lacak:update`), target rooms (`user:{id}`,
`role:{peran}`, `role:WAKASEK_BIDANG:{bidang}`, and the public-facing
`lacak:{nomorSurat}` room with its filtered, limited payload), and the resync-on-reconnect
rule.

### Key Architecture Constraints

- **Sidebar per role**:
  - Admin TU: Dashboard, Surat Masuk (Daftar Surat + Input Surat Baru), Laporan, Manajemen Pengguna
  - Kepala Sekolah: Dashboard, Surat Masuk (Daftar Surat), Disposisi (Riwayat Disposisi)
  - Guru/Staf: Dashboard, Disposisi Saya
  - Wakasek: Dashboard, Surat Masuk (Bidang Saya), Disposisi Bidang
- **Guru/Staf does NOT have "Surat Masuk" in sidebar** — they access surat only through
  Disposisi Saya.
- **No "Buat Disposisi" link in Kepala Sekolah sidebar** — disposisi is created from
  surat detail page `/surat/:id`.
- **`/lacak` has its own public layout** — no Sidebar, no Topbar, just public header +
  search + result + footer.
- **Socket.io rooms**:
  - `user:{idPengguna}` — personal notifications
  - `role:{peran}` — role broadcast
  - `role:WAKASEK_BIDANG:{bidang}` — Wakasek only (4 bidang)
  - `lacak:{nomorSurat}` — public, no auth, limited payload

Implement the application routing, global layout (Topbar + Sidebar + Content area) for
internal pages, the separate minimal public layout for `/lacak`, AND the WebSocket
room-joining logic (including the no-auth `lacak:{nomorSurat}` room) according to this
document. Do not create pages, routes, or realtime events outside
information_architecture.md.

---

## PROMPT 3: PHASE 2B — DESIGN SYSTEM UNTUK KONSISTENSI UI & INDIKATOR REALTIME

Continue to Phase 2B.
Read this document: `design_system.md`
Use design_system.md as Source of Truth #3.
Use it to determine: color palette, typography (Inter font), spacing, button/input/card/
table/modal styles, status badges (Diterima/Didisposisi/Diproses/Selesai), empty/error/
loading states, success toast notifications, the realtime-specific components:
Connection Status Indicator (green/orange-pulse/red dot in Topbar showing
Tersinkron/Menyambungkan ulang/Offline) and Realtime Update Highlight (yellow flash
transition on rows/cards that just updated via WebSocket), AND the dedicated
"Halaman Pelacakan Publik (/lacak)" component spec: Public Header, large centered Search
Box, read-only Tracking Result Card with status badge + current position + "Live"
indicator, Not Found State, and Public Footer.

### Key Design Constraints

- **Exact hex colors** from design_system.md — no improvised palettes.
- **Border-radius**: 6px buttons/inputs, 8px cards, 10px modals.
- **Inter font** family.
- **Status badges**: exact colors per status (Diterima=blue, Didisposisi=orange,
  Diproses=yellow, Selesai=green).
- **Connection Status Indicator**: 8px dot in Topbar, 3 states (green/orange-pulse/red).
- **Realtime Update Highlight**: yellow flash (#FEF3C7 → transparent) on updated rows.
- **Catatan (Notes) modal**: When Guru/Staf updates status, a modal appears with optional
  textarea for catatan tindak lanjut.

Apply the Design System to the frontend prototype, including the Connection Status
Indicator, the highlight animation, and the full public tracking page styling. Do not
create a visual style that conflicts with design_system.md. The prototype should look
consistent with the Design System, but keep the priority on making the full-stack
prototype runnable and genuinely realtime — for both internal authenticated pages and
the public `/lacak` page.

---

## PROMPT 4: PHASE 2C — USER FLOWS UNTUK INTERAKSI & SINKRONISASI REALTIME

Continue to Phase 2C.
Read all User Flow documents:
`user_flows/index.md`
`user_flows/userflow_uc_001.md` to `user_flows/userflow_uc_012.md`

Use these documents as Source of Truth #4.
Use them to determine: user actions, system responses, main flows, alternative flows,
exception flows, and postconditions for each use case — including
`userflow_uc_011.md` (Sinkronisasi Realtime Multi-Aktor) and `userflow_uc_012.md` (Lacak
Surat Publik / Tanpa Login), which together define: WebSocket connection on login (or,
for `/lacak`, a no-auth WebSocket join to a public per-letter room), room assignment,
event broadcast on data changes, the filtered/limited payload required for public
tracking (status + posisiSaatIni ONLY — no file scan, no disposition instructions, no
staff names), rate-limiting for the public endpoint, UI highlight on incoming updates,
auto-reconnect with exponential backoff, and REST API resync after reconnect.

### Key Interaction Constraints

- **UC-004 (Update Status)**: Guru/Staf sees a **modal with optional catatan textarea**
  when updating status. Catatan is optional — empty string if left blank.
- **UC-006 (Cari & Filter)**: Auto-search on keystroke (no search button needed).
  Search filters apply immediately, page resets to page 1.
- **UC-010 (Dashboard)**: All roles see stat cards. Guru/Staf stats are scoped to their
  disposisi only (not global). Table shows "Disposisi Terbaru" for Guru/Staf.
- **UC-011 (Realtime)**: After reconnect, client MUST resync by re-fetching current
  page's REST data. Connection Status Indicator reflects connection state.
- **UC-012 (Public Tracking)**: `/lacak` page joins `lacak:{nomorSurat}` room.
  Receives `lacak:update` with `{ status, posisiSaatIni }` only. "Live" indicator
  shown. Rate-limited per BR-17.

Implement the prototype interactions according to these user flows, INCLUDING the
realtime behavior in UC-011 and the public no-login tracking behavior in UC-012. Do not
create interactions that are not supported by the User Flow documents. Since the system
requires a centralized shared dataset (per BR-14), implement a real backend with
Express.js REST endpoints backed by Neon PostgreSQL for all entities (Pengguna, SuratMasuk,
Disposisi, StatusSurat, Notifikasi), plus one dedicated PUBLIC endpoint
(`GET /api/public/lacak?nomorSurat=...`) that requires NO authentication but returns only
the limited fields per BR-16, and use Socket.io to push realtime events as defined in
information_architecture.md section 5 (including `lacak:update` to the public
`lacak:{nomorSurat}` room).

---

## PROMPT 5: PHASE 3 — EKSEKUSI PROTOTYPE BERJALAN (FULL-STACK + REALTIME)

Continue to Phase 3.
Now build and finalize a runnable FULL-STACK prototype for SiDis based on all Source of
Truth documents (srs.md, information_architecture.md, design_system.md, and all
user_flows/*.md files, including userflow_uc_011.md and userflow_uc_012.md).

### Tech Stack (per srs.md)

- **Frontend**: React 18 + Vite + Tailwind CSS + React Router + Socket.io-client
- **Backend**: Express.js (REST API) + Socket.io (realtime server)
- **Database**: Neon (Cloud PostgreSQL) via connection string — NOT local PostgreSQL
- **Auth**: JWT for both REST requests and WebSocket connection authentication
- **Entry Point**: Single `server.js` at root — runs Vite dev server + Express + Socket.io
  on port 3000

### Architecture Requirements

- **Unified Folder Structure**: `server/` (backend) + `src/` (frontend) in one root directory.
  Single `package.json`. Single `npm run dev` command.
- **Database**: Neon PostgreSQL via `DATABASE_URL` connection string with SSL.
  Schema initialized via `npm run db:init` (runs `server/config/db-init.js`).
  Tables use `CREATE TABLE IF NOT EXISTS` — safe to run repeatedly.
  Seed users use `ON CONFLICT (username) DO NOTHING` — idempotent.
- **No localStorage for data**: All data lives in Neon PostgreSQL. localStorage only for
  JWT session token (BR-14).
- **Socket.io rooms** exactly as defined in information_architecture.md section 5:
  `user:{idPengguna}`, `role:{peran}`, `role:WAKASEK_BIDANG:{bidang}`, and the PUBLIC
  room `lacak:{nomorSurat}` (no authentication required to join this specific room).
- **Every mutating REST endpoint** (create surat, create disposisi, update status) must,
  after successfully writing to PostgreSQL, emit the corresponding WebSocket event
  (`surat:baru`, `disposisi:baru`, `status:update`, `notifikasi:baru`, `dashboard:refresh`,
  and `lacak:update` where applicable) to the correct rooms.
- **PUBLIC NO-LOGIN REST endpoint** for letter tracking
  (`GET /api/public/lacak?nomorSurat=...`) that returns ONLY `{ status, posisiSaatIni }`
  per BR-16 — never file scan URLs, disposition instructions, staff names, or follow-up
  notes. Apply per-IP rate-limiting per BR-17.
- **Client-side auto-reconnect** with exponential backoff and a resync (re-fetch current
  page's REST data) on reconnect, per NF-09 and UC-011.

### Access Control Rules

- **Admin TU**: Sees all surat, all disposisi, all users.
- **Kepala Sekolah**: Sees all surat, disposisi they created.
- **Wakasek**: Sees surat/disposisi scoped to their bidang (4 bidang only).
- **Guru/Staf**: Sees ONLY surat that have a disposisi addressed to them (BR-11).
  Dashboard stats are scoped to their disposisi. No "Surat Masuk" in sidebar.
- **Guru/Staf Keuangan** = "Bendahara" — no Wakasek for Keuangan bidang.

### Seed Data (11 users)

| Username  | Password   | Role           | Bidang          | Nama           |
|-----------|------------|----------------|-----------------|----------------|
| admin     | admin123   | ADMIN_TU       | —               | Admin TU       |
| kepala    | kepala123  | KEPALA_SEKOLAH | —               | Dr. Ahmad Dahlan |
| guru1     | guru123    | GURU_STAF      | Kurikulum       | Budi Santoso   |
| guru2     | guru123    | GURU_STAF      | Kesiswaan       | Siti Rahayu    |
| guru3     | guru123    | GURU_STAF      | SaranaPrasarana | Andi Pratama   |
| guru4     | guru123    | GURU_STAF      | Humas           | Dewi Lestari   |
| guru5     | guru123    | GURU_STAF      | Keuangan        | Bendahara      |
| wakasek1  | wakasek123 | WAKASEK        | Kurikulum       | Wakil Kurikulum |
| wakasek2  | wakasek123 | WAKASEK        | Kesiswaan       | Wakil Kesiswaan |
| wakasek3  | wakasek123 | WAKASEK        | SaranaPrasarana | Wakil Sarpras  |
| wakasek4  | wakasek123 | WAKASEK        | Humas           | Wakil Humas    |

### Demo Requirements

The prototype must be demonstrable with AT LEAST TWO BROWSER SESSIONS OPEN
SIMULTANEOUSLY to prove realtime sync works:

1. **Admin TU → Kepala Sekolah**: Window A (Admin TU) submits a new letter → Window B
   (Kepala Sekolah) on `/dashboard` shows the new letter and updated counts within ~2s
   WITHOUT refreshing.

2. **Kepala Sekolah → Guru/Staf**: Window A (Kepala Sekolah) creates a disposition →
   Window B (Guru/Staf) receives a notification and sees it in `/disposisi/saya` in
   realtime.

3. **Public Tracking Realtime**: Window C (no login, `/lacak`) enters a valid nomorSurat
   and sees current status + posisiSaatIni. While Window C remains open, Window A or B
   performs a status-changing action → Window C's Tracking Result Card updates
   automatically within ~2s, WITHOUT refreshing, showing only status and posisiSaatIni.

### Setup Steps

```bash
# 1. Install dependencies
npm install

# 2. Initialize database schema + seed data (run once or whenever schema changes)
npm run db:init

# 3. Start development server (Vite + Express + Socket.io on port 3000)
npm run dev
```

> **⚠ PERINGATAN: Karena menggunakan Neon (Cloud PostgreSQL), `npm run db:init` akan MENGHAPUS SEMUA DATA yang sudah ada di database. Jangan jalankan perintah ini kecuali benar-benar diperlukan. Data di Neon bersifat persisten dan TIDAK bisa dikembalikan setelah dihapus.**

Open `http://localhost:3000` in multiple browser windows/tabs, log in as different roles,
and test realtime sync.

### Documentation

Create or update: `README.md` and `IMPLEMENTATION_NOTES.md`.
- `README.md`: Setup steps, login credentials, sample nomorSurat for public tracking,
  how to test realtime sync with multiple windows, known limitations.
- `IMPLEMENTATION_NOTES.md`: Architecture decisions, deviations from spec, known issues.

Do not create AGENTS.md, CLAUDE.md, or any AI-tool-specific configuration files.

If there are conflicts between documents, make a reasonable implementation decision,
continue development, and document it in IMPLEMENTATION_NOTES.md.

Do not stop at planning. Implement, run, fix errors, and make the prototype ready for
a live demo showing realtime sync between multiple actors.
