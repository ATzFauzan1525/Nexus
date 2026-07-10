# User Flow Specification

Document Version: v0.1

Use Case ID: UC-005  
Use Case Name: Terima & Lihat Notifikasi

Status: Draft  
Last Updated: 2026-07-10  
Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Seluruh aktor internal menerima notifikasi otomatis dari sistem setiap kali terjadi event relevan (surat masuk baru, disposisi baru, perubahan status), melihatnya melalui dropdown Topbar atau halaman notifikasi penuh, dan dapat menandai notifikasi sebagai sudah dibaca.

## 1.2 Goal

Pengguna ingin mendapat informasi real-time tentang perubahan data surat yang relevan tanpa harus mengecek secara manual ke halaman masing-masing.

## 1.3 Requirement References

|Requirement ID|Requirement Name|
|---|---|
|F-06|Notifikasi otomatis internal|

## 1.4 Primary Actor

Semua Aktor Internal (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek)

## 1.5 Supporting Actors

Sistem Notifikasi, WebSocket (Socket.io)

---

# 2. TRIGGER

Terjadi event di sistem yang memicu pembuatan notifikasi: surat masuk baru diinput (BR-06), disposisi baru dibuat (BR-07), atau status surat diperbarui.

---

# 3. PRECONDITIONS

|ID|Condition|
|---|---|
|PRE-001|Pengguna sudah login|
|PRE-002|Terdapat event di sistem yang memicu notifikasi sesuai BR-06, BR-07, dan BR-08|

---

# 4. MAIN FLOW

|Step|Actor Action|System Response|
|---|---|---|
|1||Sistem secara otomatis membuat entri baru di tabel `notifikasi` setiap terjadi event relevan (surat baru, disposisi baru, update status)|
|2||Ikon lonceng di Topbar menampilkan badge angka merah sesuai jumlah notifikasi `dibaca = false` milik pengguna — diperbarui realtime via WebSocket|
|3|Pengguna menekan ikon lonceng|Sistem menampilkan dropdown berisi 5 notifikasi terbaru, masing-masing menampilkan judul, pesan singkat, dan waktu relatif (misal: "5 menit lalu")|
|4|Pengguna menekan salah satu notifikasi pada dropdown|Sistem menandai notifikasi tersebut sebagai sudah dibaca (`dibaca = true`) dan mengarahkan pengguna ke halaman terkait (detail surat atau detail disposisi)|
|5|Pengguna menekan "Lihat Semua" di bagian bawah dropdown|Sistem mengarahkan ke halaman penuh `/notifications`|
|6||Sistem menampilkan seluruh riwayat notifikasi milik pengguna, diurutkan dari terbaru, dengan indikator visual (dot biru) untuk yang belum dibaca|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Tidak Ada Notifikasi

### Condition

Ketika belum ada notifikasi sama sekali untuk pengguna.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Pengguna menekan ikon lonceng|Sistem menampilkan Empty State: "Belum ada notifikasi."|

---

## AF-002: Tandai Semua Dibaca

### Condition

Ketika pengguna ingin menandai seluruh notifikasi sebagai sudah dibaca sekaligus.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Pengguna menekan tombol "Tandai Semua Dibaca"|Sistem memperbarui seluruh notifikasi pengguna menjadi `dibaca = true`|
|2||Badge merah di ikon lonceng menghilang|

---

## AF-003: Notifikasi Merujuk ke Data yang Sudah Tidak Tersedia

### Condition

Ketika notifikasi merujuk ke surat/disposisi yang sudah dihapus atau tidak dapat diakses oleh role pengguna saat ini.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Pengguna menekan notifikasi tersebut|Sistem menampilkan pesan: "Data terkait tidak lagi tersedia."|
|2||Sistem tetap menandai notifikasi sebagai sudah dibaca|

---

# 6. EXCEPTION FLOWS

## EF-001: Koneksi WebSocket Terputus

### Condition

