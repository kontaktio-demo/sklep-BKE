import { NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/lib/server/customerAuth";
import { supabaseAdmin } from "@/lib/supabase/server";

// Zamówienia zalogowanego klienta: powiązane po user_id lub po e-mailu (zamówienia gościa).
export async function GET(req: Request) {
  const c = await getCustomerFromRequest(req);
  if (!c) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: true, orders: [] });

  // Dwa sparametryzowane zapytania (po user_id i po e-mailu) zamiast sklejanego filtra .or() —
  // e-mail traktujemy jako DANE, nie fragment składni PostgREST.
  const SELECT = "number,line,status,payment_status,total_grosze,shipping_method,created_at";
  type Row = { number: string; created_at: string };
  const seen = new Set<string>();
  const orders: Row[] = [];
  const add = (rows: Row[] | null) => {
    for (const o of rows ?? []) {
      if (!seen.has(o.number)) {
        seen.add(o.number);
        orders.push(o);
      }
    }
  };

  const byUser = await db.from("orders").select(SELECT).eq("user_id", c.userId).order("created_at", { ascending: false }).limit(100);
  add(byUser.data as Row[] | null);
  if (c.email) {
    const byEmail = await db.from("orders").select(SELECT).eq("email", c.email).order("created_at", { ascending: false }).limit(100);
    add(byEmail.data as Row[] | null);
  }
  orders.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return NextResponse.json({ ok: true, orders: orders.slice(0, 100) });
}
