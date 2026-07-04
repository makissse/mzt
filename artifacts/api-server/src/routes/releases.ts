import { Router } from "express";
import { db, releasesTable, tracksTable, usersTable, reviewsTable } from "@workspace/db";
import { eq, desc, avg, count, sql } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

async function formatRelease(release: typeof releasesTable.$inferSelect, createdBy: { id: number; username: string; createdAt: Date }) {
  const [agg] = await db
    .select({
      avg: avg(reviewsTable.score),
      count: count(reviewsTable.id),
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.releaseId, release.id));

  const avgScore = agg?.avg ? Math.min(90, Math.round(Number(agg.avg))) : null;

  return {
    id: release.id,
    type: release.type,
    artist: release.artist,
    title: release.title,
    description: release.description,
    coverUrl: release.coverUrl,
    audioUrl: release.audioUrl,
    createdAt: release.createdAt,
    createdBy: {
      id: createdBy.id,
      username: createdBy.username,
      createdAt: createdBy.createdAt,
    },
    averageScore: avgScore,
    reviewCount: Number(agg?.count ?? 0),
  };
}

router.get("/releases", async (req, res) => {
  const rows = await db
    .select({
      release: releasesTable,
      user: {
        id: usersTable.id,
        username: usersTable.username,
        createdAt: usersTable.createdAt,
      },
    })
    .from(releasesTable)
    .leftJoin(usersTable, eq(releasesTable.createdById, usersTable.id))
    .orderBy(desc(releasesTable.createdAt));

  const releases = await Promise.all(
    rows.map((row) =>
      formatRelease(row.release, row.user as { id: number; username: string; createdAt: Date })
    )
  );

  res.json(releases);
});

router.post("/releases", requireAuth, async (req, res) => {
  const { type, artist, title, description, coverUrl, audioUrl, tracks } = req.body ?? {};

  if (!type || !artist || !title || !coverUrl) {
    res.status(400).json({ error: "type, artist, title, coverUrl are required" });
    return;
  }

  if (!["single", "album"].includes(type)) {
    res.status(400).json({ error: "type must be 'single' or 'album'" });
    return;
  }

  const [release] = await db
    .insert(releasesTable)
    .values({
      type,
      artist,
      title,
      description: description || null,
      coverUrl,
      audioUrl: audioUrl || null,
      createdById: req.session.userId!,
    })
    .returning();

  if (type === "album" && Array.isArray(tracks) && tracks.length > 0) {
    const trackValues = tracks.map((t: { title: string; audioUrl: string }, i: number) => ({
      releaseId: release.id,
      title: t.title,
      audioUrl: t.audioUrl,
      order: i + 1,
    }));
    await db.insert(tracksTable).values(trackValues);
  }

  const [createdBy] = await db
    .select({ id: usersTable.id, username: usersTable.username, createdAt: usersTable.createdAt })
    .from(usersTable)
    .where(eq(usersTable.id, release.createdById))
    .limit(1);

  const formatted = await formatRelease(release, createdBy);
  res.status(201).json(formatted);
});

router.get("/releases/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .select({
      release: releasesTable,
      user: {
        id: usersTable.id,
        username: usersTable.username,
        createdAt: usersTable.createdAt,
      },
    })
    .from(releasesTable)
    .leftJoin(usersTable, eq(releasesTable.createdById, usersTable.id))
    .where(eq(releasesTable.id, id))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Release not found" });
    return;
  }

  const tracks = await db
    .select()
    .from(tracksTable)
    .where(eq(tracksTable.releaseId, id))
    .orderBy(tracksTable.order);

  const reviewRows = await db
    .select({
      review: reviewsTable,
      user: {
        id: usersTable.id,
        username: usersTable.username,
        createdAt: usersTable.createdAt,
      },
    })
    .from(reviewsTable)
    .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
    .where(eq(reviewsTable.releaseId, id))
    .orderBy(desc(reviewsTable.createdAt));

  const reviews = reviewRows.map((r) => ({
    id: r.review.id,
    releaseId: r.review.releaseId,
    user: r.user as { id: number; username: string; createdAt: Date },
    rhymes: r.review.rhymes,
    structure: r.review.structure,
    styleExecution: r.review.styleExecution,
    individuality: r.review.individuality,
    atmosphere: r.review.atmosphere,
    score: r.review.score,
    comment: r.review.comment,
    createdAt: r.review.createdAt,
  }));

  const [agg] = await db
    .select({ avg: avg(reviewsTable.score), count: count(reviewsTable.id) })
    .from(reviewsTable)
    .where(eq(reviewsTable.releaseId, id));

  const avgScore = agg?.avg ? Math.min(90, Math.round(Number(agg.avg))) : null;

  const userReview = req.session.userId
    ? reviews.find((r) => r.user?.id === req.session.userId) ?? null
    : null;

  res.json({
    id: row.release.id,
    type: row.release.type,
    artist: row.release.artist,
    title: row.release.title,
    description: row.release.description,
    coverUrl: row.release.coverUrl,
    audioUrl: row.release.audioUrl,
    createdAt: row.release.createdAt,
    createdBy: row.user,
    averageScore: avgScore,
    reviewCount: Number(agg?.count ?? 0),
    tracks: tracks.map((t) => ({
      id: t.id,
      title: t.title,
      audioUrl: t.audioUrl,
      order: t.order,
    })),
    reviews,
    userReview,
  });
});

router.delete("/releases/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [release] = await db
    .select({ createdById: releasesTable.createdById })
    .from(releasesTable)
    .where(eq(releasesTable.id, id))
    .limit(1);

  if (!release) {
    res.status(404).json({ error: "Release not found" });
    return;
  }

  if (release.createdById !== req.session.userId) {
    res.status(403).json({ error: "You can only delete your own releases" });
    return;
  }

  await db.delete(releasesTable).where(eq(releasesTable.id, id));
  res.json({ ok: true });
});

export default router;
