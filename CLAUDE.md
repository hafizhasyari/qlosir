# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Qlosir is a **mobile-first PWA point-of-sale (kasir) app for Indonesian warung kelontong** (neighborhood grocery stores). The repository currently contains no application source code — it is in the setup/scaffolding phase with specification and design handoff artifacts:

- `PRD.md` — Product Requirements Document (scope, features, data models, tech stack, and containerized microservices architecture). **Read this first.**
- `qlosir-app-design.zip` — Claude Design handoff bundle (HTML/CSS/JS prototypes). Extract using `unzip -q qlosir-app-design.zip` when inspecting designs.
- `.agents/skills/`, `.claude/skills/`, and `skills-lock.json` — Agent skill registry.

The canonical design reference is `qlosir-app-design/project/Qlosir Prototype.dc.html`. Per design handoff guidelines: **recreate the prototypes pixel-perfectly** in the target stack — match visual output rather than copying the prototype's internal structure.

---

## Target Tech Stack (Containerized Microservices & PWA - Live Official Versions)

- **API Gateway & Static Host:** Nginx 1.30.4 (`nginx:alpine`) — Port 80/443 public entry point, SSL termination, static PWA host (`dist/`), and API reverse proxy.
- **Frontend App:** React 19.2.7 + Vite 8.1.5 + `vite-plugin-pwa` 1.3.0 (Workbox 7.4.1) + Tailwind CSS 4.3.3 + TypeScript 7.0.2 (`apps/web`) — Mobile-first PWA, Workbox offline caching, client-side thermal printing (WebUSB / `@media print`), camera barcode scanner (`getUserMedia`). Direct REST API connection to Gateway (no separate BFF layer required).
- **Core POS API Service:** Node.js v24.18.0 LTS (Krypton) + Express 5.2.1 + `pg` 8.22.0 (`services/core-api` with `node:24-alpine`) — Auth (password + 6-digit till PIN), product/stock CRUD, checkout processing, offline sync reconciliation, sales reports, and public invoice endpoints (`/i/:id`).
- **Database:** PostgreSQL 17 (`postgres:17-alpine`) — Relational storage for accounts, products, stock history, transactions, and store settings with ACID transaction guarantees.
- **Invoice Render Service:** Node.js v24.18.0 LTS + Puppeteer 25.3.0 (`services/render-service` with `node:24-bookworm-slim`) — Dedicated Chromium container for server-side invoice HTML-to-PNG/PDF rendering.
- **WhatsApp Service:** WAHA Core 2026.x (`devlikeapro/waha:latest`) — Self-hosted WhatsApp HTTP API container for automated invoice dispatch.
- **Code Quality & Linting:** ESLint 9.x (Flat Config `eslint.config.mjs`) + Prettier 3.x + `typescript-eslint` 8.x + `eslint-plugin-react-hooks`.
- **E2E & Integration Testing:** Playwright 1.61+ (`@playwright/test@^1.61.1`) — Mobile viewport emulation (390×812 px), native offline PWA testing (`context.setOffline(true)`), and Chromium camera media stream mocking for barcode scanner.
- **Orchestration:** Docker Compose v2+ (`docker-compose.yml`) — Multi-container networking (`qlosir-network`), dependency management, and persistent volumes.

---

## High-Level Architecture & Communication

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

Key architectural boundaries to maintain:
1. **No BFF Layer Needed:** Direct communication from PWA to Core API via Nginx Gateway is optimal. The client is a single homogenous PWA app.
2. **Thermal printing is strictly client-side:** WebUSB and `@media print` are driven entirely from the React PWA and must not depend on backend services.
3. **Puppeteer & WAHA isolation:** CPU/RAM intensive workloads (Chromium rendering & WhatsApp Web socket) run in isolated containers with distinct resource limits.
4. **ACID Transactions on Core API:** Stock deduction and sales recording execute in a single atomic SQL transaction in PostgreSQL.

---

## Design System Constants (from Prototype)

Match these constants to ensure pixel-faithful implementation of the prototype:

- **Typeface:** Plus Jakarta Sans (weights 400, 500, 600, 700, 800) via Google Fonts.
- **Color Palette:**
  - Background / cream: `#F4F1EA`
  - Primary green: `#0E6B39` (dark variant `#0A5A2F`)
  - Ink / dark text: `#17251C`, secondary text: `#4A5850`, muted: `#7A857E` / `#9AA39D`
  - Danger / red: `#C6432D` (dark `#8A2F1F`)
  - Warning / amber: `#E8A020` (dark `#9A6A0B`)
  - Success light: `#7BD98A`, tint: `#E4F3E8`
- **UI Form Factor:** Mobile viewport frame (390×812 px reference), 5-tab bottom navigation (`Kasir`, `Produk`, `Riwayat`, `Laporan`, `Setelan`). Supports both light and dark themes.
- **Thermal Paper Widths:** Configurable `58mm` (default) and `80mm`.

---

## Development, Testing & Multi-Container Commands

When scaffolding the project as a monorepo (`apps/web`, `services/core-api`, `services/render-service`, `gateway/`), use standard commands:

### Multi-Container Operations (Docker Compose)
```bash
# Start all microservices in the background
docker compose up -d

# View live logs for all or a specific service
docker compose logs -f
docker compose logs -f core-api

# Run database migrations
docker compose exec core-api npm run db:migrate

# Stop and remove containers
docker compose down
```

### Code Quality & Linting (ESLint 9 + Prettier)
```bash
# Run linting across all monorepo workspaces
npm run lint

# Automatically fix linting and formatting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### End-to-End Testing (Playwright)
```bash
# Run all E2E test suites headless against Nginx Gateway (http://localhost:80)
npm run test:e2e

# Run E2E tests in interactive UI mode for debugging
npm run test:e2e:ui
```
