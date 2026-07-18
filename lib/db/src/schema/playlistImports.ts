import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Tracks which Apple Music tracks have ever been imported via the
 * "Трек из плейлиста Санька" feature. Even if the resulting release is
 * later deleted, the track ID stays here so it is never imported twice.
 */
export const playlistImportsTable = pgTable("playlist_imports", {
  id: serial("id").primaryKey(),
  /** Apple Music song ID — used for deduplication. */
  trackId: text("track_id").notNull().unique(),
  trackTitle: text("track_title").notNull(),
  artist: text("artist").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PlaylistImport = typeof playlistImportsTable.$inferSelect;
