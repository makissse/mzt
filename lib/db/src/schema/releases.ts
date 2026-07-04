import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const releasesTable = pgTable("releases", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'single' | 'album'
  artist: text("artist").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  coverUrl: text("cover_url").notNull(),
  audioUrl: text("audio_url"), // for singles only
  createdById: integer("created_by_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReleaseSchema = createInsertSchema(releasesTable).omit({ id: true, createdAt: true });
export type InsertRelease = z.infer<typeof insertReleaseSchema>;
export type Release = typeof releasesTable.$inferSelect;
