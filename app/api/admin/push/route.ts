import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/server/adminAuth";
import { vapidPublicKey } from "@/lib/server/push";
import { supabaseAdmin } from "@/lib/supabase/server";
import { readJson } from "@/lib/server/adminRoute";

// GET: klucz publiczny VAPID (do subskrypcji push w panelu).
export async function GET(req: Request) {
  const denied = adminGuard(req);
  if (denied) return denied;
  return NextResponse.json({ ok: true, publicKey: vapidPublicKey() });
}

// POST: zapis subskrypcji push urządzenia panelu.
export async function POST(req: Request) {
  const denied = adminGuard(req);
  if (denied) return denied;
  const body = await readJson<{ subscription?: { endpoint?: string } }>(req);
  const sub = body.subscription;
  if (!sub?.endpoint) return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "NEEDS_DB" }, { status: 400 });
  await db.from("push_subscriptions").upsert({ endpoint: sub.endpoint, subscription: sub }, { onConflict: "endpoint" });
  return NextResponse.json({ ok: true });
}
