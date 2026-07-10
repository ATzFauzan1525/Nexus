# userflow_uc_011.md — UC-011: Sinkronisasi Realtime Multi-Aktor

---

**Aktor:** Semua Aktor (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek)
**Halaman:** Berlaku global di seluruh halaman ber-autentikasi (`/dashboard`, `/surat`, `/surat/:id`, `/disposisi/saya`, `/disposisi`, `/notifications`)

---

## Pre-condition
- Pengguna sudah login dan memiliki JWT token aktif (lihat UC-001).
- Backend Express.js dan database Neon PostgreSQL aktif sebagai sumber data terpusat (BR-14).

---

## Main Flow (Alur Utama)

1. Setelah pengguna berhasil login, sistem membuka koneksi WebSocket (Socket.io) menggunakan JWT token untuk autentikasi.
2. Sistem secara otomatis menempatkan klien ke room sesuai identitas dan role pengguna: `user:{idPengguna}`, `role:{peran}`, dan — khusus Wakasek (4 bidang: Kurikulum, Kesiswaan, Sarana Prasarana, Humas) — `role:WAKASEK_BIDANG:{bidang}` (lihat information_architecture.md bagian 5).
3. Topbar menampilkan **Connection Status Indicator** berwarna hijau ("Tersinkron") begitu koneksi WebSocket berhasil terbentuk.
4. Ketika aktor lain melakukan aksi yang relevan (contoh: Admin TU input surat baru / UC-002, Kepala Sekolah buat disposisi / UC-003, Guru/Staf update status / UC-004), server memproses perubahan ke database Neon PostgreSQL terlebih dahulu, lalu memancarkan event WebSocket terkait (`surat:baru`, `disposisi:baru`, `status:update`, `notifikasi:baru`, `dashboard:refresh`) ke room yang berhak menerima.
5. Klien yang sedang berada di halaman terkait (misal `/surat` saat menerima `surat:baru`, atau `/dashboard` saat menerima `dashboard:refresh`) langsung memperbarui tampilan data **tanpa perlu refresh manual oleh pengguna**.
6. Baris/kartu yang baru berubah diberi efek highlight sesaat sesuai ketentuan **Realtime Update Highlight** di design_system.md.
7. Jika event yang diterima adalah `notifikasi:baru`, badge notifikasi di Topbar bertambah otomatis dan ikon lonceng menampilkan animasi singkat.

---

## Alternative / Exception Flow

| Kondisi | Respons Sistem |
|---|---|
| Koneksi WebSocket terputus (jaringan tidak stabil) | Connection Status Indicator berubah menjadi oranye berdenyut ("Menyambungkan ulang..."). Sistem mencoba reconnect otomatis dengan exponential backoff. |
| Koneksi WebSocket gagal tersambung dalam waktu lama | Connection Status Indicator berubah merah ("Offline"). Sistem tetap memungkinkan pengguna membaca data terakhir yang sudah dimuat, namun update baru tidak akan masuk sampai koneksi pulih. |
| Koneksi WebSocket berhasil tersambung kembali setelah terputus | Sistem otomatis memanggil ulang REST API untuk halaman yang sedang aktif guna menyamakan data (resync) — mengantisipasi event yang mungkin terlewat saat offline (NF-09). Sistem menampilkan toast: "Koneksi tersambung kembali. Data telah diperbarui." |
| Dua aktor mengubah data yang sama secara bersamaan (misal dua Guru/Staf membuka disposisi yang sama) | Server menjadi satu-satunya sumber kebenaran (single source of truth via Neon PostgreSQL); perubahan diproses berurutan sesuai waktu request diterima server. Klien lain otomatis menerima versi terbaru via event WebSocket sehingga tidak terjadi data yang saling menimpa secara diam-diam. |
| Pengguna membuka sistem di lebih dari satu tab/device secara bersamaan | Setiap tab/device membentuk koneksi WebSocket sendiri di bawah room `user:{idPengguna}` yang sama, sehingga seluruh tab/device menerima update yang identik secara realtime. |

---

## Post-condition
- Seluruh aktor yang berwenang melihat suatu data selalu melihat **versi data terbaru** dari database terpusat, tanpa perlu refresh manual.
- Tidak ada aktor yang bekerja dengan data usang (stale data) lebih dari beberapa detik (sesuai NF-08: ≤ 2 detik).
- Kebutuhan utama hasil wawancara — *"Surat masuk tuh harusnya bisa dilihat posisinya sekarang di mana... kayak melacak paket"* — terpenuhi secara teknis melalui mekanisme push realtime ini, bukan sekadar tampilan statis yang harus di-refresh manual.
