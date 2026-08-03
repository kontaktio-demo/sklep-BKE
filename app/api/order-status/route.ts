import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRate } from "@/lib/server/rateLimit";

// Publiczny status zamówienia gościa: numer + e-mail (musi się zgadzać). Rate-limit anty-enumeracja.
export async function GET(req: Request) {
  const limited = checkRate(req, "order-status", 20, 60);
  if (limited) return limited;

  const url = new URL(req.url);
  const number = (url.searchParams.get("number") ?? "").trim();
  const email = (url.searchParams.get("email") ?? "").trim().toLowerCase();
  if (!number || !email) return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });

  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "NEEDS_DB" }, { status: 400 });

  const { data } = await db
    .from("orders")
    .select("number,status,payment_status,tracking_number,shipping_method,total_grosze,created_at,email")
    .eq("number", number)
    .maybeSingle();

  // Ten sam błąd dla złego numeru i złego e-maila (nie zdradzamy istnienia zamówienia).
  if (!data || String(data.email).toLowerCase() !== email) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }
  const { email: _omit, ...order } = data as Record<string, unknown>;
  void _omit;
  return NextResponse.json({ ok: true, order });
}
