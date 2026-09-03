# Resin Ops — Frontend

Dashboard for the Resin Ops production planning platform (Thermax ion exchange resin manufacturing, Phase 1). Next.js App Router UI, shadcn/ui, dark mode. Fetches all data from the backend API over HTTP — no direct database access.

Backend API lives in a separate repo: [Autonex009/Resin-ops-backend](https://github.com/Autonex009/Resin-ops-backend).

## Getting Started

```bash
npm install
npm run dev   # http://localhost:3000 (or :3001 if 3000 is taken)
```

Requires a `.env.local` with:

- `API_BASE_URL` — base URL of the backend API (e.g. `http://localhost:3002` locally, or the deployed API URL)
- `INTERNAL_API_KEY` — shared secret sent on every API request as the `x-internal-api-key` header. Must match the value configured on the backend.

## Pages

- **Overview** — plan attainment, capacity utilization, batches behind, commitments short
- **Plan vs Actual** — day-by-day planned vs actual output, filterable by plant/stream/month
- **Capacity Utilization** — actual output vs max capacity, per plant/stream
- **Batches** — batch schedule with a computed "behind schedule" flag
- **Commitments** — imported sales commitments
- **Data Import** — upload Sales Commitment, Plant Capacity, and Daily Output files

## Build

```bash
npm run build
npm run lint
```

## Deploying

This repo is connected to the `resin-ops-web` Vercel project. Push to `main` deploys production; any other branch deploys a preview.
