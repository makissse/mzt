import { Router } from "express";
import {
  db,
  blogsTable,
  blogPostsTable,
  blogMediaTable,
  usersTable,
  blogPostLikesTable,
  blogCommentsTable,
} from "@workspace/db";
import { eq, desc, count, and, inArray, sql } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  req.userId = req.session.userId as number;
  next();
}

function getCurrentUserId(req: any): number {
  return req.userId as number;
}

type DbUser = typeof usersTable.$inferSelect;
type DbBlog = typeof blogsTable.$inferSelect;

function formatUser(user: { id: number; username: string; createdAt: Date }) {
  return { id: user.id, username: user.username, createdAt: user.createdAt };
}

/** Virtual user for seeded blogs that have no linked account yet */
function virtualUser(blog: DbBlog) {
  return { id: 0, username: blog.ownerUsername ?? "blog", createdAt: blog.createdAt };
}

/** Determine if userId is the owner of a blog (checks isAdmin, userId, and ownerUsername) */
async function resolveIsOwner(blog: DbBlog, userId: number | undefined): Promise<boolean> {
  if (!userId) return false;
  if (blog.userId === userId) return true;

  const [u] = await db
    .select({ username: usersTable.username, isAdmin: usersTable.isAdmin })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!u) return false;
  if (u.isAdmin) return true;
  if (blog.ownerUsername && u.username === blog.ownerUsername) return true;

  return false;
}

function formatBlog(
  blog: DbBlog,
  user: DbUser | null,
  postCount: number,
  isOwner: boolean,
) {
  const displayUser = user ? formatUser(user) : formatUser(virtualUser(blog));
  return {
    id: blog.id,
    title: blog.title,
    handle: blog.handle,
    description: blog.description,
    avatarUrl: blog.avatarUrl,
    coverUrl: blog.coverUrl,
    ownerUsername: blog.ownerUsername,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    user: displayUser,
    postCount,
    isOwner,
  };
}

function formatPost(
  post: typeof blogPostsTable.$inferSelect,
  user: { id: number; username: string; createdAt: Date },
  media: typeof blogMediaTable.$inferSelect[],
  isOwner: boolean,
  likesCount: number,
  isLikedByMe: boolean,
  commentsCount: number,
) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    createdBy: formatUser(user),
    media: media.map((m) => ({
      id: m.id,
      type: m.type,
      url: m.url,
      order: m.order,
      isCircle: m.isCircle,
    })),
    isOwner,
    likesCount,
    isLikedByMe,
    commentsCount,
  };
}

// ─── List all blogs ───────────────────────────────────────────────────────────

router.get("/blogs", async (req, res) => {
  const rows = await db
    .select({
      blog: blogsTable,
      user: usersTable,
      postCount: count(blogPostsTable.id),
    })
    .from(blogsTable)
    .leftJoin(usersTable, eq(blogsTable.userId, usersTable.id))
    .leftJoin(blogPostsTable, eq(blogsTable.id, blogPostsTable.blogId))
    .groupBy(blogsTable.id, usersTable.id)
    .orderBy(desc(count(blogPostsTable.id)), blogsTable.handle);

  const currentUserId = req.session.userId ? (req.session.userId as number) : undefined;

  const blogs = await Promise.all(
    rows.map(async (row) => {
      const isOwner = await resolveIsOwner(row.blog, currentUserId);
      return formatBlog(row.blog, row.user, Number(row.postCount), isOwner);
    }),
  );

  res.json(blogs);
});

// ─── Create blog (user-created) ───────────────────────────────────────────────

