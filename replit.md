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

For a fresh checkout or import, run `pnpm run setup` once. It restores the
locked workspace dependencies and applies the existing Drizzle schema to the
development PostgreSQL database. The API seeds the initial blogs when it starts.

### Restoring from a backup export

If you have a `backup.sql` and `media_export/` from a previous deployment:

```sh
bash scripts/restore-backup.sh
```

This truncates all application tables, restores data from `backup.sql` (COPY
format, FK checks temporarily disabled), resets sequences, and uploads any
files found in `media_export/media_export/uploads/` to Replit Object Storage.
After running, restart the API server workflow to pick up the fresh data.

The API health check is available at `/api/healthz`.

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
