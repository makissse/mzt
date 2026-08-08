import { Router } from "express";
import {
  db,
  usersTable,
  authTokensTable,
  reviewsTable,
  releasesTable,
  videosTable,
  moviesTable,
  recommendationMusicTable,
  blogPostsTable,
  blogsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function requireAdmin(req: Parameters<Parameters<typeof router.use>[0]>[0], res: Parameters<Parameters<typeof router.use>[0]>[1], next: Parameters<Parameters<typeof router.use>[0]>[2]) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

// GET /api/admin/users — list all users (admin only)
router.get("/admin/users", requireAdmin, async (req, res) => {
  // Fetch the requesting user to verify admin status
  const [me] = await db
    .select({ isAdmin: usersTable.isAdmin })
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId!))
    .limit(1);

  if (!me?.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const users = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      isAdmin: usersTable.isAdmin,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(usersTable.id);

  res.json(users);
});

// DELETE /api/admin/users/:id — delete a user (admin only, cannot delete yourself)
router.delete("/admin/users/:id", requireAdmin, async (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  if (isNaN(targetId)) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  const [me] = await db
    .select({ isAdmin: usersTable.isAdmin })
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId!))
    .limit(1);

  if (!me?.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (targetId === req.session.userId) {
    res.status(400).json({ error: "Нельзя удалить себя" });
    return;
  }

  let deleted;
  try {
    [deleted] = await db.transaction(async (tx) => {
      const [target] = await tx
        .select({ id: usersTable.id, username: usersTable.username })
        .from(usersTable)
        .where(eq(usersTable.id, targetId))
        .limit(1);

      if (!target) return [undefined] as const;

      // Remove standalone records authored by the user. Release deletion
      // cascades to its tracks and reviews.
      await tx.delete(reviewsTable).where(eq(reviewsTable.userId, targetId));
      await tx.delete(videosTable).where(eq(videosTable.createdById, targetId));
      await tx.delete(moviesTable).where(eq(moviesTable.createdById, targetId));
      await tx.delete(recommendationMusicTable).where(
        eq(recommendationMusicTable.createdById, targetId),
      );
      await tx.delete(releasesTable).where(eq(releasesTable.createdById, targetId));

      // Deleting owned blogs cascades through posts, media, likes, comments,
      // and the cycle tracker. Posts in other blogs remain, but no longer
      // point at the deleted user.
      await tx.delete(blogsTable).where(eq(blogsTable.userId, targetId));
      await tx
        .update(blogPostsTable)
        .set({ createdByUserId: null })
        .where(eq(blogPostsTable.createdByUserId, targetId));

      await tx.delete(authTokensTable).where(eq(authTokensTable.userId, targetId));
      return [target] as const;
    });
  } catch (error) {
    console.error("[admin] failed to delete user", { targetId, error });
    res.status(500).json({ error: "Не удалось удалить пользователя" });
    return;
  }

  if (!deleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ ok: true, deleted });
});

export default router;
