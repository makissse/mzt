/**
 * Uploads all files from media_export/media_export/uploads/ to Replit Object Storage.
 * Each file is stored at PRIVATE_OBJECT_DIR/uploads/<filename> so it can be served
 * via GET /api/storage/objects/uploads/<filename>.
 */

import { Storage } from '@google-cloud/storage';
import { readdir, readFile, stat } from 'fs/promises';
import { join, basename } from 'path';
function mimeLookup(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', mp3: 'audio/mpeg', mp4: 'video/mp4', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac', pdf: 'application/pdf' };
  return map[ext] || null;
}

const REPLIT_SIDECAR_ENDPOINT = 'http://127.0.0.1:1106';

const storage = new Storage({
  credentials: {
    audience: 'replit',
    subject_token_type: 'access_token',
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: 'external_account',
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: { type: 'json', subject_token_field_name: 'access_token' },
    },
    universe_domain: 'googleapis.com',
  },
  projectId: '',
});

const PRIVATE_OBJECT_DIR = process.env.PRIVATE_OBJECT_DIR;
if (!PRIVATE_OBJECT_DIR) {
  console.error('PRIVATE_OBJECT_DIR not set');
  process.exit(1);
}

// Parse bucket and base dir from PRIVATE_OBJECT_DIR
// e.g. /bucket-name/.private  →  bucket = "bucket-name", dir = ".private"
function parsePath(p) {
  const parts = p.replace(/^\//, '').split('/');
  return { bucketName: parts[0], prefix: parts.slice(1).join('/') };
}

const { bucketName, prefix } = parsePath(PRIVATE_OBJECT_DIR);
const bucket = storage.bucket(bucketName);

const mediaDir = join(process.cwd(), 'media_export', 'media_export', 'uploads');
const files = await readdir(mediaDir);

console.log(`Uploading ${files.length} files to bucket ${bucketName}, prefix ${prefix}/uploads/`);

let ok = 0;
let skip = 0;
let fail = 0;

for (const filename of files) {
  const localPath = join(mediaDir, filename);
  const s = await stat(localPath);
  if (!s.isFile()) continue;

  const objectName = `${prefix}/uploads/${filename}`;
  const gcsFile = bucket.file(objectName);

  const [exists] = await gcsFile.exists();
  if (exists) {
    console.log(`  SKIP (exists) ${filename}`);
    skip++;
    continue;
  }

  try {
    const contentType = mimeLookup(filename) || 'application/octet-stream';
    const data = await readFile(localPath);
    await gcsFile.save(data, { contentType, resumable: false });
    console.log(`  OK  ${filename}  (${(s.size / 1024).toFixed(1)} KB)`);
    ok++;
  } catch (err) {
    console.error(`  FAIL ${filename}: ${err.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} uploaded, ${skip} skipped, ${fail} failed`);
