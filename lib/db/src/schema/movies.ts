import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const moviesTable = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  rating: integer("rating").notNull(),
  createdById: integer("created_by_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMovieSchema = createInsertSchema(moviesTable).omit({ id: true, createdAt: true });
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof moviesTable.$inferSelect;
