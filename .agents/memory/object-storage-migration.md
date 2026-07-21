---
name: Object storage migration
description: Media files (images, audio, video) migrated from local api-server disk to Replit Object Storage presigned URLs.
---

# Object Storage Migration

## What changed

| Before | After |
|--------|-------|
| POST `/api/upload` multipart | POST `/api/storage/uploads/request-url` JSON metadata → PUT to GCS presigned URL |
| Files saved to `artifacts/api-server/uploads/` (ephemeral) | Files saved to Replit Object Storage (persistent across republishes) |
| Served at `/api/uploads/<filename>` | Served at `/api/storage/objects/uploads/<uuid>` |

## Key files

- `artifacts/mzt/src/lib/upload.ts` — frontend upload helper (two-step: request presigned URL, PUT directly to GCS).
- `artifacts/api-server/src/routes/storage.ts` — three routes: `POST /storage/uploads/request-url`, `GET /storage/public-objects/*`, `GET /storage/objects/*`.
- `artifacts/api-server/src/lib/objectStorage.ts` — `ObjectStorageService` class (from skill template).
- `artifacts/api-server/src/lib/objectAcl.ts` — ACL helper (from skill template, not currently used for auth).
- `lib/object-storage-web/` — Uppy-based upload hook library (installed but not currently used in UI; `useUpload` hook available).
- `lib/api-spec/openapi.yaml` — Three storage paths + `UploadUrlRequest`/`UploadUrlResponse` schemas added.

## Auth check

The presigned URL endpoint checks `req.session.userId` (set by cookie or X-Auth-Token header). Unauthenticated visitors get 401.

**Why:** Local disk uploads (`uploads/` folder) are wiped on every Replit republish. Object Storage persists independently of the container.

**Old URLs:** `/api/uploads/...` links saved before this migration will 404 after a republish. Nothing automatically migrates existing rows.
