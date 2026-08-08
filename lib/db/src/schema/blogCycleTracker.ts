import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { blogsTable } from "./blogs";

export const blogCycleTrackerTable = pgTable("blog_cycle_tracker", {
  id: serial("id").primaryKey(),
  blogId: integer("blog_id").notNull().unique().references(() => blogsTable.id, { onDelete: "cascade" }),
  cycleStartedAt: timestamp("cycle_started_at").notNull().defaultNow(),
  postCount: integer("post_count").notNull().default(0),
});

export type BlogCycleTracker = typeof blogCycleTrackerTable.$inferSelect;
