# User Flow Specification

Document Version: v0.1

Use Case ID: UC-003

Use Case Name: Buat Disposisi Digital

Status: Active

Last Updated: 2026-07-10

Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Kepala Sekolah memilih surat masuk yang sudah tercatat di sistem, kemudian membuat disposisi digital dengan memilih penerima (Guru/Staf), mengisi instruksi tugas, dan menetapkan deadline. Sistem memperbarui status surat menjadi `Didisposisi` dan mengirim notifikasi ke penerima.

## 1.2 Goal

Kepala Sekolah ingin menugaskan tindak lanjut surat kepada Guru/Staf yang relevan secara digital dan terdokumentasi.

## 1.3 Requirement References

| Requirement ID | Requirement Name |
|---|---|
| F-04 | Disposisi digital oleh Kepala Sekolah |
| BR-04 | Disposisi hanya dapat dibuat oleh Kepala Sekolah |
| BR-05 | Satu surat dapat memiliki lebih dari satu disposisi |

## 1.4 Primary Actor

Kepala Sekolah

## 1.5 Supporting Actors

Sistem Notifikasi, Guru/Staf (penerima disposisi)

---

# 2. TRIGGER

Kepala Sekolah menerima notifikasi surat masuk baru, atau membuka menu "Surat Masuk" di sidebar untuk memilih surat yang akan didisposisi.

---

# 3. PRECONDITIONS

| ID | Condition |
|---|---|
| PRE-001 | Kepala Sekolah sudah login dengan role `KEPALA_SEKOLAH` |
| PRE-002 | Surat masuk yang akan didisposisi sudah ada di sistem dengan status `Diterima` |
| PRE-003 | Akun Guru/Staf penerima disposisi sudah terdaftar di sistem (5 bidang) |

---

# 4. MAIN FLOW

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Kepala Sekolah menerima notifikasi surat masuk baru atau membuka menu "Surat Masuk" di sidebar | Sistem menampilkan daftar surat masuk |
| 2 | Kepala Sekolah memilih surat dan masuk ke halaman detail `/surat/:id` | Sistem menampilkan detail surat: nomor, tanggal, pengirim, perihal, file scan, dan status saat ini |
| 3 | Kepala Sekolah menekan tombol "Buat Disposisi" | Sistem membuka halaman `/disposisi/buat/:idSurat` dengan form disposisi |
| 4 | Kepala Sekolah memilih penerima disposisi dari dropdown daftar Guru/Staf | Dropdown menampilkan semua Guru/Staf aktif (5 bidang) |
| 5 | Kepala Sekolah mengisi instruksi tugas (textarea) — wajib | |
| 6 | Kepala Sekolah memilih deadline (date picker) — wajib, tidak boleh tanggal lewat | |
| 7 | Kepala Sekolah menekan tombol "Buat Disposisi" | Sistem memvalidasi semua field wajib |
| 8 | | Server menyimpan data disposisi baru ke tabel `disposisi` |
| 9 | | Server memperbarui status surat di tabel `surat_masuk` menjadi `Didisposisi` |
| 10 | | Server mencatat entri baru di tabel `status_surat`: status `Didisposisi`, waktu sekarang, oleh Kepala Sekolah |
| 11 | | Server mengirim notifikasi otomatis ke Guru/Staf penerima: "Anda mendapat disposisi baru untuk surat [Perihal]. Deadline: [tanggal]." |
| 11.5 | | Server mengirim notifikasi realtime ke Wakasek sesuai bidang: "Ada disposisi baru untuk surat [Perihal] di bidang Anda." (SRS F-04) |
| 12 | | Server mencatat ke tabel `audit_log`: aksi CREATE pada entitas disposisi |
| 13 | | Sistem mendorong update realtime via WebSocket ke aktor terkait |
| 14 | | Sistem menampilkan toast success: "Disposisi berhasil dikirim." |
| 15 | | Sistem mengarahkan Kepala Sekolah kembali ke halaman detail surat `/surat/:id` |

---

# 5. ALTERNATIVE FLOW

## AF-001: Field Wajib Tidak Diisi

### Condition

Ketika Kepala Sekolah menekan tombol "Buat Disposisi" tanpa memilih penerima, mengisi instruksi, atau memilih deadline.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Kepala Sekolah mengklik tombol "Buat Disposisi" | Sistem menampilkan validasi sesuai field yang kosong |
| 2 | | Jika penerima tidak dipilih: "Penerima disposisi wajib dipilih." |
| 3 | | Jika instruksi tidak diisi: "Instruksi tugas wajib diisi." |
| 4 | | Jika deadline tidak dipilih atau tanggal sudah lewat: "Deadline wajib diisi dan tidak boleh tanggal yang sudah lewat." |

## AF-002: Disposisi ke Penerima Lain untuk Surat yang Sama

### Condition

Ketika Kepala Sekolah ingin mendisposisi surat yang sama ke lebih dari satu penerima (BR-05).

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Kepala Sekolah mengulangi langkah 2-7 Alur Utama untuk penerima berbeda | Untuk setiap penerima, sistem membuat disposisi terpisah |
| 2 | | Riwayat disposisi sebelumnya tetap tersimpan |

## AF-003: Surat Sudah Pernah Didisposisi

### Condition

