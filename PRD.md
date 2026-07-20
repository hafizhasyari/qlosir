# PRD — Qlosir (Aplikasi Kasir Warung Kelontong)

| Document Control | Details |
|---|---|
| **Document Version** | `v1.0.0` |
| **Status** | Approved / Ready for Scaffolding |
| **Target Product Release** | Qlosir MVP `v1.0.0` |
| **Last Updated** | 2026-07-20 |
| **Architecture** | Containerized Microservices (Nginx Gateway + PERN + WAHA + Puppeteer) |

## 1. Overview

Qlosir adalah **web app kasir mobile-first (PWA)** untuk warung kelontong, ditujukan untuk 1 pemilik dan 1 toko. Fokus utama: pencatatan transaksi cepat, manajemen & pantauan stok barang, serta pembuatan invoice yang bisa dicetak (printer thermal) maupun dikirim sebagai link digital ke WhatsApp pembeli.

Aplikasi diakses langsung dari HP pedagang agar cepat dan praktis, serta dapat di-install layaknya aplikasi native.

Desain visual mengikuti bahasa dari handoff: font **Plus Jakarta Sans**, warna brand hijau `#0E6B39`, permukaan krem `#F4F1EA`, frame mobile **390×812**, dan **bottom navigation 5 tab** (Kasir / Produk / Riwayat / Laporan / Setelan).

## 2. Persona & User

- **Pemilik Warung (Admin tunggal)** — satu-satunya pengguna aktif. Bertanggung jawab atas:
  - Mengelola produk & stok.
  - Melakukan transaksi / bertindak sebagai kasir.
  - Mengirim invoice ke pembeli.
  - Melihat laporan penjualan.

### Model akun & autentikasi (password + PIN)

Sesuai desain, autentikasi terdiri dari dua lapis:

1. **Login akun (password)** — pemilik mendaftar akun sekali saja dengan: nama pemilik, nama toko, nomor HP, **password** (min. 6 karakter) + konfirmasi, **PIN kasir 6 digit** + konfirmasi, dan centang persetujuan Syarat & Ketentuan / Kebijakan Privasi. Setelahnya masuk cukup dengan **nomor HP + password**.
2. **PIN till (6 digit)** — setelah login, layar **PIN** muncul untuk membuka sesi kasir. PIN ini yang melindungi layar transaksi di setiap buka aplikasi, bukan sekadar login satu kali.

Alur pendukung di desain:
- **Lupa password?** — 3 langkah via WhatsApp OTP: (1) verifikasi nomor HP → (2) masukkan kode OTP 6 digit → (3) buat password baru.
- **Masuk dengan WhatsApp OTP** — opsi login alternatif (prototype; implementasi v1 boleh disederhanakan asal alur tersedia).
- Demo (desain): `0812-3456-7890` / `warung123`, PIN `123456`.

> Catatan: multi-kasir / multi-role dan multi-toko **tidak** termasuk scope v1. Satu akun = satu toko.

## 3. Tech Stack & Quality Standards

