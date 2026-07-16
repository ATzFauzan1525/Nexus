# User Flow Specification

Document Version: v0.1

Use Case ID: UC-006

Use Case Name: Cari & Filter Surat (Pencarian Lanjutan)

Status: Active

Last Updated: 2026-07-10

Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Aktor mencari dan memfilter surat masuk berdasarkan kata kunci (nomor surat, pengirim, perihal) serta filter status, menggunakan auto-search on keystroke dan filter lanjutan berdasarkan rentang tanggal.

## 1.2 Goal

Aktor ingin menemukan surat tertentu dengan cepat di antara banyak data surat masuk tanpa harus men-scroll manual.

## 1.3 Requirement References

|Requirement ID|Requirement Name|
|---|---|
|F-07|Pencarian dan filter surat|
|F-14|Pencarian Lanjutan (filter tanggal, pengirim, perihal)|

## 1.4 Primary Actor

Admin TU, Kepala Sekolah, Guru/Staf (5 bidang), Wakasek (4 bidang)

## 1.5 Supporting Actors

Sistem Pencarian

---

# 2. TRIGGER

Aktor membuka menu "Surat Masuk" di sidebar dan ingin mencari atau memfilter surat tertentu.

---

# 3. PRECONDITIONS

|ID|Condition|
|---|---|
|PRE-001|Aktor sudah login|
|PRE-002|Terdapat minimal satu data surat masuk di sistem|

---

# 4. MAIN FLOW

|Step|Actor Action|System Response|
|---|---|---|
|1|Aktor membuka menu "Surat Masuk" di sidebar|Sistem menampilkan halaman `/surat` berisi tabel seluruh surat masuk sesuai hak akses aktor|
|2|Aktor mengetik kata kunci pada kolom pencarian (nomor surat, pengirim, atau perihal)|Sistem secara otomatis memfilter tabel sesuai kata kunci yang diketik (auto-search on keystroke)|
|3||Sistem mereset halaman ke halaman 1 setiap kali kata kunci berubah|
|4|Aktor memilih filter status pada dropdown (opsional): Semua / Diterima / Didisposisi / Diproses / Selesai|Sistem memperbarui tabel sesuai filter status yang dipilih|
|5|Aktor memilih rentang tanggal mulai dan tanggal akhir pada filter tanggal (opsional)|Sistem memfilter surat berdasarkan rentang tanggal `diterima`|
|6|Aktor menekan baris pada tabel atau link nomor surat|Sistem mengarahkan ke halaman detail `/surat/:id`|

---

# 5. ALTERNATIVE FLOW

## AF-001: Pencarian Tidak Menemukan Hasil

### Condition

Ketika kata kunci pencarian tidak menghasilkan data apapun.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Aktor mengetik kata kunci yang tidak cocok dengan data manapun|Sistem menampilkan Empty State: "Surat tidak ditemukan."|

---

## AF-002: Mengosongkan Kolom Pencarian

### Condition

Ketika aktor menghapus seluruh kata kunci dari kolom pencarian.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Aktor mengosongkan kolom pencarian|Sistem menampilkan kembali seluruh data surat sesuai hak akses aktor|

---

## AF-003: Hasil Lebih dari Satu Halaman

### Condition

Ketika hasil pencarian/filter melebihi kapasitas satu halaman.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Aktor menekan tombol "Selanjutnya" di pagination|Sistem menampilkan halaman berikutnya dari hasil pencarian/filter|
|2|Aktor menekan tombol "Sebelumnya"|Sistem menampilkan halaman sebelumnya|

---

## AF-004: Pencarian Lanjutan (Filter Tanggal)

### Condition

Ketika aktor ingin mencari surat dalam rentang tanggal tertentu.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Aktor mengklik tombol "Filter Lanjutan"|Sistem menampilkan panel filter tambahan: tanggal mulai, tanggal akhir, pengirim, perihal|
|2|Aktor mengisi field filter dan menekan "Terapkan"|Sistem memfilter tabel berdasarkan seluruh kriteria yang dipilih|

