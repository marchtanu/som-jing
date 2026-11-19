# SomJing (สมจริง)

Rare collectibles auction marketplace. Verified authenticity badge. 4-step escrow hold. University E-Commerce prototype.

## Prerequisites

- Git
- Node.js >= 18
- npm >= 9

Check installed versions:

```bash
git --version
node -v
npm -v
```

## Quick Start (Copy & Run)

```bash
git clone https://github.com/marchtanu/som-jing.git
cd som-jing
npm install
npm run dev
```

Open browser: `http://localhost:5173/`

## Step-by-Step Guide

### 1. Clone repository

```bash
git clone https://github.com/marchtanu/som-jing.git
```

### 2. Enter project folder

```bash
cd som-jing
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start dev server

```bash
npm run dev
```

Vite serves app at `http://localhost:5173/`. Press `Ctrl + C` in terminal to stop server.

### 5. Build & preview production bundle

```bash
npm run build
npm run preview
```

Output lands in `dist/`. `vercel.json` included for static SPA deployment.

## Demo Accounts

All demo accounts use password `password123`. Or use top utility bar (`Demo Role: ผู้ซื้อ | ผู้ขาย | แอดมิน`) to switch role in one click. Click `รีเซ็ตข้อมูล` in top bar to restore initial seed data.

| Role | Email | Password |
| :--- | :--- | :--- |
| Buyer | `buyer@somjing.com` | `password123` |
| Seller | `seller@somjing.com` | `password123` |
| Admin | `admin@somjing.com` | `password123` |

## MVP Features Checklist

- **Auth**: Register and sign in (`AuthModal`) + top utility bar role switcher.
- **Catalog & Search**: Search by title/seller/serial/certificate ID, filter 4 categories (`art-toys`, `sneakers`, `gadgets`, `watches`), sale type, and Verified only.
- **Live Auction Detail**: Real-time countdown timer, current bid, quick-bid chips, custom bid input, bid history, Verified Badge + Certificate ID.
- **Sell Listing**: Create auction or fixed-price listing, attach verification request at creation.
- **Request Verify**: Submit serial number and proof notes for admin review.
- **Wanted Board**: Post wanted listing with target budget, submit competing seller offers, accept offer directly into Escrow checkout.
- **Simulated Payment & Escrow**: Mock PromptPay QR / Credit Card / Mobile Banking checkout, 4-step lifecycle (`held` -> `shipped` -> `received` -> `released`), audit log, and dispute filing.
- **Admin Console**: Approve/reject verification requests (auto-issues `SJ-CERT-2026-xxxx`) and adjudicate complaints (`resolved_refund` / `resolved_release`).

## Tech Stack

- React 18 + TypeScript 5
- Vite 5 + Tailwind CSS 3
- Lucide React
- React Context + Browser `localStorage` (`somjing_prototype_v1`)

## Project Docs

- Academic Report (Chapter 5.1 - 5.7): [CHAPTER_5_REPORT.md](./CHAPTER_5_REPORT.md)
- Design System Spec: [design.md](./design.md)
