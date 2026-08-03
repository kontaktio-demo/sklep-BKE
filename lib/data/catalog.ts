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
  name_en: string | null;
  line: string;
  pro_category: string | null;
  price_grosze: number;
  currency: string;
  tagline: string | null;
  tagline_en: string | null;
  description: string | null;
  description_en: string | null;
  details: string[] | null;
  details_en: string[] | null;
  highlights: string[] | null;
  highlights_en: string[] | null;
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
  "slug,name,name_en,line,pro_category,price_grosze,currency,tagline,tagline_en,description,description_en,details,details_en,highlights,highlights_en,badges,colors,width,collar_type,id_panel_compatible,pro_standard,bestseller_rank,in_stock,created_at,categories(slug),product_variants(size,sku,price_grosze,in_stock,neck,weight_grams,sort_order),product_images(url,sort_order)";

type Locale = "pl" | "en";

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

function mapRow(row: ProductRow, locale: Locale = "pl"): Product {
  const en = locale === "en";
  const pick = (pl: string | null, e: string | null): string => (en && e ? e : (pl ?? ""));
  const pickArr = (pl: string[] | null, e: string[] | null): string[] =>
    (en && e && e.length ? e : (pl ?? []));
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

  const specs = pickArr(row.details, row.details_en).map((d) => {
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
    name: pick(row.name, row.name_en),
    price: minPrice,
    fromPrice,
    currency: row.currency || "PLN",
    images: [primary, hover],
    gallery: gallery.length ? gallery : [primary],
    tagline: pick(row.tagline, row.tagline_en),
    description: pick(row.description, row.description_en),
    highlights: pickArr(row.highlights, row.highlights_en),
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
    productType: row.line === "pro" ? (en ? "Duty collar" : "Obroża służbowa") : (en ? "Collar" : "Obroża"),
    createdAt: row.created_at,
    line: row.line === "pro" ? "pro" : "shop",
    proCategory: (row.pro_category ?? undefined) as ProCategory | undefined,
    proStandard: row.pro_standard ?? undefined,
  };
}

export async function dbGetProducts(line: "shop" | "pro", locale: Locale = "pl"): Promise<Product[] | null> {
  const db = supabaseAdmin();
  if (!db) return null;
  const { data, error } = await db
    .from("products")
    .select(SELECT)
    .eq("active", true)
    .eq("line", line)
    .order("sort_order", { ascending: true });
  if (error || !data) return null;
  return (data as unknown as ProductRow[]).map((r) => mapRow(r, locale));
}

export async function dbGetProduct(slug: string, locale: Locale = "pl"): Promise<Product | null | undefined> {
  const db = supabaseAdmin();
  if (!db) return undefined; // undefined => wołający wraca na mock; null => faktycznie brak
  const { data, error } = await db.from("products").select(SELECT).eq("slug", slug).eq("active", true).maybeSingle();
  if (error) return undefined;
  if (!data) return null;
  return mapRow(data as unknown as ProductRow, locale);
}

export async function dbGetProCategories(locale: Locale = "pl"): Promise<
  { slug: ProCategory; code: string; title: string; description: string; productCount: number }[] | null
> {
  const db = supabaseAdmin();
  if (!db) return null;
  const en = locale === "en";
  const [{ data: cats, error: e1 }, { data: prods, error: e2 }] = await Promise.all([
    db.from("categories").select("slug,name,name_en,tagline,tagline_en,sort_order").eq("line", "pro").order("sort_order"),
    db.from("products").select("pro_category").eq("line", "pro").eq("active", true),
  ]);
  if (e1 || e2 || !cats) return null;
  const counts = new Map<string, number>();
  for (const p of prods ?? []) {
    const k = (p as { pro_category: string | null }).pro_category ?? "";
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return cats.map((c, i) => {
    const cat = c as { slug: string; name: string; name_en: string | null; tagline: string | null; tagline_en: string | null };
    return {
      slug: cat.slug as ProCategory,
      code: `PRO-${String(i + 1).padStart(2, "0")}`,
      title: en && cat.name_en ? cat.name_en : cat.name,
      description: (en && cat.tagline_en ? cat.tagline_en : cat.tagline) ?? "",
      productCount: counts.get(cat.slug) ?? 0,
    };
  });
}