---

# 6. EXCEPTION FLOW

## EF-001: Server Error Saat Pencarian

### Condition

Ketika terjadi kesalahan server saat memproses pencarian.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Aktor mengetik kata kunci atau menerapkan filter|Sistem gagal memproses request|
|2||Sistem menampilkan pesan: "Gagal memuat data. Silakan coba lagi."|

---

## EF-002: Tanggal Akhir Sebelum Tanggal Mulai

### Condition

Ketika aktor memilih tanggal akhir yang lebih awal dari tanggal mulai pada filter tanggal.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Aktor memilih tanggal akhir < tanggal mulai|Sistem menampilkan validasi error: "Tanggal akhir harus setelah tanggal mulai"|
|2||Filter tidak diterapkan sampai diperbaiki|

---

# 7. POSTCONDITIONS

|ID|Condition|
|---|---|
|POST-001|Tabel surat menampilkan hasil yang sesuai dengan kata kunci dan/atau filter yang diterapkan|
|POST-002|Filter dan pencarian direset saat aktor meninggalkan halaman|

---

# 8. BUSINESS RULES

|Rule ID|Description|
|---|---|
|BR-11|Guru/Staf hanya dapat melihat surat yang didisposisikan kepadanya|
|BR-10|Wakasek hanya dapat melihat surat yang berhubungan dengan bidangnya|
|BR-21|Input nomor surat di-trim spasi sebelum diproses|

---

# 9. RELATED PAGES

|Page ID|Page Name|
|---|---|
|PAGE-003|Daftar Surat (`/surat`)|
|PAGE-005|Detail Surat (`/surat/:id`)|

---

# 10. DATA USAGE

## 10.1 Data Read

|Entitas|Description|
|---|---|
|surat_masuk|Mengambil data surat sesuai kata kunci, filter status, dan rentang tanggal|
|disposisi|Digunakan untuk menentukan hak akses Guru/Staf dan Wakasek|

---

## 10.2 Data Created

|Entitas|Description|
|---|---|
|Tidak ada|Tidak ada data yang dibuat|

---

## 10.3 Data Updated

|Entitas|Description|
|---|---|
|Tidak ada|Tidak ada data yang diupdate|

---

## 10.4 Data Deleted

|Entitas|Description|
|---|---|
|Tidak ada|Tidak ada data yang dihapus|

---

# 11. PERMISSIONS

|Role|Access|
|---|---|
|ADMIN_TU|AKSI (ALLOWED) — semua surat|
|KEPALA_SEKOLAH|AKSI (ALLOWED) — semua surat|
|GURU_STAF|AKSI (ALLOWED) — hanya surat yang didisposisikan kepadanya|
|WAKASEK|AKSI (ALLOWED) — hanya surat bidangnya|

---

# 12. ACCEPTANCE CRITERIA

|AC ID|Description|
|---|---|
|AC-001|Aktor dapat mengetik kata kunci dan tabel terfilter otomatis (auto-search)|
|AC-002|Aktor dapat memfilter berdasarkan status surat via dropdown|
|AC-003|Aktor dapat memfilter berdasarkan rentang tanggal (mulai - akhir)|
|AC-004|Empty state muncul jika pencarian tidak menemukan hasil|
|AC-005|Pagination muncul jika hasil lebih dari satu halaman|
|AC-006|Filter direset saat aktor meninggalkan halaman|
|AC-007|Hak akses data diterapkan: Guru/Staf hanya melihat surat disposisinya, Wakasek hanya surat bidangnya|

---

# 13. TRACEABILITY

## Requirement Traceability

|Requirement ID|
|---|
|F-07|
|F-14|

## Information Architecture Traceability

|Page ID|
|---|
|PAGE-003|
|PAGE-005|

---

# 14. REVISION HISTORY

|Version|Date|Author|Description|
|---|---|---|---|
|0.1|2026-07-10|System Analyst AI|Initial Draft|
