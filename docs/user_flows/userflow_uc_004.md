# userflow_uc_004.md — UC-004: Update Status Surat

---

**Aktor:** Guru / Staf
**Halaman:** `/disposisi/saya` → `/disposisi/:id`

---

## Pre-condition
- Guru/Staf sudah login dengan role `GURU_STAF`.
- Guru/Staf telah menerima minimal satu disposisi yang ditujukan kepadanya.
- Guru/Staf hanya dapat melihat surat yang didisposisikan kepadanya — tidak dapat melihat seluruh surat masuk (BR-11).

---

## Main Flow (Alur Utama)

1. Guru/Staf menerima notifikasi disposisi baru, atau membuka menu **"Disposisi Saya"** di sidebar.
2. Sistem menampilkan daftar disposisi yang diterima pada halaman `/disposisi/saya`.
3. Guru/Staf memilih salah satu disposisi dan masuk ke halaman detail `/disposisi/:id`.
4. Sistem menampilkan detail disposisi: instruksi, deadline, data surat terkait, dan status saat ini.
5. Sistem menampilkan tombol aksi di bagian **"Aksi"** sesuai status surat:
   - Jika status `Didisposisi`: tombol **"Mulai Diproses"** (biru) dan **"Tandai Selesai"** (hijau).
   - Jika status `Diproses`: tombol **"Tandai Selesai"** (hijau) saja.
6. Guru/Staf menekan salah satu tombol status.
7. Sistem menampilkan **modal konfirmasi** berisi:
   - Judul: `Ubah Status ke "[status terpilih]"`
   - Textarea **Catatan Tindak Lanjut** (opsional) — placeholder: "Tuliskan catatan tindak lanjut..."
   - Keterangan: "Catatan akan muncul di timeline riwayat surat."
   - Tombol **"Simpan"** dan **"Batal"**.
8. Guru/Staf **dapat mengisi** catatan tindak lanjut pada textarea, atau membiarkannya kosong.
9. Guru/Staf menekan tombol **"Simpan"** pada modal.
10. Sistem menyimpan entri baru ke tabel `StatusSurat`: status terpilih, catatan (atau string kosong jika tidak diisi), waktu sekarang, oleh Guru/Staf.
11. Sistem memperbarui status di tabel `SuratMasuk` mengikuti status terbaru.
12. Jika status dipilih `Selesai`, sistem mengunci field status agar tidak dapat diubah kembali (lihat BR-13).
13. Sistem mengirimkan notifikasi otomatis ke **Kepala Sekolah**: "Status surat [Perihal] telah diperbarui menjadi [status] oleh [nama Guru/Staf]."
14. Sistem menampilkan toast success: **"Status berhasil diperbarui."**
15. Sistem menutup modal dan memperbarui tampilan detail disposisi dengan status terbaru.

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Catatan tindak lanjut dibiarkan kosong | Sistem tetap memproses perubahan status. Catatan tersimpan sebagai string kosong di tabel `StatusSurat`. |
| Guru/Staf menekan "Batal" pada modal | Sistem menutup modal tanpa melakukan perubahan apapun. Status surat tetap seperti semula. |
| Guru/Staf mencoba mengubah status surat yang sudah `Selesai` | Tombol aksi tidak ditampilkan (section "Aksi" disembunyikan). Guru/Staf hanya dapat melihat detail disposisi secara read-only. |
| Guru/Staf memilih status `Selesai` padahal status saat ini masih `Didisposisi` (melompati `Diproses`) | Sistem mengizinkan (status boleh langsung ke Selesai jika tugas memang selesai tanpa tahap proses terpisah). |
| Koneksi terputus saat menyimpan | Sistem menampilkan alert error: "Gagal memperbarui status. Periksa koneksi dan coba lagi." Modal tetap terbuka dengan data yang sudah diisi. |

---

## Post-condition
- Entri timeline baru tersimpan di tabel `StatusSurat` (beserta catatan jika diisi).
- Status surat di `SuratMasuk` ter-update.
- Notifikasi terkirim ke Kepala Sekolah.
- Jika status `Selesai`, surat terkunci dari perubahan status lebih lanjut.
