# MZT

A personal media platform (music releases, recommendations, timeline, blogs) built on a pnpm monorepo.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS + shadcn/ui, served at `/`
- **Backend:** Express 5 API server, served at `/api`
- **Database:** Replit PostgreSQL (Drizzle ORM + Zod validation)
- **File storage:** Replit Object Storage (GCS-backed presigned URL uploads) — persists across republishes

## How to run

Both workflows start automatically:

| Workflow | Command |
|---|---|
| `artifacts/mzt: web` | `PORT=19721 BASE_PATH=/ pnpm --filter @workspace/mzt run dev` |
| `artifacts/api-server: API Server` | `PORT=8080 BASE_PATH=/api pnpm --filter @workspace/api-server run dev` |

## Key facts

- **Data persistence:** The database and object storage both survive Replit republishes. The `uploads/` folder inside the API server does NOT persist — all media goes through object storage presigned URLs.
- **Schema changes:** Run `pnpm --filter @workspace/db run push` after editing `lib/db/src/schema/`. On publish, Replit auto-migrates the production database.
- **Seeded blogs:** Two blogs (`pysy-exe`, `putzermann-core`) are seeded idempotently on every server start from `artifacts/api-server/src/lib/seed-blogs.ts`.
- **Session secret:** `SESSION_SECRET` env var required (already set).
- **Object storage env vars:** `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR` (set automatically by Replit).

## Monorepo layout

```
artifacts/
  mzt/              # React + Vite frontend
  api-server/       # Express API server
lib/
  db/               # Drizzle schema + client
  api-spec/         # OpenAPI spec + codegen
  api-zod/          # Generated Zod schemas
  api-client-react/ # Generated React Query hooks
  object-storage-web/ # Uppy upload client library
```

## User preferences

- Keep existing project structure — do not restructure or migrate.
