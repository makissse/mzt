import { Router } from "express";
import { db, releasesTable, reviewsTable, usersTable } from "@workspace/db";
import { avg, count, eq, desc } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req, res) => {
  const [releaseAgg] = await db
    .select({ count: count(releasesTable.id) })
    .from(releasesTable);

  const [reviewAgg] = await db
    .select({ count: count(reviewsTable.id), avg: avg(reviewsTable.score) })
    .from(reviewsTable);

  const avgScore = reviewAgg?.avg
    ? Math.min(90, Math.round(Number(reviewAgg.avg)))
    : null;

  // Top release by average score (with at least 1 review)
  const topReleaseRows = await db
    .select({
      release: releasesTable,
      user: {
        id: usersTable.id,
        username: usersTable.username,
        createdAt: usersTable.createdAt,
      },
      avgScore: avg(reviewsTable.score),
      reviewCount: count(reviewsTable.id),
    })
    .from(releasesTable)
    .leftJoin(usersTable, eq(releasesTable.createdById, usersTable.id))
    .leftJoin(reviewsTable, eq(reviewsTable.releaseId, releasesTable.id))
    .groupBy(releasesTable.id, usersTable.id, usersTable.username, usersTable.createdAt)
    .orderBy(desc(avg(reviewsTable.score)))
    .limit(1);

  let topRelease = null;
  if (topReleaseRows.length > 0 && topReleaseRows[0].avgScore) {
    const r = topReleaseRows[0];
    topRelease = {
      id: r.release.id,
      type: r.release.type,
      artist: r.release.artist,
      title: r.release.title,
      description: r.release.description,
      coverUrl: r.release.coverUrl,
      audioUrl: r.release.audioUrl,
      createdAt: r.release.createdAt,
      createdBy: r.user,
      averageScore: Math.min(90, Math.round(Number(r.avgScore))),
      reviewCount: Number(r.reviewCount),
    };
  }

  // Recent releases
  const recentRows = await db
    .select({
      release: releasesTable,
      user: {
        id: usersTable.id,
        username: usersTable.username,
        createdAt: usersTable.createdAt,
      },
      avgScore: avg(reviewsTable.score),
      reviewCount: count(reviewsTable.id),
    })
    .from(releasesTable)
    .leftJoin(usersTable, eq(releasesTable.createdById, usersTable.id))
    .leftJoin(reviewsTable, eq(reviewsTable.releaseId, releasesTable.id))
    .groupBy(releasesTable.id, usersTable.id, usersTable.username, usersTable.createdAt)
    .orderBy(desc(releasesTable.createdAt))
    .limit(5);

  const recentReleases = recentRows.map((r) => ({
    id: r.release.id,
    type: r.release.type,
    artist: r.release.artist,
    title: r.release.title,
    description: r.release.description,
    coverUrl: r.release.coverUrl,
    audioUrl: r.release.audioUrl,
    createdAt: r.release.createdAt,
    createdBy: r.user,
    averageScore: r.avgScore ? Math.min(90, Math.round(Number(r.avgScore))) : null,
    reviewCount: Number(r.reviewCount),
  }));

  res.json({
    totalReleases: Number(releaseAgg?.count ?? 0),
    totalReviews: Number(reviewAgg?.count ?? 0),
    averageScore: avgScore,
    topRelease,
    recentReleases,
  });
});

export default router;
