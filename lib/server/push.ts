import "server-only";
import webpush from "web-push";
import { SERVER } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Powiadomienia push do panelu (nowe opłacone zamówienie „dzwoni"). Web Push/VAPID.
 * Bez kluczy VAPID = ciche no-op (gotowe do konfiguracji).
 */
let configured = false;
function ensure(): boolean {
  if (!SERVER.vapidPublicKey || !SERVER.vapidPrivateKey) return false;
  if (!configured) {
    webpush.setVapidDetails(SERVER.vapidSubject, SERVER.vapidPublicKey, SERVER.vapidPrivateKey);
    configured = true;
  }
  return true;
}

export function vapidPublicKey(): string {
  return SERVER.vapidPublicKey;
}

export async function notifyPanel(title: string, body: string, url = "/panel"): Promise<void> {
  if (!ensure()) return;
  const db = supabaseAdmin();
  if (!db) return;
  const { data } = await db.from("push_subscriptions").select("id,endpoint,subscription");
  const payload = JSON.stringify({ title, body, url });
  await Promise.all(
    (data ?? []).map(async (row) => {
      const sub = (row as { subscription: webpush.PushSubscription; endpoint: string; id: string });
      try {
        await webpush.sendNotification(sub.subscription, payload);
      } catch (e) {
        // 404/410 = subskrypcja wygasła → sprzątamy
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await db.from("push_subscriptions").delete().eq("id", sub.id);
      }
    })
  );
}
