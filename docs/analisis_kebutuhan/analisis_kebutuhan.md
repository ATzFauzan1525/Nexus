# Dokumen Analisis Kebutuhan

**Proyek:** SiDis — Sistem Informasi Disposisi dan Pelacakan Surat Digital

**Institusi:** SMP Muhammadiyah 9 Yogyakarta

**Mata Kuliah:** Desain dan Pengembangan Sistem Informasi

**Tanggal Observasi:** 22 April 2026

---

## 1. Profil Organisasi

SMP Muhammadiyah 9 Yogyakarta merupakan institusi pendidikan tingkat Sekolah Menengah Pertama yang berada di bawah naungan Muhammadiyah. Sekolah ini berlokasi di Jalan Karangkajen MG.III/1039, Brontokusuman, Mergangsan, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55153.

Dalam kegiatan operasionalnya, sekolah memiliki berbagai layanan administrasi, salah satunya pengelolaan surat masuk dan disposisi surat antar bagian internal sekolah. Proses administrasi surat melibatkan beberapa pihak seperti Tata Usaha (TU), Kepala Sekolah, Wakil Kepala Sekolah, guru, staf, serta pihak eksternal yang mengirimkan surat kepada sekolah.

---

## 2. Problem Statement

### 2.1 Latar Belakang

SMP Muhammadiyah 9 Yogyakarta merupakan institusi pendidikan yang dalam operasional sehari-harinya masih mengelola alur surat menyurat secara manual. Berdasarkan observasi terbatas dari sudut pandang pengirim surat dan wawancara dengan staf terkait yang dilakukan pada tanggal 22 April 2026, kelompok kami menemukan bahwa proses pencatatan, disposisi, dan pelacakan surat masuk maupun surat keluar dilakukan melalui buku agenda fisik dan komunikasi via WhatsApp antar staf.

Kondisi ini menyebabkan berbagai permasalahan operasional yang berpengaruh langsung pada efektivitas layanan administrasi sekolah, terutama dalam hal keterlambatan tindak lanjut dan sulitnya penelusuran riwayat surat.

### 2.2 Permasalahan Spesifik

| No | Permasalahan | Kondisi Saat Ini | Dampak | Solusi di SiDis | Sumber |
|---|---|---|---|---|---|
| 1 | Pencatatan Surat | Dicatat manual di buku agenda fisik | Rentan salah catat, data berisiko hilang/rusak | F-03: Input surat masuk digital dengan metadata lengkap dan file scan tersimpan di database Neon (BYTEA) | Wawancara |
| 2 | Pelacakan Status Surat | Tidak ada sistem pelacakan real-time | Pengirim harus konfirmasi manual ke TU; staf harus mengecek manual ke pihak terkait | F-07, F-08, F-11: Pencarian surat, timeline riwayat, dan pelacakan posisi surat real-time | Wawancara |
| 3 | Proses Disposisi | Dilakukan lisan atau via WhatsApp pribadi | Tidak terdokumentasi, rawan miskomunikasi, tidak ada jejak perpindahan tugas | F-04: Disposisi digital oleh Kepala Sekolah — memilih penerima, instruksi, deadline, semua tercatat | Wawancara |
| 4 | Notifikasi | Bergantung inisiatif petugas via WhatsApp | Surat bisa terlambat atau terlewat ditindaklanjuti karena tidak ada pengingat otomatis | F-06: Notifikasi otomatis ke Kepala Sekolah (surat baru), Guru/Staf penerima (disposisi baru), dan Wakasek sesuai bidang | Wawancara |
| 5 | Pengarsipan | Disimpan di map fisik dan sebagian difoto | Sulit mencari arsip lama, tidak terstruktur digital, berisiko rusak/hilang | F-03, F-08: File scan tersimpan sebagai BYTEA di Neon DB (persisten, tidak rusak), timeline riwayat lengkap | Wawancara |
| 6 | Monitoring Pimpinan | Tidak ada dashboard terpusat | Kepala Sekolah sulit memantau progres surat secara keseluruhan | F-09: Dashboard monitoring — statistik global + Posisi Surat live table untuk Admin/Kepala; Posisi Surat bidang untuk Wakasek | Wawancara |

