# mzt

A private music review platform for a small group of friends. Users register with a username and password, add Singles or Albums/EPs, and leave detailed reviews using a custom 90-point scoring system.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/mzt run dev` — run the frontend (port 19721, served at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — secret for express-session

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS + shadcn/ui + wouter + React Query
- API: Express 5 with express-session (cookie auth)
- Auth: username/password only, bcryptjs (cost 12)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec in lib/api-spec/openapi.yaml)
- File uploads: multer → served at /api/uploads/:filename

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle DB schema (users, releases, tracks, reviews)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/score.ts` — centralized 90-point scoring formula
- `artifacts/mzt/src/` — React frontend
- `artifacts/mzt/src/lib/score.ts` — same scoring formula mirrored for live preview

## Architecture decisions

- Session-cookie auth (no JWT): keeps auth simple for a private platform, no email required.
- Scoring formula centralized in both frontend and backend `score.ts` — frontend for real-time preview, backend for persistent storage.
- Modular sidebar architecture: only "Music Reviews" exists now; new modes can be added to the sidebar without refactoring.
- One review per user per release enforced by a DB unique constraint (`(user_id, release_id)`).
- File uploads stored on local disk at `./uploads/` relative to the API server process; served at `/api/uploads/:filename`.

## Custom Scoring System

- Base criteria (1–10 each): Rhymes/Imagery, Structure/Rhythm, Style Execution, Individuality/Charisma
- Multiplier (1–10): Atmosphere/Vibe
- Formula: `round(min(90, (sum_of_base * 1.4) * atmosphereMultiplier[atmosphere]))`
- Multipliers: 1→1.0000, 2→1.0675, 3→1.1349, 4→1.2024, 5→1.2699, 6→1.3373, 7→1.4048, 8→1.4723, 9→1.5397, 10→1.6072
- Scores always displayed as whole integers, never exceed 90.

## Product

- Home/login page: mzt logo, username+password login, register link
- Music Reviews dashboard: grid of all releases with cover art, artist, title, average score
- Add Release: Single (cover, artist, title, description, audio URL/upload) or Album/EP (same + dynamic track list)
- Release detail: hero cover, metadata, average score, review form with 5 custom sliders + live score preview, all reviews listed
- One review per user per release; delete required before re-reviewing

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any `lib/api-spec/openapi.yaml` change, always run codegen before leaf typechecks.
- After changing `lib/*` packages, run `pnpm run typecheck:libs` so leaf packages see fresh declarations.
- bcryptjs is used (not bcrypt) to avoid native build approval requirements.
- File upload endpoint (`POST /api/upload`) requires authentication.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
