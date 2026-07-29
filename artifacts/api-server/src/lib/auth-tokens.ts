import crypto from "crypto";
import { db, authTokensTable } from "@workspace/db";
import { eq, lt } from "drizzle-orm";

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createAuthToken(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  await db.insert(authTokensTable).values({ token, userId, expiresAt });
  // Clean up expired tokens opportunistically (non-blocking)
  db.delete(authTokensTable)
    .where(lt(authTokensTable.expiresAt, new Date()))
    .catch(() => {});
  return token;
}

export async function deleteAuthToken(token: string): Promise<void> {
  await db.delete(authTokensTable).where(eq(authTokensTable.token, token));
}

export async function getUserIdFromToken(token: string): Promise<number | undefined> {
  const [row] = await db
    .select()
    .from(authTokensTable)
    .where(eq(authTokensTable.token, token))
    .limit(1);
  if (!row) return undefined;
  if (row.expiresAt < new Date()) {
    await db.delete(authTokensTable).where(eq(authTokensTable.token, token));
    return undefined;
  }
  return row.userId;
}
