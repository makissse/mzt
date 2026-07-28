#!/bin/bash
# restore-backup.sh — Restore database and media files from a project export.
#
# Usage:
#   bash scripts/restore-backup.sh
#
# Expects:
#   - backup.sql          in the project root (pg_dump plain-SQL format)
#   - media_export/media_export/uploads/  containing media files (UUID filenames)
#
# The script:
#   1. Truncates all application tables (CASCADE)
#   2. Restores rows from backup.sql using COPY (FK checks disabled during load)
#   3. Resets all sequences to match restored data
#   4. Uploads media files to Replit Object Storage (.private/uploads/<uuid>)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/.."
BACKUP="$ROOT/backup.sql"
MEDIA_DIR="$ROOT/media_export/media_export/uploads"

if [ ! -f "$BACKUP" ]; then
  echo "ERROR: $BACKUP not found" >&2
  exit 1
fi

echo "==> Preparing data-only restore SQL..."
node -e "
const fs = require('fs');
const content = fs.readFileSync('$BACKUP', 'utf8');
const lines = content.split('\n');
const copyLines = [];
let inCopy = false;
for (const line of lines) {
  if (line.startsWith('COPY public.') && line.includes('FROM stdin')) {
    inCopy = true; copyLines.push(line);
  } else if (inCopy) {
    copyLines.push(line);
    if (line === '\\\\.') inCopy = false;
  }
}
copyLines.push(\`
SELECT setval('public.blog_comments_id_seq',        COALESCE((SELECT MAX(id) FROM public.blog_comments), 1));
SELECT setval('public.blog_media_id_seq',            COALESCE((SELECT MAX(id) FROM public.blog_media), 1));
SELECT setval('public.blog_post_likes_id_seq',       COALESCE((SELECT MAX(id) FROM public.blog_post_likes), 1));
SELECT setval('public.blog_posts_id_seq',            COALESCE((SELECT MAX(id) FROM public.blog_posts), 1));
SELECT setval('public.blogs_id_seq',                 COALESCE((SELECT MAX(id) FROM public.blogs), 1));
SELECT setval('public.movies_id_seq',                COALESCE((SELECT MAX(id) FROM public.movies), 1));
SELECT setval('public.playlist_imports_id_seq',      COALESCE((SELECT MAX(id) FROM public.playlist_imports), 1));
SELECT setval('public.push_subscriptions_id_seq',    COALESCE((SELECT MAX(id) FROM public.push_subscriptions), 1));
SELECT setval('public.recommendation_music_id_seq',  COALESCE((SELECT MAX(id) FROM public.recommendation_music), 1));
SELECT setval('public.recommendation_tracks_id_seq', COALESCE((SELECT MAX(id) FROM public.recommendation_tracks), 1));
SELECT setval('public.releases_id_seq',              COALESCE((SELECT MAX(id) FROM public.releases), 1));
SELECT setval('public.reviews_id_seq',               COALESCE((SELECT MAX(id) FROM public.reviews), 1));
SELECT setval('public.tracks_id_seq',                COALESCE((SELECT MAX(id) FROM public.tracks), 1));
SELECT setval('public.users_id_seq',                 COALESCE((SELECT MAX(id) FROM public.users), 1));
SELECT setval('public.video_votes_id_seq',           COALESCE((SELECT MAX(id) FROM public.video_votes), 1));
SELECT setval('public.videos_id_seq',                COALESCE((SELECT MAX(id) FROM public.videos), 1));
\`);
fs.writeFileSync('/tmp/restore_data.sql', copyLines.join('\n'));
console.log('Extracted ' + copyLines.length + ' lines');
"

echo "==> Truncating existing data..."
psql "$DATABASE_URL" -c "
SET session_replication_role = replica;
TRUNCATE TABLE
  public.video_votes, public.reviews, public.tracks,
  public.recommendation_tracks, public.blog_comments, public.blog_post_likes,
  public.blog_media, public.blog_posts, public.videos, public.releases,
  public.recommendation_music, public.movies, public.playlist_imports,
  public.push_subscriptions, public.user_activity_stats, public.blogs,
  public.users
  RESTART IDENTITY CASCADE;
SET session_replication_role = DEFAULT;
"

echo "==> Restoring data..."
{ echo "SET session_replication_role = replica;"; cat /tmp/restore_data.sql; echo "SET session_replication_role = DEFAULT;"; } \
  | psql "$DATABASE_URL"
echo "Database restore complete."

if [ -d "$MEDIA_DIR" ]; then
  echo "==> Uploading media files to Object Storage..."
  node --input-type=module << 'NODEEOF'
import { createRequire } from 'module';
const req = createRequire('/home/runner/workspace/node_modules/.pnpm/@google-cloud+storage@7.21.0/node_modules/@google-cloud/storage/package.json');
const { Storage } = req('./build/cjs/src/index.js');
import { readdir } from 'node:fs/promises';

const SIDECAR = 'http://127.0.0.1:1106';
const storage = new Storage({
  credentials: {
    audience: 'replit', subject_token_type: 'access_token',
    token_url: `${SIDECAR}/token`, type: 'external_account',
    credential_source: { url: `${SIDECAR}/credential`, format: { type: 'json', subject_token_field_name: 'access_token' } },
    universe_domain: 'googleapis.com',
  },
  projectId: '',
});
// Derive bucket name and prefix from PRIVATE_OBJECT_DIR (e.g. "replit-objstore-xxx/.private")
const privateObjectDir = process.env.PRIVATE_OBJECT_DIR;
if (!privateObjectDir) { console.error('PRIVATE_OBJECT_DIR not set'); process.exit(1); }
// Format: <bucketName>/<prefix>  (no gs:// prefix in this env)
const dirParts = privateObjectDir.replace(/^gs:\/\//, '').split('/');
const bucketId = dirParts[0];
const privatePrefix = dirParts.slice(1).join('/'); // e.g. ".private"
const bucket = storage.bucket(bucketId);
const uploadsDir = '/home/runner/workspace/media_export/media_export/uploads';
const files = await readdir(uploadsDir);
let ok = 0, fail = 0;
for (const f of files) {
  const dest = privatePrefix ? `${privatePrefix}/uploads/${f}` : `uploads/${f}`;
  try { await bucket.upload(`${uploadsDir}/${f}`, { destination: dest }); ok++; process.stdout.write('.'); }
  catch (e) { fail++; console.error(`\nFailed ${f}: ${e.message}`); }
}
console.log(`\nMedia upload complete: ${ok} ok, ${fail} failed`);
NODEEOF
else
  echo "SKIP: $MEDIA_DIR not found, skipping media upload."
fi

echo "==> Restore finished."
