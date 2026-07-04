import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { releasesTable } from "./releases";

export const tracksTable = pgTable("tracks", {
  id: serial("id").primaryKey(),
  releaseId: integer("release_id").notNull().references(() => releasesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  audioUrl: text("audio_url").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTrackSchema = createInsertSchema(tracksTable).omit({ id: true, createdAt: true });
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Track = typeof tracksTable.$inferSelect;
