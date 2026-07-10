# userflow_uc_010.md — UC-010: Lihat Dashboard Monitoring

---

**Aktor:** Semua Aktor (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek)
**Halaman:** `/dashboard`

---

## Pre-condition
- Aktor sudah login.
- Terdapat data surat masuk di sistem untuk diagregasi.

---

## Main Flow (Alur Utama)

1. Aktor login dan secara otomatis diarahkan ke halaman `/dashboard`.
2. Sistem mengambil data dari API sesuai hak akses aktor:
   - **Admin TU / Kepala Sekolah**: mengambil statistik global (total surat hari ini, belum selesai, overdue, total semua) + 5 surat terbaru.
   - **Wakasek**: mengambil statistik dan surat terbaru yang scoped ke bidangnya.
   - **Guru/Staf (5 bidang)**: mengambil statistik yang scoped hanya ke surat yang didisposisikan kepadanya + 5 disposisi terbaru.
3. Sistem menampilkan **kartu ringkasan statistik** untuk semua aktor:
   - Guru/Staf melihat: Disposisi Hari Ini (biru), Belum Selesai (kuning), Overdue (merah), Total Disposisi (hijau) — semua dihitung hanya dari surat yang didisposisikan kepadanya.
   - Admin TU / Kepala Sekolah / Wakasek melihat: Surat Hari Ini (biru), Belum Selesai (kuning), Overdue (merah), Total Semua (hijau).
4. Sistem menampilkan tabel **"Surat Terbaru"** (atau "Disposisi Terbaru" untuk Guru/Staf) berisi 5 surat terakhir yang sesuai hak akses: nomor surat, pengirim, perihal, status (badge), tanggal.
5. Aktor dapat menekan link nomor surat pada tabel untuk masuk ke halaman detail `/surat/:id`.
6. Aktor dapat menekan **"Lihat Semua"** untuk membuka halaman `/surat` dengan daftar lengkap.

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Belum ada data surat sama sekali di sistem | Sistem menampilkan kartu statistik dengan nilai 0 dan pesan: "Belum ada surat masuk" pada tabel. |
| Data gagal dimuat dari server | Sistem menampilkan skeleton loading, lalu jika gagal menampilkan alert error dengan tombol **"Coba Lagi"**. |
| Guru/Staf membuka dashboard | Sistem menampilkan kartu statistik yang dihitung hanya dari surat yang didisposisikan kepadanya, plus tabel "Disposisi Terbaru" berisi surat terakhir yang didisposisikan kepadanya. |

---

## Post-condition
- Aktor mendapatkan visibilitas terhadap kondisi administrasi surat secara real-time.
- Dashboard memperbarui data secara otomatis melalui WebSocket (event `dashboard:refresh` dan `surat:baru`) tanpa perlu refresh manual.
