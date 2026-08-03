import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { sweepStaleOrders } from "@/lib/server/order";
import { adminGuard } from "@/lib/server/adminAuth";

// Autoryzacja crona: sekret CRON_SECRET (Vercel Cron dokłada nagłówek Authorization: Bearer <secret>).
function cronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const got = req.headers.get("authorization") ?? "";
  const want = `Bearer ${secret}`;
  if (got.length !== want.length) return false;
  try {
    return timingSafeEqual(Buffer.from(got), Buffer.from(want));
  } catch {
    return false;
  }
}

// Sprzątanie porzuconych rezerwacji + przycinanie stripe_events. Wołane cyklicznie (Vercel Cron)
// albo ręcznie z kluczem admina.
export async function GET(req: Request) {
  if (!cronAuthorized(req)) {
    const denied = adminGuard(req);
    if (denied) return denied;
  }
  const hours = Number(process.env.STALE_ORDER_HOURS || "2");
  try {
    const res = await sweepStaleOrders(Number.isFinite(hours) ? hours : 2);
    return NextResponse.json({ ok: true, ...res });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "err" }, { status: 500 });
  }
}
