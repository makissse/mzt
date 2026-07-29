import webpush from "web-push";
import { db, pushSubscriptionsTable } from "@workspace/db";

let initialized = false;

function init() {
  if (initialized) return;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subj = process.env.VAPID_SUBJECT ?? "mailto:noreply@mzt.app";
  if (!pub || !priv) {
    console.warn("[push] VAPID keys not set — push disabled");
    return;
  }
  webpush.setVapidDetails(subj, pub, priv);
  initialized = true;
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

export async function sendPushToAll(payload: object, type: 'post' | 'comment' = 'post'): Promise<void> {
  init();
  if (!initialized) return;
  const allSubs = await db.select().from(pushSubscriptionsTable);
  const subs = allSubs.filter(s => type === 'post' ? s.notifyPosts : s.notifyComments);
  const body = JSON.stringify(payload);
  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        );
      } catch (err: any) {
        // 410 Gone = subscription expired; remove it
        if (err?.statusCode === 410) {
          await db
            .delete(pushSubscriptionsTable)
            .execute();
        }
      }
    }),
  );
}