router.post("/blogs", requireAuth, async (req, res) => {
  const userId = getCurrentUserId(req);

  const [existing] = await db
    .select()
    .from(blogsTable)
    .where(eq(blogsTable.userId, userId))
    .limit(1);

  if (existing) {
    res.status(409).json({ error: "У тебя уже есть блог" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const { title, description, handle, avatarUrl, coverUrl } = req.body ?? {};
  const safeHandle = typeof handle === "string" && handle.trim().length > 0
    ? handle.trim().toLowerCase()
    : user.username;

  const handleRegex = /^[a-zA-Z0-9_\-]+$/;
  if (!handleRegex.test(safeHandle)) {
    res.status(400).json({ error: "handle может содержать только буквы, цифры, _ и -" });
    return;
  }

  const [handleTaken] = await db
    .select()
    .from(blogsTable)
    .where(eq(blogsTable.handle, safeHandle))
    .limit(1);

  if (handleTaken) {
    res.status(409).json({ error: "Такой адрес блога уже занят" });
    return;
  }

  const [blog] = await db
    .insert(blogsTable)
    .values({
      userId,
      ownerUsername: user.username,
      title: typeof title === "string" ? title.trim() : "",
      handle: safeHandle,
      description: typeof description === "string" ? description.trim() : "",
      avatarUrl: typeof avatarUrl === "string" && avatarUrl.length > 0 ? avatarUrl : null,
      coverUrl: typeof coverUrl === "string" && coverUrl.length > 0 ? coverUrl : null,
    })
    .returning();

  res.status(201).json(formatBlog(blog, user, 0, true));
});

// ─── Update blog ──────────────────────────────────────────────────────────────

router.put("/blogs/:handle", requireAuth, async (req, res) => {
  const { handle } = req.params;
  const userId = getCurrentUserId(req);

  const [blog] = await db
    .select()
    .from(blogsTable)
    .where(eq(blogsTable.handle, handle))
    .limit(1);

  if (!blog) {
    res.status(404).json({ error: "Блог не найден" });
    return;
  }

  const isOwner = await resolveIsOwner(blog, userId);
  if (!isOwner) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  // If seeded blog being claimed for first time by the matching user, link userId
  if (!blog.userId) {
    await db.update(blogsTable).set({ userId }).where(eq(blogsTable.id, blog.id));
  }

  const { title, description, avatarUrl, coverUrl } = req.body ?? {};
  const updates: Partial<typeof blogsTable.$inferInsert> = {};
  if (typeof title === "string") updates.title = title.trim();
  if (typeof description === "string") updates.description = description.trim();
  if (typeof avatarUrl === "string" && avatarUrl.length > 0) updates.avatarUrl = avatarUrl;
  else if (avatarUrl === null) updates.avatarUrl = null;
  if (typeof coverUrl === "string" && coverUrl.length > 0) updates.coverUrl = coverUrl;
  else if (coverUrl === null) updates.coverUrl = null;
  updates.updatedAt = new Date();

  const [updated] = await db
    .update(blogsTable)
    .set(updates)
    .where(eq(blogsTable.id, blog.id))
    .returning();

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  const postCountRows = await db
    .select({ c: count(blogPostsTable.id) })
    .from(blogPostsTable)
    .where(eq(blogPostsTable.blogId, blog.id));

  res.json(formatBlog(updated, user, Number(postCountRows[0]?.c ?? 0), true));
});

// ─── Get blog + posts ─────────────────────────────────────────────────────────

router.get("/blogs/:handle", async (req, res) => {
  const { handle } = req.params;
  const currentUserId = req.session.userId ? (req.session.userId as number) : undefined;

  const [blogRow] = await db
    .select({ blog: blogsTable, user: usersTable })
    .from(blogsTable)
    .leftJoin(usersTable, eq(blogsTable.userId, usersTable.id))
    .where(eq(blogsTable.handle, handle))
    .limit(1);

  if (!blogRow) {
    res.status(404).json({ error: "Блог не найден" });
    return;
  }

  const { blog, user } = blogRow;
  const isOwner = await resolveIsOwner(blog, currentUserId);

  const postCountRows = await db
    .select({ c: count(blogPostsTable.id) })
    .from(blogPostsTable)
    .where(eq(blogPostsTable.blogId, blog.id));
  const postCount = Number(postCountRows[0]?.c ?? 0);

  // Fetch all posts with media
  const rows = await db
    .select({ post: blogPostsTable, media: blogMediaTable })
    .from(blogPostsTable)
    .leftJoin(blogMediaTable, eq(blogPostsTable.id, blogMediaTable.postId))
    .where(eq(blogPostsTable.blogId, blog.id))
    .orderBy(desc(blogPostsTable.createdAt));

  const postsById = new Map<number, typeof blogPostsTable.$inferSelect>();
  const mediaByPostId = new Map<number, typeof blogMediaTable.$inferSelect[]>();

  for (const row of rows) {
    if (!postsById.has(row.post.id)) {
      postsById.set(row.post.id, row.post);
      mediaByPostId.set(row.post.id, []);
    }
    if (row.media) mediaByPostId.get(row.post.id)!.push(row.media);
  }

  const postIds = Array.from(postsById.keys());

  // Batch-fetch likes counts and user likes
  const likesCountMap = new Map<number, number>();
  const userLikedSet = new Set<number>();

  if (postIds.length > 0) {
    const likeCounts = await db
      .select({ postId: blogPostLikesTable.postId, c: count(blogPostLikesTable.id) })
      .from(blogPostLikesTable)
      .where(inArray(blogPostLikesTable.postId, postIds))
      .groupBy(blogPostLikesTable.postId);
    for (const row of likeCounts) likesCountMap.set(row.postId, Number(row.c));

    if (currentUserId) {
      const userLikes = await db
        .select({ postId: blogPostLikesTable.postId })
        .from(blogPostLikesTable)
        .where(
          and(
            inArray(blogPostLikesTable.postId, postIds),
            eq(blogPostLikesTable.userId, currentUserId),
          ),
        );
      for (const row of userLikes) userLikedSet.add(row.postId);
    }
  }

  // Batch-fetch comment counts
  const commentCountMap = new Map<number, number>();
  if (postIds.length > 0) {
    const commentCounts = await db
      .select({ postId: blogCommentsTable.postId, c: count(blogCommentsTable.id) })
      .from(blogCommentsTable)
      .where(inArray(blogCommentsTable.postId, postIds))
      .groupBy(blogCommentsTable.postId);
    for (const row of commentCounts) commentCountMap.set(row.postId, Number(row.c));
  }

  const displayUser = user ? user : virtualUser(blog);

  const posts = Array.from(postsById.entries()).map(([postId, post]) => {
    const media = (mediaByPostId.get(postId) ?? []).sort((a, b) => a.order - b.order);
    return formatPost(
      post,
      formatUser(displayUser),
      media,
      isOwner,
      likesCountMap.get(postId) ?? 0,
      userLikedSet.has(postId),
      commentCountMap.get(postId) ?? 0,
    );
  });

  res.json({
    blog: formatBlog(blog, user, postCount, isOwner),
    posts,
  });
});

// ─── Create post ──────────────────────────────────────────────────────────────

router.post("/blogs/:handle/posts", requireAuth, async (req, res) => {
  const { handle } = req.params;
  const userId = getCurrentUserId(req);

  const [blog] = await db
    .select()
    .from(blogsTable)
    .where(eq(blogsTable.handle, handle))
    .limit(1);

  if (!blog) {
    res.status(404).json({ error: "Блог не найден" });
    return;
  }

  const isOwner = await resolveIsOwner(blog, userId);
  if (!isOwner) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  // Auto-claim blog userId on first post if not yet linked
  if (!blog.userId) {
    await db.update(blogsTable).set({ userId }).where(eq(blogsTable.id, blog.id));
  }

  const { title, content, media } = req.body ?? {};

  const safeTitle = typeof title === "string" ? title.trim() : "";
  const safeContent = typeof content === "string" ? content.trim() : "";

  const safeMedia = Array.isArray(media)
    ? media.filter(
        (m: { type: string; url: string }) =>
          ["image", "video", "audio"].includes(m.type) &&
          typeof m.url === "string" &&
          m.url.length > 0,
      )
    : [];

  if (safeTitle.length === 0 && safeContent.length === 0 && safeMedia.length === 0) {
    res.status(400).json({ error: "Пост не может быть пустым" });
    return;
  }

  const [post] = await db
    .insert(blogPostsTable)
    .values({
      title: safeTitle,
      content: safeContent,
      blogId: blog.id,
    })
    .returning();

  if (safeMedia.length > 0) {
    await db.insert(blogMediaTable).values(
      safeMedia.map((m: { type: string; url: string; isCircle?: boolean }, i: number) => ({
        postId: post.id,
        type: m.type,
        url: m.url,
        order: i + 1,
        isCircle: m.isCircle === true,
      })),
    );
  }

  const [owner] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  const postMedia = await db
    .select()
    .from(blogMediaTable)
    .where(eq(blogMediaTable.postId, post.id))
    .orderBy(blogMediaTable.order);

  res.status(201).json(
    formatPost(post, formatUser(owner ?? virtualUser(blog)), postMedia, true, 0, false, 0),
  );
});

// ─── Update post ──────────────────────────────────────────────────────────────

router.put("/blogs/posts/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const userId = getCurrentUserId(req);

  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }

  const [blog] = await db.select().from(blogsTable).where(eq(blogsTable.id, post.blogId)).limit(1);
  const isOwner = await resolveIsOwner(blog!, userId);
  if (!blog || !isOwner) { res.status(403).json({ error: "Forbidden" }); return; }

  const { title, content, media } = req.body ?? {};
  const safeTitle2   = typeof title   === "string" ? title.trim()   : "";
  const safeContent2 = typeof content === "string" ? content.trim() : "";

  const safeMedia = Array.isArray(media)
    ? media.filter(
        (m: { type: string; url: string }) =>
          ["image", "video", "audio"].includes(m.type) && typeof m.url === "string" && m.url.length > 0,
      )
    : [];

  if (safeTitle2.length === 0 && safeContent2.length === 0 && safeMedia.length === 0) {
    res.status(400).json({ error: "Пост не может быть пустым" }); return;
  }

  await db.update(blogPostsTable)
    .set({ title: safeTitle2, content: safeContent2, updatedAt: new Date() })
    .where(eq(blogPostsTable.id, id));

  await db.delete(blogMediaTable).where(eq(blogMediaTable.postId, id));
  if (safeMedia.length > 0) {
    await db.insert(blogMediaTable).values(
      safeMedia.map((m: { type: string; url: string; isCircle?: boolean }, i: number) => ({
        postId: id, type: m.type, url: m.url, order: i + 1, isCircle: m.isCircle === true,
      })),
    );
  }

  const [updated] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
  const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const postMedia = await db.select().from(blogMediaTable).where(eq(blogMediaTable.postId, id)).orderBy(blogMediaTable.order);

  const likeCounts = await db.select({ c: count(blogPostLikesTable.id) })
    .from(blogPostLikesTable).where(eq(blogPostLikesTable.postId, id));
  const commentCounts = await db.select({ c: count(blogCommentsTable.id) })
    .from(blogCommentsTable).where(eq(blogCommentsTable.postId, id));

  res.json(formatPost(
    updated, formatUser(owner ?? virtualUser(blog)),
    postMedia, true,
    Number(likeCounts[0]?.c ?? 0), false,
    Number(commentCounts[0]?.c ?? 0),
  ));
});

// ─── Delete post ──────────────────────────────────────────────────────────────

router.delete("/blogs/posts/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const userId = getCurrentUserId(req);
  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }

  const [blog] = await db.select().from(blogsTable).where(eq(blogsTable.id, post.blogId)).limit(1);
  const isOwner = await resolveIsOwner(blog!, userId);
  if (!blog || !isOwner) { res.status(403).json({ error: "Forbidden" }); return; }

  await db.delete(blogMediaTable).where(eq(blogMediaTable.postId, id));
  await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
  res.json({ ok: true });
});

