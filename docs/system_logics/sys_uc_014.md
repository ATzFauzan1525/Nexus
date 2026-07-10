# System Logic: UC-014 Lihat Audit Log

Document Version: v1.0

Use Case ID: UC-014

Use Case Name: Lihat Audit Log

Status: Draft

Last Updated: 2026-06-28

Author: System Analyst AI

---

## 1. Overview

This document defines the system logic for viewing audit log.

---

## 2. Related Screens

| Screen | Route | Description |
|---|---|---|
| Audit Log | `/audit-log` | Daftar pencatatan perubahan |

---

## 3. Related Entities

| Entity | Table | Description |
|---|---|---|
| Audit Log | `audit_log` | Pencatatan otomatis perubahan |
| Pengguna | `pengguna` | User yang melakukan aksi |

---

## 4. API Contract

### 4.1 GET /api/audit-log

Daftar audit log.

**Query Params:**

| Param | Type | Description |
|---|---|---|
| aksi | string | Filter aksi (CREATE/UPDATE_STATUS/DELETE) |
| entitas | string | Filter entitas (surat_masuk/disposisi/pengguna) |
| page | number | Halaman |
| limit | number | Limit per halaman |

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "audit_log": [
      {
        "id": "uuid",
        "user": {
          "nama_lengkap": "Admin TU",
          "role": "ADMIN_TU"
        },
        "aksi": "CREATE",
        "entitas": "surat_masuk",
        "entitas_id": "uuid",
        "detail": "Surat masuk baru: 001/SM9-YK/VI/2026",
        "ip_address": "192.168.1.1",
        "created_at": "2026-06-28T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  },
  "message": "Success"
}
```

---

## 5. Business Rules Reference

| Code | Rule |
|---|---|
| BR-19 | Audit Log hanya dapat dilihat oleh Admin TU dan Kepala Sekolah |

---

## 6. Traceability

| User Flow | Requirement | API Endpoint |
|---|---|---|
| userflow_uc_014.md | F-15, BR-19 | GET /api/audit-log |
