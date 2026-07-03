# userflow_uc_016.md — UC-016: Lihat Posisi Surat (Live Table)

---

**Aktor:** Admin TU, Kepala Sekolah, Wakasek
**Halaman:** Dashboard (`/dashboard`) → bagian "Posisi Surat"

---

## Pre-condition
- Pengguna sudah login dengan role `ADMIN_TU`, `KEPALA_SEKOLAH`, atau `WAKASEK_BIDANG_*`.
- Terdapat data surat masuk di database.

---

## Main Flow (Alur Utama)

1. Pengguna membuka halaman Dashboard.
2. Sistem menampilkan kartu statistik di atas, lalu di bawahnya tabel **Posisi Surat**.
3. Tabel menampilkan: Nomor Surat, Pengirim, Perihal, Status (badge), Posisi Saat Ini.
4. Status badge warna mengikuti definisi warna status surat di design_system.md.
5. Posisi saat ini:
   - Diterima → "Belum Didisposisi"
   - Didisposisi → "Wakasek [Bidang] / Guru [Bidang]"
   - Diproses → "Sedang Diproses"
   - Selesai → "Selesai"
6. Filter di atas tabel: Semua, Diterima, Didisposisi, Diproses, Selesai.
7. Wakasek hanya melihat surat yang didisposisikan ke bidangnya.
8. Admin TU dan Kepala melihat semua surat.

---

## Realtime Update

1. Ketika data surat baru ditambahkan (via UC-002), event `surat:baru` dipancarkan.
2. Frontend menerima event → baris baru muncul di tabel dengan highlight kuning (`#FEF9C3`) selama 2 detik.
3. Ketika status surat berubah (via UC-004), event `status:update` dipancarkan.
4. Frontend memperbarui status dan posisi pada baris yang sesuai dengan animasi transisi warna badge.
5. Ketika ada disposisi baru (via UC-003), event `disposisi:baru` dipancarkan.
6. Tabel posisi surat otomatis memperbarui posisi saat ini.

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Koneksi WebSocket terputus | Indikator "Offline" muncul di Topbar; tabel menampilkan data terakhir yang diketahui. |
| Koneksi kembali | Indikator berubah "Tersambung"; data di tabel disinkronkan ulang secara otomatis. |
| Token expired | Sistem mengarahkan ke halaman login. |

---

## Post-condition
- Pengguna dapat melihat posisi terkini semua surat secara real-time tanpa perlu refresh halaman.
- Data posisi surat selalu sinkron dengan status terbaru di database.
