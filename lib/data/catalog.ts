import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import type {
  CollarCategory,
  CollarSize,
  CollarType,
  CollarWidth,
  Product,
  ProCategory,
  ProductBadge,
  ProductColor,
  ProductVariant,
} from "@/lib/types";

/**
 * Warstwa katalogu na Supabase — mapuje wiersze DB na typ `Product` (lib/types.ts),
 * żeby CAŁY storefront działał bez zmian. Gdy baza nieskonfigurowana albo zapytanie padnie,
 * wołający (SEAM w index.ts) wraca na mock. Czyta service_role (serwer).
 */

const SIZE_FROM_DB: Record<string, CollarSize> = {
  S: "small",
  M: "medium",
  L: "large",
};

type VariantRow = {
  size: string | null;
  sku: string;
  price_grosze: number;
  in_stock: boolean;
  neck: string | null;
  weight_grams: number | null;
  sort_order: number;
};
type ImageRow = { url: string; sort_order: number };
type ProductRow = {
  slug: string;
  name: string;
  line: string;
  pro_category: string | null;
  price_grosze: number;
  currency: string;
  tagline: string | null;
  description: string | null;
  details: string[] | null;
  highlights: string[] | null;
  badges: string[] | null;
  colors: ProductColor[] | null;
  width: string | null;
  collar_type: string | null;
  id_panel_compatible: boolean;
  pro_standard: string | null;
  bestseller_rank: number | null;
  in_stock: boolean;
  created_at: string;
  categories: { slug: string } | { slug: string }[] | null;
  product_variants: VariantRow[] | null;
  product_images: ImageRow[] | null;
};

const SELECT =
  "slug,name,line,pro_category,price_grosze,currency,tagline,description,details,highlights,badges,colors,width,collar_type,id_panel_compatible,pro_standard,bestseller_rank,in_stock,created_at,categories(slug),product_variants(size,sku,price_grosze,in_stock,neck,weight_grams,sort_order),product_images(url,sort_order)";

function catSlug(row: ProductRow): string {
  const c = row.categories;
  if (!c) return "";
  return Array.isArray(c) ? (c[0]?.slug ?? "") : c.slug;
}

function toCategory(row: ProductRow): CollarCategory {
  // sklep cywilny: slug kategorii = CollarCategory. Pro: derywacja jak w katalogu.
  if (row.line === "pro") return row.pro_category === "e-collar" ? "e-collar" : "working";
  const slug = catSlug(row);
  return (["working", "non-working", "e-collar"].includes(slug) ? slug : "working") as CollarCategory;
}

function mapRow(row: ProductRow): Product {
  const variants: ProductVariant[] = (row.product_variants ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((v) => ({
      size: SIZE_FROM_DB[v.size ?? "M"] ?? "medium",
      sku: v.sku,
      price: Math.round(v.price_grosze / 100),
      inStock: v.in_stock,
      neck: v.neck ?? "",
      weightGrams: v.weight_grams ?? 0,
    }));

  const gallery = (row.product_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => i.url);
  const primary = gallery[0] ?? `/placeholder/${row.slug}-1.svg`;
  const hover = gallery[1] ?? primary;

  const prices = variants.length ? variants.map((v) => v.price) : [Math.round(row.price_grosze / 100)];
  const minPrice = Math.min(...prices);
  const fromPrice = new Set(prices).size > 1;

  const specs = (row.details ?? []).map((d) => {
    const idx = d.indexOf(": ");
    return idx === -1
      ? { label: d, value: "" }
      : { label: d.slice(0, idx), value: d.slice(idx + 2) };
  });

  const sizes = variants.map((v) => v.size);
  const inStock = variants.length ? variants.some((v) => v.inStock) : row.in_stock;

  return {
    id: `db_${row.slug}`,
    slug: row.slug,
    name: row.name,
    price: minPrice,
    fromPrice,
    currency: row.currency || "PLN",
    images: [primary, hover],
    gallery: gallery.length ? gallery : [primary],
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    highlights: row.highlights ?? [],
    specs,
    sku: variants[0]?.sku?.replace(/-[SML]$/, "") ?? row.slug.toUpperCase(),
    colors: row.colors ?? [],
    badges: (row.badges ?? []) as ProductBadge[],
    category: toCategory(row),
    type: (row.collar_type ?? "nylon") as CollarType,
    width: (row.width ?? "1.5") as CollarWidth,
    variants,
    sizes,
    idPanelCompatible: row.id_panel_compatible,
    inStock,
    bestsellerRank: row.bestseller_rank ?? undefined,
    productType: row.line === "pro" ? "Obroża służbowa" : "Obroża",
    createdAt: row.created_at,
    line: row.line === "pro" ? "pro" : "shop",
    proCategory: (row.pro_category ?? undefined) as ProCategory | undefined,
    proStandard: row.pro_standard ?? undefined,
  };
}

export async function dbGetProducts(line: "shop" | "pro"): Promise<Product[] | null> {
  const db = supabaseAdmin();
  if (!db) return null;
  const { data, error } = await db
    .from("products")
    .select(SELECT)
    .eq("active", true)
    .eq("line", line)
    .order("sort_order", { ascending: true });
  if (error || !data) return null;
  return (data as unknown as ProductRow[]).map(mapRow);
}

export async function dbGetProduct(slug: string): Promise<Product | null | undefined> {
  const db = supabaseAdmin();
  if (!db) return undefined; // undefined => wołający wraca na mock; null => faktycznie brak
  const { data, error } = await db.from("products").select(SELECT).eq("slug", slug).eq("active", true).maybeSingle();
  if (error) return undefined;
  if (!data) return null;
  return mapRow(data as unknown as ProductRow);
}

export async function dbGetProCategories(): Promise<
  { slug: ProCategory; code: string; title: string; description: string; productCount: number }[] | null
> {
  const db = supabaseAdmin();
  if (!db) return null;
  const [{ data: cats, error: e1 }, { data: prods, error: e2 }] = await Promise.all([
    db.from("categories").select("slug,name,tagline,sort_order").eq("line", "pro").order("sort_order"),
    db.from("products").select("pro_category").eq("line", "pro").eq("active", true),
  ]);
  if (e1 || e2 || !cats) return null;
  const counts = new Map<string, number>();
  for (const p of prods ?? []) {
    const k = (p as { pro_category: string | null }).pro_category ?? "";
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return cats.map((c, i) => {
    const cat = c as { slug: string; name: string; tagline: string | null };
    return {
      slug: cat.slug as ProCategory,
      code: `PRO-${String(i + 1).padStart(2, "0")}`,
      title: cat.name,
      description: cat.tagline ?? "",
      productCount: counts.get(cat.slug) ?? 0,
    };
  });
}
