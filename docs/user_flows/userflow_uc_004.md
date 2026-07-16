# User Flow Specification

Document Version: v0.1

Use Case ID: UC-004

Use Case Name: Update Status Surat (Tindak Lanjut & Selesai)

Status: Active

Last Updated: 2026-07-10

Author: System Analyst AI

---

# 1. OVERVIEW

## 1.1 Summary

Guru/Staf yang menerima disposisi memperbarui status surat dari `Didisposisi` menjadi `Diproses` (Tindak Lanjut) atau `Selesai` melalui halaman detail disposisi, serta menambahkan catatan tindak lanjut opsional.

## 1.2 Goal

Guru/Staf ingin menindaklanjuti surat yang didisposisikan kepadanya dan memperbarui status penyelesaian agar terpantau oleh Kepala Sekolah dan Admin TU.

## 1.3 Requirement References

|Requirement ID|Requirement Name|
|---|---|
|F-05|Update status surat oleh Guru/Staf|
|F-06|Notifikasi otomatis internal|
|F-08|Timeline/riwayat alur surat|

## 1.4 Primary Actor

Guru / Staf (5 bidang: Kurikulum, Kesiswaan, SaranaPrasarana, Humas, Keuangan)

## 1.5 Supporting Actors

Sistem Disposisi, Sistem Notifikasi

---

# 2. TRIGGER

Guru/Staf menerima notifikasi disposisi baru atau membuka halaman `Disposisi Saya` (`/disposisi/saya`) untuk menindaklanjuti surat yang diterima.

---

# 3. PRECONDITIONS

|ID|Condition|
|---|---|
|PRE-001|Guru/Staf sudah login dengan role `GURU_STAF`|
|PRE-002|Guru/Staf telah menerima minimal satu disposisi yang ditujukan kepadanya|
|PRE-003|Status surat belum `Selesai` (BR-13)|

---

# 4. MAIN FLOW

|Step|Actor Action|System Response|
|---|---|---|
|1|Guru/Staf membuka menu "Disposisi Saya" di sidebar|Sistem menampilkan daftar disposisi yang diterima pada halaman `/disposisi/saya`|
|2|Guru/Staf memilih salah satu disposisi dan masuk ke halaman detail `/disposisi/:id`|Sistem menampilkan detail disposisi: instruksi, deadline, data surat terkait, dan status saat ini|
|3||Sistem menampilkan tombol aksi di bagian "Aksi" sesuai status: jika `Didisposisi` tampilkan tombol "Mulai Diproses" (biru) dan "Tandai Selesai" (hijau); jika `Diproses` tampilkan tombol "Tandai Selesai" (hijau) saja|
|4|Guru/Staf menekan salah satu tombol status|Sistem menampilkan modal konfirmasi berisi judul "Ubah Status ke [status terpilih]", textarea catatan tindak lanjut (opsional), keterangan, tombol "Simpan" dan "Batal"|
|5|Guru/Staf mengisi catatan tindak lanjut (opsional) dan menekan "Simpan"|Sistem menyimpan entri baru ke tabel `status_surat` dengan status terpilih, catatan, timestamp, dan ID pengguna|
|6||Sistem memperbarui kolom `status` di tabel `surat_masuk` dengan status terbaru|
|7||Jika status `Selesai`, sistem mengunci field status agar tidak dapat diubah kembali (BR-13)|
|8||Sistem mengirim notifikasi ke Kepala Sekolah: "Status surat [Perihal] telah diperbarui menjadi [status] oleh [nama Guru/Staf]"|
|9||Sistem menampilkan toast success: "Status berhasil diperbarui."|
|10||Sistem menutup modal dan memperbarui tampilan detail disposisi dengan status terbaru|

---

# 5. ALTERNATIVE FLOW

## AF-001: Catatan Tindak Lanjut Dikosongkan

### Condition

Ketika Guru/Staf tidak mengisi catatan tindak lanjut pada modal konfirmasi.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Guru/Staf menekan "Simpan" tanpa mengisi catatan|Sistem tetap memproses perubahan status; catatan tersimpan sebagai string kosong di tabel `status_surat`|

---

## AF-002: Membatalkan Perubahan Status

### Condition

Ketika Guru/Staf membatalkan proses perubahan status.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Guru/Staf menekan "Batal" atau klik di luar modal|Sistem menutup modal tanpa melakukan perubahan apapun; status surat tetap seperti semula|

---

# 6. EXCEPTION FLOW

## EF-001: Surat Sudah Berstatus Selesai

### Condition

Ketika Guru/Staf mencoba mengubah status surat yang sudah `Selesai`.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Guru/Staf membuka detail disposisi surat yang sudah `Selesai`|Sistem menyembunyikan section "Aksi" (tombol status tidak ditampilkan)|
|2||Guru/Staf hanya dapat melihat detail disposisi secara read-only|

