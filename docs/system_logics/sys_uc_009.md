# System Logic: UC-009 Kelola Akun Pengguna

Document Version: v1.0

Use Case ID: UC-009

Use Case Name: Kelola Akun Pengguna

Status: Draft

Last Updated: 2026-06-28

Author: System Analyst AI

---

## 1. Overview

This document defines the system logic for managing user accounts (CRUD) by Admin TU.

---

## 2. Related Screens

| Screen | Route | Description |
|---|---|---|
| Daftar Pengguna | `/pengguna` | Tabel daftar akun pengguna |
| Tambah Pengguna | `/pengguna/tambah` | Form tambah akun baru |
| Edit Pengguna | `/pengguna/:id/edit` | Form ubah data akun |

---

## 3. Related Entities

| Entity | Table | Description |
|---|---|---|
| Pengguna | `pengguna` | Data akun pengguna |

---

## 4. API Contract

### 4.1 GET /api/pengguna

Daftar seluruh pengguna.

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "username": "admin",
      "nama_lengkap": "Admin TU",
      "role": "ADMIN_TU",
      "bidang": null,
      "is_active": true,
      "created_at": "2026-06-28T00:00:00Z"
    }
  ],
  "message": "Success"
}
```

---

### 4.2 POST /api/pengguna

Tambah pengguna baru.

**Request Body:**

```json
{
  "username": "string (required, unique)",
  "password": "string (required, min 6)",
  "nama_lengkap": "string (required)",
  "role": "string (required: ADMIN_TU/KEPALA_SEKOLAH/GURU_STAF/WAKASEK)",
  "bidang": "string (required if role=GURU_STAF/WAKASEK)"
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "guru6",
    "nama_lengkap": "Guru Baru",
    "role": "GURU_STAF",
    "bidang": "Kurikulum",
    "is_active": true
  },
  "message": "Pengguna berhasil ditambahkan"
}
```

---

### 4.3 PUT /api/pengguna/:id

Update data pengguna.

**Request Body:**

```json
{
  "nama_lengkap": "string (optional)",
  "role": "string (optional)",
  "bidang": "string (optional)",
  "is_active": "boolean (optional)"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": null,
  "message": "Pengguna berhasil diupdate"
}
```

---

### 4.4 DELETE /api/pengguna/:id

Hapus pengguna.

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": null,
  "message": "Pengguna berhasil dihapus"
}
```

---

## 5. Business Rules Reference

| Code | Rule |
|---|---|
| BR-02 | Akun hanya dapat dibuat oleh Admin TU |
| BR-10 | Wakasek hanya dapat melihat surat yang berhubungan dengan bidangnya |
| BR-11 | Guru/Staf hanya dapat melihat surat yang didisposisikan kepadanya |

---

## 6. Traceability

| User Flow | Requirement | API Endpoint |
|---|---|---|
| userflow_uc_009.md | F-02, BR-02 | GET/POST/PUT/DELETE /api/pengguna |