| Layer / Service | Teknologi & Versi Target Resmi | Docker Base Image / Package Target | Peran & Tanggung Jawab |
|---|---|---|---|
| **API Gateway & Host** | **Nginx 1.30.4** (atau 1.27 Mainline) | `nginx:alpine` | Single public entry point (Port 80/443), host static build PWA React (`dist/`), SSL termination, dan routing request ke backend services. |
| **Frontend App** | **React 19.2.7** + **Vite 8.1.5** | `react@^19.2.7`, `vite@^8.1.5` | PWA mobile-first, Workbox offline caching, client-side thermal printing (WebUSB / `@media print`), scanner barcode kamera (`getUserMedia`). Berinteraksi langsung via REST API Gateway (tanpa layer BFF terpisah). |
| **PWA & Offline** | **`vite-plugin-pwa` 1.3.0** (Workbox 7.4.1) | `vite-plugin-pwa@^1.3.0` | Generator service worker otomatis, app-shell precaching, dan offline transaction sync. |
| **CSS Styling** | **Tailwind CSS 4.3.3** | `tailwindcss@^4.3.3`, `@tailwindcss/vite` | Styling utility-first modern berbasis CSS-first engine (`@theme` di CSS). |
| **Language & Types** | **TypeScript 7.0.2** (atau 5.8+) | `typescript@^7.0.2` | Strict type safety end-to-end antara API contracts dan frontend state. |
| **Linting & Code Quality** | **ESLint 9.x (Flat Config) + Prettier 3.x** | `eslint@^9.x`, `typescript-eslint@^8.x` | Static analysis, validasi resmi React 19 Hooks (`eslint-plugin-react-hooks`), dan automatic code formatting. |
| **E2E & Integration Testing** | **Playwright 1.61+** | `@playwright/test@^1.61.1` | End-to-End testing untuk simulasi mobile viewport 390×812, native offline PWA sync (`context.setOffline(true)`), dan mock kamera barcode. |
| **Core POS API Service** | **Node.js v24.18.0 LTS** + **Express 5.2.1** | `node:24-alpine`, `express@^5.2.1` | REST API untuk Auth (password + PIN 6 digit), CRUD produk & stok, pemrosesan transaksi kasir, rekonsiliasi sinkronisasi offline, laporan penjualan, dan public invoice endpoint `/i/:id`. |
| **Database Server** | **PostgreSQL 17** (atau 18) | `postgres:17-alpine` | Relational DB persisten untuk `accounts`, `products`, `stock_history`, `transactions`/`invoices`, dan `store_settings`. Mendukung transaksi atomik ACID untuk transaksi & stok. |
| **PostgreSQL Driver** | **`pg` (node-postgres) 8.22.0** | `pg@^8.22.0` | High-performance connection pool client untuk PostgreSQL di Node.js. |
| **Invoice Render Service** | **Node.js v24.18.0 LTS** + **Puppeteer 25.3.0** | `node:24-bookworm-slim` (atau `ghcr.io/puppeteer/puppeteer:25`) | Microservice terisolasi khusus rendering server-side HTML invoice menjadi buffer gambar PNG (untuk WA) dan PDF (untuk download). Mencegah lonjakan RAM/CPU mengganggu Core API. |
| **WhatsApp Service** | **WAHA Core 2026.x** (`latest`) | `devlikeapro/waha:latest` | Container otomatisasi WhatsApp Web untuk pengiriman invoice (gambar PNG + teks ringkas + link digital) ke WhatsApp pembeli. |
| **Orchestration** | **Docker Compose v2+** | Compose Spec (`docker compose`) | Manajemen multi-container, private networking (`qlosir-network`), dependency startup order, environment variables, dan volume persisten. |