Ketika koneksi WebSocket klien terputus sementara.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1||Sistem klien mendeteksi koneksi WebSocket terputus (NF-09)|
|2||Sistem secara otomatis mencoba menyambung kembali (auto-reconnect)|
|3||Setelah koneksi pulih, sistem menyinkronkan notifikasi terbaru dari server|

---

## EF-002: Lonjakan Notifikasi

### Condition

Ketika banyak notifikasi masuk dalam waktu singkat (misal: disposisi massal).

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1||Sistem tetap membuat entri notifikasi satu per satu|
|2||Badge angka di ikon lonceng diperbarui secara realtime|
|3||Dropdown tetap menampilkan 5 notifikasi terbaru|

---

# 7. POSTCONDITIONS

|ID|Condition|
|---|---|
|POST-001|Notifikasi yang dibuka berubah status menjadi sudah dibaca|
|POST-002|Badge jumlah notifikasi di Topbar diperbarui secara real-time via WebSocket|
|POST-003|Pengguna diarahkan ke halaman terkait saat menekan notifikasi|

---

# 8. BUSINESS RULES

|Rule ID|Description|
|---|---|
|BR-06|Notifikasi otomatis dikirim ke Kepala Sekolah setiap ada surat masuk baru|
|BR-07|Notifikasi otomatis dikirim ke Guru/Staf setiap ada disposisi baru ditujukan kepadanya|
|BR-08|Setiap perubahan status surat harus tercatat sebagai entri baru di tabel `status_surat`|
|BR-15|Setiap perubahan data wajib didorong (push) secara realtime via WebSocket|
|NF-09|Auto-reconnect jika koneksi WebSocket terputus|

---

# 9. RELATED PAGES

|Page ID|Page Name|
|---|---|
|PAGE-008|Notifikasi (`/notifications`)|
|PAGE-TOP|Topbar (ikon lonceng + dropdown)|

---

# 10. DATA USAGE

## 10.1 Data Read

|Entity|Description|
|---|---|
|notifikasi|Mengambil daftar notifikasi milik pengguna yang sedang login|

---

## 10.2 Data Created

|Entity|Description|
|---|---|
|notifikasi|Dibuat otomatis oleh sistem saat event relevan terjadi|

---

## 10.3 Data Updated

|Entity|Description|
|---|---|
|notifikasi|Memperbarui kolom `dibaca` dari `false` ke `true` saat notifikasi dibuka atau "Tandai Semua Dibaca"|

---

## 10.4 Data Deleted

|Entity|Description|
|---|---|
|None|Tidak ada data yang dihapus|

---

# 11. PERMISSIONS

|Role|Access|
|---|---|
|ADMIN_TU|AKSI (ALLOWED) — melihat notifikasinya sendiri|
|KEPALA_SEKOLAH|AKSI (ALLOWED) — melihat notifikasinya sendiri|
|GURU_STAF|AKSI (ALLOWED) — melihat notifikasinya sendiri|
|WAKASEK|AKSI (ALLOWED) — melihat notifikasinya sendiri|

---

# 12. ACCEPTANCE CRITERIA

|AC ID|Description|
|---|---|
|AC-001|Ikon lonceng menampilkan badge merah dengan jumlah notifikasi belum dibaca|
|AC-002|Dropdown menampilkan 5 notifikasi terbaru dengan waktu relatif|
|AC-003|Menekan notifikasi mengarahkan ke halaman terkait dan menandai sebagai dibaca|
|AC-004|"Lihat Semua" mengarahkan ke halaman `/notifications`|
|AC-005|"Tandai Semua Dibaca" menandai semua notifikasi sebagai dibaca|
|AC-006|Empty state muncul jika tidak ada notifikasi|
|AC-007|Badge diperbarui secara realtime tanpa refresh halaman|

---

# 13. TRACEABILITY

## Requirement Traceability

|Requirement ID|
|---|
|F-06|

## Information Architecture Traceability

|Page ID|
|---|
|PAGE-008|
|PAGE-TOP|

---

# 15. REVISION HISTORY

|Version|Date|Author|Description|
|---|---|---|---|
|0.1|2026-07-10|System Analyst AI|Initial Draft|