Ketika Kepala Sekolah membuka surat yang sudah berstatus `Didisposisi`.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Kepala Sekolah membuka detail surat dengan status `Didisposisi` | Sistem menampilkan riwayat disposisi sebelumnya beserta penerima, instruksi, dan deadline |
| 2 | Kepala Sekolah menekan tombol "Buat Disposisi" | Sistem tetap mengizinkan pembuatan disposisi baru (BR-05) |

---

# 6. EXCEPTION FLOW

## EF-001: Penerima Tidak Lagi Aktif

### Condition

Ketika akun Guru/Staf yang dipilih dinonaktifkan (is_active = false) setelah dropdown dimuat.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Kepala Sekolah memilih penerima dan mengklik "Buat Disposisi" | Server memvalidasi status aktif penerima |
| 2 | | Jika tidak aktif: sistem menampilkan error "Penerima disposisi tidak aktif. Pilih penerima lain." |

## EF-002: Koneksi Server Terputus

### Condition

Ketika koneksi terputus saat submit disposisi.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Kepala Sekolah mengklik "Buat Disposisi" | Sistem mencoba mengirim request |
| 2 | | Koneksi gagal / timeout |
| 3 | | Sistem menampilkan alert error: "Gagal membuat disposisi. Periksa koneksi dan coba lagi." |

---

# 7. POSTCONDITIONS

| ID | Condition |
|---|---|
| POST-001 | Data disposisi tersimpan di tabel `disposisi` |
| POST-002 | Status surat berubah menjadi `Didisposisi` di tabel `surat_masuk` |
| POST-003 | Entri timeline baru tersimpan di tabel `status_surat` |
| POST-004 | Notifikasi terkirim ke Guru/Staf penerima disposisi |
| POST-005 | Entri audit log tercatat |
| POST-006 | Wakasek sesuai bidang menerima notifikasi disposisi baru |

---

# 8. BUSINESS RULES

| Rule ID | Description |
|---|---|
| BR-04 | Disposisi hanya dapat dibuat oleh Kepala Sekolah dan harus menyertakan: penerima, instruksi, dan deadline |
| BR-05 | Satu surat masuk dapat memiliki lebih dari satu disposisi (disposisi ke banyak penerima) |
| BR-07 | Notifikasi otomatis dikirim ke Guru/Staf setiap ada disposisi baru yang ditujukan kepadanya |
| BR-08 | Setiap perubahan status surat harus tercatat sebagai entri baru di tabel `status_surat` |
| BR-13 | Surat yang sudah berstatus `Selesai` tidak dapat diubah statusnya kembali |

---

# 9. RELATED PAGES

| Page ID | Page Name |
|---|---|
| PAGE-005 | Detail Surat (`/surat/:id`) |
| PAGE-008 | Buat Disposisi (`/disposisi/buat/:idSurat`) |
| PAGE-006 | Daftar Disposisi Kepala Sekolah (`/disposisi`) |

---

# 10. DATA USAGE

## 10.1 Data Read

| Entitas | Description |
|---|---|
| surat_masuk | Mengambil data surat yang akan didisposisi |
| pengguna | Mendapatkan daftar Guru/Staf untuk dropdown penerima |

## 10.2 Data Created

| Entitas | Description |
|---|---|
| disposisi | Data disposisi baru |
| status_surat | Entri timeline perubahan status ke `Didisposisi` |
| notifikasi | Notifikasi untuk Guru/Staf penerima |
| audit_log | Catatan aksi CREATE |

## 10.3 Data Updated

| Entitas | Description |
|---|---|
| surat_masuk | Status berubah dari `Diterima` menjadi `Didisposisi` |

## 10.4 Data Deleted

| Entitas | Description |
|---|---|
| Tidak ada | Tidak ada data yang dihapus |

---

# 11. PERMISSIONS

| Role | Access |
|---|---|
| Kepala Sekolah | AKSI (ALLOWED) |
| Admin TU | VIEW (ALLOWED) — hanya melihat hasil |
| Guru/Staf | VIEW (ALLOWED) — hanya disposisi miliknya |
| Wakasek | VIEW (ALLOWED) — sesuai bidang |
| Guest | VIEW (DENIED) |

---

# 12. ACCEPTANCE CRITERIA

| AC ID | Description |
|---|---|
| AC-001 | Kepala Sekolah dapat melihat detail surat dan menekan tombol "Buat Disposisi" |
| AC-002 | Kepala Sekolah dapat memilih penerima dari dropdown daftar Guru/Staf aktif |
| AC-003 | Kepala Sekolah dapat mengisi instruksi dan memilih deadline |
| AC-004 | Sistem memvalidasi semua field wajib sebelum submit |
| AC-005 | Disposisi tersimpan, status surat berubah menjadi `Didisposisi` |
| AC-006 | Notifikasi otomatis terkirim ke Guru/Staf penerima |
| AC-007 | Kepala Sekolah diarahkan kembali ke detail surat setelah berhasil |
| AC-008 | Surat dapat didisposisi ke lebih dari satu penerima secara terpisah |

---

# 13. TRACEABILITY

## Requirement Traceability

| Requirement ID |
|---|
| F-04 |
| BR-04 |
| BR-05 |

## Information Architecture Traceability

| Page ID |
|---|
| PAGE-005 |
| PAGE-008 |
| PAGE-006 |

---

# 14. REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 0.1 | 2026-07-10 | System Analyst AI | Initial Draft — adaptasi ke format user flow specification |
