import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { products } from "@/lib/data/products.mock";
import { proProducts } from "@/lib/data/pro.mock";

/**
 * Serwerowe rozwiązanie pozycji koszyka na CENY Z BAZY (albo mocka offline).
 * To jedyne zaufane źródło cen przy kasie — klient przesyła tylko slug+SKU wariantu+ilość.
 */

export interface CartInput {
  slug: string;
  variant_sku?: string | null;
  qty: number;
  color?: string | null;
}

export interface ResolvedLine {
  product_id: string | null;
  variant_id: string | null;
  slug: string;
  name: string;
  variant_sku: string | null;
  price_grosze: number;
  qty: number;
  image_url: string | null;
  config: Record<string, unknown> | null;
  line: "shop" | "pro";
}

const mockAll = [...products.filter((p) => p.line === "shop"), ...proProducts];

function resolveFromMock(items: CartInput[]): ResolvedLine[] {
  const out: ResolvedLine[] = [];
  for (const it of items) {
    const p = mockAll.find((x) => x.slug === it.slug);
    if (!p) continue;
    const variant = it.variant_sku ? p.variants.find((v) => v.sku === it.variant_sku) : p.variants[0];
    const price = variant ? variant.price : p.price;
    out.push({
      product_id: null,
      variant_id: null,
      slug: p.slug,
      name: p.name,
      variant_sku: variant?.sku ?? null,
      price_grosze: Math.round(price * 100),
      qty: Math.max(1, Math.min(99, Math.floor(it.qty))),
      image_url: p.images[0] ?? null,
      config: it.color ? { color: it.color, size: variant?.size ?? null } : variant?.size ? { size: variant.size } : null,
      line: p.line,
    });
  }
  return out;
}

export async function resolveCart(items: CartInput[]): Promise<ResolvedLine[]> {
  const db = supabaseAdmin();
  if (!db) return resolveFromMock(items);

  const slugs = [...new Set(items.map((i) => i.slug))];
  const { data, error } = await db
    .from("products")
    .select("id,slug,name,line,price_grosze,in_stock,active,product_variants(id,sku,price_grosze,in_stock),product_images(url,sort_order)")
    .in("slug", slugs)
    .eq("active", true);
  if (error || !data) return resolveFromMock(items);

  type Row = {
    id: string;
    slug: string;
    name: string;
    line: string;
    price_grosze: number;
    product_variants: { id: string; sku: string; price_grosze: number; in_stock: boolean }[];
    product_images: { url: string; sort_order: number }[];
  };
  const bySlug = new Map((data as unknown as Row[]).map((r) => [r.slug, r]));

  const out: ResolvedLine[] = [];
  for (const it of items) {
    const r = bySlug.get(it.slug);
    if (!r) continue;
    const variant = it.variant_sku ? r.product_variants.find((v) => v.sku === it.variant_sku) : r.product_variants[0];
    const priceG = variant ? variant.price_grosze : r.price_grosze;
    const image = r.product_images.slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;
    out.push({
      product_id: r.id,
      variant_id: variant?.id ?? null,
      slug: r.slug,
      name: r.name,
      variant_sku: variant?.sku ?? null,
      price_grosze: priceG,
      qty: Math.max(1, Math.min(99, Math.floor(it.qty))),
      image_url: image,
      config: it.color ? { color: it.color } : null,
      line: r.line === "pro" ? "pro" : "shop",
    });
  }
  return out;
}
