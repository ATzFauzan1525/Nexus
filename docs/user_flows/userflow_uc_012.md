# userflow_uc_012.md — UC-012: Lacak Surat Publik (Tanpa Login)

---

**Aktor:** Pengirim Surat Eksternal (External Actor, tidak memiliki akun)
**Halaman:** `/lacak`

---

## Pre-condition
- Surat yang ingin dilacak sudah pernah diinput oleh Admin TU ke sistem (UC-002) dan memiliki `nomorSurat` yang sah.
- Pengirim eksternal mengetahui nomor surat miliknya (biasanya diberikan oleh Admin TU saat surat fisik diserahkan, misalnya tertera pada tanda terima).
- Pengirim **tidak perlu** memiliki akun dan **tidak perlu** login.

---

## Main Flow (Alur Utama)

1. Pengirim eksternal membuka URL publik `/lacak` melalui browser (tanpa proses login).
2. Sistem menampilkan halaman publik berisi Header Publik (logo biru + nama sekolah), Logo SMP Muhammadiyah 9 YK ukuran besar (192px) di bawah teks deskripsi, kotak pencarian nomor surat, dan Footer Publik.
3. Pengirim mengetikkan **nomor surat** pada kolom input.
4. Pengirim menekan tombol **"Cek Status"**.
5. Sistem mengirim request ke endpoint publik (`GET /api/public/lacak?nomorSurat=...`) tanpa menyertakan token autentikasi apapun.
6. Server mencari data di tabel `surat_masuk` berdasarkan `nomorSurat` (dengan `TRIM()`), lalu mengambil:
   - Data surat: status, pengirim, perihal, tanggal diterima
   - Timeline dari tabel `status_surat`: daftar perubahan status beserta nama **role** (bukan nama orang) dan tanggal
   - Posisi saat ini berdasarkan status terkini
7. Server mengembalikan respons **terbatas**: status, posisiSaatIni, tanggalDiterima, pengirim, perihal, timeline (dengan role name), tanpa file scan, instruksi disposisi, atau nama lengkap orang.
8. Sistem menampilkan:
   - **Nomor Surat** + badge status besar
   - Info: Pengirim, Perihal, Tanggal Diterima
   - **Indikator "Live"** dengan titik hijau berdenyut
   - **Posisi Saat Ini**
   - **Alur Surat** (stepper visual horizontal): 4 langkah (Diterima → Didisposisi → Diproses → Selesai)
     - Langkah sudah dicapai: lingkaran berwarna + nama role + tanggal
     - Langkah belum dicapai: lingkaran abu-abu + teks "Belum"
9. Klien bergabung ke room WebSocket publik `lacak:{nomorSurat}` agar hasil pelacakan **otomatis ter-update secara realtime** selama halaman ini tetap terbuka.

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Nomor surat tidak diisi, lalu tombol "Cek Status" ditekan | Sistem menampilkan validasi: "Masukkan nomor surat terlebih dahulu." Request tidak dikirim ke server. |
| Nomor surat tidak ditemukan di database | Sistem menampilkan Not Found State: "Nomor surat tidak ditemukan. Pastikan nomor surat sudah benar." |
| Status surat berubah SAAT halaman `/lacak` masih terbuka | Server memancarkan event `lacak:update` ke room `lacak:{nomorSurat}`; badge status, posisi, dan alur surat pada klien otomatis memperbarui tanpa perlu refresh. |
| Pengirim melakukan banyak percobaan pencarian berturut-turut | Server menerapkan rate-limit per IP (BR-17); jika melebihi batas, sistem menampilkan: "Terlalu banyak percobaan. Silakan coba lagi beberapa saat lagi." |
| Pengirim mencoba mengakses `/surat/:id` langsung | Sistem menolak akses dan mengarahkan ke `/login`. |

---

## Post-condition
- Pengirim eksternal mengetahui status, posisi, dan alur surat miliknya secara mandiri dan realtime.
- Tidak ada data sensitif sekolah (file scan, instruksi internal, nama staf) yang terekspos ke pihak eksternal.
- Nama yang ditampilkan adalah **role** (Kepala Sekolah, Admin TU, Guru/Staf, Wakasek), bukan nama orang.
