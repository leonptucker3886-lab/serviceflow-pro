# ServiceFlow – Service Business SaaS Prototype

Working prototype for small service businesses: estimates/invoices, affordable reviews, lightweight scheduling/dispatch, multi-user roles, customer portal, sales dashboard & competitive leaderboard, private company notes, photo support.

## Features Implemented

- Landing page with logo and feature overview
- Auth with roles: Owner, Admin, Technician, Customer
- Sample company: Apex Home Services fully seeded
- Jobs: list, detail, status pipeline (estimate → scheduled → in progress → sold → invoiced → paid)
- When marked sold, job becomes visible in customer portal; public files shared, private folder stays internal
- Private notes section (company-only)
- Lightweight schedule view
- Invoices with mark-paid
- Reviews request + display
- Dashboard sales metrics (today / week / month) + avg job time
- Leaderboard daily / weekly / monthly by sales $, jobs sold, avg completion time
- Customer portal: view jobs, bills, pay, leave review
- Mobile-optimized professional UI (Tailwind)

## Demo Accounts (password: demo123)

| Role        | Email                  |
|-------------|------------------------|
| Owner       | owner@apex.com         |
| Admin       | admin@apex.com         |
| Technician  | mike@apex.com          |
| Technician  | lisa@apex.com          |
| Customer    | john.smith@email.com   |
| Customer    | emily.jones@email.com  |

## Run locally

```bash
cd serviceflow-pro
npm install
npm run dev
```

Open http://localhost:3000

Data persists in browser localStorage.

## Deploy to Vercel

```bash
npx vercel
```

## Tech

- Next.js 15 (App Router) + TypeScript + Tailwind
- Client-side store + localStorage (prototype DB)

---

## Live Demo

Deployed on Vercel. Use the demo accounts above after the build finishes.

Last trigger: deployment requested via push.
