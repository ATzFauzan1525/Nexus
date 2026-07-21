# API Specification — SiDis

**Project:** SiDis — Sistem Informasi Disposisi dan Pelacakan Surat Digital

**Base URL:** `https://sidis-production.up.railway.app/api`

**Autentikasi:** JWT Bearer Token — kirim header `Authorization: Bearer <token>`

**Content-Type:** `application/json` (kecuali file upload: `multipart/form-data`)

---

## 1. Autentikasi

### POST `/auth/login`

Login pengguna dan mendapatkan JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "nama_lengkap": "Admin TU",
    "role": "ADMIN_TU",
    "bidang": null
  }
}
```

**Response 400:** `{ "message": "Username dan password wajib diisi" }`

**Response 401:** `{ "message": "Username atau password salah" }`

---

### GET `/auth/profile`

Mendapatkan data profil pengguna yang sedang login.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "id": "uuid",
  "username": "admin",
  "nama_lengkap": "Admin TU",
  "role": "ADMIN_TU",
  "bidang": null,
  "is_active": true,
  "created_at": "2026-07-15T00:00:00.000Z"
}
```

**Response 404:** `{ "message": "Pengguna tidak ditemukan" }`

---

## 2. Surat Masuk

### GET `/surat`

Mendapatkan daftar surat masuk. Data difilter berdasarkan peran:
- **ADMIN_TU / KEPALA_SEKOLAH:** Semua surat
- **GURU_STAF:** Hanya surat yang memiliki disposisi ditujukan kepadanya
- **WAKASEK:** Hanya surat yang didisposisikan ke bidangnya

**Headers:** `Authorization: Bearer <token>`

**Query Params:**

| Param | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| search | string | — | Pencarian (ILIKE) pada nomor_surat, pengirim, perihal |
| status | string | — | Filter status: Diterima, Didisposisi, Diproses, Selesai |
| tanggal_mulai | date | — | Filter tanggal mulai |
| tanggal_akhir | date | — | Filter tanggal akhir |
| pengirim | string | — | Filter pengirim (ILIKE) |
| perihal | string | — | Filter perihal (ILIKE) |
| page | int | 1 | Nomor halaman |
| limit | int | 20 | Jumlah data per halaman |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nomor_surat": "SM/001/2026",
      "tanggal_diterima": "2026-07-15",
      "pengirim": "Dinas Pendidikan",
      "perihal": "Surat Edaran Kurikulum",
      "status": "Diterima",
      "created_at": "2026-07-15T08:00:00.000Z",
      "created_by_nama": "Admin TU"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

---

### GET `/surat/:id`

Mendapatkan detail surat lengkap beserta timeline dan disposisi.

**Headers:** `Authorization: Bearer <token>`

**Role restriction:** GURU_STAF harus memiliki disposisi untuk surat tersebut.

**Response 200:**
```json
{
  "id": "uuid",
  "nomor_surat": "SM/001/2026",
  "tanggal_diterima": "2026-07-15",
  "pengirim": "Dinas Pendidikan",
  "perihal": "Surat Edaran Kurikulum",
  "status": "Didisposisi",
  "file_scan": "surat_edaran.pdf",
  "created_by": "uuid",
  "created_by_nama": "Admin TU",
  "timeline": [
    {
      "id": "uuid",
      "status": "Diterima",
      "catatan": null,
      "created_at": "2026-07-15T08:00:00.000Z",
      "diubah_oleh_nama": "Admin TU"
    },
    {
      "id": "uuid",
      "status": "Didisposisi",
      "catatan": null,
      "created_at": "2026-07-15T09:00:00.000Z",
      "diubah_oleh_nama": "Dr. Ahmad Dahlan"
    }
  ],
  "disposisi": [
    {
      "id": "uuid",
      "instruksi": "Tindak lanjuti segera",
      "deadline": "2026-07-20",
      "penerima_nama": "Budi Santoso",
      "penerima_bidang": "Kurikulum"
    }
  ]
}
```

**Response 403:** `{ "message": "Anda tidak memiliki akses ke surat ini" }`

