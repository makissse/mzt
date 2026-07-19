import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createAuthToken, deleteAuthToken } from "../lib/auth-tokens";

const router = Router();

// Usernames that automatically receive admin privileges on registration
const ADMIN_USERNAMES = new Set(["qwer"]);

router.post("/auth/register", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== "string" || username.length < 3 || username.length > 32) {
    res.status(400).json({ error: "Username must be 3–32 characters" });
    return;
  }

  if (typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Этот никнейм уже занят" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const isAdmin = ADMIN_USERNAMES.has(username);

  const [user] = await db
    .insert(usersTable)
    .values({ username, passwordHash, isAdmin })
    .returning({
      id: usersTable.id,
      username: usersTable.username,
      isAdmin: usersTable.isAdmin,
      createdAt: usersTable.createdAt,
    });

  req.session.userId = user.id;
  const authToken = createAuthToken(user.id);

  res.status(201).json({ ...user, authToken });
});

router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.userId = user.id;
  const authToken = createAuthToken(user.id);

  res.json({
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    authToken,
  });
});

router.post("/auth/logout", (req, res) => {
  const token = req.headers["x-auth-token"] as string | undefined;
  if (token) deleteAuthToken(token);
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/auth/me", async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      isAdmin: usersTable.isAdmin,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId))
    .limit(1);

  if (!user) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json(user);
});

export default router;
