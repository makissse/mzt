import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { sql } from "drizzle-orm";
import { userActivityStatsTable } from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";

export type ActivityColumn = "lifetime_recommendations" | "lifetime_reviews" | "lifetime_tracks";

export async function incrementUserActivity(
  userId: number,
  column: ActivityColumn,
  amount = 1,
) {
  await db.execute(sql`
    INSERT INTO ${userActivityStatsTable} (user_id, ${sql.raw(column)})
    VALUES (${userId}, ${amount})
    ON CONFLICT (user_id)
    DO UPDATE SET ${sql.raw(column)} = ${userActivityStatsTable}.${sql.raw(column)} + ${amount},
                  updated_at = NOW()
  `);
}