### 2.3 Dampak Permasalahan

1. Keterlambatan respons terhadap surat-surat yang memerlukan tindak lanjut segera (surat dari dinas pendidikan, undangan resmi, dll.).
2. Risiko surat penting tidak tertindaklanjuti (hilang dalam alur komunikasi informal).
3. Tidak adanya akuntabilitas yang jelas — tidak diketahui siapa bertanggung jawab dan kapan harus selesai.
4. Beban kerja Staf Humas meningkat akibat seringnya menerima pertanyaan status surat dari pihak eksternal, sementara untuk menjawabnya Staf Humas harus menanyakan kembali secara manual ke bagian Tata Usaha — menciptakan rantai komunikasi yang tidak efisien.

### 2.4 Pernyataan Masalah

"SMP Muhammadiyah 9 Yogyakarta belum memiliki sistem informasi yang mampu mendukung pengelolaan surat masuk secara digital, mulai dari pencatatan, distribusi disposisi, pelacakan status secara real-time, hingga pengarsipan. Akibatnya, proses administrasi surat menjadi lambat, tidak transparan, dan berisiko kehilangan data serta tidak tertindaklanjutinya surat-surat penting."

---

## 3. Identifikasi Stakeholder

| No | Stakeholder | Peran dalam Sistem | Permasalahan | Kebutuhan Utama | Klasifikasi |
|---|---|---|---|---|---|
| 1 | Admin TU | Menginput surat masuk, mengelola arsip, mencetak laporan, dan mengelola akun pengguna | Pencatatan manual, rawan kesalahan input dan kehilangan data | Form input surat mudah digunakan, notifikasi konfirmasi, dashboard rekapitulasi | Primary Actor |
| 2 | Kepala Sekolah | Menerima surat, membuat disposisi ke guru/staf, memantau status tindak lanjut, melihat laporan dan audit log | Disposisi tidak terdokumentasi, sulit memantau progres surat real-time | Antarmuka disposisi cepat, notifikasi surat masuk baru, laporan status penyelesaian | Primary Actor |
| 3 | Guru / Staf | Menerima disposisi, menindaklanjuti surat, memperbarui status penyelesaian (Diproses / Selesai), menambah komentar | Tidak adanya notifikasi terpusat, tugas dapat terlewat atau terlambat | Notifikasi tugas masuk, kemudahan memperbarui status, komentar pada detail surat | Primary Actor |
| 4 | Wakil Kepala Sekolah | Memantau surat sesuai bidang, menerima notifikasi disposisi | Akses informasi terbatas dan tidak real-time | Akses disposisi terbatas sesuai bidang, kemampuan memantau surat yang relevan | Secondary Actor |
| 5 | Pengirim Surat Eksternal | Mengirimkan surat ke pihak sekolah, melacak posisi/status surat tanpa login | Tidak dapat melacak status surat, harus konfirmasi manual ke pihak sekolah | Pelacakan posisi surat real-time tanpa login (mirip melacak paket) | Stakeholder Eksternal |

### 3.1 Penjelasan Klasifikasi Aktor

- **Admin TU** — terlibat langsung sebagai penginput data awal surat, pengelola arsip digital, dan pengelola akun pengguna.
- **Kepala Sekolah** — terlibat langsung sebagai pembuat disposisi, pemantau status surat via dashboard, serta akses laporan dan audit log.
- **Guru/Staf** — terlibat langsung sebagai penerima disposisi, pembaruan status penyelesaian, dan penambah komentar pada detail surat. Terdiri dari 5 bidang: Kurikulum, Kesiswaan, Sarana Prasarana, Humas, Keuangan.
- **Wakil Kepala Sekolah** — peran pendukung, memantau surat sesuai bidang dengan hak akses terbatas. Tidak melakukan disposisi — disposisi hanya dilakukan oleh Kepala Sekolah. Terdiri dari 4 bidang: Kurikulum, Kesiswaan, Sarana Prasarana, Humas (tidak ada Wakasek untuk bidang Keuangan).
- **Pengirim Surat Eksternal** — tidak memiliki akun dalam sistem, dapat melacak posisi surat secara real-time tanpa login menggunakan nomor surat.