---

## EF-002: Koneksi Terputus Saat Menyimpan

### Condition

Ketika koneksi internet terputus saat Guru/Staf menyimpan perubahan status.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Guru/Staf menekan "Simpan"|Sistem gagal mengirim request ke server|
|2||Sistem menampilkan alert error: "Gagal memperbarui status. Periksa koneksi dan coba lagi."|
|3||Modal tetap terbuka dengan data yang sudah diisi|

---

## EF-003: Server Error

### Condition

Ketika terjadi kesalahan server saat menyimpan perubahan.

### Flow

|Step|Actor Action|System Response|
|---|---|---|
|1|Guru/Staf menekan "Simpan"|Sistem backend gagal menyimpan data|
|2||Sistem menampilkan pesan: "Terjadi kesalahan server. Silakan coba lagi."|

---

# 7. POSTCONDITIONS

|ID|Condition|
|---|---|
|POST-001|Entri timeline baru tersimpan di tabel `status_surat` beserta catatan jika diisi|
|POST-002|Status surat di tabel `surat_masuk` ter-update|
|POST-003|Notifikasi terkirim ke Kepala Sekolah|
|POST-004|Jika status `Selesai`, surat terkunci dari perubahan status lebih lanjut|

---

# 8. BUSINESS RULES

|Rule ID|Description|
|---|---|
|BR-03|Status surat hanya boleh berubah mengikuti urutan alur: `Diterima` → `Didisposisi` → `Diproses` → `Selesai`. Status tidak boleh melompat mundur|
|BR-04|Disposisi hanya dapat dibuat oleh Kepala Sekolah|
|BR-07|Notifikasi otomatis dikirim ke Guru/Staf setiap ada disposisi baru|
|BR-08|Setiap perubahan status surat harus tercatat sebagai entri baru di tabel `status_surat`|
|BR-11|Guru/Staf hanya dapat melihat surat yang didisposisikan kepadanya|
|BR-13|Surat yang sudah berstatus `Selesai` tidak dapat diubah statusnya kembali|

---

# 9. RELATED PAGES

|Page ID|Page Name|
|---|---|
|PAGE-010|Disposisi Saya (`/disposisi/saya`)|
|PAGE-009|Detail Disposisi (`/disposisi/:id`)|

---

# 10. DATA USAGE

## 10.1 Data Read

|Entitas|Description|
|---|---|
|disposisi|Mengambil data disposisi yang ditujukan kepada Guru/Staf|
|surat_masuk|Mengambil data surat terkait disposisi|

---

## 10.2 Data Created

|Entitas|Description|
|---|---|
|status_surat|Membuat entri baru riwayat perubahan status|
|notifikasi|Membuat notifikasi untuk Kepala Sekolah|

---

## 10.3 Data Updated

|Entitas|Description|
|---|---|
|surat_masuk|Memperbarui kolom `status` dengan status terbaru|

---

## 10.4 Data Deleted

|Entitas|Description|
|---|---|
|Tidak ada|Tidak ada data yang dihapus|

---

# 11. PERMISSIONS

|Role|Access|
|---|---|
|GURU_STAF|AKSI (ALLOWED)|
|ADMIN_TU|VIEW ONLY|
|KEPALA_SEKOLAH|VIEW ONLY|
|WAKASEK|VIEW ONLY (bidang terkait)|

---

# 12. ACCEPTANCE CRITERIA

|AC ID|Description|
|---|---|
|AC-001|Guru/Staf dapat melihat daftar disposisi yang diterima di halaman `/disposisi/saya`|
|AC-002|Guru/Staf dapat membuka detail disposisi dan melihat instruksi, deadline, data surat|
|AC-003|Tombol aksi muncul sesuai status: "Mulai Diproses" dan/atau "Tandai Selesai"|
|AC-004|Modal konfirmasi muncul saat tombol status ditekan dengan textarea catatan opsional|
|AC-005|Catatan tindak lanjut bersifat opsional — status tetap berubah meskipun catatan kosong|
|AC-006|Status `Selesai` mengunci surat dari perubahan lebih lanjut|
|AC-007|Notifikasi terkirim ke Kepala Sekolah saat status berubah|
|AC-008|Toast success muncul setelah perubahan berhasil|

---

# 13. TRACEABILITY

## Requirement Traceability

|Requirement ID|
|---|
|F-05|
|F-06|
|F-08|

## Information Architecture Traceability

|Page ID|
|---|
|PAGE-010|
|PAGE-009|

---

# 14. REVISION HISTORY

|Version|Date|Author|Description|
|---|---|---|---|
|0.1|2026-07-10|System Analyst AI|Initial Draft|