**Response 404:** `{ "message": "Surat tidak ditemukan" }`

---

### POST `/surat`

Menambahkan surat masuk baru. Hanya Admin TU.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Request Body (form-data):**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| nomor_surat | string | Ya | Nomor surat unik |
| tanggal_diterima | date | Ya | Tanggal diterima |
| pengirim | string | Ya | Nama pengirim |
| perihal | string | Ya | Perihal surat |
| file_scan | file | Tidak | File scan (PDF/gambar) |

**Response 201:**
```json
{
  "id": "uuid",
  "nomor_surat": "SM/001/2026",
  "tanggal_diterima": "2026-07-15",
  "pengirim": "Dinas Pendidikan",
  "perihal": "Surat Edaran Kurikulum",
  "status": "Diterima",
  "created_by": "uuid"
}
```

**Response 400:** `{ "message": "Semua field wajib diisi" }`

**Response 400:** `{ "message": "Nomor surat sudah ada" }`

**Side effects:** Membuat entri `status_surat` awal (Diterima), notifikasi ke Kepala Sekolah, emit Socket.IO events.

---

### GET `/surat/stats`

Mendapatkan statistik surat masuk (scoped per peran).

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "stats": {
    "total_hari_ini": 3,
    "belum_selesai": 12,
    "overdue": 2,
    "total_semua": 50
  },
  "recentSurat": [
    {
      "id": "uuid",
      "nomor_surat": "SM/050/2026",
      "pengirim": "Dinas Kesehatan",
      "status": "Diterima",
      "created_at": "2026-07-17T08:00:00.000Z"
    }
  ]
}
```

---

### GET `/surat/posisi`

Mendapatkan data posisi semua surat (tabel live).

**Headers:** `Authorization: Bearer <token>`

**Role restriction:** WAKASEK hanya melihat surat di bidangnya.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "nomor_surat": "SM/001/2026",
    "perihal": "Surat Edaran Kurikulum",
    "pengirim": "Dinas Pendidikan",
    "status": "Didisposisi",
    "posisi_saat_ini": "Kurikulum",
    "penerima_nama": "Budi Santoso",
    "penerima_bidang": "Kurikulum",
    "deadline": "2026-07-20"
  }
]
```

---

### GET `/surat/:id/download`

Mengunduh file scan surat.

**Headers:** `Authorization: Bearer <token>`

**Response 200:** Binary file (PDF/gambar)

**Response 404:** `{ "message": "File tidak ditemukan" }`

---

## 3. Disposisi

### GET `/disposisi`

Mendapatkan daftar disposisi. Data difilter berdasarkan peran:
- **KEPALA_SEKOLAH:** Disposisi yang dibuatnya
- **GURU_STAF:** Disposisi yang ditujukan kepadanya
- **WAKASEK:** Disposisi untuk bidangnya

**Headers:** `Authorization: Bearer <token>`

**Query Params:**

| Param | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| page | int | 1 | Nomor halaman |
| limit | int | 20 | Jumlah data per halaman |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "surat_id": "uuid",
      "nomor_surat": "SM/001/2026",
      "perihal": "Surat Edaran Kurikulum",
      "surat_status": "Diproses",
      "instruksi": "Tindak lanjuti segera",
      "deadline": "2026-07-20",
      "created_at": "2026-07-15T09:00:00.000Z",
      "pemberi_nama": "Dr. Ahmad Dahlan",
      "penerima_nama": "Budi Santoso"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

---

### GET `/disposisi/:id`

Mendapatkan detail disposisi beserta timeline.

**Headers:** `Authorization: Bearer <token>`

**Role restriction:** GURU_STAF harus pemilik disposisi.

