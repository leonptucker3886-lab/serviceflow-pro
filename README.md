# ServiceFlow Pro

**Estimates, invoices, scheduling, reviews & customer portal for small service businesses.**

Production-oriented multi-tenant SaaS foundation built from the original client-side prototype.

## What changed (v0.2 – backend foundation)

| Area | Status |
|------|--------|
| Multi-tenant data model (Company → Membership → Jobs/Customers) | ✅ Prisma schema |
| Real database (SQLite local, Postgres-ready) | ✅ |
| Password hashing (bcrypt) | ✅ |
| Auth.js (NextAuth v5) credentials + JWT with company/role | ✅ |
| Server Actions (job status, create job, mark invoice paid) | ✅ |
| Seeded demo company (Apex Home Services) | ✅ |
| Stripe / Resend / file storage | 📦 Wired in deps + env – implement next |
| Full UI migration off localStorage | 🔄 In progress (client store still present for demo UX) |

## Quick start (local)

```bash
npm install
cp .env.example .env
# edit AUTH_SECRET if desired
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

### Demo accounts (password: `demo123`)

| Role        | Email                  |
|-------------|------------------------|
| Owner       | owner@apex.com         |
| Admin       | admin@apex.com         |
| Technician  | mike@apex.com          |
| Technician  | lisa@apex.com          |
| Customer    | john.smith@email.com   |
| Customer    | emily.jones@email.com  |

## Production (Vercel + Neon)

1. Create a free Neon Postgres project → copy connection string.
2. In Vercel project settings set:
   - `DATABASE_URL` = Neon URL (use `postgresql://...`)
   - `AUTH_SECRET` = strong random
   - `AUTH_URL` / `NEXTAUTH_URL` = https://your-domain.vercel.app
   - Stripe + Resend keys when ready
3. Change `provider = "postgresql"` in `prisma/schema.prisma` and switch adapter to `@prisma/adapter-pg` (or use Prisma Accelerate).
4. Deploy. Run migrate/seed via Vercel build or one-off script.

## Architecture overview

- **Tenancy**: Row-level via `companyId` on every business record. JWT carries `companyId` + `role`.
- **Roles**: `owner` | `admin` | `technician` (staff) and `customer` (portal via Customer.userId).
- **Auth**: Credentials provider today; add Google/GitHub providers easily in `src/lib/auth.ts`.
- **Mutations**: Server Actions in `src/app/actions/` – always scoped by session company.
- **UI**: Existing Tailwind pages still use the client store for the interactive demo. Next step is to replace `useApp()` data with server components + React Query / SWR against the DB.

## Roadmap to fully sellable product

1. **Done / foundation** – schema, auth, seed, server actions, env template.
2. **Migrate UI to server data** – replace localStorage store with Prisma queries in RSC + actions.
3. **Stripe Checkout** for customer invoice payments + SaaS plan billing (company subscription).
4. **File uploads** (Vercel Blob or R2) with private/public ACLs.
5. **Email** (Resend) for invoice, review request, appointment reminders.
6. **Signup + onboarding** – create company on first registration, invite team.
7. **Calendar scheduling** improvements + optional Google Calendar.
8. **PDF invoices**, exports, price book, recurring jobs.
9. **Legal** – Terms, Privacy, data export/delete.
10. **Observability** – Sentry, logging, rate limits.

## Security notes

- **Revoke any GitHub token that was shared in chat.**
- Never commit `.env` or real secrets.
- All mutations must go through server actions that re-check `companyId`.
- For production use Postgres + RLS policies as defense-in-depth.

## Tech

Next.js 15 · TypeScript · Tailwind · Prisma 7 · Auth.js · bcrypt · Stripe (ready) · Resend (ready)

---

Live demo (previous client-only): https://serviceflow-pro-six.vercel.app  
This repo is now the source of truth for the production path.
