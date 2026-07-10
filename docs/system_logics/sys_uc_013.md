# System Logic: UC-013 Tambah Komentar

Document Version: v1.0

Use Case ID: UC-013

Use Case Name: Tambah Komentar pada Surat

Status: Draft

Last Updated: 2026-06-28

Author: System Analyst AI

---

## 1. Overview

This document defines the system logic for adding comments on letters.

---

## 2. Related Screens

| Screen | Route | Description |
|---|---|---|
| Detail Surat | `/surat/:id` | Detail surat + komentar section |
| Detail Disposisi | `/disposisi/:id` | Detail disposisi + komentar section |

---

## 3. Related Entities

| Entity | Table | Description |
|---|---|---|
| Komentar | `komentar` | Data komentar diskusi tim |
| Pengguna | `pengguna` | Penulis komentar |

---

## 4. API Contract

### 4.1 GET /api/surat/:suratId/komentar

Ambil komentar surat.

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "isi": "Sudah saya terima",
      "user": {
        "id": "uuid",
        "nama_lengkap": "Guru Kurikulum",
        "role": "GURU_STAF"
      },
      "created_at": "2026-06-28T11:00:00Z"
    }
  ],
  "message": "Success"
}
```

---

### 4.2 POST /api/surat/:suratId/komentar

Tambah komentar baru.

**Request Body:**

```json
{
  "isi": "string (required, min 1 char)"
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isi": "Sudah saya terima",
    "user_id": "uuid",
    "created_at": "2026-06-28T11:00:00Z"
  },
  "message": "Komentar berhasil ditambahkan"
}
```

---

### 4.3 DELETE /api/surat/:suratId/komentar/:id

Hapus komentar.

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": null,
  "message": "Komentar berhasil dihapus"
}
```

**Error Response (403 Forbidden):**

```json
{
  "success": false,
  "data": null,
  "message": "Tidak memiliki akses untuk menghapus komentar ini",
  "errors": []
}
```

---

## 5. Business Rules Reference

| Code | Rule |
|---|---|
| BR-18 | Komentar hanya dapat dihapus oleh penulis, Admin TU, atau Kepala Sekolah |

---

## 6. Traceability

| User Flow | Requirement | API Endpoint |
|---|---|---|
| userflow_uc_013.md | F-13, BR-18 | GET/POST/DELETE /api/surat/:suratId/komentar |
