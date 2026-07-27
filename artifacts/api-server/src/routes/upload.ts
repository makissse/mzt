import { Router } from "express";
import path from "path";
import fs from "fs";
import { ObjectNotFoundError, ObjectStorageService } from "../lib/objectStorage";

const router = Router();
const objectStorageService = new ObjectStorageService();

const uploadsDir = path.join(process.cwd(), "uploads");

// Serve uploaded files (public read, but safe filename validation)
router.get("/uploads/:filename", async (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!/^[\d]+-[a-z0-9]+(\.[a-z0-9]+)?$/.test(filename)) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }

  const filePath = path.join(uploadsDir, filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
    return;
  }

  // Legacy URLs remain readable after republish. Migrated files live in
  // Object Storage under /objects/legacy/<filename>.
  try {
    const objectFile = await objectStorageService.getObjectEntityFile(`/objects/legacy/${filename}`);
    const [metadata] = await objectFile.getMetadata();
    const totalSize = Number(metadata.size || 0);
    const rangeHeader = req.headers.range;
    const contentType = (metadata.contentType as string) || "application/octet-stream";

    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "private, max-age=3600");

    if (rangeHeader && totalSize > 0) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? Math.min(parseInt(match[2], 10), totalSize - 1) : totalSize - 1;
        if (start <= end) {
          res.status(206);
          res.setHeader("Content-Range", `bytes ${start}-${end}/${totalSize}`);
          res.setHeader("Content-Length", String(end - start + 1));
          objectFile.createReadStream({ start, end }).pipe(res);
          return;
        }
      }
    }

    if (totalSize > 0) res.setHeader("Content-Length", String(totalSize));
    objectFile.createReadStream().pipe(res);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    res.status(500).json({ error: "Failed to serve file" });
  }
});

export default router;
