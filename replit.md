# mzt — Music/Media Platform

A full-stack music and media platform with blogs, track recommendations, reviews, uploads, push notifications, and user activity.

## Stack

- **Frontend**: React + Vite (`artifacts/mzt`) — served at `/`
- **API server**: Express 5 (`artifacts/api-server`) — served at `/api`
- **Database**: PostgreSQL via Drizzle ORM (`lib/db`)
- **Schema**: users, releases, tracks, reviews, videos, movies, blogs, push subscriptions, recommendations, playlist imports

## How to run

Dependencies are managed with pnpm. The database is Replit's built-in PostgreSQL.

```bash
# Install all workspace packages
pnpm install

# Push database schema
pnpm --filter @workspace/db run push
```

Both workflows start automatically:
- `artifacts/mzt: web` — Vite dev server (frontend)
- `artifacts/api-server: API Server` — Express API (builds then serves)

## Required secrets

| Key | Where set | Notes |
|-----|-----------|-------|
| `SESSION_SECRET` | Replit Secrets | Express session signing |
| `DATABASE_URL` | Runtime-managed | Injected automatically by Replit |
| `VAPID_PUBLIC_KEY` | Shared env | Web push notifications |
| `VAPID_PRIVATE_KEY` | Shared env | Web push notifications |
| `VAPID_SUBJECT` | Shared env | Web push contact email |

## Key features

- **Auth** — session-based auth with bcrypt password hashing
- **Releases & Tracks** — full CRUD with upload support
- **Reviews** — user reviews on releases
- **Recommendations** — music and track recommendation engine
- **Blogs** — multi-blog support with per-blog themes; two blogs seeded on startup
- **Uploads** — files via Replit Object Storage (presigned URLs at `/api/storage/objects/...`)
- **Push notifications** — Web Push via VAPID (`lib/db/src/schema/pushSubscriptions.ts`)
- **Videos** — video uploads and voting

## User preferences

_None recorded yet._