### Mengapa stack ini
- **Playwright 1.61+**: Satu-satunya framework E2E yang mendukung native offline network testing (`context.setOffline(true)`) untuk memvalidasi antrean transaksi IndexedDB & Workbox sync secara presisi, serta emulasi mobile viewport (390×812 px) dan fake camera media stream untuk scanner barcode.
- **Node.js v24.18.0 LTS (Krypton)**: Runtime aktif LTS resmi dengan engine V8 terbaru, built-in `.env` file loader, native fetch & WebSockets, serta efisiensi memori tinggi untuk REST API kasir.
- **Vite 8.1.5 + React 19.2.7 + vite-plugin-pwa 1.3.0**: Standar PWA React tercepat: React 19 Actions (`useOptimistic`) untuk responsivitas kasir instan, build sub-detik Vite, serta Workbox 7.4 untuk offline app-shell caching dan antrean transaksi lokal saat warung tidak memiliki sinyal internet.
- **ESLint 9 Flat Config + Prettier**: Menjaga integritas kode monorepo secara modular. Plugin resmi `eslint-plugin-react-hooks` memastikan lifecycle hook React 19 (`useOptimistic`, `useActionState`) berjalan tanpa memory leak di HP kasir.
- **Tailwind CSS 4.3.3**: Engine compiler CSS-first super cepat tanpa perlu file konfigurasi JavaScript yang berat.
- **Express 5.2.1**: REST API modern dengan native `async/await` promise error handling tanpa perlu wrapper try/catch manual.
- **Nginx 1.30.4 Gateway**: Menghemat memori (~5-15MB RAM), melayani file statis PWA dengan caching optimal, dan merutekan traffic API dengan sangat cepat.
- **Direct REST API (Tanpa BFF)**: Karena frontend hanya berupa 1 aplikasi PWA kasir, penambahan BFF (Backend For Frontend) terpisah hanya akan menambah hop jaringan dan kompleksitas redundan. Frontend langsung mengonsumsi REST API dari Core POS Service melalui Gateway.
- **WAHA & Puppeteer terisolasi**: Memisahkan rendering Chromium dan socket WhatsApp ke container independen menjaga Core API tetap ringan, responsif, dan stabil.

### Data Model (konkret, dari desain)

Entitas utama (field mengikuti mock data di prototype):

- **accounts**: `phone` (PK, unik), `pass` (hash), `pin` (hash 6 digit), `nama`, `created_at`.
- **products**: `id`, `name`, `sku` (auto jika kosong, format `XXX-00N`), `barcode` (opsional, 13 digit), `cat` (kategori free-text), `unit`, `price` (harga jual), `buy` (harga beli), `stock`, `ini` (inisial 2 huruf untuk avatar).
- **stock_history**: `product_id`, `delta` (+/−), `title` (mis. "Stok awal", "Restock · Agen X", "Penjualan · INV-…", "Adjustment · kemasan rusak"), `time`, `remain` (sisa stok).
- **transactions / invoices**: `no` (format `INV-YYYYMMDD-00N`), `time`, `method` (`cash`/`qris`), `total`, `cash`, `change`, `items` (jumlah item), `lines[]` (nama, qty, harga, diskon per item), `store_id`.
- **store_settings**: `name`, `addr`, `phone`, `paper_width` (`58mm`/`80mm`, default `58mm`), `qris_nmid` (mis. `ID102026001234`), `qris_image`.

Konstanta desain:
- **Unit presets**: `pcs, btl, bks, ltr, kg, sct, sak, tbg` + custom bebas.
- **Low-stock threshold**: configurable, default **5** (min 1, max 20). Stok `0` = "Habis", stok ≤ threshold = "menipis" (⚠).
- **Kategori**: free-text dengan saran "pakai lagi" dari kategori yang sudah ada (Sembako, Minuman, Rokok, Snack, …).

## 4. Fitur Utama

### 4.1 Manajemen Produk & Stok
- CRUD produk: nama, SKU (auto jika kosong), **barcode** (opsional, bisa di-scan), kategori, satuan, harga jual, harga beli, stok awal.
- Pantau stok secara real-time; badge "Habis" (merah) / "Stok N" (hijau) / "menipis" (amber) di list produk.
- **Alert otomatis** di layar Produk saat ada produk habis dan/atau menipis.
- **Riwayat perubahan stok** per produk (restock / adjustment / penjualan) lengkap dengan waktu & sisa stok.
- **Restock**: tambah stok + catatan supplier (chips +5/+10/+24, qty bebas).
- **Adjustment**: kurangi/tambah dengan alasan — `Koreksi hitung`, `Kemasan rusak`, `Kadaluarsa`, `Hilang`.
- **Hapus produk** dengan konfirmasi; riwayat stok ikut hilang, **transaksi lama tidak berubah**.
- Import produk massal via **CSV** untuk onboarding cepat (tombol di layar Kasir kosong & layar Produk).

