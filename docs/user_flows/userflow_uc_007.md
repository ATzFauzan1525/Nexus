# User Flow Specification

Document Version: v0.1

Use Case ID: UC-007  
Use Case Name: Lihat Timeline Surat

Status: Draft  
Last Updated: 2026-07-10  
Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Aktor internal membuka halaman detail surat dan melihat seluruh riwayat perjalanan surat dari diterima hingga status terkini, ditampilkan dalam bentuk vertical timeline.

## 1.2 Goal

Aktor ingin mengetahui posisi dan riwayat lengkap suatu surat tanpa harus bertanya ke Admin TU secara manual.

## 1.3 Requirement References

|Requirement ID|Requirement Name|
|---|---|
|F-08|Timeline/riwayat lengkap alur surat dari diterima hingga selesai|
|F-11|Pelacakan posisi terkini surat secara real-time|

## 1.4 Primary Actor

Semua Aktor Internal (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek)

## 1.5 Supporting Actors

Sistem Riwayat Surat

---

# 2. TRIGGER

Aktor mengklik baris surat pada tabel `/surat`, menekan tombol "Detail" pada disposisi, atau mengklik notifikasi yang merujuk ke surat tertentu.

---

# 3. PRECONDITIONS

|ID|Condition|
|---|---|
|PRE-001|Aktor sudah login (UC-001 selesai)|
|PRE-002|Surat dengan ID yang dituju sudah ada di sistem|
|PRE-003|Aktor memiliki hak akses terhadap surat tersebut sesuai role (BR-10, BR-11)|

---

# 4. MAIN FLOW

|Step|Actor Action|System Response|
|---|---|---|
|1|Aktor mengakses halaman `/surat/:id`|Sistem memvalidasi akses pengguna terhadap surat tersebut|
|2||Sistem menampilkan header informasi surat: nomor surat, tanggal diterima, pengirim, perihal, badge status terkini|
|3||Sistem menampilkan tombol download file scan (jika ada)|
|4|Aktor men-scroll ke bagian "Timeline / Riwayat Surat"|Sistem menampilkan seluruh entri dari tabel `status_surat` yang berkaitan, diurutkan berdasarkan `created_at` ascending|
|5||Setiap entri ditampilkan dalam bentuk vertical timeline dengan ikon status berwarna|
|6||Setiap entri menampilkan: status (badge), nama pengguna yang melakukan perubahan, waktu, dan catatan (jika ada)|
|7||Jika surat sudah memiliki disposisi, sistem menampilkan ringkasan disposisi: penerima, instruksi, deadline|
|8||Sistem menampilkan badge status live yang terupdate secara real-time via WebSocket|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Belum Ada Disposisi

### Condition

Ketika surat belum pernah didisposisi oleh Kepala Sekolah.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Aktor membuka halaman detail surat|Sistem tidak menampilkan bagian ringkasan disposisi|
|2||Timeline hanya menampilkan entri status "Diterima"|

---

## AF-002: Guru/Staf Mengakses Surat Tanpa Disposisi

### Condition

Ketika Guru/Staf mencoba mengakses surat yang tidak memiliki disposisi kepadanya.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Guru/Staf mengakses `/surat/:id`|Sistem memeriksa hak akses (BR-11)|
|2||Sistem menampilkan halaman 403 "Anda tidak memiliki akses ke surat ini"|

---

## AF-003: Wakasek Mengakses Surat di Luar Bidang

### Condition

Ketika Wakasek mencoba mengakses surat yang tidak berhubungan dengan bidangnya.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Wakasek mengakses `/surat/:id`|Sistem memeriksa hak akses (BR-10)|
|2||Sistem menampilkan halaman 403 "Anda tidak memiliki akses ke surat ini"|

---

# 6. EXCEPTION FLOWS

## EF-001: Surat Tidak Ditemukan

### Condition

Ketika ID surat yang diakses tidak valid atau tidak ada di database.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Aktor mengakses `/surat/:id`|Sistem tidak menemukan data surat dengan ID tersebut|
|2||Sistem menampilkan halaman 404 "Surat tidak ditemukan"|

