import { pgTable, serial, text, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { releasesTable } from "./releases";

export const reviewsTable = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    releaseId: integer("release_id").notNull().references(() => releasesTable.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => usersTable.id),
    rhymes: integer("rhymes").notNull(),
    structure: integer("structure").notNull(),
    styleExecution: integer("style_execution").notNull(),
    individuality: integer("individuality").notNull(),
    atmosphere: integer("atmosphere").notNull(),
    score: integer("score").notNull(),
    comment: text("comment").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("unique_user_release_review").on(table.userId, table.releaseId),
  ]
);

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