**Response 200:**
```json
{
  "id": "uuid",
  "surat_id": "uuid",
  "nomor_surat": "SM/001/2026",
  "perihal": "Surat Edaran Kurikulum",
  "pengirim": "Dinas Pendidikan",
  "tanggal_diterima": "2026-07-15",
  "instruksi": "Tindak lanjuti segera",
  "deadline": "2026-07-20",
  "pemberi_nama": "Dr. Ahmad Dahlan",
  "penerima_nama": "Budi Santoso",
  "penerima_bidang": "Kurikulum",
  "status_terakhir": {
    "catatan": "Sedang diproses",
    "status": "Diproses",
    "created_at": "2026-07-16T10:00:00.000Z",
    "pengubah_nama": "Budi Santoso"
  },
  "timeline": [
    {
      "status": "Diterima",
      "created_at": "2026-07-15T08:00:00.000Z"
    },
    {
      "status": "Didisposisi",
      "created_at": "2026-07-15T09:00:00.000Z"
    },
    {
      "status": "Diproses",
      "catatan": "Sedang diproses",
      "created_at": "2026-07-16T10:00:00.000Z"
    }
  ]
}
```

**Response 403:** `{ "message": "Anda tidak memiliki akses ke disposisi ini" }`

**Response 404:** `{ "message": "Disposisi tidak ditemukan" }`

---

### POST `/disposisi`

Membuat disposisi baru. Hanya Kepala Sekolah.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "surat_id": "uuid",
  "diberikan_kepada": "uuid",
  "instruksi": "Tindak lanjuti segera",
  "deadline": "2026-07-20"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "surat_id": "uuid",
  "diberikan_oleh": "uuid",
  "diberikan_kepada": "uuid",
  "instruksi": "Tindak lanjuti segera",
  "deadline": "2026-07-20",
  "created_at": "2026-07-15T09:00:00.000Z"
}
```

**Response 400:** `{ "message": "Semua field wajib diisi" }`

**Response 404:** `{ "message": "Surat tidak ditemukan" }`

**Side effects:** Update status surat ke "Didisposisi", buat entri `status_surat`, notifikasi ke penerima, emit Socket.IO events.

---

## 4. Status Surat

### PUT `/surat/:id/status`

Memperbarui status surat. Hanya Guru/Staf. Status hanya boleh maju (tidak mundur).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "surat_id": "uuid",
  "status": "Diproses",
  "catatan": "Sedang dalam proses penyelesaian"
}
```

**Valid status (berurutan):** Diterima → Didisposisi → Diproses → Selesai

**Response 200:**
```json
{
  "message": "Status berhasil diperbarui",
  "status": "Diproses"
}
```

**Response 400:** `{ "message": "Surat ID dan status wajib diisi" }`

**Response 400:** `{ "message": "Status tidak valid" }`

**Response 400:** `{ "message": "Surat yang sudah Selesai tidak dapat diubah" }`

**Response 400:** `{ "message": "Status tidak boleh mundur" }`

**Response 404:** `{ "message": "Surat tidak ditemukan" }`

**Side effects:** Update `surat_masuk.status`, buat entri `status_surat`, notifikasi ke Kepala Sekolah dan Admin TU, emit Socket.IO events.

---

## 5. Notifikasi

### GET `/notifikasi`

Mendapatkan daftar notifikasi pengguna yang sedang login.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**

| Param | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| page | int | 1 | Nomor halaman |
| limit | int | 20 | Jumlah data per halaman |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "judul": "Surat Baru",
      "pesan": "Surat SM/001/2026 telah diterima",
      "tipe": "surat_baru",
      "dibaca": false,
      "created_at": "2026-07-15T08:00:00.000Z"
    }
  ],
  "total": 10,
  "unread": 3,
  "page": 1,
  "limit": 20
}
```

---

### GET `/notifikasi/unread-count`

Mendapatkan jumlah notifikasi yang belum dibaca.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "count": 3
}
```

---

### PUT `/notifikasi/:id/read`

Menandai satu notifikasi sudah dibaca.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "message": "Notifikasi ditandai sudah dibaca"
}
```

---

### PUT `/notifikasi/read-all`

Menandai semua notifikasi sudah dibaca.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "message": "Semua notifikasi ditandai sudah dibaca"
}
```

---

## 6. Pengguna

### GET `/pengguna`

