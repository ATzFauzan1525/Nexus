# User Flow Specification

Document Version: v0.1

Use Case ID: UC-002

Use Case Name: Input Surat Masuk

Status: Active

Last Updated: 2026-07-10

Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Admin TU mengisi form input surat masuk dengan metadata lengkap (nomor surat, tanggal diterima, pengirim, perihal) dan mengunggah file scan (PDF/gambar) untuk dicatat ke dalam sistem sebagai surat baru berstatus `Diterima`.

## 1.2 Goal

Admin TU ingin mencatat surat masuk secara digital agar dapat diproses lebih lanjut oleh Kepala Sekolah dan Guru/Staf terkait.

## 1.3 Requirement References

| Requirement ID | Requirement Name |
|---|---|
| F-03 | Input surat masuk beserta metadata lengkap dan unggah file scan (PDF/gambar) |
| BR-12 | File scan hanya PDF/JPG/PNG, maksimal 10MB |
| BR-20 | File scan disimpan sebagai BYTEA di database Neon |
| BR-21 | Nomor surat di-trim spasi sebelum disimpan |

## 1.4 Primary Actor

Admin TU

## 1.5 Supporting Actors

Sistem Penyimpanan File (Neon BYTEA)

---

# 2. TRIGGER

Admin TU menekan menu "Surat Masuk" → "Input Surat Baru" di sidebar atau mengakses URL `/surat/tambah`.

---

# 3. PRECONDITIONS

| ID | Condition |
|---|---|
| PRE-001 | Admin TU sudah login dengan role `ADMIN_TU` |
| PRE-002 | File scan surat tersedia di perangkat Admin TU (format PDF atau JPG/PNG) |
| PRE-003 | Nomor surat dari pengirim sudah diketahui |

---

# 4. MAIN FLOW

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin TU menekan menu "Surat Masuk" → "Input Surat Baru" di sidebar | Sistem menampilkan halaman `/surat/tambah` berisi form input surat masuk |
| 2 | Admin TU mengisi field: Nomor Surat, Tanggal Diterima (date picker), Pengirim, Perihal | Sistem memvalidasi input di sisi klien |
| 3 | Admin TU menekan tombol "Unggah File Scan" dan memilih file dari perangkat | Sistem menampilkan preview nama file yang dipilih dan indikator upload (progress bar) |
| 4 | Admin TU menekan tombol "Simpan Surat" | Sistem memvalidasi semua field wajib terisi dan file berhasil dipilih |
| 5 | | Sistem mengirim data ke server (metadata + file dalam satu request) |
| 6 | | Server menyimpan data surat ke tabel `surat_masuk` dengan status `Diterima`, file disimpan sebagai BYTEA |
| 7 | | Server mencatat entri pertama di tabel `status_surat`: status `Diterima`, waktu sekarang, oleh Admin TU |
| 8 | | Server mengirim notifikasi otomatis ke Kepala Sekolah: "Surat masuk baru dari [Pengirim] dengan perihal [Perihal]." |
| 9 | | Server mencatat ke tabel `audit_log`: aksi CREATE pada entitas surat_masuk |
| 10 | | Sistem mendorong update realtime via WebSocket ke seluruh aktor yang berwenang |
| 11 | | Sistem menampilkan toast success: "Surat berhasil disimpan." |
| 12 | | Sistem mengarahkan Admin TU ke halaman `/surat/:id` (detail surat yang baru dibuat) |

---

# 5. ALTERNATIVE FLOW

## AF-001: Field Wajib Tidak Diisi

### Condition

Ketika Admin TU menekan tombol "Simpan Surat" tanpa mengisi nomor surat, pengirim, perihal, atau tanggal.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin TU mengklik tombol "Simpan Surat" | Sistem menampilkan pesan validasi merah di bawah field yang kosong |
| 2 | | Request tidak dikirim ke server |

## AF-002: Format atau Ukuran File Tidak Sesuai

### Condition

Ketika file yang diunggah bukan PDF/JPG/PNG atau melebihi 10 MB.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin TU memilih file yang tidak sesuai | Sistem memvalidasi file di sisi klien |
| 2 | | Jika format tidak didukung: Sistem menampilkan pesan "Format file tidak didukung. Hanya PDF, JPG, dan PNG yang diizinkan." File tidak terunggah |
| 3 | | Jika ukuran > 10MB: Sistem menampilkan pesan "Ukuran file terlalu besar. Maksimum 10 MB." |

## AF-003: Nomor Surat Sudah Ada

### Condition

Ketika nomor surat yang diinput sudah ada di database (unique constraint).

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin TU mengklik tombol "Simpan Surat" | Server mendeteksi duplikasi nomor surat |
| 2 | | Sistem menampilkan pesan warning: "Nomor surat ini sudah pernah diinput. Pastikan tidak ada duplikasi." |
| 3 | | Tombol simpan tetap aktif — Admin TU dapat menyimpan jika memang surat berbeda |

