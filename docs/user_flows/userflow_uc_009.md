# User Flow Specification

Document Version: v0.1

Use Case ID: UC-009

Use Case Name: Kelola Akun Pengguna

Status: Active

Last Updated: 2026-07-10

Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Admin TU mengelola akun pengguna internal sistem: menambah pengguna baru, mengedit data pengguna yang sudah ada, atau menghapus akun pengguna.

## 1.2 Goal

Admin TU ingin memastikan hanya pengguna yang berwenang memiliki akses ke sistem dengan data akun yang akurat.

## 1.3 Requirement References

|Requirement ID|Requirement Name|
|---|---|
|F-02|Manajemen akun pengguna oleh Admin TU (tambah, ubah, hapus akun)|

## 1.4 Primary Actor

Admin TU

## 1.5 Supporting Actors

Sistem Manajemen Pengguna

---

# 2. TRIGGER

Admin TU membuka menu "Manajemen Pengguna" di sidebar navigasi.

---

# 3. PRECONDITIONS

|ID|Condition|
|---|---|
|PRE-001|Admin TU sudah login dengan role `ADMIN_TU`|
|PRE-002|Hanya role `ADMIN_TU` yang memiliki akses ke menu ini (BR-02)|

---

# 4. MAIN FLOW — Tambah Pengguna

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU membuka menu "Manajemen Pengguna" di sidebar|Sistem menampilkan halaman `/pengguna` berisi tabel daftar seluruh akun pengguna internal|
|2|Admin TU menekan tombol "+ Tambah Pengguna"|Sistem membuka halaman `/pengguna/tambah` dengan form input|
|3|Admin TU mengisi Username|Input diterima|
|4|Admin TU mengisi Password|Input diterima (ditampilkan sebagai hidden field)|
|5|Admin TU mengisi Nama Lengkap|Input diterima|
|6|Admin TU memilih Peran dari dropdown|Sistem menampilkan opsi: Admin TU, Kepala Sekolah, Wakil Kepala Sekolah, Guru/Staf|
|7|Admin TU memilih Bidang dari dropdown (jika peran memerlukan)|Sistem menampilkan opsi: Kurikulum, Kesiswaan, SaranaPrasarana, Humas, Keuangan|
|8|Admin TU menekan tombol "Simpan"|Sistem memvalidasi semua field wajib terisi dan username belum digunakan|
|9||Validasi lolos: sistem menyimpan akun baru ke tabel `pengguna` (password dienkripsi dengan bcrypt)|
|10||Sistem menampilkan toast success "Akun pengguna berhasil ditambahkan"|
|11||Sistem mengarahkan Admin TU kembali ke halaman `/pengguna`|

---

# 4. MAIN FLOW — Edit Pengguna

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU menekan ikon "Edit" pada baris akun yang ingin diubah|Sistem membuka halaman `/pengguna/:id/edit` dengan data akun terisi otomatis|
|2|Admin TU mengubah data yang diperlukan (nama, peran, bidang, atau reset password)|Input diterima|
|3|Admin TU menekan tombol "Simpan Perubahan"|Sistem memvalidasi data yang diubah|
|4||Sistem memperbarui data di tabel `pengguna`|
|5||Sistem menampilkan toast success "Data akun berhasil diperbarui"|

---

# 4. MAIN FLOW — Hapus Pengguna

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU menekan ikon "Hapus" pada baris akun yang ingin dihapus|Sistem menampilkan dialog konfirmasi: "Apakah Anda yakin ingin menghapus akun [nama]?"|
|2|Admin TU menekan tombol "Ya, Hapus"|Sistem memeriksa apakah akun yang dihapus bukan akun Admin TU sendiri|
|3||Sistem menghapus data akun dari tabel `pengguna` (soft delete: `is_active = false`)|
|4||Sistem mencatat ke tabel `audit_log`|
|5||Sistem menampilkan toast success "Akun berhasil dihapus"|

---

# 5. ALTERNATIVE FLOW

## AF-001: Membatalkan Tambah/Edit Pengguna

### Condition

Ketika Admin TU membatalkan proses tambah atau edit pengguna.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU menekan tombol "Batal"|Sistem membatalkan perubahan|
|2||Sistem mengarahkan kembali ke halaman `/pengguna`|

---

## AF-002: Membatalkan Hapus Pengguna

### Condition

Ketika Admin TU membatalkan dialog konfirmasi hapus.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU menekan tombol "Tidak" atau tombol X di dialog|Sistem menutup dialog konfirmasi|
|2||Tidak ada perubahan data|

---

## AF-003: Reset Password (Edit)

### Condition