---

## 4. Batasan Sistem

- Sistem tidak mengelola surat keluar — hanya surat masuk.
- Pengirim eksternal tidak dapat membuat akun atau login ke sistem.
- Sistem tidak terintegrasi dengan sistem informasi akademik sekolah yang sudah ada.
- Sistem tidak memiliki fitur email atau pengiriman surat digital keluar.
- Tidak ada fitur kecerdasan buatan (AI) atau machine learning.
- Sistem tidak dikembangkan sebagai aplikasi mobile native (Android/iOS).
- Sistem tidak memiliki fitur forgot password — reset password hanya dilakukan oleh Admin TU.
- Sistem tidak terintegrasi dengan payment gateway atau sistem pembayaran apapun.

---

## 5. Kebutuhan Fungsional

Tabel berikut memetakan kebutuhan fungsional dan permasalahan yang diselesaikan:

| No | Kode | Kebutuhan Fungsional | Prioritas | Dikaitkan dengan Masalah |
|---|---|---|---|---|
| 1 | F-01 | Sistem harus menyediakan halaman login dengan form input username dan password, serta menyimpan token sesi di localStorage | Tinggi | Autentikasi belum terstruktur |
| 2 | F-02 | Admin TU dapat mengelola akun pengguna: tambah, ubah, hapus akun (username, password, nama, role, bidang) | Sedang | Diperlukan kontrol akses per peran |
| 3 | F-03 | Admin TU dapat menginput surat masuk baru beserta metadata lengkap (nomor surat, tanggal diterima, pengirim, perihal) dan unggah file scan (PDF/JPG/PNG, maks 10MB). Nomor surat di-trim spasi | Tinggi | Pencatatan manual di buku agenda |
| 4 | F-04 | Kepala Sekolah dapat membuat disposisi digital: memilih penerima (Guru/Staf), menambah instruksi, menetapkan deadline. Satu surat dapat memiliki lebih dari satu disposisi | Tinggi | Disposisi lisan / WhatsApp tanpa dokumentasi |
| 5 | F-05 | Guru/Staf penerima disposisi dapat memperbarui status surat: Tindak Lanjut (Didisposisi → Diproses) dan Selesai (Diproses → Selesai) | Tinggi | Surat nyangkut / tidak tertindaklanjuti |
| 6 | F-06 | Sistem mengirimkan notifikasi otomatis ke Kepala Sekolah (surat baru), Guru/Staf penerima (disposisi baru), dan Wakasek sesuai bidang (disposisi baru) | Tinggi | Surat nyangkut tanpa notifikasi |
| 7 | F-07 | Sistem menyediakan pencarian dan filter surat berdasarkan nomor, tanggal, pengirim, perihal, dan status — dengan auto-search on keystroke | Sedang | Sulit melacak riwayat surat lama |
| 8 | F-08 | Sistem menampilkan timeline/riwayat lengkap alur surat dari diterima hingga selesai dengan timestamp | Sedang | Riwayat surat sulit ditelusuri |
| 9 | F-09 | Dashboard monitoring: Admin TU/Kepala melihat statistik global + Posisi Surat; Wakasek melihat Posisi Surat bidang; Guru/Staf melihat statistik disposisi yang ditujukan kepadanya | Sedang | Tidak ada visibilitas pimpinan |
| 10 | F-10 | Laporan rekapitulasi surat masuk per periode (harian/mingguan/bulanan) — dapat diunduh sebagai PDF | Sedang | Tidak ada laporan berkala untuk pimpinan |
| 11 | F-11 | Sistem menampilkan posisi terkini surat secara real-time: di TU, di Kepala Sekolah, sudah didisposisi ke siapa (berdasarkan bidang) | Tinggi | Tidak diketahui surat sedang berada di siapa |
| 12 | F-12 | Halaman pelacakan publik (`/lacak`) tanpa login: pengirim eksternal memasukkan nomor surat dan melihat status + posisi unit yang sedang menangani secara real-time | Sedang | Pengirim harus konfirmasi manual ke TU |
| 13 | F-13 | Pengguna internal dapat menambah komentar pada detail surat untuk diskusi tim | Sedang | Perlu diskusi terkait surat |
| 14 | F-14 | Pencarian Lanjutan: filter tanggal mulai/akhir, pengirim, perihal di halaman Daftar Surat | Sedang | Sulit mencari surat berdasarkan kriteria spesifik |
| 15 | F-15 | Audit Log: pencatatan otomatis semua perubahan data (siapa, kapan, ubah apa) — hanya dapat dilihat oleh Admin TU dan Kepala Sekolah | Sedang | Tidak ada jejak perubahan data |
| 16 | F-16 | Setiap perubahan status surat tercatat di tabel `status_surat` (event sourcing) dengan timestamp | Tinggi | Tidak ada riwayat perpindahan surat |

