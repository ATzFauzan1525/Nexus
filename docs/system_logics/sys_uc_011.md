# System Logic: UC-011 Sinkronisasi Realtime Multi-Aktor

Document Version: v1.0

Use Case ID: UC-011

Use Case Name: Sinkronisasi Realtime Multi-Aktor

Status: Draft

Last Updated: 2026-06-28

Author: System Analyst AI

---

## 1. Overview

This document defines the system logic for realtime synchronization via WebSocket across multiple actors.

---

## 2. Related Screens

| Screen | Route | Description |
|---|---|---|
| All Pages | - | Realtime updates on any page |

---

## 3. Related Entities

| Entity | Table | Description |
|---|---|---|
| All | All | Any data change triggers WebSocket event |

---

## 4. WebSocket Connection

### 4.1 Connection Setup

```javascript
// Client connects with JWT token
const socket = io(API_URL, {
  auth: { token: jwt_token }
});

// Server verifies token and joins rooms
socket.on('connect', () => {
  // Client joins rooms based on role
});
```

### 4.2 Room Structure

| Room | Description | Joined By |
|---|---|---|
| user:{id} | Notifikasi personal | Semua user login |
| role:{peran} | Broadcast sesuai role | Semua user login |
| role:WAKASEK_BIDANG:{bidang} | Khusus Wakasek per bidang | Wakasek only |
| lacak:{nomorSurat} | Publik (tanpa login) | User di /lacak |

---

## 5. WebSocket Events

### 5.1 Outgoing Events (Server → Client)

| Event | Room Target | Payload |
|---|---|---|
| surat:baru | role:KEPALA_SEKOLAH | Object SuratMasuk |
| disposisi:baru | user:{idPenerima} | Object Disposisi |
| status:update | role:KEPALA_SEKOLAH, role:WAKASEK_BIDANG:{bidang} | Status terbaru |
| notifikasi:baru | user:{idPenerima} | Object Notifikasi |
| dashboard:refresh | role:KEPALA_SEKOLAH, role:WAKASEK | Trigger refresh |
| lacak:update | lacak:{nomorSurat} | {status, posisiSaatIni} |

### 5.2 Client Actions on Events

| Event | Client Action |
|---|---|
| surat:baru | Add surat to table, highlight row |
| disposisi:baru | Add disposisi to list, show notification |
| status:update | Update status badge, highlight row |
| notifikasi:baru | Increment badge, add to dropdown |
| dashboard:refresh | Re-fetch stats and position table |
| lacak:update | Update tracking result |

---

## 6. Reconnection Logic

```javascript
socket.on('disconnect', () => {
  // Show "Menyambungkan ulang..." indicator
});

socket.on('connect', () => {
  // Resync data from REST API
  // Show "Koneksi tersambung kembali" toast
});
```

---

## 7. Business Rules Reference

| Code | Rule |
|---|---|
| BR-15 | Setiap perubahan data wajib didorong secara realtime via WebSocket |
| NF-08 | Update harus diterima klien dalam waktu ≤ 2 detik |
| NF-09 | Auto-reconnect dengan resync saat koneksi pulih |

---

## 8. Traceability

| User Flow | Requirement | API Endpoint |
|---|---|---|
| userflow_uc_011.md | F-11, BR-15, NF-08, NF-09 | WebSocket (socket.io) |
