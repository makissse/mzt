import { Router } from "express";
import { db, pushSubscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getVapidPublicKey } from "../lib/push";

const router = Router();

// ─── Get public VAPID key ─────────────────────────────────────────────────────
router.get("/push/vapid-public-key", (_req, res) => {
  const key = getVapidPublicKey();
  if (!key) { res.status(503).json({ error: "Push not configured" }); return; }
  res.json({ publicKey: key });
});

// ─── Subscribe ────────────────────────────────────────────────────────────────
router.post("/push/subscribe", async (req, res) => {
  const { endpoint, keys } = req.body ?? {};
  if (
    typeof endpoint !== "string" ||
    typeof keys?.p256dh !== "string" ||
    typeof keys?.auth !== "string"
  ) {
    res.status(400).json({ error: "Invalid subscription" });
    return;
  }
  await db
    .insert(pushSubscriptionsTable)
    .values({ endpoint, p256dh: keys.p256dh, auth: keys.auth })
    .onConflictDoNothing();
  res.status(201).json({ ok: true });
});

// ─── Unsubscribe ──────────────────────────────────────────────────────────────
router.post("/push/unsubscribe", async (req, res) => {
  const { endpoint } = req.body ?? {};
  if (typeof endpoint !== "string") {
    res.status(400).json({ error: "Invalid" });
    return;
  }
  await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.endpoint, endpoint));
  res.json({ ok: true });
});

export default router;
