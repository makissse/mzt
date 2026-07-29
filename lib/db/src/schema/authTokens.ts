import { bigint, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const authTokensTable = pgTable("auth_tokens", {
  token: text("token").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type AuthToken = typeof authTokensTable.$inferSelect;
