# design_system.md — Design System
# SiDis: Sistem Informasi Disposisi dan Pelacakan Surat Digital

---

## 1. Color Palette

| Nama | Token | Kode HEX | Penggunaan |
|---|---|---|---|
| Primary | `--color-primary` | `#1D4ED8` | Tombol utama, link aktif, header sidebar, Topbar |
| Primary Light | `--color-primary-light` | `#EFF6FF` | Background badge, highlight row |
| Secondary | `--color-secondary` | `#475569` | Teks sekunder, label, ikon non-aktif |
| Success | `--color-success` | `#16A34A` | Status Selesai, badge berhasil, notif sukses |
| Warning | `--color-warning` | `#D97706` | Status Overdue, peringatan deadline dekat |
| Danger | `--color-danger` | `#DC2626` | Pesan error, validasi gagal, tombol hapus |
| Info | `--color-info` | `#0891B2` | Status Diproses, notif informasi |
| Neutral 50 | `--color-neutral-50` | `#F8FAFC` | Background halaman |
| Neutral 100 | `--color-neutral-100` | `#F1F5F9` | Background sidebar, card header |
| Neutral 200 | `--color-neutral-200` | `#E2E8F0` | Border, divider, tabel baris alt |
| Neutral 700 | `--color-neutral-700` | `#334155` | Teks body utama |
| Neutral 900 | `--color-neutral-900` | `#0F172A` | Judul, heading |
| White | `--color-white` | `#FFFFFF` | Background card, modal, form |

### Warna Status Surat (Badge)

| Status | Background | Text |
|---|---|---|
| Diterima | `#DBEAFE` | `#1E40AF` |
| Didisposisi | `#FEF3C7` | `#92400E` |
| Diproses | `#CFFAFE` | `#155E75` |
| Selesai | `#DCFCE7` | `#166534` |

---

## 2. Tipografi

**Font Utama:** `Inter` (Google Fonts)  
**Font Fallback:** `ui-sans-serif, system-ui, sans-serif`

| Elemen | Size | Weight | Line Height |
|---|---|---|---|
| H1 | 30px | 700 (Bold) | 1.2 |
| H2 | 24px | 700 (Bold) | 1.3 |
| H3 | 20px | 600 (SemiBold) | 1.4 |
| H4 | 16px | 600 (SemiBold) | 1.4 |
| Body (paragraf) | 14px | 400 (Regular) | 1.6 |
| Small / Caption | 12px | 400 (Regular) | 1.5 |
| Label Form | 14px | 500 (Medium) | 1.4 |
| Tabel Header | 12px | 600 (SemiBold) | uppercase, letter-spacing: 0.05em |

---

## 3. Komponen UI

### Button

| Variant | Warna Normal | Warna Hover | Digunakan untuk |
|---|---|---|---|
| Primary | Background `#1D4ED8`, teks putih | Background `#1E40AF` | Aksi utama: Simpan, Buat Disposisi, Tindak Lanjut, Selesai |
| Secondary | Border `#CBD5E1`, teks `#334155`, bg putih | Background `#F1F5F9` | Aksi sekunder: Batal, Kembali, Download PDF |
| Danger | Background `#DC2626`, teks putih | Background `#B91C1C` | Aksi destruktif: Hapus |
| Ghost | Teks `#1D4ED8`, bg transparan | Background `#EFF6FF` | Aksi tersier, link-like |

- Semua tombol menggunakan `border-radius: 6px`
- Padding: `8px 16px` (normal), `6px 12px` (small)
- Wajib menampilkan loading spinner saat sedang proses submit

### Input Form

- Border: `1px solid #CBD5E1`, `border-radius: 6px`
- Padding: `10px 12px`
- Focus state: Border `#1D4ED8`, box-shadow `0 0 0 3px rgba(29,78,216,0.15)`
- Error state: Border `#DC2626`, teks error merah di bawah input
- Disabled state: Background `#F1F5F9`, teks `#94A3B8`, cursor not-allowed
- Label selalu tampil di atas input (tidak sebagai placeholder saja)

