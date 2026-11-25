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

### 5. Run automated tests

```bash
npm test
```

Runs 17 automated Vitest test cases (`TC-01` to `TC-16` plus Verified Wanted checkout) covering real RBAC auth, product option sync, watchlist, bidding, verify, wanted offers, 4-step escrow with 5%/7% seller commission, legacy storage migration, and admin actions.

### 6. Build & preview production bundle

```bash
npm run build
npm run preview
```

Output lands in `dist/`. Deploy script included for GitHub Pages (`npm run deploy`) and `vercel.json` for Vercel.

## Live Demo & Docs

- GitHub Repo: `https://github.com/marchtanu/som-jing`
- GitHub Pages URL: `https://marchtanu.github.io/som-jing/`
- Test Cases Table: [TEST_CASES.md](./TEST_CASES.md)
- Academic Report (Chapter 5.1 - 5.7): [CHAPTER_5_REPORT.md](./CHAPTER_5_REPORT.md)
- Design System Spec: [design.md](./design.md)

## Demo Accounts

All demo accounts use password `password123`. Sign out from Account Modal (`User Icon`) and sign in with another account to test Buyer, Seller, and Admin permissions separately.

| Role | Email | Password |
| :--- | :--- | :--- |
| Buyer | `buyer@somjing.com` | `password123` |
| Seller | `seller@somjing.com` | `password123` |
| Admin | `admin@somjing.com` | `password123` |

## MVP Features Checklist

- **Auth & RBAC**: Register (Buyer/Seller only) and Sign In (`AuthModal`). Strict role checks hide Admin Console from customers/sellers and enforce Buyer vs Seller ownership on bids, Wanted offers, and Escrow steps.
- **Catalog, Swatches & Watchlist**: Search by title/seller/serial/certificate ID, filter 4 categories, toggle Verified/Saved (`watchlist`), and pick product options directly on cards.
- **Live Auction Detail**: Synced product options & specs table, real-time countdown timer, current bid, quick-bid chips, custom bid input, bid history, Verified Badge + Certificate ID.
- **Sell Listing**: Create auction or fixed-price listing with custom product options/editions and optional Verify request.
- **Request Verify**: Submit serial number and proof notes for admin review.
- **Wanted Board**: Post wanted listing with target budget, sellers submit competing offers, listing owner selects offer directly into Escrow checkout.
- **Simulated Payment & Escrow**: Editable shipping address & payment methods (PromptPay QR / Credit Card / Mobile Banking), 4-step lifecycle (`held` -> `shipped` -> `received` -> `released`), audit log, and dispute filing.
- **Admin Console**: Accessible only to logged-in `admin` accounts. Approve/reject verification requests (auto-issues `SJ-CERT-2026-xxxx`) and adjudicate complaints (`resolved_refund` / `resolved_release`).

## Tech Stack

- React 18 + TypeScript 5
- Vite 5 + Tailwind CSS 3
- Lucide React
- Vitest + React Testing Library
- React Context + Browser `localStorage` (`somjing_prototype_v2`)
