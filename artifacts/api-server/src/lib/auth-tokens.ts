import crypto from "crypto";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, matches session cookie maxAge

interface TokenEntry {
  userId: number;
  expiresAt: number;
}

// In-memory token store: token -> {userId, expiresAt}
// Used as a cookie-free auth fallback for environments where cookies are
// blocked (e.g. the Replit preview iframe). Tokens are intentionally
// ephemeral — they are cleared on server restart, matching the behaviour
// of the MemoryStore sessions they complement.
const authTokens = new Map<string, TokenEntry>();

export function createAuthToken(userId: number): string {
  const token = crypto.randomBytes(32).toString("hex");
  authTokens.set(token, { userId, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

export function deleteAuthToken(token: string): void {
  authTokens.delete(token);
}

export function getUserIdFromToken(token: string): number | undefined {
  const entry = authTokens.get(token);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    authTokens.delete(token);
    return undefined;
  }
  return entry.userId;
}
