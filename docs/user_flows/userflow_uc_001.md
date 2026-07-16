# User Flow Specification

Document Version: v0.1

Use Case ID: UC-001

Use Case Name: Login Pengguna

Status: Active

Last Updated: 2026-07-10

Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Seluruh aktor internal (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek) mengakses aplikasi SiDis dan melakukan autentikasi menggunakan username dan password untuk mendapatkan akses ke sistem.

## 1.2 Goal

Pengguna ingin masuk ke dalam sistem agar dapat mengakses fitur sesuai role masing-masing.

## 1.3 Requirement References

| Requirement ID | Requirement Name |
|---|---|
| F-01 | Login dan logout berbasis role untuk semua aktor internal |
| NF-02 | Security - Autentikasi JWT |

## 1.4 Primary Actor

Admin TU / Kepala Sekolah / Guru Staf (5 bidang) / Wakil Kepala Sekolah (4 bidang)

## 1.5 Supporting Actors

Sistem Autentikasi (JWT)

---

# 2. TRIGGER

Pengguna membuka browser dan mengakses URL utama sistem SiDis tanpa sesi login aktif.

---

# 3. PRECONDITIONS

| ID | Condition |
|---|---|
| PRE-001 | Pengguna memiliki akun yang terdaftar di sistem (dibuat oleh Admin TU) |
| PRE-002 | Aplikasi dapat diakses melalui browser desktop |
| PRE-003 | Pengguna belum dalam status login (sesi belum aktif) |

---

# 4. MAIN FLOW

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna membuka browser dan mengakses URL sistem SiDis | Sistem mendeteksi bahwa pengguna belum login dan menampilkan halaman `/login` dengan form input username dan password |
| 2 | Pengguna mengisi kolom Username dan Password | Sistem memvalidasi input (tidak kosong) |
| 3 | Pengguna menekan tombol "Masuk" | Sistem mengirimkan data kredensial ke server melalui REST API |
| 4 | | Server memvalidasi username dan password terhadap data di database (bcrypt) |
| 5 | | Jika valid, server mengembalikan JWT token dan data profil pengguna (nama, role, bidang) |
| 6 | | Sistem menyimpan JWT token di sesi browser |
| 7 | | Sistem mengarahkan pengguna ke halaman `/dashboard` |

---

# 5. ALTERNATIVE FLOW

## AF-001: Login dengan Kredensial Salah

### Condition

Ketika username atau password yang dimasukkan tidak sesuai dengan data di database.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna mengklik tombol "Masuk" | Sistem mengirimkan kredensial ke backend |
| 2 | | Server menolak: username atau password tidak cocok |
| 3 | | Sistem menampilkan pesan error merah di bawah form: "Username atau password salah." Form tidak dikosongkan (menurut BR-02, pesan tidak menyebutkan field mana yang salah) |
| 4 | Pengguna memasukkan ulang kredensial yang benar | Sistem kembali ke langkah 2 pada Alur Utama |

## AF-002: Input Kosong

### Condition

Ketika pengguna mengklik tombol "Masuk" tanpa mengisi username atau password.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna mengklik tombol "Masuk" | Sistem menampilkan validasi error merah di bawah kolom yang kosong: "Kolom ini wajib diisi." Tombol Masuk tidak mengirim request ke server |

---

# 6. EXCEPTION FLOW

## EF-001: Server Tidak Dapat Dihubungi

### Condition

Ketika backend server atau database tidak dapat diakses.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna mengklik tombol "Masuk" | Sistem mencoba mengirim request ke backend |
| 2 | | Sistem timeout atau mendapat error koneksi |
| 3 | | Sistem menampilkan alert error: "Gagal terhubung ke server. Periksa koneksi Anda dan coba lagi." Data form tetap tersimpan di halaman |

## EF-002: Sesi Login Sudah Aktif

### Condition

Ketika pengguna sudah login (token masih aktif) dan mencoba mengakses halaman login.

### Flow

| Step | Actor Action | System Response |
|---|---|---|
| 1 | Pengguna mengakses URL `/login` | Sistem mendeteksi sesi aktif dari token yang tersimpan |
| 2 | | Sistem langsung redirect ke halaman `/dashboard` tanpa menampilkan halaman login |

---

# 7. POSTCONDITIONS

| ID | Condition |
|---|---|
| POST-001 | Pengguna berhasil login dan memiliki sesi aktif (JWT token) |
| POST-002 | Pengguna berada di halaman `/dashboard` |
| POST-003 | Topbar menampilkan nama dan role pengguna yang sedang aktif |
| POST-004 | Pengguna dapat mengakses semua fitur yang diizinkan sesuai role-nya |

---

# 8. BUSINESS RULES

| Rule ID | Description |
|---|---|
| BR-01 | Setiap pengguna wajib login menggunakan username dan password sebelum mengakses sistem |
| BR-02 | Pesan error jika gagal login: "Username atau password salah" (tidak menyebutkan field mana yang salah) |
| BR-03 | Akun hanya dapat dibuat oleh Admin TU — tidak ada fitur registrasi publik |
| BR-04 | Sesi login aktif selama browser terbuka atau token belum expired |

---

# 9. RELATED PAGES

| Page ID | Page Name |
|---|---|
| PAGE-001 | Login (`/login`) |
| PAGE-002 | Dashboard (`/dashboard`) |

---

# 10. DATA USAGE

## 10.1 Data Read

| Entitas | Description |
|---|---|
| pengguna | Memverifikasi username dan password hash (bcrypt) |

## 10.2 Data Created

| Entitas | Description |
|---|---|
| Session (JWT) | Membuat token sesi login baru |

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
| Guest (belum login) | AKSI (ALLOWED) |
| Admin TU | AKSI (ALLOWED) |
| Kepala Sekolah | AKSI (ALLOWED) |
| Guru/Staf | AKSI (ALLOWED) |
| Wakasek | AKSI (ALLOWED) |

---

# 12. ACCEPTANCE CRITERIA

| AC ID | Description |
|---|---|
| AC-001 | Pengguna dapat melihat form login dengan input username dan password |
| AC-002 | Pengguna dapat memasukkan kredensial dan mengklik tombol "Masuk" |
| AC-003 | Sistem menampilkan pesan error jika kredensial salah (tanpa menyebut field mana) |
| AC-004 | Sistem menampilkan validasi jika field kosong (tanpa request ke server) |
| AC-005 | Sistem redirect ke `/dashboard` setelah login berhasil |
| AC-006 | Halaman login tidak menampilkan sidebar navigation |
| AC-007 | Sistem redirect ke `/dashboard` jika pengguna sudah login dan mengakses `/login` |

---

# 13. TRACEABILITY

## Requirement Traceability

| Requirement ID |
|---|
| F-01 |
| NF-02 |

## Information Architecture Traceability

| Page ID |
|---|
| PAGE-001 |
| PAGE-002 |

---

# 14. REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 0.1 | 2026-07-10 | System Analyst AI | Initial Draft — adaptasi ke format user flow specification |
