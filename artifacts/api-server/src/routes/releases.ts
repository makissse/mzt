import { Router } from "express";
import { db, releasesTable, tracksTable, usersTable, reviewsTable, playlistImportsTable, incrementUserActivity } from "@workspace/db";
import { eq, desc, avg, count, sql, inArray } from "drizzle-orm";

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
    isOurTrack: release.isOurTrack,
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
  const { type, artist, title, description, coverUrl, audioUrl, tracks, isOurTrack } = req.body ?? {};

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
      isOurTrack: isOurTrack === true,
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
    await incrementUserActivity(req.session.userId!, "lifetime_tracks", trackValues.length);
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
    isOurTrack: row.release.isOurTrack,
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

// ---------- IMPORT FROM SANYA'S PLAYLIST ----------

interface AppleMusicTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
}

async function fetchPlaylistTracks(): Promise<AppleMusicTrack[]> {
  // The embed page is a bare Web Component shell (no SSR data).
  // The main music.apple.com page embeds the full track list as
  // <script type="application/json"> with a predictable structure.
  const PLAYLIST_URL =
    "https://music.apple.com/md/playlist/muzic%C4%83/pl.u-oZylD6eCG1jN25N";

  const res = await fetch(PLAYLIST_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  });

  if (!res.ok) throw new Error(`Apple Music returned HTTP ${res.status}`);

  const html = await res.text();

  // Find the first <script type="application/json"> block — this is the
  // page-intent payload that contains sections[].items[] for all tracks.
  const scriptMatch = html.match(
    /<script[^>]+type="application\/json"[^>]*>([\s\S]+?)<\/script>/
  );
  if (!scriptMatch) throw new Error("No application/json script tag found");

  const pageData = JSON.parse(scriptMatch[1]);

  // Navigate to the sections array embedded in the page intent.
  const sections: unknown[] =
    pageData?.data?.[0]?.data?.sections ?? [];

  // Find the section whose itemKind is "trackLockup" — that's the track list.
  const trackSection = (sections as Array<Record<string, unknown>>).find(
    (s) => s["itemKind"] === "trackLockup"
  );
  if (!trackSection) throw new Error("trackLockup section not found");

  const items = trackSection["items"] as Array<Record<string, unknown>>;
  if (!items?.length) throw new Error("Track list is empty");

  const tracks: AppleMusicTrack[] = [];

  for (const item of items) {
    // Track ID lives in contentDescriptor.identifiers.storeAdamID
    const cd = item["contentDescriptor"] as Record<string, unknown> | undefined;
    const id = String(
      (cd?.["identifiers"] as Record<string, unknown>)?.["storeAdamID"] ?? ""
    );
    const title = String(item["title"] ?? "");
    // artistName is a flat field on the item
    const artist = String(
      item["artistName"] ??
        (item["subtitleLinks"] as Array<Record<string, unknown>>)?.[0]?.[
          "title"
        ] ??
        ""
    );
    const artworkDict = (
      item["artwork"] as Record<string, unknown> | undefined
    )?.["dictionary"] as Record<string, unknown> | undefined;
    const rawUrl = String(artworkDict?.["url"] ?? "");
    const coverUrl = rawUrl
      .replace("{w}", "500")
      .replace("{h}", "500")
      .replace("{f}", "jpg");

    if (id && title && artist && coverUrl && !coverUrl.includes("{")) {
      tracks.push({ id, title, artist, coverUrl });
    }
  }

  if (tracks.length === 0) throw new Error("No valid tracks parsed from playlist");
  return tracks;
}

router.post("/releases/from-playlist", requireAuth, async (req, res) => {
  try {
    // 1. Fetch all tracks from the Apple Music playlist.
    const allTracks = await fetchPlaylistTracks();

    // 2. Find track IDs that have already been imported.
    const allIds = allTracks.map((t) => t.id);
    const imported = await db
      .select({ trackId: playlistImportsTable.trackId })
      .from(playlistImportsTable)
      .where(inArray(playlistImportsTable.trackId, allIds));
    const importedSet = new Set(imported.map((r) => r.trackId));

    // 3. Filter to unused tracks only.
    const available = allTracks.filter((t) => !importedSet.has(t.id));
    if (available.length === 0) {
      res
        .status(409)
        .json({ error: "Все треки из плейлиста уже были добавлены" });
      return;
    }

    // 4. Pick a random track.
    const track = available[Math.floor(Math.random() * available.length)];

    // 5. Create the release (type: single, isOurTrack: false, no audio).
    const [release] = await db
      .insert(releasesTable)
      .values({
        type: "single",
        artist: track.artist,
        title: track.title,
        description: null,
        coverUrl: track.coverUrl,
        audioUrl: null,
        isOurTrack: false,
        createdById: req.session.userId!,
      })
      .returning();

    // 6. Record the import so this track is never selected again.
    await db.insert(playlistImportsTable).values({
      trackId: track.id,
      trackTitle: track.title,
      artist: track.artist,
    });

    const [createdBy] = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, release.createdById))
      .limit(1);

    const formatted = await formatRelease(release, createdBy);
    res.status(201).json(formatted);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(502).json({ error: `Не удалось загрузить плейлист: ${msg}` });
  }
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

  await db.delete(releasesTable).where(eq(releasesTable.id, id));
  res.json({ ok: true });
});

export default router;
