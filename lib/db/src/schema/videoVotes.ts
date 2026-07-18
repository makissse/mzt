import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { videosTable } from "./videos";

export const videoVotesTable = pgTable("video_votes", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videosTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  vote: integer("vote").notNull(), // +1 or -1
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type VideoVote = typeof videoVotesTable.$inferSelect;
