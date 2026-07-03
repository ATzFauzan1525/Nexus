# userflow_uc_003.md — UC-003: Buat Disposisi Digital

---

**Aktor:** Kepala Sekolah  
**Halaman:** `/surat/:id` → `/disposisi/buat/:idSurat`

---

## Pre-condition
- Kepala Sekolah sudah login dengan role `KEPALA_SEKOLAH`.
- Surat masuk yang akan didisposisi sudah ada di sistem dengan status `Diterima`.
- Akun Guru/Staf penerima disposisi sudah terdaftar di sistem (5 bidang: Kurikulum, Kesiswaan, Sarana Prasarana, Humas, Keuangan).

---

## Main Flow (Alur Utama)

1. Kepala Sekolah menerima notifikasi surat masuk baru atau membuka menu **"Surat Masuk"** di sidebar.
2. Kepala Sekolah memilih surat dari daftar dan masuk ke halaman detail `/surat/:id`.
3. Sistem menampilkan detail surat: nomor, tanggal, pengirim, perihal, file scan, dan status saat ini.
4. Kepala Sekolah menekan tombol **"Buat Disposisi"**.
5. Sistem membuka halaman `/disposisi/buat/:idSurat` dengan form disposisi.
6. Kepala Sekolah memilih **penerima disposisi** dari dropdown daftar Guru/Staf yang terdaftar.
7. Kepala Sekolah mengisi **instruksi tugas** (textarea) — wajib diisi.
8. Kepala Sekolah memilih **deadline** (date picker) — wajib diisi, tidak boleh tanggal yang sudah lewat.
9. Kepala Sekolah menekan tombol **"Buat Disposisi"**.
10. Sistem menyimpan data disposisi baru ke tabel `Disposisi`.
11. Sistem memperbarui status surat di tabel `SuratMasuk` menjadi `Didisposisi`.
12. Sistem mencatat entri baru di tabel `StatusSurat`: status `Didisposisi`, waktu sekarang, oleh Kepala Sekolah.
13. Sistem mengirimkan notifikasi otomatis ke **Guru/Staf penerima**: "Anda mendapat disposisi baru untuk surat [Perihal]. Deadline: [tanggal]."
14. Sistem menampilkan toast success: **"Disposisi berhasil dikirim."**
15. Sistem mengarahkan Kepala Sekolah kembali ke halaman detail surat `/surat/:id`.

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Penerima disposisi tidak dipilih | Sistem menampilkan validasi: "Penerima disposisi wajib dipilih." |
| Instruksi tidak diisi | Sistem menampilkan validasi: "Instruksi tugas wajib diisi." |
| Deadline tidak dipilih atau tanggal sudah lewat | Sistem menampilkan validasi: "Deadline wajib diisi dan tidak boleh tanggal yang sudah lewat." |
| Kepala Sekolah ingin mendisposisi ke lebih dari satu penerima | Untuk setiap penerima, Kepala Sekolah membuat disposisi terpisah. Satu surat dapat memiliki lebih dari satu disposisi (BR-05). |
| Surat sudah pernah didisposisi sebelumnya | Sistem tetap mengizinkan pembuatan disposisi baru (satu surat bisa didisposisi lebih dari sekali). Riwayat disposisi sebelumnya tetap tersimpan dan tampil di detail surat. |

---

## Post-condition
- Data disposisi tersimpan di tabel `Disposisi`.
- Status surat berubah menjadi `Didisposisi` di tabel `SuratMasuk`.
- Entri timeline baru tersimpan di tabel `StatusSurat`.
- Notifikasi terkirim ke Guru/Staf penerima disposisi.
