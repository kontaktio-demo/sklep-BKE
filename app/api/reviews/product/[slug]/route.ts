import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// Publiczne recenzje produktu + agregat oceny (do JSON-LD / karty produktu).
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: true, reviews: [], average: 0, count: 0 });

  const { data: product } = await db.from("products").select("id").eq("slug", slug).maybeSingle();
  if (!product) return NextResponse.json({ ok: true, reviews: [], average: 0, count: 0 });

  const { data } = await db
    .from("reviews")
    .select("author_name,rating,content,verified,created_at")
    .eq("product_id", product.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const reviews = data ?? [];
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + ((r as { rating: number }).rating ?? 0), 0) / count : 0;
  return NextResponse.json({ ok: true, reviews, average: Number(average.toFixed(2)), count });
}
