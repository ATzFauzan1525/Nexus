# System Logic: UC-003 Create Digital Disposition

Document Version: v1.0

Use Case ID: UC-003

Use Case Name: Create Digital Disposition

Status: Draft

Last Updated: 2026-06-28

Author: System Analyst AI

---

## 1. Overview

This document defines the system logic for creating digital dispositions by the Principal.

---

## 2. Related Pages

| Page | Route | Description |
|---|---|---|
| Disposition Form | `/disposisi/buat/:idSurat` | Disposition form: select recipient, instructions, deadline |
| Letter Detail | `/surat/:id` | Letter detail with "Create Disposition" button |

---

## 3. Related Entities

| Entity | Table | Description |
|---|---|---|
| Disposition | `disposisi` | Letter disposition data |
| Incoming Letter | `surat_masuk` | Dispositioned letter |
| User | `pengguna` | Principal (creator) & Teacher/Staff (recipient) |
| Notification | `notifikasi` | Notification to disposition recipient |

---

## 4. Sequence Diagram

```mermaid
sequenceDiagram
    actor Kepala
    participant Browser
    participant Frontend
    participant API
    participant Database
    actor Guru

    Kepala->>Browser: Navigate to /disposisi/buat/:idSurat
    Browser->>Frontend: Load disposition form
    Frontend->>API: GET /api/surat/:id
    API->>Database: Query letter + status
    API-->>Frontend: 200 OK + SuratMasuk object
    Frontend-->>Kepala: Display form with letter info

    Kepala->>Frontend: Select recipient (Teacher/Staff)
    Kepala->>Frontend: Fill instructions
    Kepala->>Frontend: Set deadline
    Kepala->>Frontend: Click "Buat Disposisi"

    Frontend->>Frontend: Validate form

    alt Input valid
        Frontend->>API: POST /api/disposisi
        API->>Database: INSERT disposisi
        API->>Database: UPDATE surat_masuk.status = 'Didisposisi'
        API->>Database: INSERT status_surat (Didisposisi)
        API->>Database: INSERT notifikasi (to Guru)
        API->>API: Log audit_log (CREATE)
        API-->>Frontend: 201 Created + Disposisi object
        Frontend->>Browser: Redirect to /disposisi
        Frontend-->>Kepala: Show success toast

        Note over API,Guru: WebSocket Notification
        API->>Guru: Emit 'disposisi:baru' to room user:{idGuru}
        API->>Guru: Emit 'notifikasi:baru' to room user:{idGuru}
        API->>Guru: Emit 'status:update' to room role:WAKASEK_BIDANG:{bidang}
        API->>Guru: Emit 'dashboard:refresh'
    else Input invalid
        Frontend-->>Kepala: Show validation errors
    end
```

---

## 5. API Contract

### 5.1 POST /api/disposisi

Create new disposition.

**Request Headers:**

| Header | Value |
|---|---|
| Authorization | Bearer <jwt_token> |
| Content-Type | application/json |

**Request Body:**

```json
{
  "surat_id": "uuid (required)",
  "diberikan_kepada": "uuid (required)",
  "instruksi": "string (required)",
  "deadline": "date (required)"
}
```

**Request Example:**

```json
{
  "surat_id": "uuid-surat",
  "diberikan_kepada": "uuid-guru-kurikulum",
  "instruksi": "Mohon ditindaklanjuti undangan rapat koordinasi ini",
  "deadline": "2026-07-05"
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "surat_id": "uuid-surat",
    "diberikan_oleh": "uuid-kepala",
    "diberikan_kepada": "uuid-guru",
    "instruksi": "Mohon ditindaklanjuti undangan rapat koordinasi ini",
    "deadline": "2026-07-05",
    "created_at": "2026-06-28T10:30:00Z",
    "surat": {
      "nomor_surat": "001/SM9-YK/VI/2026",
      "pengirim": "Dinas Pendidikan Kota Yogyakarta",
      "perihal": "Undangan Rapat Koordinasi"
    },
    "penerima": {
      "nama_lengkap": "Guru Kurikulum",
      "bidang": "Kurikulum"
    }
  },
  "message": "Disposition created successfully"
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": [
    {
      "field": "diberikan_kepada",
      "message": "Recipient must be selected"
    }
  ]
}
```

---

## 6. Data Flow

| Frontend Column | Database Column | Transformation |
|---|---|---|
| surat_id | surat_id | Direct mapping |
| diberikan_kepada | diberikan_kepada | Direct mapping |
| instruksi | instruksi | Direct mapping |
| deadline | deadline | Direct mapping |
| - | diberikan_oleh | From JWT token (Principal) |
| - | surat_masuk.status | Updated to 'Didisposisi' |

---

## 7. Validation Rules

| Column | Rule | Error Message |
|---|---|---|
| surat_id | Required, valid UUID | "Invalid letter" |
| diberikan_kepada | Required, must be GURU_STAF | "Recipient must be selected" |
| instruksi | Required, min 10 characters | "Instructions must be at least 10 characters" |
| deadline | Required, must be future date | "Deadline must be in the future" |

---

## 8. Security Rules

| Rule | Description |
|---|---|
| Authentication | JWT authentication required |
| Authorization | Only Principal can create dispositions (BR-04) |
| Letter Validation | Letter must exist and have "Received" or "Dispositioned" status |

---

## 9. Business Rule References

| Code | Rule |
|---|---|
| BR-03 | Letter status changes: Received → Dispositioned |
| BR-04 | Dispositions can only be created by Principal |
| BR-05 | One letter can have multiple dispositions |
| BR-07 | Automatic notification sent to Teacher/Staff whenever new disposition arrives |
| BR-08 | Status changes recorded in status_surat table |
| BR-15 | Data changes pushed in realtime via WebSocket |

---

## 10. WebSocket Events

| Event | Room | Payload |
|---|---|---|
| disposisi:baru | user:{idGuru} | Complete Disposisi object |
| notifikasi:baru | user:{idGuru} | Notifikasi object |
| status:update | role:WAKASEK_BIDANG:{bidang} | Latest letter status |
| dashboard:refresh | role:KEPALA_SEKOLAH, role:WAKASEK | Dashboard summary |

---

## 11. Traceability

| User Flow | Requirement | API Endpoint |
|---|---|---|
| userflow_uc_003.md | F-04, BR-03, BR-04, BR-05, BR-07, BR-08, BR-15 | POST /api/disposisi |