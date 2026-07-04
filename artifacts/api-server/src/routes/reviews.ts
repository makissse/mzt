import { Router } from "express";
import { db, reviewsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { calculateScore } from "../lib/score";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.post("/releases/:releaseId/reviews", requireAuth, async (req, res) => {
  const releaseId = parseInt(req.params.releaseId, 10);
  if (isNaN(releaseId)) {
    res.status(400).json({ error: "Invalid releaseId" });
    return;
  }

  const { rhymes, structure, styleExecution, individuality, atmosphere, comment } = req.body ?? {};

  const criteria = [rhymes, structure, styleExecution, individuality, atmosphere];
  if (criteria.some((v) => typeof v !== "number" || v < 1 || v > 10)) {
    res.status(400).json({ error: "All rating criteria must be integers 1–10" });
    return;
  }

  if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
    res.status(400).json({ error: "Comment is required" });
    return;
  }

  const existing = await db
    .select({ id: reviewsTable.id })
    .from(reviewsTable)
    .where(
      and(
        eq(reviewsTable.releaseId, releaseId),
        eq(reviewsTable.userId, req.session.userId!)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    res.status(400).json({ error: "You already have a review for this release. Delete it first." });
    return;
  }

  const score = calculateScore(rhymes, structure, styleExecution, individuality, atmosphere);

  const [review] = await db
    .insert(reviewsTable)
    .values({
      releaseId,
      userId: req.session.userId!,
      rhymes,
      structure,
      styleExecution,
      individuality,
      atmosphere,
      score,
      comment: comment.trim(),
    })
    .returning();

  const [user] = await db
    .select({ id: usersTable.id, username: usersTable.username, createdAt: usersTable.createdAt })
    .from(usersTable)
    .where(eq(usersTable.id, review.userId))
    .limit(1);

  res.status(201).json({
    id: review.id,
    releaseId: review.releaseId,
    user,
    rhymes: review.rhymes,
    structure: review.structure,
    styleExecution: review.styleExecution,
    individuality: review.individuality,
    atmosphere: review.atmosphere,
    score: review.score,
    comment: review.comment,
    createdAt: review.createdAt,
  });
});

router.delete("/releases/:releaseId/reviews/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const releaseId = parseInt(req.params.releaseId, 10);

  if (isNaN(id) || isNaN(releaseId)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [review] = await db
    .select({ userId: reviewsTable.userId })
    .from(reviewsTable)
    .where(eq(reviewsTable.id, id))
    .limit(1);

  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  if (review.userId !== req.session.userId) {
    res.status(403).json({ error: "Not your review" });
    return;
  }

  await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
  res.json({ ok: true });
});

export default router;