Ketika Admin TU ingin mereset password pengguna tanpa mengubah data lain.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU menekan ikon "Edit" pada baris akun|Sistem menampilkan halaman edit dengan field password kosong|
|2|Admin TU mengisi field password baru|Input diterima|
|3|Admin TU menekan "Simpan Perubahan"|Sistem menyimpan password baru (terenkripsi)|
|4|Sistem tidak mengubah data lain|Toast success ditampilkan|

---

# 6. EXCEPTION FLOW

## EF-001: Username Duplikat

### Condition

Ketika username yang dimasukkan sudah digunakan oleh akun lain.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU menekan tombol "Simpan"|Sistem memvalidasi username ke database|
|2||Sistem mendeteksi username sudah ada|
|3||Sistem menampilkan pesan error "Username sudah digunakan. Pilih username lain."|
|4|Admin TU mengganti username|Sistem kembali ke validasi langkah|

---

## EF-002: Field Wajib Kosong

### Condition

Ketika Admin TU menekan Simpan tanpa mengisi field yang wajib.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU menekan tombol "Simpan"|Sistem memvalidasi semua field|
|2||Sistem menampilkan border merah dan pesan error pada field yang kosong|

---

## EF-003: Menghapus Akun Sendiri

### Condition

Ketika Admin TU mencoba menghapus akunnya sendiri.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Admin TU menekan ikon "Hapus" pada baris akunnya sendiri|Sistem menampilkan pesan error "Anda tidak dapat menghapus akun Anda sendiri"|
|2||Aksi hapus dibatalkan|

---

# 7. POSTCONDITIONS

|ID|Condition|
|---|---|
|POST-001|Akun baru tersimpan dan dapat digunakan untuk login (UC-001)|
|POST-002|Perubahan data akun langsung berlaku pada sesi berikutnya|
|POST-003|Akun yang dihapus (soft delete) tidak dapat login lagi|
|POST-004|Sesi aktif akun yang dinonaktifkan akan diakhiri paksa|

---

# 8. BUSINESS RULES

|Rule ID|Description|
|---|---|
|BR-02|Akun pengguna hanya dapat dibuat oleh Admin TU — tidak ada fitur registrasi publik|
|BR-14|Data pengguna disimpan di basis data terpusat (Neon PostgreSQL)|
|BR-19|Penghapusan/penonaktifan akun dicatat di audit log|

---

# 9. RELATED PAGES

|Page ID|Page Name|
|---|---|
|PAGE-015|Manajemen Pengguna|
|PAGE-016|Tambah Pengguna|
|PAGE-017|Edit Pengguna|

---

# 10. DATA USAGE

## 10.1 Data Read

|Entitas|Description|
|---|---|
|pengguna|Menampilkan daftar seluruh akun pengguna|
|pengguna|Mengecek duplikasi username saat tambah/edit|

---

## 10.2 Data Created

|Entitas|Description|
|---|---|
|pengguna|Membuat data akun pengguna baru|
|audit_log|Mencatat aksi CREATE pengguna|

---

## 10.3 Data Updated

|Entitas|Description|
|---|---|
|pengguna|Memperbarui data akun (nama, role, bidang, password)|
|audit_log|Mencatat aksi UPDATE pengguna|

---

## 10.4 Data Deleted

|Entitas|Description|
|---|---|
|pengguna|Soft delete: `is_active = false` (tidak dihapus permanen)|
|audit_log|Mencatat aksi DELETE pengguna|

---

# 11. PERMISSIONS

|Role|Access|
|---|---|
|Admin TU|AKSI (ALLOWED)|
|Kepala Sekolah|AKSI (DENIED)|
|Guru/Staf|AKSI (DENIED)|
|Wakasek|AKSI (DENIED)|

---

# 12. ACCEPTANCE CRITERIA

|AC ID|Description|
|---|---|
|AC-001|Admin TU dapat melihat daftar seluruh akun pengguna|
|AC-002|Admin TU dapat menambah pengguna baru dengan semua field|
|AC-003|Admin TU dapat memilih role dan bidang sesuai ketentuan|
|AC-004|Sistem memvalidasi username duplikat saat tambah/edit|
|AC-005|Admin TU dapat mengedit data pengguna yang sudah ada|
|AC-006|Admin TU dapat mereset password pengguna|
|AC-007|Admin TU dapat menghapus akun pengguna (soft delete)|
|AC-008|Admin TU tidak dapat menghapus akunnya sendiri|
|AC-009|Setiap perubahan tercatat di audit log|

---

# 13. TRACEABILITY

## Requirement Traceability

|Requirement ID|
|---|
|F-02|

## Information Architecture Traceability

|Page ID|
|---|
|PAGE-015|
|PAGE-016|
|PAGE-017|

---

# 14. REVISION HISTORY

|Version|Date|Author|Description|
|---|---|---|---|
|0.1|2026-07-10|System Analyst AI|Initial Draft|