### 4.2 Transaksi / Kasir
- List produk 2 kolom + search (nama/SKU) + filter kategori (chip "Semua" + kategori).
- **Scan barcode** (kamera HP) untuk tambah ke cart langsung; barcode tak dikenal → arahkan ke form tambah produk.
- Cart: quantity +/− per item, **diskon per item** (nominal Rp, chips 500/1.000/2.000/5.000, dibatasi maks = harga line).
- Perhitungan subtotal, diskon, total otomatis.
- Validasi stok: tidak bisa tambah melebihi stok; stok 0 → "Stok habis, restock dulu".
- Simpan transaksi → sistem generate invoice otomatis + kurangi stok + catat ke riwayat secara atomik.

### 4.3 Pembayaran
- **Cash**: input uang diterima, sistem menghitung kembalian; tombol cepat **"Uang pas"** + pembulatan ke atas (10rb/50rb/100rb); label "Kembalian" vs "Masih kurang" saat uang kurang.
- **QRIS statis**: tampilkan QR statis milik pemilik (NMID `ID102026001234`), konfirmasi pembayaran **secara manual** oleh kasir ("✓ Sudah Dibayar" + catatan "cek notifikasi bank").

### 4.4 Invoice
- Berisi: nomor invoice, tanggal/waktu, daftar item (+ diskon per item), total, metode pembayaran, status LUNAS.
- **Print thermal**: template **58mm / 80mm** (pilihan lebar di Setelan) via browser print / WebUSB.
- **Link digital**: URL publik `qlosir.app/i/{id}` yang bisa dibuka di HP pembeli (halaman publik, tanpa login) — menampilkan struk + footer "Dibuat dengan Qlosir".
- **Share WhatsApp** (via WAHA): auto kirim ke nomor pembeli berupa **image invoice + text ringkas + link digital**; tombol berubah jadi "Terkirim ✓".
- **Download** invoice sebagai **PNG** dan **PDF** dari halaman link digital.
- Dari layar "Selesai": tombol **Salin link** & **Lihat halaman pembeli**.

### 4.5 Laporan
- Rentang: **Hari ini / Minggu ini / Bulan ini** (navigasi ‹ › antar periode).
- Metrik: total penjualan + delta % vs periode sebelumnya, jumlah transaksi, item terjual, rata-rata.
- Breakdown **Cash vs QRIS** (bar + persen).
- **Produk terlaris** (ranking + bar qty).
- **Export laporan** (CSV) per periode.

### 4.6 Riwayat Transaksi
- Daftar transaksi sesi ini (reverse-chronological), filter **Semua / Cash / QRIS**.
- Tiap baris: nomor invoice, waktu, jumlah item, total, metode (ikon Cash/QRIS).
- Tap baris → buka kembali layar invoice (Selesai) untuk cetak/share/copy link.

### 4.7 Pengaturan
- **Profil toko**: nama toko (tampil di struk), alamat, no. WA toko.
- **Struk & pembayaran**: pilih **lebar kertas thermal 58mm / 80mm**; **upload/ganti QRIS statis toko** (tampil NMID + status terpasang).
- **Keamanan**: **Ganti PIN kasir**; **Keluar akun**.
- Footer versi: "Qlosir v1.0.0 · prototype".

### 4.8 Mode Offline & Sinkronisasi
- Aplikasi **offline-tolerant**: saat offline, transaksi tersimpan di HP (banner "Offline — transaksi tersimpan di HP kamu" + badge "N antre sync").
- Saat kembali online, banner sinkronisasi muncul ("Sinkronisasi N transaksi…") lalu transaksi dikirim ke Core API.
- Cache daftar produk & stok di client agar kasir tetap jalan tanpa koneksi.

## 5. User Flow

### A. Onboarding & Login
1. Buka Qlosir (PWA) di HP → layar **Masuk** (nomor HP + password) atau **Daftar** (signup lengkap + PIN + TOS).
2. Lupa password? → flow **WhatsApp OTP** (nomor → kode → password baru).
3. Setelah login → layar **PIN** untuk buka sesi kasir.

