# Design System (DS) - Source of Truth #3

Document Version: v1.0

Project: SiDis — Sistem Informasi Disposisi dan Pelacakan Surat Digital

Product: Web-Based Letter Disposition & Tracking System

Status: Validated / Active

Last Updated: 2026-07-16

Author: System Analyst AI

---

## 1. DOCUMENT OVERVIEW

### 1.1 Purpose

Dokumen ini mendefinisikan bahasa visual, standar interaksi, dan komponen UI yang dapat digunakan kembali (reusable UI components) pada seluruh antarmuka SiDis (Sistem Informasi Disposisi dan Pelacakan Surat Digital).

Sebagai Source of Truth #3 (SoT-3), dokumen ini diturunkan langsung dari SoT-1 (SRS v1.0) dan SoT-2 (IA v1.0), serta akan digunakan sebagai landasan mutlak untuk:

- Pembuatan High-Fidelity Prototype (SoT-5).
- Panduan penulisan kode komponen Frontend (React, Tailwind CSS).
- Menjaga konsistensi pengalaman pengguna (UX) di seluruh layar aplikasi.
- Mempercepat waktu pelatihan pengguna melalui pola interaksi yang konsisten dan intuitif.

### 1.2 Related Sources of Truth

| Artifact | Reference | Deskripsi |
|---|---|---|
| SoT-1 | SRS v1.0 | Spesifikasi Kebutuhan Perangkat Lunak dasar. |
| SoT-2 | Information Architecture | Struktur navigasi, peta situs, dan pemetaan routing. |
| SoT-4 | User Flows | Rangkaian langkah interaksi pengguna per use-case. |
| SoT-5 | System Logic | API contracts dan sequence diagrams. |

---

## 2. Design Principles

### 2.1 Design Goals

- **Clarity & Transparency (Kejelasan & Transparansi):** Setiap informasi surat, status, dan disposisi harus langsung terlihat jelas tanpa perlu interpretasi tambahan.
- **Real-time Feedback (Umpan Balik Realtime):** Setiap perubahan data harus terlihat oleh pengguna tanpa perlu refresh halaman.
- **Role-Based Focus (Fokus Berdasarkan Role):** Setiap role hanya melihat informasi yang relevan dengan tugasnya.
- **Professional & Trustworthy (Profesional & Terpercaya):** Desain harus memberikan kesan sistem yang handal untuk administrasi sekolah.

### 2.2 UX Principles

- **Minimal Clicks (Sedikit Klik):** Setiap alur utama harus diselesaikan dalam jumlah klik seminimal mungkin.
- **Instant Feedback (Umpan Balik Instan):** Setiap aksi harus memicu perubahan visual instan tanpa menunggu reload halaman penuh.
- **Error Prevention (Pencegahan Kesalahan):** Konfirmasi berlapis hanya diberikan pada aksi destruktif (hapus komentar, hapus pengguna).
- **Consistent Patterns (Pola Konsisten):** Komponen yang sama harus memiliki perilaku yang sama di seluruh halaman.

---

## 3. Brand Foundation

### 3.1 Brand Personality

- **Profesional & Terpercaya:** Menggunakan struktur layout yang kokoh, stabil, dan bersih untuk administrasi sekolah.
- **Modern & Efisien:** Bebas dari elemen dekoratif yang tidak perlu, mengutamakan fungsionalitas dan kecepatan akses.
- **Transparan & Terbuka:** Menggunakan warna biru untuk merepresentasikan kepercayaan, transparansi, dan komunikasi yang jelas.

### 3.2 Visual Characteristics

