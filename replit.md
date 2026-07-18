# МЗТ — Media Management Platform

A media management and recommendation platform for music/video releases, tracks, and statistics.

## Stack

- **Frontend** (`artifacts/mzt`): React 19 + Vite, TypeScript, Tailwind CSS, Radix UI, TanStack Query, Wouter
- **Backend** (`artifacts/api-server`): Express 5, Node.js, TypeScript, Drizzle ORM, Pino logging, Multer (file uploads), express-session
- **Database**: PostgreSQL (Replit managed), Drizzle ORM + drizzle-kit migrations
- **Shared libs** (`lib/`): `api-spec` (OpenAPI), `api-client-react` (generated hooks), `api-zod` (Zod schemas), `db` (Drizzle schema + client)

## Running the app

Both services are configured as Replit workflows and start automatically:

| Workflow | Command |
|---|---|
| `artifacts/mzt: web` | `pnpm --filter @workspace/mzt run dev` |
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` |

## Environment variables

| Variable | Source |
|---|---|
| `DATABASE_URL` | Replit runtime-managed (auto-injected) |
| `SESSION_SECRET` | Replit secret |

## Database schema

Push schema changes to the dev database:

```bash
pnpm --filter @workspace/db run push
```

## Install dependencies

```bash
pnpm install
```

## User preferences

- Keep the existing monorepo structure (pnpm workspace with `artifacts/` and `lib/`)
- Do not migrate or replace the database setup
