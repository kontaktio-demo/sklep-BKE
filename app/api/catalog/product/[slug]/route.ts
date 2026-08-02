import { NextResponse } from "next/server";
import { getProduct } from "@/lib/data";

// Publiczny odczyt pojedynczego produktu (dla klienta: rehydracja koszyka).
// Czyta przez SEAM — realna baza, z fallbackiem na mock. Bez sekretów.
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const product = await getProduct(slug);
  return NextResponse.json(
    { product },
    { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
