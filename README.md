# Hookcast

Paste a YouTube Short, TikTok, or Instagram Reel and get a structural breakdown of its hook, script, and editing; an honest viral-vs-ordinary verdict; a ranked list of improvements; a Claude-rewritten hook and script; and a search for real, similar videos worth studying. Built with Next.js (App Router), Prisma/Postgres, NextAuth, Stripe, and the Claude (Anthropic) API.

See **[docs/PRD.md](docs/PRD.md)** for the product spec and **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for system design, data model, and the platform-data limitations you should know about before launching.

## Stack

- **Next.js 14** (App Router, TypeScript) — frontend + API routes
- **Prisma + Postgres** — data layer
- **NextAuth.js** — email/password (+ optional Google) auth
- **Stripe** — subscriptions (Free / Pro / Agency)
- **Claude (Anthropic API)** — all analysis, hook/script redesign, and similar-video search (via the server-side `web_search` tool)
- **Tailwind CSS** — styling

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start Postgres** (or point `DATABASE_URL` at one you already have)
   ```bash
   docker compose up -d
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in at minimum: `DATABASE_URL`, `NEXTAUTH_SECRET` (`openssl rand -base64 32`), and `ANTHROPIC_API_KEY`. Everything else (YouTube key, Stripe, Google OAuth) is optional — the app degrades gracefully without it (see docs/ARCHITECTURE.md).

4. **Push the schema**
   ```bash
   npm run db:push
   ```

5. **Run it**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Stripe webhook (local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

## What's wired up vs. what's a stub

This is a **working scaffold**, not a finished product — see `docs/PRD.md` → "Out of scope for v1" for the full list. The short version:

- **Real and working:** Claude analysis/redesign/similar-search, YouTube metadata (Data API v3 or oEmbed fallback), TikTok oEmbed, auth, Stripe checkout/portal/webhooks, usage quotas.
- **Stubbed by design:** Instagram has no public metadata API for arbitrary Reels — the UI asks the user to paste stats instead of pretending to fetch them (see `lib/platforms/instagram.ts`).
- **Not built yet:** background job queue (analysis currently runs synchronously in the request — fine for an MVP, worth queuing for scale), profile editing, team/multi-seat accounts, CSV export.

## Project structure

```
app/                 Next.js App Router: pages + API routes
  api/                REST-ish API routes (analyze, analyses, regenerate, similar, stripe/*, auth)
  dashboard/           Authenticated app (list, analysis detail, billing, settings)
  (auth)/              Sign in / sign up
components/           UI, layout, and feature components
lib/                  Claude client, platform adapters, auth, stripe, db, plans, usage
prisma/schema.prisma  Data model
types/                Shared TypeScript contracts for analysis payloads
docs/                 PRD + architecture docs
```
