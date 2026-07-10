# System Logic: UC-010 Lihat Dashboard Monitoring

Document Version: v1.0

Use Case ID: UC-010

Use Case Name: Lihat Dashboard Monitoring

Status: Draft

Last Updated: 2026-06-28

Author: System Analyst AI

---

## 1. Overview

This document defines the system logic for viewing dashboard with statistics and live position table.

---

## 2. Related Screens

| Screen | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Ringkasan statistik + Posisi Surat |

---

## 3. Related Entities

| Entity | Table | Description |
|---|---|---|
| Surat Masuk | `surat_masuk` | Data surat untuk statistik |
| Disposisi | `disposisi` | Data disposisi |

---

## 4. API Contract

### 4.1 GET /api/surat/stats

Statistik dashboard.

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_surat": 50,
    "diterima": 10,
    "didisposisi": 15,
    "diproses": 12,
    "selesai": 13,
    "overdue": 5
  },
  "message": "Success"
}
```

---

### 4.2 GET /api/surat/posisi

Posisi surat (live table).

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nomor_surat": "001/SM9-YK/VI/2026",
      "pengirim": "Dinas Pendidikan Kota Yogyakarta",
      "perihal": "Undangan Rapat Koordinasi",
      "status": "Didisposisi",
      "posisi_saat_ini": "Kurikulum"
    }
  ],
  "message": "Success"
}
```

---

## 5. WebSocket Events

| Event | Room | Description |
|---|---|---|
| dashboard:refresh | role:KEPALA_SEKOLAH | Dashboard perlu refresh |
| dashboard:refresh | role:WAKASEK | Dashboard perlu refresh |

---

## 6. Traceability

| User Flow | Requirement | API Endpoint |
|---|---|---|
| userflow_uc_010.md | F-09, F-11, F-16 | GET /api/surat/stats, GET /api/surat/posisi |