// ─── Like / unlike post ───────────────────────────────────────────────────────

router.post("/blogs/posts/:id/like", requireAuth, async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const userId = getCurrentUserId(req);

  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, postId)).limit(1);
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }

  const [existing] = await db
    .select()
    .from(blogPostLikesTable)
    .where(and(eq(blogPostLikesTable.postId, postId), eq(blogPostLikesTable.userId, userId)))
    .limit(1);

  if (existing) {
    await db.delete(blogPostLikesTable).where(eq(blogPostLikesTable.id, existing.id));
  } else {
    await db.insert(blogPostLikesTable).values({ postId, userId });
  }

  const [countRow] = await db
    .select({ c: count(blogPostLikesTable.id) })
    .from(blogPostLikesTable)
    .where(eq(blogPostLikesTable.postId, postId));

  res.json({ liked: !existing, count: Number(countRow?.c ?? 0) });
});

// ─── Get comments ─────────────────────────────────────────────────────────────

router.get("/blogs/posts/:id/comments", async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const rows = await db
    .select({ comment: blogCommentsTable, user: usersTable })
    .from(blogCommentsTable)
    .innerJoin(usersTable, eq(blogCommentsTable.userId, usersTable.id))
    .where(eq(blogCommentsTable.postId, postId))
    .orderBy(blogCommentsTable.createdAt);

  res.json(
    rows.map((r) => ({
      id: r.comment.id,
      content: r.comment.content,
      createdAt: r.comment.createdAt,
      user: formatUser(r.user),
    })),
  );
});

// ─── Add comment ──────────────────────────────────────────────────────────────

router.post("/blogs/posts/:id/comments", requireAuth, async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const userId = getCurrentUserId(req);
  const { content } = req.body ?? {};

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    res.status(400).json({ error: "content is required" }); return;
  }

  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, postId)).limit(1);
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }

  const [comment] = await db
    .insert(blogCommentsTable)
    .values({ postId, userId, content: content.trim() })
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  res.status(201).json({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    user: formatUser(user),
  });
});

export default router;
