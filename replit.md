# МЗТ — Music Tracking App

A personal music tracking platform with releases, recommendations, a timeline, and user blogs. Built as a pnpm monorepo with a React frontend and Express API backend.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS + shadcn/ui (`artifacts/mzt`)
- **Backend**: Express 5 + Drizzle ORM + PostgreSQL (`artifacts/api-server`)
- **Shared libs**: `lib/db` (schema + queries), `lib/api-spec` (OpenAPI), `lib/api-zod` (validation), `lib/api-client-react` (typed hooks)

## Running the project

Both workflows start automatically:

| Workflow | Command | Port |
|---|---|---|
| `artifacts/mzt: web` | `pnpm --filter @workspace/mzt run dev` | 19721 |
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` | 8080 |

## Environment

- `DATABASE_URL` — Replit-managed PostgreSQL (set automatically)
- `SESSION_SECRET` — stored as a Replit secret

## Database

Schema is managed with Drizzle ORM. To push schema changes:

```sh
pnpm --filter @workspace/db exec drizzle-kit push
```

## User preferences

- Keep the existing monorepo structure (artifacts/*, lib/*)