---

## 6. Kebutuhan Non-Fungsional

| No | Kode | Kategori | Kebutuhan |
|---|---|---|---|
| 1 | NF-01 | Realtime | Sistem harus melakukan sinkronisasi data secara real-time via WebSocket (Socket.io) dengan latency ≤2 detik |
| 2 | NF-02 | Security | Sistem menggunakan autentikasi JWT dan otorisasi berbasis role (Admin TU, Kepala Sekolah, Guru/Staf, Wakasek) |
| 3 | NF-03 | Usability | Antarmuka sistem harus mudah digunakan oleh pengguna non-teknis (staf TU dan guru) |
| 4 | NF-04 | Reliability | Sistem harus bersifat multi-user dan tersinkronisasi secara real-time; file scan disimpan sebagai BYTEA di database Neon |
| 5 | NF-05 | Compatibility | Aplikasi sepenuhnya berbasis web; dapat diakses melalui browser (Chrome diutamakan, Firefox, Edge, Safari versi terbaru) |
| 6 | NF-06 | Availability | Sistem memiliki tingkat ketersediaan minimal 95% (cloud-hosted: Railway backend, Vercel frontend, Neon DB) |
| 7 | NF-07 | Authorization | Data surat hanya dapat diakses oleh pengguna yang berwenang; Guru/Staf hanya melihat surat yang didisposisikan kepadanya |

---

## 7. Hasil Observasi dan Wawancara

### 7.1 Informasi Observasi

| | |
|---|---|
| Tanggal Observasi | 22 April 2026 |
| Lokasi | SMP Muhammadiyah 9 Yogyakarta |
| Metode | Observasi langsung (dari sudut pandang pengirim surat) + Wawancara semi-terstruktur |
| Narasumber | Staf Humas |

### 7.2 Temuan Observasi Lapangan

Observasi dilakukan pada tanggal 22 April 2026 di SMP Muhammadiyah 9 Yogyakarta melalui dua pendekatan, yaitu pengamatan langsung dari sudut pandang pengirim surat dan wawancara semi-terstruktur dengan Staf Humas. Secara umum, ditemukan bahwa seluruh proses administrasi surat masih berjalan secara manual dan belum didukung oleh sistem informasi yang memadai.