### B. Kasir (sesi aktif)
1. Masukkan PIN → layar **Kasir**.
2. Tap produk / **scan barcode** → isi quantity → masuk ke cart.
3. Di cart: atur qty, **diskon per item** jika perlu → pilih bayar.
4. **Cash**: input uang → lihat kembalian. **QRIS**: tampil QR statis → konfirmasi manual.
5. Transaksi selesai → invoice muncul (layar **Selesai**).
6. **Cetak thermal** langsung (pilih 58/80mm), **Salin link**, **Lihat halaman pembeli**, ATAU input nomor WA pembeli → sistem pemicu WhatsApp via WAHA secara asinkron.
7. "Transaksi baru" → balik ke Kasir.

### C. Manajemen & Laporan
- **Produk**: tambah/edit/hapus, restock, adjustment, lihat riwayat stok.
- **Riwayat**: cek transaksi sesi, buka ulang invoice.
- **Laporan**: pantau penjualan harian/mingguan/bulanan + export CSV.
- **Setelan**: profil toko, lebar kertas, QRIS, ganti PIN, logout.

## 6. Arsitektur & Topologi Microservices

```
                       ┌─────────────────────────────────────────┐
                       │            Klien (HP Kasir)             │
                       │  React 19 PWA (Vite + Workbox Offline)  │
                       │  - Scanner (Camera)  - Print (WebUSB)   │
                       └────────────────────┬────────────────────┘
                                            │ HTTPS (:80 / :443)
                       ┌────────────────────▼────────────────────┐
                       │       Nginx 1.30.4 Reverse Proxy        │
                       │    (API Gateway & Static PWA Host)      │
                       └───────┬─────────────────────────┬───────┘
             / (Static PWA)    │                         │ /api/* & /i/*
      ┌────────────────────────┘                         ▼
 ┌────▼────────────────────┐            ┌────────────────────────────────┐
 │  PWA Static Build Dist  │            │  Core API (Express 5 + Node24) │
 └─────────────────────────┘            │  - Auth (Password + PIN Till)  │
                                        │  - Transaksi & Offline Sync    │
                                        │  - Template Generator          │
                                        └──────┬───────────────┬─────────┘
                                               │ SQL (pg 8.22) │
                                        ┌──────▼──────┐        │ REST (Internal Docker Net)
                                        │ PostgreSQL  │        ├──────────────────────────┐
                                        │ (17-alpine) │        │                          │
                                        └─────────────┘        ▼                          ▼
                                                     ┌──────────────────┐       ┌──────────────────┐
                                                     │  Render Service  │       │  WAHA Service    │
                                                     │ (Puppeteer 25.3) │       │  (WhatsApp API)  │
                                                     └──────────────────┘       └──────────────────┘
```

### 6.1 Service Boundaries & Communication Protocol

| Service | Image Docker / Runtime | Port Internal | Port Eksternal | Komunikasi Masuk | Komunikasi Keluar |
|---|---|---|---|---|---|
| `gateway` | `nginx:alpine` (v1.30.4 / 1.27) | 80 / 443 | 80 / 443 | HTTPS dari Browser Klien | Forward static ke `dist/`, forward API ke `core-api:5000` |
| `core-api` | `node:24-alpine` (Node v24.18.0 LTS + Express 5.2.1) | 5000 | - (Private) | HTTP REST dari `gateway` | SQL ke `postgres:5432`, HTTP POST ke `render-service:3001` & `waha:3000` |
| `render-service` | `node:24-bookworm-slim` (Puppeteer 25.3.0) | 3001 | - (Private) | HTTP POST `/render` dari `core-api` | Stateless (return buffer image/PDF) |
| `waha` | `devlikeapro/waha:latest` (Core 2026.x) | 3000 | - (Private) | HTTP POST `/api/*` dari `core-api` | WebSocket ke WhatsApp Web Server |
| `postgres` | `postgres:17-alpine` | 5432 | - (Private) | TCP SQL dari `core-api` | Persistent Volume Storage |

