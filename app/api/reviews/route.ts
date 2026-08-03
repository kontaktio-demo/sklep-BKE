import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";

const Body = z.object({
  order_token: z.string().uuid(),
  product_slug: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  author_name: z.string().trim().max(80).optional(),
  content: z.string().trim().max(2000).optional(),
});

// Dodanie recenzji — TYLKO zweryfikowanej: token pochodzi z zamówienia (orders.review_token).
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
  const b = parsed.data;

  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "NEEDS_DB" }, { status: 400 });

  const { data: order } = await db.from("orders").select("id").eq("review_token", b.order_token).maybeSingle();
  if (!order) return NextResponse.json({ ok: false, error: "INVALID_TOKEN" }, { status: 403 });

  const { data: product } = await db.from("products").select("id").eq("slug", b.product_slug).maybeSingle();
  if (!product) return NextResponse.json({ ok: false, error: "NO_PRODUCT" }, { status: 404 });

  const { error } = await db.from("reviews").upsert(
    {
      product_id: product.id,
      order_id: order.id,
      author_name: b.author_name ?? null,
      rating: b.rating,
      content: b.content ?? null,
      status: "published",
      verified: true,
    },
    { onConflict: "order_id,product_id" }
  );
  if (error) return NextResponse.json({ ok: false, error: "SAVE_FAILED" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
