# System Logic Specifications

Document Version: v1.0

Project: SiDis (Sistem Informasi Disposisi dan Pelacakan Surat Digital)

Product: Web-Based Document Management & Disposisi System

Status: Draft

Last Updated: 2026-06-28

Author: System Analyst AI

---

## 1. PURPOSE

This document serves as the master index for all System Logic Specifications.

Each System Logic contains sequence diagrams and API contracts derived from the corresponding User Flow specifications.

---

## 2. FILE STRUCTURE

```
system_logics/
├── index.md
├── sys_uc_001.md
├── sys_uc_002.md
├── sys_uc_003.md
├── sys_uc_004.md
├── sys_uc_005.md
├── sys_uc_006.md
├── sys_uc_007.md
├── sys_uc_008.md
├── sys_uc_009.md
├── sys_uc_010.md
├── sys_uc_011.md
├── sys_uc_012.md
├── sys_uc_013.md
├── sys_uc_014.md
├── sys_uc_015.md
└── sys_uc_016.md
```

---

## 3. SYSTEM LOGIC CATALOG

| Use Case ID | Use Case Name | File Path | Status |
|---|---|---|---|
| UC-001 | User Login | ./sys_uc_001.md | Draft |
| UC-002 | Input Surat Masuk | ./sys_uc_002.md | Draft |
| UC-003 | Buat Disposisi Digital | ./sys_uc_003.md | Draft |
| UC-004 | Update Status Surat | ./sys_uc_004.md | Draft |
| UC-005 | Terima & Lihat Notifikasi | ./sys_uc_005.md | Draft |
| UC-006 | Pencarian Lanjutan | ./sys_uc_006.md | Draft |
| UC-007 | Lihat Timeline Surat | ./sys_uc_007.md | Draft |
| UC-008 | Download Laporan PDF | ./sys_uc_008.md | Draft |
| UC-009 | Kelola Akun Pengguna | ./sys_uc_009.md | Draft |
| UC-010 | Lihat Dashboard Monitoring | ./sys_uc_010.md | Draft |
| UC-011 | Sinkronisasi Realtime Multi-Aktor | ./sys_uc_011.md | Draft |
| UC-012 | Lacak Surat Publik | ./sys_uc_012.md | Draft |
| UC-013 | Tambah Komentar | ./sys_uc_013.md | Draft |
| UC-014 | Lihat Audit Log | ./sys_uc_014.md | Draft |
| UC-015 | Download File Scan | ./sys_uc_015.md | Draft |
| UC-016 | Lihat Posisi Surat (Live Table) | ./sys_uc_016.md | Draft |

---

## 4. USER FLOW → SYSTEM LOGIC MAPPING

| User Flow | System Logic | Description |
|---|---|---|
| userflow_uc_001.md | sys_uc_001.md | Authentication flow and login API |
| userflow_uc_002.md | sys_uc_002.md | Input surat masuk + upload file BYTEA |
| userflow_uc_003.md | sys_uc_003.md | Buat disposisi + notifikasi realtime |
| userflow_uc_004.md | sys_uc_004.md | Update status surat (Tindak Lanjut/Selesai) |
| userflow_uc_005.md | sys_uc_005.md | Notifikasi internal via WebSocket |
| userflow_uc_006.md | sys_uc_006.md | Pencarian & filter surat |
| userflow_uc_007.md | sys_uc_007.md | Timeline riwayat surat (event sourcing) |
| userflow_uc_008.md | sys_uc_008.md | Generate & download laporan PDF |
| userflow_uc_009.md | sys_uc_009.md | CRUD pengguna oleh Admin TU |
| userflow_uc_010.md | sys_uc_010.md | Dashboard monitoring + Posisi Surat |
| userflow_uc_011.md | sys_uc_011.md | WebSocket sync multi-actor |
| userflow_uc_012.md | sys_uc_012.md | Pelacakan publik tanpa login |
| userflow_uc_013.md | sys_uc_013.md | Komentar diskusi tim |
| userflow_uc_014.md | sys_uc_014.md | Audit log perubahan data |
| userflow_uc_015.md | sys_uc_015.md | Download file scan dari database |
| userflow_uc_016.md | sys_uc_016.md | Posisi surat live table + highlight |

---

## 5. API OVERVIEW

### Base URL

```
/api
```

### Authentication

All endpoints (except login and `/api/public/lacak`) require Bearer token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Common Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "errors": []
}
```

### HTTP Status Codes

| Code | Description |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

### WebSocket Events

| Event | Direction | Description |
|---|---|---|
| surat:baru | Server → Client | Surat masuk baru |
| disposisi:baru | Server → Client | Disposisi baru |
| status:update | Server → Client | Status surat berubah |
| notifikasi:baru | Server → Client | Notifikasi baru |
| dashboard:refresh | Server → Client | Dashboard perlu refresh |
| lacak:update | Server → Client | Update untuk halaman lacak publik |

---

## 6. REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 2026-06-28 | System Analyst AI | Initial Draft |
