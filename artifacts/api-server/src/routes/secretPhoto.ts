import { Router } from "express";
import { db, userActivityStatsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const SECRET_PHOTO_URL = "/secret-photo.jpg";

const RECOMMENDATIONS_THRESHOLD = 322;
const REVIEWS_THRESHOLD = 88;
const TRACKS_THRESHOLD = 175;

function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.get("/secret-photo", requireAuth, async (req, res) => {
  const userId = req.session.userId!;

  const [user] = await db
    .select({ id: usersTable.id, username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  // Test user bypass: always unlocked for the chosen test account.
  if (user.username === "qwer") {
    res.json({ unlocked: true, photoUrl: SECRET_PHOTO_URL });
    return;
  }

  const [stats] = await db
    .select({
      lifetimeRecommendations: userActivityStatsTable.lifetimeRecommendations,
      lifetimeReviews: userActivityStatsTable.lifetimeReviews,
      lifetimeTracks: userActivityStatsTable.lifetimeTracks,
    })
    .from(userActivityStatsTable)
    .where(eq(userActivityStatsTable.userId, userId))
    .limit(1);

  const recommendations = stats?.lifetimeRecommendations ?? 0;
  const reviews = stats?.lifetimeReviews ?? 0;
  const tracks = stats?.lifetimeTracks ?? 0;

  const unlocked =
    recommendations > RECOMMENDATIONS_THRESHOLD ||
    reviews > REVIEWS_THRESHOLD ||
    tracks > TRACKS_THRESHOLD;

  res.json({
    unlocked,
    photoUrl: unlocked ? SECRET_PHOTO_URL : null,
    progress: {
      recommendations: { current: recommendations, needed: RECOMMENDATIONS_THRESHOLD },
      reviews: { current: reviews, needed: REVIEWS_THRESHOLD },
      tracks: { current: tracks, needed: TRACKS_THRESHOLD },
    },
  });
});

export default router;
