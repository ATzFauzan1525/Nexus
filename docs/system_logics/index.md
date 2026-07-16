# System Logic Specifications

Document Version: v1.0

Project: SiDis — Sistem Informasi Disposisi dan Pelacakan Surat Digital

Product: Web-Based Letter Disposition & Tracking System

Status: Validated / Active

Last Updated: 2026-07-16

Author: System Analyst AI

---

## 1. PURPOSE

This document serves as the main index for all System Logic Specifications.

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
| UC-002 | Input Incoming Letter | ./sys_uc_002.md | Draft |
| UC-003 | Create Digital Disposition | ./sys_uc_003.md | Draft |
| UC-004 | Update Letter Status | ./sys_uc_004.md | Draft |
| UC-005 | Receive & View Notifications | ./sys_uc_005.md | Draft |
| UC-006 | Advanced Search | ./sys_uc_006.md | Draft |
| UC-007 | View Letter Timeline | ./sys_uc_007.md | Draft |
| UC-008 | Download PDF Report | ./sys_uc_008.md | Draft |
| UC-009 | Manage User Accounts | ./sys_uc_009.md | Draft |
| UC-010 | View Monitoring Dashboard | ./sys_uc_010.md | Draft |
| UC-011 | Multi-Actor Realtime Sync | ./sys_uc_011.md | Draft |
| UC-012 | Track Public Letter | ./sys_uc_012.md | Draft |
| UC-013 | Add Comment | ./sys_uc_013.md | Draft |
| UC-014 | View Audit Log | ./sys_uc_014.md | Draft |
| UC-015 | Download Scan File | ./sys_uc_015.md | Draft |
| UC-016 | View Letter Position (Live Table) | ./sys_uc_016.md | Draft |

---

## 4. USER FLOW → SYSTEM LOGIC MAPPING

| User Flow | System Logic | Description |
|---|---|---|
| userflow_uc_001.md | sys_uc_001.md | Authentication flow and login API |
| userflow_uc_002.md | sys_uc_002.md | Letter input + file upload |
| userflow_uc_003.md | sys_uc_003.md | Create disposition + realtime notification |
| userflow_uc_004.md | sys_uc_004.md | Update letter status (Follow-up / Completed) |
| userflow_uc_005.md | sys_uc_005.md | Internal notification via WebSocket |
| userflow_uc_006.md | sys_uc_006.md | Letter search & filter |
| userflow_uc_007.md | sys_uc_007.md | Letter history timeline (event sourcing) |
| userflow_uc_008.md | sys_uc_008.md | Generate & download PDF report |
| userflow_uc_009.md | sys_uc_009.md | User CRUD by Admin TU |
| userflow_uc_010.md | sys_uc_010.md | Dashboard monitoring + Letter Position |
| userflow_uc_011.md | sys_uc_011.md | Multi-actor WebSocket synchronization |
| userflow_uc_012.md | sys_uc_012.md | Public tracking without login |
| userflow_uc_013.md | sys_uc_013.md | Team discussion comments |
| userflow_uc_014.md | sys_uc_014.md | Data change audit log |
| userflow_uc_015.md | sys_uc_015.md | Download scan file from database |
| userflow_uc_016.md | sys_uc_016.md | Letter position live table + highlight |

---

## 5. API OVERVIEW

### Base URL

```
/api
```

### Authentication

All endpoints (except login and `/api/public/lacak`) require a Bearer token in the Authorization header:

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
| surat:baru | Server → Client | New incoming letter |
| disposisi:baru | Server → Client | New disposition |
| status:update | Server → Client | Letter status changed |
| notifikasi:baru | Server → Client | New notification |
| dashboard:refresh | Server → Client | Dashboard needs refresh |
| lacak:update | Server → Client | Update for public tracking page |

---

## 6. REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 2026-06-28 | System Analyst AI | Initial Draft |