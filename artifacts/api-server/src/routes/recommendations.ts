import { Router } from "express";
import {
  db,
  videosTable,
  moviesTable,
  recommendationMusicTable,
  recommendationTracksTable,
  usersTable,
} from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

async function getCreatedBy(createdById: number) {
  const [user] = await db
    .select({ id: usersTable.id, username: usersTable.username, createdAt: usersTable.createdAt })
    .from(usersTable)
    .where(eq(usersTable.id, createdById))
    .limit(1);
  return user as { id: number; username: string; createdAt: Date };
}

// ---------- VIDEOS ----------

router.get("/recommendations/videos", async (_req, res) => {
  const rows = await db
    .select({
      video: videosTable,
      user: { id: usersTable.id, username: usersTable.username, createdAt: usersTable.createdAt },
    })
    .from(videosTable)
    .leftJoin(usersTable, eq(videosTable.createdById, usersTable.id))
    .orderBy(desc(videosTable.createdAt));

  const videos = await Promise.all(
    rows.map(async (row) => ({
      id: row.video.id,
      url: row.video.url,
      title: row.video.title,
      description: row.video.description,
      thumbnailUrl: row.video.thumbnailUrl,
      createdAt: row.video.createdAt,
      createdBy: row.user as { id: number; username: string; createdAt: Date },
    }))
  );

  res.json(videos);
});

router.post("/recommendations/videos", requireAuth, async (req, res) => {
  const { url, title, description, thumbnailUrl } = req.body ?? {};

  if (!url || !title) {
    res.status(400).json({ error: "url and title are required" });
    return;
  }

  const [video] = await db
    .insert(videosTable)
    .values({
      url,
      title,
      description: description || null,
      thumbnailUrl: thumbnailUrl || null,
      createdById: req.session.userId!,
    })
    .returning();

  const createdBy = await getCreatedBy(video.createdById);

  res.status(201).json({
    id: video.id,
    url: video.url,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    createdAt: video.createdAt,
    createdBy,
  });
});

router.delete("/recommendations/videos/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [video] = await db
    .select({ createdById: videosTable.createdById })
    .from(videosTable)
    .where(eq(videosTable.id, id))
    .limit(1);

  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  await db.delete(videosTable).where(eq(videosTable.id, id));
  res.json({ ok: true });
});

// ---------- MOVIES ----------

router.get("/recommendations/movies", async (_req, res) => {
  const rows = await db
    .select({
      movie: moviesTable,
      user: { id: usersTable.id, username: usersTable.username, createdAt: usersTable.createdAt },
    })
    .from(moviesTable)
    .leftJoin(usersTable, eq(moviesTable.createdById, usersTable.id))
    .orderBy(desc(moviesTable.createdAt));

  const movies = await Promise.all(
    rows.map(async (row) => ({
      id: row.movie.id,
      title: row.movie.title,
      description: row.movie.description,
      genre: row.movie.genre,
      rating: row.movie.rating,
      createdAt: row.movie.createdAt,
      createdBy: row.user as { id: number; username: string; createdAt: Date },
    }))
  );

  res.json(movies);
});

router.post("/recommendations/movies", requireAuth, async (req, res) => {
  const { title, description, genre, rating } = req.body ?? {};

  if (!title || !genre || typeof rating !== "number" || rating < 1 || rating > 10) {
    res.status(400).json({ error: "title, genre and rating 1-10 are required" });
    return;
  }

  const [movie] = await db
    .insert(moviesTable)
    .values({
      title,
      description: description || null,
      genre,
      rating,
      createdById: req.session.userId!,
    })
    .returning();

  const createdBy = await getCreatedBy(movie.createdById);

  res.status(201).json({
    id: movie.id,
    title: movie.title,
    description: movie.description,
    genre: movie.genre,
    rating: movie.rating,
    createdAt: movie.createdAt,
    createdBy,
  });
});

router.delete("/recommendations/movies/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [movie] = await db
    .select({ createdById: moviesTable.createdById })
    .from(moviesTable)
    .where(eq(moviesTable.id, id))
    .limit(1);

  if (!movie) {
    res.status(404).json({ error: "Movie not found" });
    return;
  }

  await db.delete(moviesTable).where(eq(moviesTable.id, id));
  res.json({ ok: true });
});

// ---------- MUSIC ----------

