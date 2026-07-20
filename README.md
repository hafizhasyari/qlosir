# Qlosir (Aplikasi Kasir Warung Kelontong)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D24.18.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-19.2.7-blue.svg)](https://react.dev/)
[![Docker Compose](https://img.shields.io/badge/docker--compose-v2%2B-blue.svg)](https://docs.docker.com/compose/)

**Qlosir** adalah web app point-of-sale (kasir) mobile-first berbasis **PWA (Progressive Web App)** yang dirancang khusus untuk operasional warung kelontong (1 pemilik, 1 toko). 

Fokus utama Qlosir adalah **kecepatan transaksi (< 15 detik)**, pencatatan transaksi kasir instan, manajemen & pantauan stok barang real-time, toleransi penuh terhadap jaringan offline (offline-first sync), serta pembuatan invoice digital yang dapat dicetak langsung ke printer thermal maupun dikirim otomatis via WhatsApp pembeli.

---

## 🌟 Fitur Utama

- 📱 **Mobile-First PWA (390×812 px)**: Desain thumb-friendly dengan frame mobile optimal, bottom navigation 5-tab (*Kasir, Produk, Riwayat, Laporan, Setelan*), serta dukungan light & dark mode.
- ⚡ **Offline-Tolerant & Auto-Sync**: Transaksi tetap dapat dilakukan saat warung kehilangan koneksi internet. Transaksi tersimpan di IndexedDB lokal dan otomatis tersinkronisasi ke PostgreSQL saat kembali online.
- 📷 **Barcode Scanner Kamera**: Scan barcode produk instan via kamera HP (`getUserMedia`) langsung ke keranjang belanja tanpa alat scanner eksternal.
- 🖨️ **Thermal Printing Client-Side**: Cetak struk belanja thermal (lebar **58mm** & **80mm**) langsung dari browser/PWA via `@media print` atau WebUSB tanpa perlu install driver tambahan.
- 📲 **WhatsApp Invoice Dispatch (WAHA)**: Otomatisasi pengiriman invoice digital berupa gambar PNG, ringkasan teks, dan link publik ke nomor WhatsApp pembeli secara asinkron.
- 🔗 **Public Digital Invoice (`/i/:id`)**: Halaman struk online publik dan ringan yang dapat dibuka oleh pembeli untuk mengunduh invoice dalam format PDF/PNG.
- 🔒 **Two-Layer Authentication**: Login akun pemilik toko dengan password + perlindungan sesi transaksi kasir dengan **PIN 6 digit**.
- 📊 **Laporan & Export CSV**: Rekapitulasi penjualan harian, mingguan, bulanan, breakdown Cash vs QRIS statis, dan ranking produk terlaris.

---

## 🏗️ Arsitektur & Topologi Containerized Microservices

Qlosir mengadopsi arsitektur **Containerized Microservices** berbasis Docker Compose dengan Nginx sebagai Reverse Proxy dan Static Host:

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

### Boundary & Service Roles

1. **API Gateway & Static Host (`gateway`)**: Menggunakan `nginx:alpine` (1.30.4) untuk SSL termination, menyajikan static build PWA React (`dist/`), dan merutekan `/api/*` serta `/i/*` ke Core API.
2. **Frontend App (`apps/web`)**: React 19.2.7 + Vite 8.1.5 + `vite-plugin-pwa` 1.3.0 + Tailwind CSS 4.3.3. Mengonsumsi REST API langsung melalui Gateway Nginx.
3. **Core POS API Service (`services/core-api`)**: Node.js v24.18.0 LTS + Express 5.2.1. Pusat logika bisnis dengan transaksi database atomik (ACID) di PostgreSQL.
4. **Database Server (`postgres`)**: PostgreSQL 17 (`postgres:17-alpine`) dengan persistent storage volume `postgres_data`.
5. **Invoice Render Service (`services/render-service`)**: Node.js v24 + Puppeteer 25.3.0 (`node:24-bookworm-slim`). Container terisolasi untuk render template HTML struk ke PNG/PDF tanpa membebani event-loop Core API.
6. **WhatsApp Service (`waha`)**: WAHA Core 2026.x (`devlikeapro/waha:latest`) untuk pengiriman pesan WhatsApp secara asinkron.

---

## 🛠️ Tech Stack & Matriks Versi Resmi (Live 2026)

| Layer / Service | Teknologi & Library | Versi Resmi | Image Docker / Package Target |
|---|---|---|---|
| **Runtime Environment** | Node.js (Krypton LTS) | `v24.18.0` | `node:24-alpine` |
| **API Gateway & Proxy** | Nginx | `1.30.4` / `1.27` | `nginx:alpine` |
| **Frontend Framework** | React 19 | `19.2.7` | `react@^19.2.7` |
| **Build Tooling & PWA** | Vite + `vite-plugin-pwa` | `8.1.5` / `1.3.0` | `vite@^8.1.5`, Workbox 7.4.1 |
| **Styling** | Tailwind CSS v4 | `4.3.3` | `@tailwindcss/vite` |
| **Language & Types** | TypeScript | `7.0.2` / `5.8+` | `typescript@^7.0.2` |
| **Backend Framework** | Express.js | `5.2.1` | `express@^5.2.1` |
| **Database & Client** | PostgreSQL 17 + `pg` | `17-alpine` / `8.22.0` | `postgres:17-alpine`, `pg@^8.22.0` |
| **Invoice Renderer** | Puppeteer 25 | `25.3.0` | `node:24-bookworm-slim` |
| **WhatsApp HTTP API** | WAHA | `Core 2026.x` | `devlikeapro/waha:latest` |
| **Linting & Formatting**| ESLint 9 (Flat Config) + Prettier | `9.x` / `3.x` | `typescript-eslint@^8.x` |
| **E2E Testing** | Playwright | `1.61+` | `@playwright/test@^1.61.1` |

---

## 🚀 Panduan Menjalankan Project

### Prerequisites
- Docker & Docker Compose v2+
- Node.js v24.18.0+ & npm

### Menjalankan Seluruh Microservices
```bash
# Clone repository
git clone https://github.com/hafizhasyari/qlosir.git
cd qlosir

# Jalankan seluruh multi-container microservices di background
docker compose up -d

# Pantau live logs untuk seluruh container atau service tertentu
docker compose logs -f
docker compose logs -f core-api

# Jalankan migrasi database PostgreSQL
docker compose exec core-api npm run db:migrate

# Menghentikan seluruh container
docker compose down
```

---

## 🧪 Linting & Testing

### Code Quality & Formatting
```bash
# Menjalankan linter ESLint 9 di seluruh monorepo workspace
npm run lint

# Memperbaiki linting issues secara otomatis
npm run lint:fix

# Memformat kode dengan Prettier
npm run format
```

### End-to-End Testing (Playwright)
```bash
# Menjalankan seluruh test suite E2E secara headless
npm run test:e2e

# Membuka Playwright Interactive UI Mode untuk debugging
npm run test:e2e:ui
```

---

## 🎨 Design Tokens (Brand Visual)

- **Typeface**: Plus Jakarta Sans (Google Fonts)
- **Background / Cream**: `#F4F1EA`
- **Primary Green**: `#0E6B39` (Dark `#0A5A2F`)
- **Ink / Dark Text**: `#17251C` (Muted `#7A857E` / `#9AA39D`)
- **Danger Red**: `#C6432D`
- **Warning Amber**: `#E8A020`

---

## 👤 Author & Maintainer

- **Author**: Hafizh Asy'ari
- **Email**: [hafizhasyari@gmail.com](mailto:hafizhasyari@gmail.com)
- **Repository**: [https://github.com/hafizhasyari/qlosir](https://github.com/hafizhasyari/qlosir)

---
Co-Authored-By: Claude <noreply@anthropic.com>
