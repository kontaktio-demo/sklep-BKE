import "server-only";
import { createHash } from "node:crypto";
import { SERVER, PUBLIC } from "@/lib/env";

/**
 * Meta Conversions API — serwerowy event Purchase (dedup po numerze zamówienia).
 * Bez FB_PIXEL_ID / FB_CAPI_TOKEN = ciche no-op. Dane osobowe hashowane SHA-256.
 */
const sha = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

export async function sendPurchase(params: {
  orderNumber: string;
  email: string | null;
  valueGrosze: number;
  meta?: { fbp?: string; fbc?: string; ip?: string; ua?: string } | null;
}): Promise<void> {
  if (!SERVER.fbPixelId || !SERVER.fbCapiToken) return;
  const userData: Record<string, unknown> = {};
  if (params.email) userData.em = [sha(params.email)];
  if (params.meta?.fbp) userData.fbp = params.meta.fbp;
  if (params.meta?.fbc) userData.fbc = params.meta.fbc;
  if (params.meta?.ip) userData.client_ip_address = params.meta.ip;
  if (params.meta?.ua) userData.client_user_agent = params.meta.ua;

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.orderNumber,
        action_source: "website",
        event_source_url: PUBLIC.siteUrl,
        user_data: userData,
        custom_data: { currency: "PLN", value: Number((params.valueGrosze / 100).toFixed(2)) },
      },
    ],
  };
  try {
    await fetch(`https://graph.facebook.com/v21.0/${SERVER.fbPixelId}/events?access_token=${SERVER.fbCapiToken}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // analityka nie może wywrócić procesu zamówienia
  }
}
