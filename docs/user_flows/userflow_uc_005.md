# userflow_uc_005.md — UC-005: Terima & Lihat Notifikasi

---

**Aktor:** Semua Aktor (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek)
**Halaman:** Topbar (dropdown) → `/notifications`

---

## Pre-condition
- Pengguna sudah login.
- Terdapat event di sistem yang memicu notifikasi (surat baru, disposisi baru, atau perubahan status) sesuai BR-06, BR-07, dan BR-08.

---

## Main Flow (Alur Utama)

1. Sistem secara otomatis membuat entri baru di tabel `Notifikasi` setiap terjadi event yang relevan (surat baru, disposisi baru, update status).
2. Ikon lonceng di Topbar menampilkan badge angka merah sesuai jumlah notifikasi `statusBaca = false` milik pengguna.
3. Pengguna menekan ikon lonceng.
4. Sistem menampilkan dropdown berisi 5 notifikasi terbaru, masing-masing menampilkan pesan singkat dan waktu kirim relatif (misal: "5 menit lalu").
5. Pengguna menekan salah satu notifikasi pada dropdown.
6. Sistem menandai notifikasi tersebut sebagai sudah dibaca (`statusBaca = true`) dan mengarahkan pengguna ke halaman terkait (detail surat atau detail disposisi).
7. Pengguna juga dapat menekan **"Lihat Semua"** di bagian bawah dropdown untuk membuka halaman penuh `/notifications`.
8. Sistem menampilkan seluruh riwayat notifikasi milik pengguna, diurutkan dari yang terbaru, dengan indikator visual (dot biru) untuk yang belum dibaca.

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Tidak ada notifikasi sama sekali | Sistem menampilkan Empty State: "Belum ada notifikasi." |
| Pengguna menekan "Tandai Semua Dibaca" | Sistem memperbarui seluruh notifikasi pengguna menjadi `statusBaca = true` dan menghilangkan badge merah di ikon lonceng. |
| Notifikasi merujuk ke surat/disposisi yang sudah dihapus atau tidak dapat diakses oleh role pengguna saat ini | Sistem menampilkan pesan: "Data terkait tidak lagi tersedia." dan tetap menandai notifikasi sebagai dibaca. |

---

## Post-condition
- Notifikasi yang dibuka berubah status menjadi sudah dibaca.
- Badge jumlah notifikasi di Topbar diperbarui secara real-time.