---

## EF-002: Gagal Memuat Timeline

### Condition

Ketika terjadi error server saat mengambil data riwayat status.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Aktor membuka halaman detail surat|Sistem mencoba mengambil data timeline dari server|
|2||Sistem mendapat error dari server|
|3||Sistem menampilkan pesan "Gagal memuat riwayat surat. Silakan coba lagi."|

---

## EF-003: File Scan Gagal Didownload

### Condition

Ketika file scan surat rusak atau tidak dapat diunduh.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Aktor mengklik tombol download file scan|Sistem mencoba mengambil data BYTEA dari database|
|2||Sistem gagal membaca atau mengkonversi file|
|3||Sistem menampilkan pesan "File scan tidak tersedia atau rusak"|

---

# 7. POSTCONDITIONS

|ID|Condition|
|---|---|
|POST-001|Aktor berhasil melihat seluruh riwayat perjalanan surat|
|POST-002|Tidak ada perubahan data pada sistem (read-only)|
|POST-003|Aktor dapat mengunduh file scan surat jika diperlukan|

---

# 8. BUSINESS RULES

|Rule ID|Description|
|---|---|
|BR-08|Setiap perubahan status surat harus tercatat sebagai entri baru di tabel `status_surat` (event sourcing) untuk membentuk timeline audit|
|BR-10|Wakasek hanya dapat melihat surat yang berhubungan dengan bidangnya|
|BR-11|Guru/Staf hanya dapat melihat surat yang didisposisikan kepadanya|
|BR-13|Surat yang sudah berstatus `Selesai` tidak dapat diubah statusnya kembali|
|BR-15|Perubahan status surat wajib didorong secara realtime via WebSocket|

---

# 9. RELATED PAGES

|Page ID|Page Name|
|---|---|
|PAGE-006|Detail Surat|

---

# 10. DATA USAGE

## 10.1 Data Read

|Entity|Description|
|---|---|
|surat_masuk|Mengambil data header surat (nomor, tanggal, pengirim, perihal, status)|
|status_surat|Mengambil seluruh riwayat perubahan status surat|
|disposisi|Mengambil ringkasan disposisi terkait surat|
|pengguna|Mengambil nama pengguna yang melakukan perubahan status|

---

## 10.2 Data Created

|Entity|Description|
|---|---|
|None|Tidak ada data yang dibuat|

---

## 10.3 Data Updated

|Entity|Description|
|---|---|
|None|Tidak ada data yang diupdate|

---

## 10.4 Data Deleted

|Entity|Description|
|---|---|
|None|Tidak ada data yang dihapus|

---

# 11. PERMISSIONS

|Role|Access|
|---|---|
|Admin TU|AKSI (ALLOWED) — semua surat|
|Kepala Sekolah|AKSI (ALLOWED) — semua surat|
|Wakasek|AKSI (ALLOWED) — hanya surat sesuai bidang|
|Guru/Staf|AKSI (ALLOWED) — hanya surat dengan disposisi kepadanya|

---

# 12. ACCEPTANCE CRITERIA

|AC ID|Description|
|---|---|
|AC-001|Halaman detail menampilkan header informasi surat lengkap|
|AC-002|Timeline menampilkan seluruh entri status_surat secara kronologis|
|AC-003|Setiap entri timeline menampilkan status, pengubah, waktu, dan catatan|
|AC-004|Ringkasan disposisi ditampilkan jika surat sudah didisposisi|
|AC-005|Guru/Staf mendapat error akses jika surat tidak memiliki disposisi kepadanya|
|AC-006|Wakasek mendapat error akses jika surat di luar bidangnya|
|AC-007|Badge status terupdate secara real-time via WebSocket|

---

# 13. TRACEABILITY

## Requirement Traceability

|Requirement ID|
|---|
|F-08|
|F-11|

## Information Architecture Traceability

|Page ID|
|---|
|PAGE-006|

---

# 15. REVISION HISTORY

|Version|Date|Author|Description|
|---|---|---|---|
|0.1|2026-07-10|System Analyst AI|Initial Draft|
