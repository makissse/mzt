import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const recommendationMusicTable = pgTable("recommendation_music", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'single' | 'album'
  artist: text("artist").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  coverUrl: text("cover_url"),
  createdById: integer("created_by_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRecommendationMusicSchema = createInsertSchema(recommendationMusicTable).omit({ id: true, createdAt: true });
export type InsertRecommendationMusic = z.infer<typeof insertRecommendationMusicSchema>;
export type RecommendationMusic = typeof recommendationMusicTable.$inferSelect;