- **Bentuk Sudut:** Membulat sedang (Rounded 8px atau rounded-lg) untuk memberikan kesan modern namun tetap rapi dan terstruktur.
- **Kedalaman Visual:** Menggunakan bayangan lembut (soft shadows) pada komponen mengambang seperti kartu, modal form, dan panel untuk menegaskan hierarki tumpukan halaman.
- **Warna Dominan:** Biru (#1D4ED8) sebagai warna utama untuk identitas merek dan elemen tindakan utama.

---

## 4. Color System

### 4.1 Primary Colors (Blue Brand)

Digunakan untuk elemen tindakan utama, status aktif, dan identitas merek aplikasi.

| Token | Hex Value | Tailwind Class | Usage |
|---|---|---|---|
| color-primary | #1D4ED8 | bg-blue-700 | Tombol aksi utama, link aktif, header sidebar, Topbar |
| color-primary-hover | #1E40AF | hover:bg-blue-800 | Sesi hover pada tombol utama |
| color-primary-active | #1E3A8A | active:bg-blue-900 | Sesi tekan/klik pada tombol utama |
| color-primary-light | #EFF6FF | bg-blue-50 | Background badge, highlight row aktif |

### 4.2 Secondary Colors (Slate Structure)

Digunakan untuk elemen navigasi sekunder, border, dan teks pendukung.

| Token | Hex Value | Tailwind Class | Usage |
|---|---|---|---|
| color-secondary | #475569 | bg-slate-600 | Teks sekunder, label, ikon non-aktif |
| color-secondary-hover | #334155 | hover:bg-slate-700 | Sesi hover tombol sekunder |
| color-secondary-active | #1e293b | active:bg-slate-800 | Sesi tekan tombol sekunder |

### 4.3 Semantic Colors (Status & Alerts)

| Token | Hex Value | Tailwind Class | Usage |
|---|---|---|---|
| color-success | #16A34A | bg-green-600 | Status Selesai, badge berhasil, notif sukses |
| color-warning | #D97706 | bg-amber-600 | Status Overdue, peringatan deadline dekat |
| color-danger | #DC2626 | bg-red-600 | Pesan error, validasi gagal, tombol hapus |
| color-info | #0891B2 | bg-cyan-600 | Status Diproses, notif informasi |

### 4.4 Neutral Colors (Backgrounds & Text)

| Token | Hex Value | Tailwind Class | Usage |
|---|---|---|---|
| color-bg-app | #F8FAFC | bg-slate-50 | Latar belakang aplikasi keseluruhan |
| color-bg-card | #FFFFFF | bg-white | Latar belakang card, modal, form |
| color-text-main | #0F172A | text-slate-900 | Teks judul utama, label form |
| color-text-muted | #64748B | text-slate-500 | Teks deskripsi, penanda waktu |
| color-border | #E2E8F0 | border-slate-200 | Garis pembatas tabel, border input |

### 4.5 Letter Status Colors (Badge)

| Status | Background | Teks | Tailwind Class |
|---|---|---|---|
| Diterima | #DBEAFE | #1E40AF | bg-blue-100 text-blue-800 |
| Didisposisi | #FEF3C7 | #92400E | bg-amber-100 text-amber-800 |
| Diproses | #CFFAFE | #155E75 | bg-cyan-100 text-cyan-800 |
| Selesai | #DCFCE7 | #166534 | bg-green-100 text-green-800 |

---

## 5. Typography

Sistem menggunakan font Inter untuk memastikan legibilitas dan konsistensi di seluruh antarmuka.

| Text Style | Font Family | Weight | Size (px/rem) | Line Height | Usage |
|---|---|---|---|---|---|
| Display Title | Inter | Bold (700) | 30px (1.875rem) | 1.2 | Judul besar halaman Login |
| Page Title | Inter | Bold (700) | 24px (1.5rem) | 1.3 | Judul halaman utama |
| Section Title | Inter | SemiBold (600) | 20px (1.25rem) | 1.4 | Judul section, judul tabel |
| H4 | Inter | SemiBold (600) | 16px (1rem) | 1.4 | Sub-judul, label penting |
| Body Large | Inter | Regular (400) | 14px (0.875rem) | 1.6 | Teks body utama, paragraf |
| Body Medium | Inter | Regular (400) | 14px (0.875rem) | 1.5 | Label input form |
| Body Small/Muted | Inter | Regular (400) | 12px (0.75rem) | 1.5 | Teks kecil, caption, timestamp |
| Label Form | Inter | Medium (500) | 14px (0.875rem) | 1.4 | Label input form |
| Table Header | Inter | SemiBold (600) | 12px (0.75rem) | uppercase | Header tabel, letter-spacing: 0.05em |

---

## 6. Elevation & Shadows

Kedalaman visual digunakan untuk mengarahkan fokus pengguna ke elemen aktif di atas layar.

- **Shadow None (shadow-none):** Digunakan untuk seluruh elemen input teks dan tabel datar.
- **Shadow Small (shadow-sm):** Digunakan pada kartu di daftar surat, disposisi.
- **Shadow Medium (shadow-md):** Digunakan untuk Sidebar, Topbar, dan panel konten utama.
- **Shadow Large (shadow-lg):** Digunakan khusus untuk Modal Overlay (Form Input, Konfirmasi) dan Dropdown Notifikasi.

---

## 7. Grid & Layout

Aplikasi dioptimalkan untuk perangkat layar lanskap dengan resolusi minimal 1024px (Desktop PC / Layar Tablet iPad dalam orientasi landscape).

### 7.1 Desktop Grid (Width >= 1024px)

- **Layout Style:** Flexbox / Grid Split Layout.
- **Main Container:** Lebar penuh (100vw) tanpa margin luar berlebih untuk efisiensi ruang layar.
- **Sidebar Width:** Tetap di angka 240px (bisa diciutkan menjadi 80px lewat tombol kustom).
- **Content Padding:** 24px (p-6) di sekeliling area kerja konten.
- **Gutter Grid:** 16px (gap-4) antar elemen kartu di dashboard.

### 7.2 Tablet Grid (Width 768px to 1023px)

- **Layout Style:** Modul responsive satu kolom mengalir ke bawah atau sidebar disembunyikan (collapsible off-canvas).
- **Sidebar Behavior:** Disembunyikan secara otomatis. Dapat ditarik keluar menggunakan hamburger menu di pojok kiri atas.
- **Gutter Grid:** 12px (gap-3).

### 7.3 Mobile Grid (Width < 768px)

- **Layout Style:** Satu kolom penuh.
- **Sidebar Behavior:** Tersembunyi total, diakses via hamburger menu.
- **Content Padding:** 16px (p-4).

---

## 8. Iconography

Aplikasi menggunakan pustaka ikon Lucide React (atau inline SVG yang setara) dengan gaya ikon Outline yang konsisten (ketebalan stroke 2px).

| Icon Function | Lucide Icon Name | Visual Representation |
|---|---|---|
| Dashboard | BarChart3 | Ikon Grafik Dashboard |
| Surat Masuk | FileText | Ikon Dokumen Surat |
| Input Surat Baru | FilePlus | Ikon Dokumen dengan Tanda Plus |
| Disposisi | Send | Ikon Kirim/Disposisi |
| Disposisi Saya | Inbox | Ikon Kotak Masuk |
| Notifikasi | Bell | Ikon Lonceng Notifikasi |
| Laporan | FileSpreadsheet | Ikon Laporan Spreadsheet |
| Audit Log | History | Ikon Riwayat |
| Pengguna | Users | Ikon Pengguna |
| Tambah | Plus | Tanda Plus (+) |
| Edit | Edit | Ikon Pensil Edit |
| Hapus | Trash2 | Ikon Tempat Sampah |
| Pencarian | Search | Ikon Kaca Pembesar |
| Download | Download | Ikon Unduh |
| Logout | LogOut | Ikon Pintu Keluar |
| Close | X | Ikon Silang Tutup |
| Check | CheckCircle | Ikon Centang Selesai |
| Clock | Clock | Ikon Jam |
| FileText | FileText | Ikon Dokumen |

---

## 9. Component Library

### 9.1 Button

**Variants & Visual Tokens**

- **Primary Button:** Latar belakang bg-blue-700, teks text-white, sudut rounded-lg (8px).
- **Secondary Button:** Latar belakang bg-white, border border-slate-300, teks text-slate-700, sudut rounded-lg (8px).
- **Danger Button:** Latar belakang bg-red-600, teks text-white, sudut rounded-lg (8px).
- **Ghost Button:** Teks text-blue-700, bg transparan, sudut rounded-lg (8px).

**States Representation**

| Button State | Visual |
|---|---|
| [Default] | bg-blue-700, text-white |
| [Hover] | bg-blue-800 (Kursor berubah menjadi pointer) |
| [Active] | bg-blue-900 (Transform skala tekan 98%) |
| [Disabled] | bg-slate-300, text-slate-500 (Kursor dilarang) |
| [Loading] | bg-blue-700 dengan animasi spinner berputar di dalam teks |

### 9.2 Text Input

Komponen utama untuk formulir input surat, disposisi, dan kolom pencarian.

- **Default State:** Border border-slate-300, latar belakang bg-white, teks text-slate-900, placeholder text-slate-400.
- **Focus State:** Border berubah menjadi border-blue-500 dengan outline tipis berwarna biru terang (ring-2 ring-blue-200).
- **Validation - Success State:** Border berwarna border-green-500, dilengkapi ikon centang hijau kecil di sisi kanan input.
- **Validation - Error State:** Border berwarna border-red-500, disertai pesan teks error berwarna merah di bawah input (ukuran 12px).

### 9.3 Modal Dialog

Digunakan untuk menampilkan form input, konfirmasi, dan detail tambahan tanpa meninggalkan halaman utama.

- **Overlay Backdrop:** Warna hitam transparan (bg-slate-900/50) dengan efek blur tipis (backdrop-blur-sm).
- **Card Container:** Berada tepat di tengah layar, latar belakang putih, lebar maksimal 560px (max-w-lg), sudut membulat lebar rounded-xl (12px), shadow tebal (shadow-lg).
- **Header:** Berisi judul form (misal: "Konfirmasi Update Status") dan tombol silang X di pojok kanan untuk menutup modal.
- **Footer:** Berisi tombol sejajar kanan: Tombol "Batal" (Secondary) dan Tombol "Konfirmasi" (Primary).

### 9.4 Table Component

Digunakan untuk menampilkan daftar surat, disposisi, pengguna, dan audit log.

- **Header Row (thead):** Latar belakang abu-abu terang bg-slate-100, teks abu-abu tua text-slate-600 dengan tulisan tebal (Sized 12px/SemiBold, uppercase).
- **Body Rows (tbody):** Baris selang-seling abu-abu tipis untuk memudahkan pembacaan data horizontal (zebra striping): Baris ganjil bg-white, baris genap bg-slate-50.
- **Hover Row State:** Baris yang ditunjuk kursor berubah menjadi biru tipis (hover:bg-blue-50) untuk memperjelas baris yang sedang diteliti.
- **Clickable Rows:** Setiap baris tabel harus dapat diklik untuk masuk ke halaman detail.

### 9.5 Card Component

**Stat Card (Dashboard)**

- **Visual:** Border abu-abu tipis (border-slate-200), layout grid vertikal.
- **Body:** Judul card (Sized 12px, text-slate-500), angka stat besar (Sized 24px Bold berwarna sesuai status).
- **Footer:** Badge status atau teks keterangan.

**Surat Card (Detail Surat)**

- **Visual:** Border abu-abu tipis (border-slate-200), padding 20px.
- **Body:** Informasi surat (nomor, tanggal, pengirim, perihal, status badge).
- **Footer:** Tombol aksi (Download File, Buat Disposisi).

### 9.6 Status Badge

- `border-radius: 999px` (pill shape)
- Padding: `2px 10px`
- Font size: `12px`, weight `500`
- Warna mengikuti tabel **Letter Status Colors** di atas

### 9.7 Notification Bell (Topbar)

- Ikon lonceng dengan badge angka merah jika ada notif belum dibaca
- Klik ikon membuka dropdown daftar 5 notif terbaru
- Klik "Lihat Semua" mengarah ke `/notifications`
- Notifikasi baru yang masuk via WebSocket otomatis menambah badge tanpa perlu refresh, disertai animasi singkat (bounce) pada ikon lonceng

### 9.8 Connection Status Indicator (Topbar)

Indikator kecil di Topbar yang menampilkan status koneksi realtime (WebSocket):

| State | Tampilan | Warna |
|---|---|---|
| Tersambung (Connected) | Titik solid + label "Tersinkron" | #16A34A (Success) |
| Menyambungkan ulang (Reconnecting) | Titik berdenyut (pulse animation) + label "Menyambungkan ulang..." | #D97706 (Warning) |
| Terputus (Disconnected) | Titik solid + label "Offline" | #DC2626 (Danger) |

- Ukuran titik: 8px, bentuk lingkaran penuh
- Posisi: di sisi kiri ikon notifikasi pada Topbar
- Saat status berubah dari Disconnected/Reconnecting kembali ke Connected, tampilkan toast singkat: "Koneksi tersambung kembali. Data telah diperbarui."

### 9.9 Letter Flow (Stepper) — Public Tracking Page

Komponen stepper visual horizontal yang menampilkan progres surat:

- 4 langkah selalu ditampilkan: Diterima → Didisposisi → Diproses → Selesai
- Langkah sudah dicapai: lingkaran berwarna (sesuai status) + nama role (bukan nama orang) + tanggal
- Langkah belum dicapai: lingkaran abu-abu + teks "Belum"
- Connector antar langkah: garis horizontal warna-warni (warna langkah sebelumnya)
- Icons: FileText (Diterima), Users (Didisposisi), Clock (Diproses), CheckCircle (Selesai)
- Warna: Diterima #F97316, Didisposisi #D97706, Diproses #2563EB, Selesai #16A34A

### 9.10 Comment

Komponen untuk diskusi tim pada detail surat:

- Card dengan border 1px solid #E2E8F0, padding 12px
- Input field text + tombol kirim (Primary) di bawahnya
- Setiap komentar menampilkan: nama penulis, role (badge kecil), waktu, isi komentar
- Tombol hapus (ikon trash) hanya muncul untuk penulis komentar, Admin TU, atau Kepala Sekolah
- Background komentar: #F8FAFC, border 1px solid #E2E8F0

### 9.11 Letter Position (Live Table)

Komponen tabel live yang menampilkan posisi terkini semua surat:

- Hanya ditampilkan untuk Admin TU, Kepala Sekolah, dan Wakasek di Dashboard
- Kolom: Nomor Surat, Pengirim, Perihal, Status (badge), Posisi Saat Ini
- Filter: Semua, Diterima, Didisposisi, Diproses, Selesai
- Realtime update via WebSocket
- Wakasek hanya melihat surat yang didisposisikan ke bidangnya

### 9.12 Audit Log

Halaman daftar pencatatan perubahan sistem:

- Filter: Semua Aksi (CREATE, UPDATE_STATUS, DELETE), Semua Entitas (surat_masuk, disposisi, pengguna)
- Tabel: Waktu, User, Role, Aksi (badge warna), Entitas, Detail
- Aksi CREATE = hijau, UPDATE_STATUS = kuning, DELETE = merah
- Pagination

---

## 10. Form Design Rules

- **Labels:** Label harus selalu diletakkan di atas bidang input teks (top-aligned labels) untuk mempermudah pemindaian formulir secara vertikal.
- **Required Fields:** Ditandai dengan karakter bintang merah (*) langsung di samping teks label (misal: Nomor Surat *).
- **Validation Messages:** Pesan error validasi harus informatif, tidak boleh hanya menuliskan kata "Input salah".
  - Benar: "Nomor surat sudah ada di database."
  - Salah: "Input tidak valid!"
- **Error Presentation:** Fokus kursor otomatis berpindah ke field pertama yang mengalami kegagalan validasi saat tombol "Simpan" ditekan.

---

## 11. Interaction Patterns

### 11.1 Loading State

Setiap kali sistem melakukan komunikasi REST API ke backend (seperti menyimpan data surat baru atau memuat data disposisi):

- Tombol aksi yang memicu proses tersebut akan menampilkan animasi spinner berputar di samping tulisan tombol, dan dinonaktifkan sementara (disabled) untuk menghindari terjadinya double submit.
- Sisa bagian halaman akan dipasangi overlay transparan tipis agar pengguna tidak dapat menekan tombol lain sebelum proses selesai terekam.

### 11.2 Empty State

Jika pengguna melakukan pencarian surat namun tidak ada data yang cocok:

- Tampilkan ilustrasi visual sederhana (seperti ikon dokumen kosong) berukuran sedang di tengah area hasil pencarian.
- Sertakan teks informatif: "Belum ada surat masuk." atau "Nomor surat tidak ditemukan."
- Sertakan tombol aksi (opsional): "Input Surat Pertama" untuk Admin TU.

### 11.3 Confirmation Pattern

Untuk aksi yang berpotensi memengaruhi data secara signifikan:

- Ketika pengguna menekan tombol "Tandai Selesai" atau "Buat Disposisi", sistem akan menampilkan dialog konfirmasi terlebih dahulu di layar. Pengguna harus menekan tombol konfirmasi final untuk menyelesaikan penguncian data.

### 11.4 Destructive Action Pattern

Ketika Admin TU bermaksud menghapus pengguna atau komentar:

1. Pengguna harus mengklik tombol "Hapus" (berwarna merah).
2. Muncul modal konfirmasi: "Apakah Anda yakin ingin menghapus data ini?"
3. Pilihan tombol konfirmasi: "Ya, Hapus" (Latar merah) dan "Batal" (Latar abu-abu).

### 11.5 Realtime Update Highlight

Efek visual saat data baru diterima via WebSocket pada halaman yang sedang terbuka:

- Baris/kartu yang baru muncul atau berubah diberi background sementara #FEF9C3 (kuning pucat) selama 2 detik, lalu bertransisi halus (transition: background-color 1.5s ease-out) kembali ke warna normal.
- Untuk kartu statistik dashboard yang nilainya berubah, gunakan animasi angka berganti (count-up/count-down) singkat agar perubahan terlihat jelas.

---

## 12. Responsive Behavior

Sistem ini didesain sepenuhnya responsif untuk menjamin kenyamanan akses operasional pengguna baik menggunakan monitor komputer di meja kerja maupun menggunakan komputer tablet.

**[Viewport: Mobile (< 768px)]**

- Sidebar disembunyikan total (Hanya dapat diakses melalui drawer hamburger menu).
- Konten utama menggunakan satu kolom penuh.
- Tabel menampilkan kolom esensial saja (nomor surat, status).
- Padding konten: 16px.

**[Viewport: Tablet (768px - 1023px)]**

- Sidebar terlipat menjadi bentuk ikon (lebar 80px) untuk memaksimalkan area konten kerja.
- Tabel menampilkan kolom utama (nomor surat, pengirim, perihal, status).
- Padding konten: 16px.

**[Viewport: Desktop (>= 1024px)]**

- Sidebar terbuka lebar penuh secara permanen (lebar 240px).
- Layout 2 kolom berdampingan secara proporsional.
- Tabel menampilkan semua kolom.
- Padding konten: 24px.

---

## 13. Accessibility (a11y)

- **Contrast Ratio:** Teks judul dan label form harus memenuhi standar WCAG 2.1 AA dengan rasio kontras minimal 4.5:1 terhadap warna latar belakang putih/terang untuk mempermudah pembacaan.
- **Keyboard Navigation:** Pengguna dapat menavigasi seluruh halaman menggunakan tombol Tab. Fokus harus terlihat jelas dengan outline berwarna biru.
- **Focus States:** Setiap elemen interaktif (tombol, input, link) harus memiliki visual focus state yang jelas.
- **Alt Text:** Setiap ikon harus memiliki deskripsi untuk screen reader.
- **Semantic HTML:** Menggunakan elemen HTML yang tepat (header, nav, main, section, article) untuk struktur halaman.

---

## 14. Design Tokens Table

| Token Name | Token Category | Token Value | Mapped CSS / Tailwind |
|---|---|---|---|
| token-font-main | Typography | Inter, sans-serif | font-sans |
| token-color-primary | Color | #1D4ED8 | bg-blue-700 |
| token-color-primary-hover | Color | #1E40AF | hover:bg-blue-800 |
| token-color-success | Color | #16A34A | bg-green-600 |
| token-color-warning | Color | #D97706 | bg-amber-600 |
| token-color-danger | Color | #DC2626 | bg-red-600 |
| token-color-info | Color | #0891B2 | bg-cyan-600 |
| token-border-radius | Layout | 8px | rounded-lg |
| token-shadow-sm | Depth | 0 1px 2px rgba(0,0,0,0.05) | shadow-sm |
| token-shadow-md | Depth | 0 4px 6px rgba(0,0,0,0.1) | shadow-md |
| token-shadow-lg | Depth | 0 10px 15px rgba(0,0,0,0.1) | shadow-lg |

---

## 15. Traceability Matrix (SRS v1.0 → DS v1.0)

Setiap elemen visual dan aturan komponen dalam sistem ini diturunkan untuk menjamin terpenuhinya spesifikasi fungsional dari dokumen dasar.

| Feature ID | Feature Name | Design System Target Components | Applied Design / Interaction Rules |
|---|---|---|---|
| F-01 | Login dan Logout | Login Form, Button Primary | Layout minimalis tanpa sidebar, form input dengan validasi |
| F-02 | Manajemen Akun Pengguna | Table, Modal Form, Button Danger | Tabel pengguna, modal tambah/edit, konfirmasi hapus |
| F-03 | Input Surat Masuk | Form Input, File Upload, Button Primary | Form dengan validasi, upload file dengan preview |
| F-04 | Buat Disposisi Digital | Form Disposisi, Dropdown Select, Date Picker | Form dengan info surat read-only, pilih penerima |
| F-05 | Update Status Surat | Button Primary, Modal Konfirmasi | Tombol "Mulai Diproses" / "Tandai Selesai" dengan konfirmasi |
| F-06 | Notifikasi Otomatis | Bell Icon, Dropdown, Badge | Ikon lonceng dengan badge, dropdown notifikasi realtime |
| F-07 | Pencarian dan Filter Surat | Search Input, Filter Buttons, Table | Pencarian dengan auto-search, filter status |
| F-08 | Timeline Surat | Stepper Component, Timeline | Stepper visual horizontal dengan warna status |
| F-09 | Dashboard Monitoring | Stat Cards, Live Table, Filter | Kartu statistik, tabel posisi surat realtime |
| F-10 | Laporan Rekapitulasi | Form Periode, Summary Cards, Table | Form periode, ringkasan statistik, tabel detail |
| F-11 | Pelacakan Posisi Real-time | Live Table, Connection Indicator | Tabel dengan highlight realtime, indikator koneksi |
| F-12 | Pelacakan Publik | Search Box, Stepper, Status Badge | Layout publik tanpa login, stepper alur surat |
| F-13 | Komentar | Comment Card, Input Form, Button | Kartu komentar dengan nama penulis, tombol hapus |
| F-14 | Pencarian Lanjutan | Filter Form, Date Picker, Table | Filter tanggal, pengirim, perihal |
| F-15 | Audit Log | Table, Filter, Badge | Tabel dengan badge warna aksi, filter aksi/entitas |
| F-16 | Export Laporan PDF | Button Secondary, Download Icon | Tombol download PDF dengan ikon download |

---

## 16. Revision History

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 2026-06-28 | System Analyst AI | Initial Draft (Dokumen Dasar SoT-3). |
