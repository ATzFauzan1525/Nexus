# userflow_uc_002.md — UC-002: Input Surat Masuk

---

**Aktor:** Admin TU  
**Halaman:** `/surat/tambah`

---

## Pre-condition
- Admin TU sudah login dan memiliki role `ADMIN_TU`.
- File scan surat tersedia di perangkat Admin TU (format PDF atau JPG/PNG).

---

## Main Flow (Alur Utama)

1. Admin TU menekan menu **"Surat Masuk"** → **"Input Surat Baru"** di sidebar.
2. Sistem menampilkan halaman `/surat/tambah` berisi form input surat masuk.
3. Admin TU mengisi seluruh field yang wajib:
   - **Nomor Surat** (String) — nomor dari pengirim
   - **Tanggal Diterima** (Date picker) — tanggal surat diterima secara fisik
   - **Pengirim** (String) — nama instansi atau individu pengirim
   - **Perihal** (String) — pokok isi surat secara ringkas
4. Admin TU menekan tombol **"Unggah File Scan"** dan memilih file dari perangkat.
5. Sistem menampilkan preview nama file yang dipilih dan indikator upload (progress bar).
6. Admin TU menekan tombol **"Simpan Surat"**.
7. Sistem memvalidasi semua field wajib terisi dan file berhasil diunggah.
8. Sistem menyimpan data surat ke tabel `SuratMasuk` dengan status awal `Diterima`.
9. Sistem mencatat entri pertama di tabel `StatusSurat`: status `Diterima`, waktu sekarang, oleh Admin TU.
10. Sistem mengirimkan notifikasi otomatis ke **Kepala Sekolah**: "Surat masuk baru dari [Pengirim] dengan perihal [Perihal]."
11. Sistem menampilkan toast success: **"Surat berhasil disimpan."**
12. Sistem mengarahkan Admin TU ke halaman `/surat/:id` (detail surat yang baru dibuat).

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Field wajib tidak diisi (nomor surat / pengirim / perihal / tanggal) | Sistem menampilkan pesan validasi merah di bawah field yang kosong. Request tidak dikirim ke server. |
| File yang diunggah bukan PDF/JPG/PNG | Sistem menampilkan pesan error: "Format file tidak didukung. Hanya PDF, JPG, dan PNG yang diizinkan." File tidak terunggah. |
| Ukuran file melebihi batas maksimum (10 MB) | Sistem menampilkan pesan error: "Ukuran file terlalu besar. Maksimum 10 MB." |
| Nomor surat yang diinput sudah ada di database | Sistem menampilkan pesan warning: "Nomor surat ini sudah pernah diinput. Pastikan tidak ada duplikasi." Tombol simpan tetap aktif (Admin TU tetap bisa menyimpan jika memang berbeda). |
| Admin TU menekan "Batal" sebelum menyimpan | Sistem menampilkan konfirmasi dialog: "Apakah Anda yakin ingin membatalkan? Data yang diisi akan hilang." Jika konfirmasi, sistem kembali ke `/surat`. |
| Koneksi server terputus saat submit | Sistem menampilkan alert error: "Gagal menyimpan surat. Periksa koneksi dan coba lagi." Data form tetap tersimpan di halaman (tidak hilang). |

---

## Post-condition
- Data surat masuk tersimpan di tabel `SuratMasuk` dengan status `Diterima`.
- Entri pertama timeline tersimpan di tabel `StatusSurat`.
- Notifikasi terkirim ke Kepala Sekolah.
- Surat muncul di daftar `/surat` dan dapat diakses oleh aktor yang berwenang.
