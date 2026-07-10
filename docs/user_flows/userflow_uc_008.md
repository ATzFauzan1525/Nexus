# User Flow Specification

Document Version: v0.1

Use Case ID: UC-008  
Use Case Name: Download Laporan PDF

Status: Draft  
Last Updated: 2026-07-10  
Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Admin TU membuka halaman laporan, memilih periode, melihat ringkasan rekapitulasi surat, dan mengunduh laporan dalam format PDF.

## 1.2 Goal

Admin TU ingin mendapatkan dokumen laporan rekapitulasi surat masuk untuk arsip atau pelaporan ke pihak terkait.

## 1.3 Requirement References

|Requirement ID|Requirement Name|
|---|---|
|F-10|Laporan rekapitulasi surat masuk per periode (harian/mingguan/bulanan) — dapat diunduh sebagai PDF|
|F-16|Export Laporan PDF: generate laporan rekapitulasi dalam format PDF untuk diunduh|

## 1.4 Primary Actor

Admin TU

## 1.5 Supporting Actors

Sistem Laporan, pdfkit

---

# 2. TRIGGER

Admin TU membuka menu "Laporan" di sidebar navigasi.

---

# 3. PRECONDITIONS

|ID|Condition|
|---|---|
|PRE-001|Admin TU sudah login dengan role `ADMIN_TU`|
|PRE-002|Terdapat data surat masuk pada periode yang akan dilaporkan|
|PRE-003|Browser mengizinkan unduhan file|

---

# 4. MAIN FLOW

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU membuka menu "Laporan" di sidebar|Sistem menampilkan halaman `/laporan`|
|2||Sistem menampilkan form pemilihan periode: jenis periode (Harian/Mingguan/Bulanan) dan rentang tanggal|
|3|Admin TU memilih jenis periode (Harian, Mingguan, atau Bulanan)|Sistem menyesuaikan opsi rentang tanggal sesuai jenis periode|
|4|Admin TU memilih tanggal mulai dan tanggal akhir|Input diterima|
|5|Admin TU menekan tombol "Generate"|Sistem memvalidasi input tanggal (tanggal akhir >= tanggal mulai)|
|6||Sistem mengagregasi data surat masuk dari rentang tanggal: total surat, status Diterima, Didisposisi, Diproses, Selesai|
|7||Sistem menampilkan ringkasan statistik (KPI Cards) dan tabel detail surat pada periode tersebut|
|8|Admin TU meninjau hasil laporan|Sistem mengaktifkan tombol "Download PDF"|
|9|Admin TU menekan tombol "Download PDF"|Sistem mengirim request ke endpoint `/api/laporan/pdf` dengan parameter periode dan tanggal|
|10||Server menggunakan pdfkit untuk generate PDF: judul laporan, ringkasan statistik, tabel detail surat|
|11||Browser mengunduh file PDF dengan format nama `Laporan_SiDis_{tglMulai}_{tglAkhir}.pdf`|

---

# 5. ALTERNATIVE FLOWS

## AF-001: Membatalkan Generate

### Condition

Ketika Admin TU ingin mengubah periode sebelum menekan tombol Generate.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU mengubah pilihan jenis periode atau rentang tanggal|Sistem mereset hasil laporan sebelumnya (jika ada)|
|2||Tombol "Download PDF" kembali nonaktif|

---

## AF-002: Data Kosong pada Periode

### Condition

Ketika tidak ada data surat masuk pada rentang tanggal yang dipilih.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU menekan tombol "Generate"|Sistem memeriksa data pada rentang tanggal|
|2||Tidak ada data: sistem menampilkan Empty State "Tidak ada data surat pada periode ini"|
|3||Tombol "Download PDF" tetap nonaktif|

---

# 6. EXCEPTION FLOWS

## EF-001: Tanggal Akhir Sebelum Tanggal Mulai

### Condition

Ketika Admin TU memilih tanggal akhir lebih awal dari tanggal mulai.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU menekan tombol "Generate"|Sistem memvalidasi rentang tanggal|
|2||Sistem menampilkan pesan error "Tanggal akhir tidak boleh sebelum tanggal mulai"|
|3||Laporan tidak digenerate|

---

## EF-002: Server Error Saat Generate PDF

### Condition

Ketika terjadi error pada server saat memproses PDF.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU menekan tombol "Download PDF"|Sistem memproses generate PDF di server|
|2||Server mengalami error (timeout, pdfkit error, dll)|
|3||Sistem menampilkan pesan "Gagal menghasilkan PDF. Silakan coba lagi."|

---

## EF-003: Token Expired Saat Download

### Condition

Ketika sesi JWT Admin TU kadaluarsa saat akan mendownload PDF.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU menekan tombol "Download PDF"|Sistem memeriksa token JWT|
|2||Token expired: sistem mengarahkan ke halaman login|
|3|Admin TU login kembali|Kembali ke halaman `/laporan`|

---

# 7. POSTCONDITIONS

|ID|Condition|
|---|---|
|POST-001|File PDF laporan berhasil diunduh ke perangkat lokal Admin TU|
|POST-002|Data surat di database tidak berubah (read-only)|
|POST-003|PDF berisi judul, ringkasan statistik, dan tabel detail surat periode terpilih|

---

# 8. BUSINESS RULES

|Rule ID|Description|
|---|---|
|BR-09|Laporan rekapitulasi hanya dapat diakses oleh Admin TU dan Kepala Sekolah|
|BR-14|Data diambil dari basis data terpusat (Neon PostgreSQL), bukan dari localStorage|
|BR-21|Nomor surat di-trim spasi sebelum ditampilkan di laporan|

---

# 9. RELATED PAGES

|Page ID|Page Name|
|---|---|
|PAGE-007|Laporan Rekapitulasi|

---

# 10. DATA USAGE

## 10.1 Data Read

|Entity|Description|
|---|---|
|surat_masuk|Mengambil seluruh data surat pada rentang tanggal yang dipilih|
|status_surat|Mengambil status terkini setiap surat untuk agregasi statistik|

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
|Admin TU|AKSI (ALLOWED)|
|Kepala Sekolah|AKSI (ALLOWED)|
|Guru/Staf|AKSI (DENIED)|
|Wakasek|AKSI (DENIED)|

---

# 12. ACCEPTANCE CRITERIA

|AC ID|Description|
|---|---|
|AC-001|Admin TU dapat memilih jenis periode (Harian/Mingguan/Bulanan)|
|AC-002|Admin TU dapat memilih rentang tanggal mulai dan akhir|
|AC-003|Sistem menampilkan ringkasan statistik setelah Generate|
|AC-004|Sistem menampilkan tabel detail surat setelah Generate|
|AC-005|Admin TU dapat mendownload PDF laporan|
|AC-006|PDF berisi judul, statistik, dan tabel detail surat|
|AC-007|Validasi error muncul jika tanggal akhir < tanggal mulai|
|AC-008|Empty state muncul jika tidak ada data pada periode terpilih|

---

# 13. TRACEABILITY

## Requirement Traceability

|Requirement ID|
|---|
|F-10|
|F-16|

## Information Architecture Traceability

|Page ID|
|---|
|PAGE-007|

---

# 15. REVISION HISTORY

|Version|Date|Author|Description|
|---|---|---|---|
|0.1|2026-07-10|System Analyst AI|Initial Draft|
