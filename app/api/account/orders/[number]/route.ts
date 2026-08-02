import { NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/lib/server/customerAuth";
import { supabaseAdmin } from "@/lib/supabase/server";

// Szczegóły zamówienia klienta (weryfikacja właściciela: user_id lub e-mail konta).
export async function GET(req: Request, ctx: { params: Promise<{ number: string }> }) {
  const c = await getCustomerFromRequest(req);
  if (!c) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  const { number } = await ctx.params;
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  const { data } = await db
    .from("orders")
    .select("*,order_items(name,slug,variant_sku,qty,price_grosze,image_url,config)")
    .eq("number", number)
    .maybeSingle();
  if (!data) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  const owns = data.user_id === c.userId || (c.email && data.email?.toLowerCase() === c.email.toLowerCase());
  if (!owns) return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  return NextResponse.json({ ok: true, order: data });
}
