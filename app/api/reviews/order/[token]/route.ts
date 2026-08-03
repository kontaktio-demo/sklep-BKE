import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// Pozycje zamówienia po tokenie recenzji (do formularza /opinie) — dostęp tylko z tokenem.
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "NEEDS_DB" }, { status: 400 });

  const { data: order } = await db.from("orders").select("id,number").eq("review_token", token).maybeSingle();
  if (!order) return NextResponse.json({ ok: false, error: "INVALID_TOKEN" }, { status: 404 });

  const { data: items } = await db
    .from("order_items")
    .select("slug,name,image_url")
    .eq("order_id", order.id as string);

  const seen = new Set<string>();
  const products = (items ?? [])
    .map((i) => i as { slug: string | null; name: string | null; image_url: string | null })
    .filter((i) => i.slug && !seen.has(i.slug) && seen.add(i.slug))
    .map((i) => ({ slug: i.slug as string, name: i.name ?? "", image: i.image_url }));

  return NextResponse.json({ ok: true, number: order.number, items: products });
}