## AF-004: Membatalkan Input

### Condition

Ketika Admin TU menekan tombol "Batal" sebelum menyimpan.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin TU mengklik tombol "Batal" | Sistem menampilkan konfirmasi dialog: "Apakah Anda yakin ingin membatalkan? Data yang diisi akan hilang." |
| 2 | Admin TU mengonfirmasi pembatalan | Sistem kembali ke halaman `/surat` |

---

# 6. EXCEPTION FLOW

## EF-001: Koneksi Server Terputus Saat Submit

### Condition

Ketika koneksi internet atau server terputus saat Admin TU menekan tombol "Simpan Surat".

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Admin TU mengklik tombol "Simpan Surat" | Sistem mencoba mengirim request ke server |
| 2 | | Koneksi gagal / timeout |
| 3 | | Sistem menampilkan alert error: "Gagal menyimpan surat. Periksa koneksi dan coba lagi." |
| 4 | | Data form tetap tersimpan di halaman (tidak hilang) |

---

# 7. POSTCONDITIONS

| ID | Condition |
|---|---|
| POST-001 | Data surat masuk tersimpan di tabel `surat_masuk` dengan status `Diterima` |
| POST-002 | Entri pertama timeline tersimpan di tabel `status_surat` |
| POST-003 | Notifikasi terkirim ke Kepala Sekolah |
| POST-004 | Entri audit log tercatat |
| POST-005 | Surat muncul di daftar `/surat` dan dapat diakses oleh aktor yang berwenang |

---

# 8. BUSINESS RULES

| Rule ID | Description |
|---|---|
| BR-03 | Status surat dimulai dari `Diterima` |
| BR-06 | Notifikasi otomatis dikirim ke Kepala Sekolah setiap ada surat masuk baru |
| BR-08 | Setiap perubahan status surat harus tercatat sebagai entri baru di tabel `status_surat` |
| BR-12 | File scan hanya PDF/JPG/PNG, maksimal 10MB |
| BR-15 | Setiap perubahan data wajib didorong secara realtime via WebSocket |
| BR-20 | File scan disimpan sebagai BYTEA di database Neon |
| BR-21 | Nomor surat di-trim spasi sebelum disimpan |

---

# 9. RELATED PAGES

| Page ID | Page Name |
|---|---|
| PAGE-004 | Input Surat Baru (`/surat/tambah`) |
| PAGE-005 | Detail Surat (`/surat/:id`) |
| PAGE-003 | Daftar Surat (`/surat`) |

---

# 10. DATA USAGE

## 10.1 Data Read

| Entitas | Description |
|---|---|
| pengguna | Memvalidasi role Admin TU |

## 10.2 Data Created

| Entitas | Description |
|---|---|
| surat_masuk | Data surat baru dengan status `Diterima` |
| status_surat | Entri pertama timeline status |
| notifikasi | Notifikasi untuk Kepala Sekolah |
| audit_log | Catatan aksi CREATE |

## 10.3 Data Updated

| Entitas | Description |
|---|---|
| Tidak ada | Tidak ada data yang diupdate |

## 10.4 Data Deleted

| Entitas | Description |
|---|---|
| Tidak ada | Tidak ada data yang dihapus |

---

# 11. PERMISSIONS

| Role | Access |
|---|---|
| Admin TU | AKSI (ALLOWED) |
| Kepala Sekolah | VIEW (ALLOWED) — hanya melihat hasil |
| Guru/Staf | VIEW (DENIED) — hanya melihat yang didisposisikan |
| Wakasek | VIEW (ALLOWED) — sesuai bidang |
| Guest | VIEW (DENIED) |

---

# 12. ACCEPTANCE CRITERIA

| AC ID | Description |
|---|---|
| AC-001 | Admin TU dapat mengakses halaman `/surat/tambah` dan melihat form lengkap |
| AC-002 | Admin TU dapat mengisi nomor surat, tanggal, pengirim, dan perihal |
| AC-003 | Admin TU dapat mengunggah file scan (PDF/JPG/PNG) |
| AC-004 | Sistem menolak file dengan format selain PDF/JPG/PNG atau > 10MB |
| AC-005 | Sistem menampilkan validasi jika field wajib kosong |
| AC-006 | Surat tersimpan dengan status `Diterima` setelah submit berhasil |
| AC-007 | Notifikasi otomatis terkirim ke Kepala Sekolah |
| AC-008 | Admin TU diarahkan ke halaman detail surat setelah simpan berhasil |

---

# 13. TRACEABILITY

## Requirement Traceability

| Requirement ID |
|---|
| F-03 |
| BR-12 |
| BR-20 |
| BR-21 |

## Information Architecture Traceability

| Page ID |
|---|
| PAGE-004 |
| PAGE-005 |
| PAGE-003 |

---

# 14. REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 0.1 | 2026-07-10 | System Analyst AI | Initial Draft — adaptasi ke format user flow specification |
