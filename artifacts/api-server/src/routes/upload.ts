import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

// Accept any image/*, audio/*, or video/* MIME type to avoid browser MIME inconsistencies
const ALLOWED_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".gif",
  ".mp3", ".m4a", ".aac", ".alac", ".ogg", ".opus", ".wav", ".flac", ".webm",
  ".mp4", ".mov", ".m4v", ".ogv", ".mkv",
]);

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB (for video)
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    const isAllowedMime =
      mime.startsWith("image/") ||
      mime.startsWith("audio/") ||
      mime.startsWith("video/") ||
      mime === "application/octet-stream"; // some browsers send this for webm
    const isAllowedExt = ALLOWED_EXTENSIONS.has(ext) || ext === ""; // allow no-ext webm blobs
    if (isAllowedMime && (isAllowedExt || mime.startsWith("video/"))) {
      cb(null, true);
    } else {
      cb(new Error("Only image, audio, and video files are allowed"));
    }
  },
});

router.post("/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }

  const url = `/api/uploads/${req.file.filename}`;
  res.json({ url });
});

// Serve uploaded files (public read, but safe filename validation)
router.get("/uploads/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!/^[\d]+-[a-z0-9]+(\.[a-z0-9]+)?$/.test(filename)) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }

  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.sendFile(filePath);
});

export default router;