Mendapatkan daftar seluruh pengguna. Hanya Admin TU.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
[
  {
    "id": "uuid",
    "username": "guru1",
    "nama_lengkap": "Budi Santoso",
    "role": "GURU_STAF",
    "bidang": "Kurikulum",
    "created_at": "2026-07-15T00:00:00.000Z"
  }
]
```

---

### GET `/pengguna/:id`

Mendapatkan detail pengguna. Hanya Admin TU.

**Headers:** `Authorization: Bearer <token>`

**Response 200:** `{ "id", "username", "nama_lengkap", "role", "bidang", "created_at" }`

**Response 404:** `{ "message": "Pengguna tidak ditemukan" }`

---

### GET `/pengguna/guru-staf`

Mendapatkan daftar Guru/Staf. Untuk dropdown pemilihan penerima disposisi.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
[
  {
    "id": "uuid",
    "username": "guru1",
    "nama_lengkap": "Budi Santoso",
    "role": "GURU_STAF",
    "bidang": "Kurikulum"
  }
]
```

---

### POST `/pengguna`

Menambahkan pengguna baru. Hanya Admin TU.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "username": "guru6",
  "password": "guru123",
  "nama_lengkap": "Guru Baru",
  "role": "GURU_STAF",
  "bidang": "Kurikulum"
}
```

**Response 201:** `{ "id", "username", "nama_lengkap", "role", "bidang", "created_at" }`

**Response 400:** `{ "message": "Semua field wajib diisi" }`

**Response 400:** `{ "message": "Username sudah digunakan" }`

---

### PUT `/pengguna/:id`

Mengubah data pengguna. Hanya Admin TU. Tidak bisa mengubah akun sendiri.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "nama_lengkap": "Nama Baru",
  "role": "WAKASEK",
  "bidang": "Kurikulum"
}
```

**Response 200:** `{ "id", "username", "nama_lengkap", "role", "bidang", "created_at" }`

**Response 400:** `{ "message": "Tidak dapat mengubah akun sendiri" }`

**Response 404:** `{ "message": "Pengguna tidak ditemukan" }`

---

### PUT `/pengguna/:id/password`

Mengubah password pengguna. Hanya Admin TU.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Response 200:** `{ "message": "Password berhasil diubah" }`

**Response 400:** `{ "message": "Password wajib diisi" }`

---

### DELETE `/pengguna/:id`

Menghapus pengguna secara permanen. Hanya Admin TU. Tidak bisa menghapus akun sendiri.

**Headers:** `Authorization: Bearer <token>`

**Response 200:** `{ "message": "Pengguna berhasil dihapus" }`

**Response 400:** `{ "message": "Tidak dapat menghapus akun sendiri" }`

**Response 404:** `{ "message": "Pengguna tidak ditemukan" }`

---

## 7. Komentar

### GET `/surat/:suratId/komentar`

Mendapatkan daftar komentar pada surat tertentu.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
[
  {
    "id": "uuid",
    "isi": "Surat sudah diproses",
    "created_at": "2026-07-16T10:00:00.000Z",
    "user_nama": "Budi Santoso",
    "user_role": "GURU_STAF"
  }
]
```

---

### POST `/surat/:suratId/komentar`

Menambahkan komentar pada surat.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "isi": "Surat sudah diproses, menunggu persetujuan"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "isi": "Surat sudah diproses, menunggu persetujuan",
  "created_at": "2026-07-16T10:00:00.000Z",
  "user_nama": "Budi Santoso",
  "user_role": "GURU_STAF"
}
```

**Response 400:** `{ "message": "Isi komentar wajib diisi" }`

---

### DELETE `/surat/:suratId/komentar/:id`

Menghapus komentar. Hanya pemilik komentar, Admin TU, atau Kepala Sekolah.

**Headers:** `Authorization: Bearer <token>`

**Response 200:** `{ "message": "Komentar dihapus" }`

**Response 403:** `{ "message": "Tidak bisa menghapus komentar ini" }`

**Response 404:** `{ "message": "Komentar tidak ditemukan" }`

---

## 8. Audit Log

### GET `/audit-log`

Mendapatkan riwayat aktivitas sistem. Hanya Admin TU & Kepala Sekolah.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**

