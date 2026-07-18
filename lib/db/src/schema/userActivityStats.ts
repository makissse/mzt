import { pgTable, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const userActivityStatsTable = pgTable("user_activity_stats", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  lifetimeRecommendations: integer("lifetime_recommendations").notNull().default(0),
  lifetimeReviews: integer("lifetime_reviews").notNull().default(0),
  lifetimeTracks: integer("lifetime_tracks").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type UserActivityStats = typeof userActivityStatsTable.$inferSelect;
