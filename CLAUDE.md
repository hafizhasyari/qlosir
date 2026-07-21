# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

**Qlosir** is a mobile-first PWA point-of-sale (kasir) application designed for Indonesian warung kelontong (neighborhood grocery stores, 1 owner / 1 store).

- **Architecture:** Monorepo with npm workspaces (`apps/web`, `services/*`, `gateway/`).
- **Core Spec & Artifacts:**
  - `PRD.md` — Product Requirements Document (domain rules, containerized microservices specification, ACID transaction requirements).
  - `qlosir-app-design.zip` — Claude Design handoff bundle. Prototypes are referenced for pixel-perfect recreation.
  - `README.md` — Project overview and containerized microservices topology.

---

## Development & Test Commands

Commands can be run from repository root or within specific workspace directories (`apps/web`).

### Development Server & Build
```bash
# Start Vite development server for web app (http://localhost:5173)
npm run dev

# Typecheck and build production bundle
npm run build
```

### Code Quality & Linting
```bash
# Run ESLint 9 (Flat Config) across workspaces
npm run lint

# Automatically fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### End-to-End Testing (Playwright)
```bash
# Run all Playwright E2E suites headless
npm run test:e2e

# Run Playwright with interactive UI mode
npm run test:e2e:ui

# Run a specific test file
npx playwright test e2e/auth.spec.ts

# Run a single test case matching a title pattern
npx playwright test e2e/pos.spec.ts -g "verifies QRIS payment flow"

# Run visual snapshot comparison tests
npm run test:e2e:visual

# Update visual snapshot baselines
npm run test:e2e:update
```

### Multi-Container Operations (Docker Compose)
```bash
# Start all microservices in the background
docker compose up -d

# View live logs for all or a specific service
docker compose logs -f
docker compose logs -f core-api

# Run database migrations
docker compose exec core-api npm run db:migrate

# Stop all containers
docker compose down
```

---

## High-Level Architecture & Code Structure

### 1. Frontend App (`apps/web`)

The frontend is a 100% full-screen native PWA built with **React 19.2.7**, **Vite 8.1.5**, **Tailwind CSS v4** (`@tailwindcss/vite`), and **Zustand 5.0.14** for domain state management.

- **Entry & Routing (`src/main.tsx`, `src/router.tsx`):**
  - Uses React Router DOM v7 (`createBrowserRouter`).
  - Public Buyer Invoice deep-link (`/i/:id`) renders standalone without navigation chrome.
  - Protected app routes are wrapped with `RequireAuthed` (checks account login) and `RequireUnlocked` (checks 6-digit till PIN unlock).
- **Full-Screen PWA Layout (`src/components/MobileFrame.tsx`, `src/components/AppLayout.tsx`):**
  - Renders full-bleed (`w-full min-h-screen`) on mobile viewports and standalone PWA installations.
  - `AppLayout` renders sticky/offline status `Banner`, page `Outlet`, 5-tab `BottomNav` (Kasir, Produk, Riwayat, Laporan, Setelan), and global `Toast`.
- **State Management & Persistence (`src/store/useStore.ts`, `src/store/selectors.ts`):**
  - Zustand store with `persist` middleware (stored under localStorage key `qlosir-store`).
  - Atomic checkout logic: generating invoice (`INV-YYYYMMDD-00N`), deducting product stock, recording `stock_history`, and storing transaction in a single store action.
  - Selectors in `selectors.ts` calculate cart totals (`computeTotals`), transaction filtering (`allTransactions`), and sales report aggregations (`aggregateReport`).
- **Design Tokens & Visuals (`src/index.css`):**
  - Typeface: Plus Jakarta Sans via Google Fonts.
  - Color Tokens: Cream background (`#F4F1EA`), Brand Green (`#0E6B39` / Dark `#0A5A2F`), Ink (`#17251C`), Muted (`#7A857E` / `#9AA39D`), Danger (`#C6432D`), Warning (`#E8A020`).

### 2. Microservices Architecture (Backend & Infrastructure)

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

- **API Gateway (`gateway/`):** Nginx 1.30.4 reverse proxy serving static PWA assets from `apps/web/dist` and proxying `/api/*` and `/i/*` to Core API.
- **Core POS API Service (`services/core-api`):** Node.js 24 LTS + Express 5.2.1 handling account authentication, stock CRUD, atomic checkout transactions in PostgreSQL 17 (`pg@8.22.0`).
- **Invoice Render Service (`services/render-service`):** Node.js 24 + Puppeteer 25.3.0 for background server-side HTML-to-PNG/PDF invoice generation.
- **WhatsApp Service (`waha`):** WAHA Core HTTP API container for automated WhatsApp invoice dispatch.

---

## Domain Rules & Conventions

- **Two-Layer Authentication:** Account login requires `phone + password` (min 6 characters). A **6-digit till PIN** gates the cashier POS session on every app open. Demo credentials: `0812-3456-7890` / `warung123`, PIN `123456`.
- **Atomic Checkout Guarantee:** Stock deduction, invoice record generation, and `stock_history` logging must always execute in a single atomic SQL transaction.
- **Stock Indicators:** `0` = "Habis" (red), `≤ threshold` (default **5**) = "menipis" (amber ⚠), otherwise OK (green).
- **Product Deletion:** Deleting a product removes its stock history but leaves past invoice transaction line items intact.
- **Thermal Receipt Printing:** Driven client-side directly from React PWA via `@media print` / WebUSB for 58mm (default) and 80mm paper widths.
- **QRIS Payments:** Static store QRIS with manual cashier confirmation in v1 (no dynamic PSP callback integration).
- **Unit Presets:** `pcs`, `btl`, `bks`, `ltr`, `kg`, `sct`, `sak`, `tbg`, and custom text.
