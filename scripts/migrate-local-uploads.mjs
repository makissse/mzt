import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const dbRequire = createRequire(path.resolve("lib/db/package.json"));
const apiRequire = createRequire(path.resolve("artifacts/api-server/package.json"));
const { Pool } = dbRequire("pg");
const { Storage } = apiRequire("@google-cloud/storage");

const uploadsDir = path.resolve("artifacts/api-server/uploads");
const privateDir = process.env.PRIVATE_OBJECT_DIR;
if (!privateDir) throw new Error("PRIVATE_OBJECT_DIR is not configured");

function parseStoragePath(value) {
  const normalized = value.replace(/^gs:\/\//, "").replace(/^\/+/, "");
  const [bucketName, ...prefixParts] = normalized.split("/");
  if (!bucketName) throw new Error(`Invalid PRIVATE_OBJECT_DIR: ${value}`);
  return { bucketName, prefix: prefixParts.join("/").replace(/\/+$/, "") };
}

const { bucketName, prefix } = parseStoragePath(privateDir);
const storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: "http://127.0.0.1:1106/token",
    type: "external_account",
    credential_source: {
      url: "http://127.0.0.1:1106/credential",
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const files = (await fs.readdir(uploadsDir)).filter((file) => /^[0-9]+-[a-z0-9]+(?:\.[a-z0-9]+)?$/.test(file));
const client = await pool.connect();

try {
  await client.query("BEGIN");
  for (const filename of files) {
    const localPath = path.join(uploadsDir, filename);
    const objectName = `${prefix}/legacy/${filename}`;
    const objectPath = `/api/storage/objects/legacy/${filename}`;
    const file = storage.bucket(bucketName).file(objectName);
    await file.save(await fs.readFile(localPath), {
      resumable: false,
      metadata: { contentType: contentTypeFor(filename) },
    });

    const replacement = objectPath;
    const oldUrl = `/api/uploads/${filename}`;
    const updates = [
      ["releases", "cover_url"],
      ["releases", "audio_url"],
      ["tracks", "audio_url"],
      ["recommendation_tracks", "audio_url"],
      ["recommendation_music", "cover_url"],
      ["videos", "url"],
      ["videos", "thumbnail_url"],
      ["blogs", "avatar_url"],
      ["blogs", "cover_url"],
    ];
    for (const [table, column] of updates) {
      await client.query(`UPDATE ${table} SET ${column} = $1 WHERE ${column} = $2`, [replacement, oldUrl]);
    }
    await client.query("UPDATE blog_media SET url = $1 WHERE url = $2", [replacement, oldUrl]);
    await client.query(
      "UPDATE blog_comments SET attachments = (SELECT COALESCE(json_agg(CASE WHEN item->>'url' = $1 THEN jsonb_set(item::jsonb, '{url}', to_jsonb($2::text)) ELSE item::jsonb END), '[]'::json) FROM json_array_elements(attachments) item) WHERE attachments::text LIKE $3",
      [oldUrl, replacement, `%${oldUrl}%`],
    );
    console.log(`migrated ${filename}`);
  }
  await client.query("COMMIT");
  console.log(`migrated ${files.length} local files`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}

function contentTypeFor(filename) {
  const ext = path.extname(filename).toLowerCase();
  return {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
  }[ext] ?? "application/octet-stream";
}