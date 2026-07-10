# userflow_uc_008.md — UC-008: Download Laporan PDF

---

**Aktor:** Admin TU
**Halaman:** `/laporan`

---

## Pre-condition
- Admin TU sudah login dengan role `ADMIN_TU`.
- Terdapat data surat masuk pada periode yang ingin dilaporkan.

---

## Main Flow (Alur Utama)

1. Admin TU membuka menu **"Laporan"** di sidebar.
2. Sistem menampilkan halaman `/laporan` berisi form pemilihan periode.
3. Admin TU memilih jenis periode: **Harian**, **Mingguan**, atau **Bulanan**.
4. Admin TU memilih rentang tanggal mulai dan tanggal akhir sesuai jenis periode.
5. Admin TU menekan tombol **"Generate"**.
6. Sistem mengagregasi data dari tabel `surat_masuk` pada rentang tanggal terpilih: total surat masuk, total selesai, total overdue, total diterima, total didisposisi, total diproses.
7. Sistem menampilkan hasil laporan dalam bentuk ringkasan angka dan tabel detail surat pada periode tersebut.
8. Tombol **"Download PDF"** muncul di samping tombol Generate.
9. Admin TU menekan tombol **"Download PDF"**.
10. Sistem mengirim request ke endpoint `/api/laporan/pdf` dengan parameter periode dan tanggal.
11. Server menggunakan `pdfkit` untuk generate PDF berisi: judul laporan, ringkasan statistik, dan tabel detail surat.
12. Browser mengunduh file PDF dengan nama `Laporan_SiDis_{tanggal_mulai}_{tanggal_akhir}.pdf`.

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Tidak ada data surat pada rentang tanggal terpilih | Sistem menampilkan Empty State: "Tidak ada data surat pada periode ini." Tombol "Download PDF" dinonaktifkan. |
| Tanggal akhir lebih awal dari tanggal mulai | Sistem menampilkan validasi: "Tanggal akhir tidak boleh sebelum tanggal mulai." |
| Admin TU belum memilih jenis periode | Sistem menampilkan validasi: "Pilih jenis periode terlebih dahulu." |
| Token JWT expired saat download PDF | Sistem mengarahkan ke halaman login. |

---

## Post-condition
- File PDF laporan berhasil diunduh oleh Admin TU ke perangkat lokal.
- PDF berisi ringkasan statistik + tabel detail surat pada periode yang dipilih.
