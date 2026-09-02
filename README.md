# Resin Ops

Centralized production planning & monitoring platform for Thermax's ion exchange resin manufacturing business (Phase 1).

## Structure

This is a Turborepo monorepo with two independently deployable apps and one shared package:

- `apps/web` — the Next.js dashboard (UI only). Fetches all data from `apps/api` over HTTP.
- `apps/api` — a Next.js app exposing REST endpoints (Route Handlers only, no UI). Owns the database connection.
- `packages/db` — shared Drizzle ORM schema and database client, used only by `apps/api`.

Each app has its own `package.json`, deploys as its own Vercel project, and scales independently.

## Getting Started

Install dependencies from the repo root:

```bash
npm install
```

Run both apps in dev mode:

```bash
npm run dev
```

- `apps/web` runs on http://localhost:3001 (falls back if 3000 is taken)
- `apps/api` runs on http://localhost:3002

Each app needs its own `.env.local`:

- `apps/api/.env.local` — `DATABASE_URL` (Neon) plus `INTERNAL_API_KEY`
- `apps/web/.env.local` — `API_BASE_URL` (pointing at the deployed/local `apps/api`) and the same `INTERNAL_API_KEY`

`INTERNAL_API_KEY` is a shared secret apps/web sends on every request so apps/api isn't a fully open public endpoint — both apps must use the same value.

## Database

Schema lives in `packages/db/src/schema.ts`. From the repo root:

```bash
npm run db:push    # push schema changes to Neon
npm run db:studio  # open Drizzle Studio
npm run db:seed    # seed initial plant data
```

## Build

```bash
npm run build   # builds both apps via Turborepo
npm run lint    # lints both apps
```

## Deploying

Each app is its own Vercel project pointed at this repo, with **Root Directory** set to `apps/web` or `apps/api` respectively in Project Settings → General. Push to `main` deploys production; any other branch deploys a preview.