### Card

- Background: `#FFFFFF`
- Border: `1px solid #E2E8F0`
- Border-radius: `8px`
- Box-shadow: `0 1px 3px rgba(0,0,0,0.07)`
- Padding: `20px 24px`

### Tabel

- Header: Background `#F1F5F9`, teks uppercase `12px` semibold `#475569`
- Row ganjil: Background putih
- Row genap: Background `#F8FAFC`
- Row hover: Background `#EFF6FF`
- Border antar baris: `1px solid #E2E8F0`
- Setiap baris tabel harus dapat diklik untuk masuk ke halaman detail

### Modal / Dialog

- Overlay: Background `rgba(0,0,0,0.5)`
- Modal box: Background putih, `border-radius: 10px`, padding `24px`
- Lebar maksimum: `560px`
- Selalu memiliki tombol tutup (×) di pojok kanan atas
- Tombol aksi modal selalu ada di bawah (footer modal): tombol konfirmasi (Primary) di kanan, tombol batal (Secondary) di kiri

### Badge Status

- `border-radius: 999px` (pill shape)
- Padding: `2px 10px`
- Font size: `12px`, weight `500`
- Warna mengikuti tabel **Warna Status Surat** di atas

### Notifikasi Bell (Topbar)

- Ikon lonceng dengan badge angka merah jika ada notif belum dibaca
- Klik ikon membuka dropdown daftar 5 notif terbaru
- Klik "Lihat Semua" mengarah ke `/notifications`
- Notifikasi baru yang masuk via WebSocket otomatis menambah badge tanpa perlu refresh, disertai animasi singkat (bounce) pada ikon lonceng

### Connection Status Indicator (Topbar)

Indikator kecil di Topbar yang menampilkan status koneksi realtime (WebSocket):

| State | Tampilan | Warna |
|---|---|---|
| Tersambung (Connected) | Titik solid + label "Tersinkron" | `#16A34A` (Success) |
| Menyambungkan ulang (Reconnecting) | Titik berdenyut (pulse animation) + label "Menyambungkan ulang..." | `#D97706` (Warning) |
| Terputus (Disconnected) | Titik solid + label "Offline" | `#DC2626` (Danger) |

- Ukuran titik: `8px`, bentuk lingkaran penuh
- Posisi: di sisi kiri ikon notifikasi pada Topbar
- Saat status berubah dari Disconnected/Reconnecting kembali ke Connected, tampilkan toast singkat: "Koneksi tersambung kembali. Data telah diperbarui."

### Realtime Update Highlight

Efek visual saat data baru diterima via WebSocket pada halaman yang sedang terbuka (tabel surat, dashboard, daftar disposisi):

- Baris/kartu yang baru muncul atau berubah diberi background sementara `#FEF9C3` (kuning pucat) selama 2 detik, lalu bertransisi halus (`transition: background-color 1.5s ease-out`) kembali ke warna normal.
- Untuk kartu statistik dashboard yang nilainya berubah, gunakan animasi angka berganti (count-up/count-down) singkat agar perubahan terlihat jelas, bukan langsung berganti angka secara instan.

### Komentar

Komponen untuk diskusi tim pada detail surat:

- Card dengan border `1px solid #E2E8F0`, padding `12px`
- Input field text + tombol kirim (Primary) di bawahnya
- Setiap komentar menampilkan: nama penulis, role (badge kecil), waktu, isi komentar
- Tombol hapus (ikon trash) hanya muncul untuk penulis komentar, Admin TU, atau Kepala Sekolah
- Background komentar: `#F8FAFC`, border `1px solid #E2E8F0`

### Alur Surat (Stepper) — Halaman Lacak Publik

Komponen stepper visual horizontal yang menampilkan progres surat:

- 4 langkah selalu ditampilkan: Diterima → Didisposisi → Diproses → Selesai
- Langkah sudah dicapai: lingkaran berwarna (sesuai status) + nama role (bukan nama orang) + tanggal
- Langkah belum dicapai: lingkaran abu-abu + teks "Belum"
- Connector antar langkah: garis horizontal warna-warni (warna langkah sebelumnya)
- Icons: FileText (Diterima), Users (Didisposisi), Clock (Diproses), CheckCircle (Selesai)
- Warna: Diterima `#F97316`, Didisposisi `#D97706`, Diproses `#2563EB`, Selesai `#16A34A`