| Param | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| page | int | 1 | Nomor halaman |
| limit | int | 20 | Jumlah data per halaman |
| aksi | string | — | Filter aksi: CREATE, UPDATE_STATUS, dll. |
| entitas | string | — | Filter entitas: surat_masuk, disposisi, dll. |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "aksi": "CREATE",
      "entitas": "surat_masuk",
      "entitas_id": "uuid",
      "detail": "Surat SM/001/2026 ditambahkan",
      "created_at": "2026-07-15T08:00:00.000Z",
      "user_nama": "Admin TU",
      "user_role": "ADMIN_TU"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

## 9. Laporan

### POST `/laporan/generate`

Menghasilkan laporan rekapitulasi surat. Hanya Admin TU.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "periode": "mingguan",
  "tanggal_mulai": "2026-07-10",
  "tanggal_akhir": "2026-07-17"
}
```

**Response 200:**
```json
{
  "periode": "mingguan",
  "tanggal_mulai": "2026-07-10",
  "tanggal_akhir": "2026-07-17",
  "summary": {
    "total_masuk": 15,
    "total_selesai": 8,
    "total_overdue": 2,
    "total_diterima": 3,
    "total_didisposisi": 2,
    "total_diproses": 2
  },
  "detail": [
    {
      "id": "uuid",
      "nomor_surat": "SM/001/2026",
      "pengirim": "Dinas Pendidikan",
      "perihal": "Surat Edaran",
      "status": "Selesai",
      "pembuat_nama": "Admin TU",
      "instruksi": "Tindak lanjuti",
      "disposisi_deadline": "2026-07-20",
      "penerima_nama": "Budi Santoso",
      "penerima_bidang": "Kurikulum"
    }
  ]
}
```

**Response 400:** `{ "message": "Periode dan rentang tanggal wajib diisi" }`

---

### GET `/laporan/pdf`

Mengunduh laporan dalam format PDF.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**

| Param | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| periode | string | Ya | Harian / Mingguan / Bulanan |
| tanggal_mulai | date | Ya | Tanggal mulai |
| tanggal_akhir | date | Ya | Tanggal akhir |

**Response 200:** Binary PDF (`Content-Type: application/pdf`)

**Response 400:** `{ "message": "Parameter tidak lengkap" }`

---

## 10. Pelacakan Publik

### GET `/public/lacak`

Melacak status surat berdasarkan nomor surat. **Tanpa autentikasi.**

**Rate limit:** 30 requests per 15 menit per IP.

**Query Params:**

| Param | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| nomorSurat | string | Ya | Nomor surat yang ingin dilacak |

**Request:**
```
GET /api/public/lacak?nomorSurat=SM/001/2026
```

**Response 200:**
```json
{
  "nomorSurat": "SM/001/2026",
  "status": "Diproses",
  "posisiSaatIni": "Kurikulum",
  "tanggalDiterima": "2026-07-15",
  "pengirim": "Dinas Pendidikan",
  "perihal": "Surat Edaran Kurikulum",
  "timeline": [
    {
      "status": "Diterima",
      "catatan": null,
      "created_at": "2026-07-15T08:00:00.000Z"
    },
    {
      "status": "Didisposisi",
      "catatan": null,
      "created_at": "2026-07-15T09:00:00.000Z"
    },
    {
      "status": "Diproses",
      "catatan": "Sedang diproses",
      "created_at": "2026-07-16T10:00:00.000Z"
    }
  ],
  "disposisiHistory": [
    {
      "instruksi": "Tindak lanjuti segera",
      "deadline": "2026-07-20",
      "created_at": "2026-07-15T09:00:00.000Z",
      "penerima_nama": "Budi Santoso",
      "bidang": "Kurikulum"
    }
  ]
}
```

**Response 400:** `{ "message": "Nomor surat wajib diisi" }`

**Response 404:** `{ "message": "Nomor surat tidak ditemukan" }`

> **Catatan:** Endpoint ini hanya menampilkan data umum (status, posisi, alur). Tidak menampilkan nama pribadi — hanya role/bidang.

---

## 11. Health Check

### GET `/health`

Cek kesehatan server. Tanpa autentikasi.

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-17T12:00:00.000Z"
}
```