## 7. Non-Functional Requirements, Deployment & Code Standards

### 7.1 Deployment Multi-Container
- Seluruh service diorkestrasi menggunakan `docker-compose.yml` untuk kemudahan deployment satu perintah (`docker compose up -d`).
- **Resource Constraints**:
  - `gateway`: `nginx:alpine` (~15MB RAM).
  - `core-api`: `node:24-alpine` (~60MB - 120MB RAM).
  - `render-service`: `node:24-bookworm-slim` + Chromium (diberikan batas RAM ~256MB - 512MB).
  - `waha`: `devlikeapro/waha:latest` (diberikan batas RAM ~256MB - 512MB).
  - `postgres`: `postgres:17-alpine` (~100MB RAM).

### 7.2 Code Standards & Static Analysis
- **Linter & Formatter**: ESLint v9+ (Flat Config `eslint.config.mjs`) terpadu dengan `typescript-eslint` dan Prettier 3.x.
- **Frontend Rules**: Wajib menggunakan `eslint-plugin-react-hooks` untuk memvalidasi state mutability dan dependensi hook React 19 (`useOptimistic`, `useActionState`) agar PWA kasir bebas memory leak.
- **Backend Rules**: Wajib menggunakan type-aware async promise rules (`@typescript-eslint/no-floating-promises`) agar seluruh transaksi database PostgreSQL ditangani dengan aman.

### 7.3 End-to-End Testing Standards (Playwright)
- **Suite E2E Monorepo (`e2e/`)**: Menggunakan Playwright 1.61+ untuk pengujian integrasi otomatis multi-container.
- **Skenario Kritis Wajib**:
  1. *Mobile Emulation*: Viewport frame 390×812 px, touch interactions, dan navigasi 5-tab.
  2. *Offline PWA Sync*: Validasi `context.setOffline(true)` $\rightarrow$ transaksi antre di IndexedDB $\rightarrow$ `context.setOffline(false)` $\rightarrow$ rekonsiliasi otomatis ke Core API.
  3. *Camera Mocking*: Media stream virtual untuk pengujian instan barcode scanner tanpa kamera fisik.
  4. *Multi-Context Invoice*: Validasi kasir membuat transaksi dan pembeli membuka struk digital `/i/:id` di tab terpisah.

### 7.4 Performance & Usability
- **Load cepat di 4G/3G**: Precache app shell PWA melalui Workbox 7.4.1, kompresi Gzip/Brotli dari Nginx 1.30.4.
- **Offline-tolerant**: Cache daftar produk & stok di IndexedDB/LocalStorage, sinkronisasi transaksi saat online.
- **Auth dua lapis**: Password akun toko + PIN 6 digit till kasir tiap buka sesi.

## 8. Out of Scope (v1)

- Multi-toko & multi-kasir dengan role berbeda.
- QRIS dinamis / settlement & callback otomatis dari PSP (v1 pakai QRIS statis + konfirmasi manual).
- Fitur refund / retur.
- Integrasi pajak & akuntansi.
- Backend production penuh untuk WA OTP login & upload QRIS (di v1 cukup alur + mock/lightweight; tidak wajib enterprise-grade).

## 9. Success Metrics

- Transaksi selesai (dari tap pertama sampai invoice) **< 15 detik**.
- **≥ 90%** invoice WhatsApp terkirim tanpa error.
- Stok tercatat akurat (selisih < 1% vs fisik).
- PWA dapat di-install dan dibuka kembali dalam **< 3 detik** saat offline/dari homescreen.
- Offline → transaksi antre → sinkron otomatis saat online tanpa kehilangan data.
