# mzt Platform

A music/media platform for releases, reviews, recommendations, and user blogs — with a gamification layer (secret photo unlocks based on activity milestones).

## Stack

- **Frontend:** React + Vite, Tailwind CSS, Radix UI, Framer Motion, Wouter (routing)
- **Backend:** Node.js + Express, esbuild bundler
- **Database:** PostgreSQL (Replit built-in) via Drizzle ORM
- **API layer:** OpenAPI spec → Zod schemas → Orval-generated TanStack Query hooks
- **Monorepo:** pnpm workspaces

## Structure

```
artifacts/mzt/          # React web app (frontend)
artifacts/api-server/   # Express API server (backend)
artifacts/mockup-sandbox/ # Component design preview environment
lib/db/                 # Drizzle ORM schema + DB connection
lib/api-spec/           # OpenAPI specification
lib/api-zod/            # Zod schemas derived from OpenAPI
lib/api-client/         # Generated React/TanStack Query hooks
scripts/                # Maintenance utilities
```

## How to run

All workflows are configured. After `pnpm install`:

- **Web frontend** — `artifacts/mzt: web` workflow (Vite dev server)
- **API server** — `artifacts/api-server: API Server` workflow (builds with esbuild, then serves)
- **Database schema** — `pnpm --filter @workspace/db run push` (Drizzle push to dev DB)

The app runs on Replit's built-in PostgreSQL — `DATABASE_URL` is managed automatically.

## User preferences
