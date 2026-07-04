# mzt

A modular private platform for a small group of friends. The first mode is a **Music Reviews** system where users can add and review music releases (Singles, Albums, EPs) using a custom 90-point scoring system.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS + shadcn/ui (`artifacts/mzt`)
- **Backend**: Express.js 5 API server (`artifacts/api-server`)
- **Database**: PostgreSQL via Drizzle ORM (`lib/db`)
- **Shared**: Zod schemas (`lib/api-zod`), React Query hooks (`lib/api-client-react`)
- **Package manager**: pnpm workspaces

## How to run

All workflows are pre-configured. On start:

1. **API Server** (`artifacts/api-server: API Server`) — builds and starts the Express backend on `$PORT`
2. **Frontend** (`artifacts/mzt: web`) — starts the Vite dev server on `$PORT`

## Environment variables / secrets

| Key | Type | Notes |
|-----|------|-------|
| `DATABASE_URL` | Runtime-managed | Auto-provided by Replit PostgreSQL |
| `SESSION_SECRET` | Secret | Used for Express session signing |

## Database

Schema is managed with Drizzle ORM. To apply schema changes to development:

```bash
pnpm --filter @workspace/db run push
```

Tables: `users`, `releases`, `tracks`, `reviews`, `videos`, `movies`, `recommendationMusic`, `recommendationTracks`

## Monorepo structure

```
artifacts/
  api-server/   Express.js backend
  mzt/          React frontend
  mockup-sandbox/  UI prototyping sandbox
lib/
  api-client-react/  React Query hooks (generated)
  api-spec/          OpenAPI spec + Orval config
  api-zod/           Shared Zod schemas
  db/                Drizzle ORM schema & client
scripts/             Workspace maintenance scripts
```

## User preferences

- Dark theme, minimalistic design
- Russian-language UI
- Private platform (username/password auth only, no OAuth)