router.get("/recommendations/music", async (_req, res) => {
  const rows = await db
    .select({
      music: recommendationMusicTable,
      user: { id: usersTable.id, username: usersTable.username, createdAt: usersTable.createdAt },
    })
    .from(recommendationMusicTable)
    .leftJoin(usersTable, eq(recommendationMusicTable.createdById, usersTable.id))
    .orderBy(desc(recommendationMusicTable.createdAt));

  const music = await Promise.all(
    rows.map(async (row) => ({
      id: row.music.id,
      type: row.music.type,
      artist: row.music.artist,
      title: row.music.title,
      description: row.music.description,
      coverUrl: row.music.coverUrl,
      createdAt: row.music.createdAt,
      createdBy: row.user as { id: number; username: string; createdAt: Date },
    }))
  );

  res.json(music);
});

router.post("/recommendations/music", requireAuth, async (req, res) => {
  const { type, artist, title, description, coverUrl, tracks } = req.body ?? {};

  if (!type || !title) {
    res.status(400).json({ error: "type and title are required" });
    return;
  }

  if (!["single", "album"].includes(type)) {
    res.status(400).json({ error: "type must be 'single' or 'album'" });
    return;
  }

  const [music] = await db
    .insert(recommendationMusicTable)
    .values({
      type,
      artist,
      title,
      description: description || null,
      coverUrl: coverUrl || null,
      createdById: req.session.userId!,
    })
    .returning();

  if (type === "album" && Array.isArray(tracks) && tracks.length > 0) {
    const trackValues = tracks.map((t: { title: string; audioUrl: string }, i: number) => ({
      musicId: music.id,
      title: t.title,
      audioUrl: t.audioUrl,
      order: i + 1,
    }));
    await db.insert(recommendationTracksTable).values(trackValues);
  }

  const createdBy = await getCreatedBy(music.createdById);
  const savedTracks =
    type === "album"
      ? await db
          .select()
          .from(recommendationTracksTable)
          .where(eq(recommendationTracksTable.musicId, music.id))
          .orderBy(recommendationTracksTable.order)
      : [];

  res.status(201).json({
    id: music.id,
    type: music.type,
    artist: music.artist,
    title: music.title,
    description: music.description,
    coverUrl: music.coverUrl,
    createdAt: music.createdAt,
    createdBy,
    tracks: savedTracks.map((t) => ({
      id: t.id,
      title: t.title,
      audioUrl: t.audioUrl,
      order: t.order,
    })),
  });
});

router.get("/recommendations/music/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .select({
      music: recommendationMusicTable,
      user: { id: usersTable.id, username: usersTable.username, createdAt: usersTable.createdAt },
    })
    .from(recommendationMusicTable)
    .leftJoin(usersTable, eq(recommendationMusicTable.createdById, usersTable.id))
    .where(eq(recommendationMusicTable.id, id))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Music not found" });
    return;
  }

  const tracks = await db
    .select()
    .from(recommendationTracksTable)
    .where(eq(recommendationTracksTable.musicId, id))
    .orderBy(recommendationTracksTable.order);

  res.json({
    id: row.music.id,
    type: row.music.type,
    artist: row.music.artist,
    title: row.music.title,
    description: row.music.description,
    coverUrl: row.music.coverUrl,
    createdAt: row.music.createdAt,
    createdBy: row.user,
    tracks: tracks.map((t) => ({
      id: t.id,
      title: t.title,
      audioUrl: t.audioUrl,
      order: t.order,
    })),
  });
});

router.delete("/recommendations/music/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [music] = await db
    .select({ createdById: recommendationMusicTable.createdById })
    .from(recommendationMusicTable)
    .where(eq(recommendationMusicTable.id, id))
    .limit(1);

  if (!music) {
    res.status(404).json({ error: "Music not found" });
    return;
  }

  await db.delete(recommendationMusicTable).where(eq(recommendationMusicTable.id, id));
  res.json({ ok: true });
});

// ---------- YOUTUBE METADATA ----------

router.post("/recommendations/fetch-video-meta", requireAuth, async (req, res) => {
  const { url } = req.body ?? {};

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "url is required" });
    return;
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch metadata");
    }
    const data = await response.json() as { title?: string; thumbnail_url?: string };
    res.json({
      title: data.title || null,
      thumbnailUrl: data.thumbnail_url || null,
    });
  } catch (e) {
    res.status(422).json({ error: "Could not fetch video metadata" });
  }
});

export default router;
