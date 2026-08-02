import { NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/lib/server/customerAuth";
import { supabaseAdmin } from "@/lib/supabase/server";

// Zamówienia zalogowanego klienta: powiązane po user_id lub po e-mailu (zamówienia gościa).
export async function GET(req: Request) {
  const c = await getCustomerFromRequest(req);
  if (!c) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: true, orders: [] });

  const filters = c.email ? `user_id.eq.${c.userId},email.eq.${c.email}` : `user_id.eq.${c.userId}`;
  const { data } = await db
    .from("orders")
    .select("number,line,status,payment_status,total_grosze,shipping_method,created_at")
    .or(filters)
    .order("created_at", { ascending: false })
    .limit(100);
  return NextResponse.json({ ok: true, orders: data ?? [] });
}