### Halaman Pelacakan Publik (`/lacak`)

Komponen khusus untuk halaman publik tanpa login, bergaya "lacak paket":

- **Header Publik**: Background `--color-primary` (`#1D4ED8`), logo + nama sekolah berwarna putih.
- **Logo**: Logo SMP Muhammadiyah 9 YK (PNG transparan) ukuran besar (`192px`) di bawah teks deskripsi, di luar kotak pencarian.
- **Search Box**: Card besar terpusat (`max-width: 480px`), input nomor surat dengan ukuran besar (`font-size: 18px`, padding `14px 16px`), tombol "Cek Status" Primary di sebelah kanan input.
- **Tracking Result Card**: muncul di bawah search box setelah pencarian berhasil.
  - Menampilkan badge status besar (mengikuti **Warna Status Surat** di atas) dan teks **posisi saat ini**.
  - **Alur Surat** (stepper visual) di bawah info utama.
  - Disertai Connection Status Indicator kecil bertuliskan "Live" dengan titik hijau berdenyut halus.
  - Tidak menampilkan tombol aksi apapun (read-only).
- **Not Found State**: jika nomor surat tidak ditemukan, tampilkan Empty State: "Nomor surat tidak ditemukan. Pastikan nomor surat sudah benar."
- **Footer Publik**: Background `--color-neutral-100`, teks kecil `12px` warna `--color-secondary`.

### Posisi Surat (Live Table)

Komponen tabel live yang menampilkan posisi terkini semua surat:

- Hanya ditampilkan untuk Admin TU, Kepala Sekolah, dan Wakasek di Dashboard
- Kolom: Nomor Surat, Pengirim, Perihal, Status (badge), Posisi Saat Ini
- Filter: Semua, Diterima, Didisposisi, Diproses, Selesai
- Realtime update via WebSocket
- Wakasek hanya melihat surat yang didisposisikan ke bidangnya

### Audit Log

Halaman daftar pencatatan perubahan sistem:

- Filter: Semua Aksi (CREATE, UPDATE_STATUS, DELETE), Semua Entitas (surat_masuk, disposisi, pengguna)
- Tabel: Waktu, User, Role, Aksi (badge warna), Entitas, Detail
- Aksi CREATE = hijau, UPDATE_STATUS = kuning, DELETE = merah
- Pagination

---

## 4. State Management Visual

### Empty State
Tampil saat tidak ada data di tabel atau list.
- Ikon ilustrasi (SVG sederhana) di tengah
- Teks utama: heading `H3`, contoh: "Belum Ada Surat Masuk"
- Teks sekunder: `14px` warna `#94A3B8`, penjelasan singkat
- Tombol aksi (opsional): contoh "Input Surat Pertama"

### Loading State
Tampil saat data sedang dimuat dari server.
- Skeleton loader (bukan spinner penuh layar) pada area tabel/card
- Skeleton berupa blok abu-abu animasi `pulse` sesuai struktur konten
- Warna skeleton: `#E2E8F0`

### Error State
Tampil saat request ke server gagal.
- Alert box merah di atas konten: Background `#FEF2F2`, border `#DC2626`
- Ikon error + teks pesan error yang jelas
- Tombol "Coba Lagi" di dalam alert

### Success State
Tampil setelah aksi berhasil (simpan, update, hapus).
- Toast notification di pojok kanan atas: Background `#DCFCE7`, border `#16A34A`
- Tampil selama 3 detik lalu menghilang otomatis

---

## 5. Spacing & Grid

- Base spacing unit: `4px`
- Layout utama: 2-kolom (Sidebar `240px` fixed + Konten `flex-1`)
- Gap antar section: `24px`
- Gap antar komponen dalam card: `16px`
- Padding halaman konten: `24px`
