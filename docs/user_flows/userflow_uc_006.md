# userflow_uc_006.md — UC-006: Cari & Filter Surat

---

**Aktor:** Admin TU, Kepala Sekolah, Guru/Staf (5 bidang), Wakasek (4 bidang: Kurikulum, Kesiswaan, Sarana Prasarana, Humas)
**Halaman:** `/surat`

---

## Pre-condition
- Aktor sudah login.
- Terdapat minimal satu data surat masuk di sistem.

---

## Main Flow (Alur Utama)

1. Aktor membuka menu **"Surat Masuk"** di sidebar.
2. Sistem menampilkan halaman `/surat` berisi tabel seluruh surat masuk yang sesuai hak akses aktor:
   - Admin TU, Kepala Sekolah: melihat semua surat.
   - Guru/Staf: hanya melihat surat yang didisposisikan kepadanya (BR-11).
   - Wakasek: hanya melihat surat yang didisposisi ke bidangnya.
3. Aktor mengetik kata kunci pada kolom **pencarian** (nomor surat, pengirim, atau perihal).
4. Sistem secara otomatis memfilter tabel sesuai kata kunci yang diketik (auto-search) — halaman kembali ke halaman 1.
5. Aktor dapat memilih **filter status** pada dropdown (opsional): Semua Status / Diterima / Didisposisi / Diproses / Selesai.
6. Sistem memperbarui tabel sesuai filter status yang dipilih — halaman kembali ke halaman 1.
7. Aktor dapat menekan baris pada tabel atau link nomor surat untuk masuk ke halaman detail `/surat/:id`.

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Kata kunci pencarian tidak menghasilkan data apapun | Sistem menampilkan Empty State: "Belum Ada Surat Masuk" atau "Surat tidak ditemukan." |
| Aktor mengosongkan kolom pencarian | Sistem menampilkan kembali seluruh data sesuai hak akses. |
| Hasil lebih dari satu halaman | Sistem menampilkan tombol pagination: "Sebelumnya" / "Selanjutnya" di bagian bawah tabel. |

---

## Post-condition
- Tabel surat menampilkan hasil yang sesuai dengan kata kunci dan/atau filter status yang diterapkan.
- Filter dan pencarian direset saat aktor meninggalkan halaman.