Proses pengantaran surat masih mengharuskan pengirim datang langsung ke sekolah dan menyerahkan dokumen fisik ke bagian Tata Usaha. Setelah diterima, surat dicatat pada buku agenda fisik dan didisposisikan secara lisan atau melalui WhatsApp pribadi oleh Kepala Sekolah kepada pihak terkait. Tidak tersedia mekanisme pelacakan status surat secara real-time, baik bagi pengirim maupun pihak internal sekolah. Pengarsipan juga masih mengandalkan map fisik dan dokumentasi foto, sehingga penelusuran arsip lama membutuhkan waktu yang tidak sedikit.

### 7.3 Transkrip Wawancara

Transkrip lengkap wawancara dengan Staf Humas dapat dilihat di [`transkrip_wawancara.md`](transkrip_wawancara.md).

---

## 8. Konsep Solusi yang Diusulkan

### 8.1 Nama Sistem

**SiDis** — Sistem Informasi Disposisi dan Pelacakan Surat Digital

### 8.2 Deskripsi Solusi

SiDis adalah aplikasi web berbasis sistem informasi yang berfungsi sebagai platform terpusat untuk mengelola seluruh alur persuratan di SMP Muhammadiyah 9 Yogyakarta. Sistem ini mengadopsi konsep pelacakan mirip status pengiriman paket, namun diaplikasikan dalam konteks administrasi surat sekolah.

### 8.3 Alur Sistem yang Diusulkan

| No | Tahap | Proses | Aktor |
|---|---|---|---|
| 1 | Input Surat | Admin TU menginput data surat masuk: nomor, tanggal, pengirim, perihal, dan mengunggah file scan surat (PDF/JPG/PNG). Nomor surat di-trim spasi | Admin TU |
| 2 | Notifikasi | Sistem otomatis mengirim notifikasi ke Kepala Sekolah bahwa ada surat masuk baru. Status surat tercatat "Diterima" di tabel `status_surat` | Sistem (otomatis) |
| 3 | Disposisi | Kepala Sekolah membuka surat, memilih penerima disposisi (Guru/Staf), menambah instruksi, dan menetapkan deadline. Status surat berubah: Diterima → Didisposisi. Notifikasi terkirim ke Guru penerima dan Wakasek sesuai bidang | Kepala Sekolah |
| 4 | Terima Tugas | Guru/Staf menerima notifikasi disposisi, membaca instruksi, dan memulai tindak lanjut | Guru / Staf |
| 5 | Update Status | Guru/staf memperbarui status surat: Tindak Lanjut (Didisposisi → Diproses), kemudian Selesai (Diproses → Selesai) beserta catatan penyelesaian. Setiap perubahan tercatat di tabel `status_surat` | Guru / Staf |
| 6 | Monitoring | Semua pihak dapat melihat riwayat lengkap surat; Kepala sekolah memantau dashboard statistik + Posisi Surat; Pengirim eksternal melacak posisi surat tanpa login via `/lacak` | Semua Aktor |

---

## 9. Kesimpulan Analisis Kebutuhan

Berdasarkan seluruh temuan observasi dan wawancara, dapat disimpulkan bahwa SMP Muhammadiyah 9 Yogyakarta membutuhkan sistem informasi persuratan digital yang mampu:

1. Mendigitalisasi proses pencatatan surat masuk dengan formulir terstruktur dan penyimpanan file digital.
2. Menyediakan fitur disposisi digital yang terdokumentasi, dapat dilacak, dan dilengkapi notifikasi otomatis kepada Guru/Staf penerima dan Wakasek sesuai bidang.
3. Memberikan visibilitas real-time terhadap posisi surat kepada semua pihak yang berwenang, termasuk pelacakan publik tanpa login untuk pengirim eksternal.
4. Memungkinkan penerima disposisi memperbarui status penyelesaian tugasnya langsung dalam sistem dengan pencatatan event sourcing.
5. Menyediakan fitur pelaporan (harian/mingguan/bulanan), export PDF, audit log, komentar, dan pengarsipan untuk mendukung akuntabilitas administrasi sekolah.

---


