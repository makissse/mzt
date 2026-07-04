import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { recommendationMusicTable } from "./recommendationMusic";

export const recommendationTracksTable = pgTable("recommendation_tracks", {
  id: serial("id").primaryKey(),
  musicId: integer("music_id").notNull().references(() => recommendationMusicTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  audioUrl: text("audio_url").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRecommendationTrackSchema = createInsertSchema(recommendationTracksTable).omit({ id: true, createdAt: true });
export type InsertRecommendationTrack = z.infer<typeof insertRecommendationTrackSchema>;
export type RecommendationTrack = typeof recommendationTracksTable.$inferSelect;