---

## Ringkasan Endpoint

| No | Method | Endpoint | Auth | Role |
|----|--------|----------|------|------|
| 1 | POST | `/auth/login` | Tidak | Public |
| 2 | GET | `/auth/profile` | Ya | Semua |
| 3 | GET | `/surat` | Ya | Semua (scoped) |
| 4 | GET | `/surat/:id` | Ya | Semua (scoped) |
| 5 | POST | `/surat` | Ya | ADMIN_TU |
| 6 | GET | `/surat/stats` | Ya | Semua (scoped) |
| 7 | GET | `/surat/posisi` | Ya | ADMIN_TU, KEPALA, WAKASEK |
| 8 | GET | `/surat/:id/download` | Ya | Semua (scoped) |
| 9 | GET | `/disposisi` | Ya | KEPALA, GURU_STAF, WAKASEK |
| 10 | GET | `/disposisi/:id` | Ya | KEPALA, GURU_STAF, WAKASEK |
| 11 | POST | `/disposisi` | Ya | KEPALA_SEKOLAH |
| 12 | PUT | `/surat/:id/status` | Ya | GURU_STAF |
| 13 | GET | `/notifikasi` | Ya | Semua |
| 14 | GET | `/notifikasi/unread-count` | Ya | Semua |
| 15 | PUT | `/notifikasi/:id/read` | Ya | Semua |
| 16 | PUT | `/notifikasi/read-all` | Ya | Semua |
| 17 | GET | `/pengguna` | Ya | ADMIN_TU |
| 18 | GET | `/pengguna/:id` | Ya | ADMIN_TU |
| 19 | GET | `/pengguna/guru-staf` | Ya | ADMIN_TU, KEPALA |
| 20 | POST | `/pengguna` | Ya | ADMIN_TU |
| 21 | PUT | `/pengguna/:id` | Ya | ADMIN_TU |
| 22 | PUT | `/pengguna/:id/password` | Ya | ADMIN_TU |
| 23 | DELETE | `/pengguna/:id` | Ya | ADMIN_TU |
| 24 | GET | `/surat/:suratId/komentar` | Ya | Semua |
| 25 | POST | `/surat/:suratId/komentar` | Ya | Semua |
| 26 | DELETE | `/surat/:suratId/komentar/:id` | Ya | Pemilik / Admin / Kepala |
| 27 | GET | `/audit-log` | Ya | ADMIN_TU, KEPALA |
| 28 | POST | `/laporan/generate` | Ya | ADMIN_TU |
| 29 | GET | `/laporan/pdf` | Ya | ADMIN_TU |
| 30 | GET | `/public/lacak` | Tidak | Public |
| 31 | GET | `/health` | Tidak | Public |

**Total: 31 endpoints** (30 API + 1 health check)

---

## WebSocket Events

| Event | Trigger | Target Room | Payload |
|-------|---------|-------------|---------|
| `surat:baru` | Admin input surat | `role:KEPALA_SEKOLAH` | Surat object |
| `disposisi:baru` | Kepala buat disposisi | `user:{penerima_id}` | Disposisi object |
| `status:update` | Guru update status | `role:KEPALA_SEKOLAH`, `role:WAKASEK_BIDANG:{bidang}` | `{ surat_id, status, nomorSurat }` |
| `notifikasi:baru` | Notifikasi dibuat | `user:{target_id}` | Notifikasi object |
| `dashboard:refresh` | Data berubah | `role:KEPALA_SEKOLAH`, `role:WAKASEK` | `{}` |
| `lacak:update` | Status berubah | `lacak:{nomorSurat}` (public) | `{ status, posisiSaatIni }` |

---

## Error Response Format

Semua error mengikuti format:

```json
{
  "message": "Deskripsi error"
}
```

| Status Code | Keterangan |
|-------------|------------|
| 400 | Validasi gagal / input tidak valid |
| 401 | Tidak terautentikasi / token expired |
| 403 | Tidak memiliki akses |
| 404 | Data tidak ditemukan |
| 500 | Kesalahan server |
