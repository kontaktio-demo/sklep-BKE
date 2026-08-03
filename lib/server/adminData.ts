import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { products as mockProducts } from "@/lib/data/products.mock";
import { proProducts } from "@/lib/data/pro.mock";

/**
 * Dane dla panelu. Zapisy wymagają bazy; ODCZYTY mają fallback demo (mock),
 * żeby panel dało się obejrzeć przed konfiguracją Supabase. „Demo" = read-only.
 */
export class NeedsDb extends Error {
  constructor() {
    super("SUPABASE_NOT_CONFIGURED");
  }
}
function db() {
  const c = supabaseAdmin();
  if (!c) throw new NeedsDb();
  return c;
}
export function hasDb(): boolean {
  return supabaseAdmin() != null;
}

// ---------- PRODUKTY ----------
const PROD_COLS =
  "id,slug,name,line,pro_category,category_id,price_grosze,sale_price_grosze,in_stock,stock_qty,active,bestseller,bestseller_rank,badges,short_description,sort_order,updated_at,categories(slug,name),product_variants(id,size,sku,price_grosze,stock_qty,in_stock),product_images(url,sort_order)";

export async function listProducts(line?: "shop" | "pro") {
  if (!hasDb()) {
    const all = [...mockProducts.filter((p) => p.line === "shop"), ...proProducts];
    return all
      .filter((p) => !line || p.line === line)
      .map((p) => ({
        id: `demo_${p.slug}`,
        slug: p.slug,
        name: p.name,
        line: p.line,
        pro_category: p.proCategory ?? null,
        price_grosze: Math.round(p.price * 100),
        in_stock: p.inStock,
        active: true,
        bestseller: p.bestsellerRank != null,
        badges: p.badges,
        category: p.line === "pro" ? p.proCategory : p.category,
        variants: p.variants.length,
        image: p.images[0],
      }));
  }
  let q = db().from("products").select(PROD_COLS).order("sort_order", { ascending: true });
  if (line) q = q.eq("line", line);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, patch: Record<string, unknown>) {
  const allowed = [
    "name",
    "line",
    "pro_category",
    "category_id",
    "price_grosze",
    "sale_price_grosze",
    "in_stock",
    "stock_qty",
    "active",
    "bestseller",
    "bestseller_rank",
    "badges",
    "short_description",
    "description",
    "tagline",
    "sort_order",
  ];
  const clean: Record<string, unknown> = {};
  for (const k of allowed) if (k in patch) clean[k] = patch[k];
  const { data, error } = await db().from("products").update(clean).eq("id", id).select("id").single();
  if (error) throw error;
  return data;
}

export async function createProduct(input: Record<string, unknown>) {
  const { data, error } = await db()
    .from("products")
    .insert({
      slug: input.slug,
      name: input.name,
      line: input.line ?? "shop",
      pro_category: input.pro_category ?? null,
      category_id: input.category_id ?? null,
      price_grosze: input.price_grosze ?? 0,
      short_description: input.short_description ?? null,
      description: input.description ?? null,
      active: input.active ?? true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await db().from("products").delete().eq("id", id);
  if (error) throw error;
}

// ---------- KATEGORIE ----------
export async function listCategories(line?: "shop" | "pro") {
  if (!hasDb()) return [];
  let q = db().from("categories").select("id,slug,name,tagline,line,sort_order").order("sort_order");
  if (line) q = q.eq("line", line);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
export async function createCategory(input: Record<string, unknown>) {
  const { data, error } = await db().from("categories").insert(input).select("id").single();
  if (error) throw error;
  return data;
}
export async function updateCategory(id: string, patch: Record<string, unknown>) {
  const { error } = await db().from("categories").update(patch).eq("id", id);
  if (error) throw error;
}
export async function deleteCategory(id: string) {
  const { error } = await db().from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ---------- PROMOCJE ----------
export async function listPromotions() {
  if (!hasDb()) return [];
  const { data, error } = await db()
    .from("promotions")
    .select("id,code,name,kind,value,min_order_grosze,active,starts_at,ends_at,usage_limit,used_count")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
export async function createPromotion(input: Record<string, unknown>) {
  const { data, error } = await db().from("promotions").insert(input).select("id").single();
  if (error) throw error;
  return data;
}
export async function updatePromotion(id: string, patch: Record<string, unknown>) {
  const { error } = await db().from("promotions").update(patch).eq("id", id);
  if (error) throw error;
}
export async function deletePromotion(id: string) {
  const { error } = await db().from("promotions").delete().eq("id", id);
  if (error) throw error;
}

// ---------- ZAMÓWIENIA ----------
export async function listOrders(status?: string) {
  if (!hasDb()) return [];
  let q = db()
    .from("orders")
    .select("id,number,email,line,status,payment_status,total_grosze,shipping_method,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
export async function getOrder(id: string) {
  const { data, error } = await db()
    .from("orders")
    .select("*,order_items(name,slug,variant_sku,qty,price_grosze,image_url,config)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
export async function updateOrder(id: string, patch: Record<string, unknown>) {
  const allowed = ["status", "payment_status", "tracking_number", "notes"];
  const clean: Record<string, unknown> = {};
  for (const k of allowed) if (k in patch) clean[k] = patch[k];
  const { error } = await db().from("orders").update(clean).eq("id", id);
  if (error) throw error;
}

// ---------- USTAWIENIA ----------
export async function getSettingsStore() {
  if (!hasDb()) return { free_shipping_grosze: 14900, currency: "PLN", open: true };
  const { data } = await db().from("settings").select("value").eq("key", "store").maybeSingle();
  return (data?.value as Record<string, unknown>) ?? { free_shipping_grosze: 14900, currency: "PLN", open: true };
}
export async function putSettingsStore(value: Record<string, unknown>) {
  const { error } = await db().from("settings").upsert({ key: "store", value }).eq("key", "store");
  if (error) throw error;
}

// ---------- STATYSTYKI ----------
export async function stats() {
  if (!hasDb()) return { orders: 0, revenueGrosze: 0, paid: 0, pending: 0, products: 0 };
  const c = db();
  const [ordersRes, paidRes] = await Promise.all([
    c.from("orders").select("total_grosze,status,payment_status", { count: "exact" }),
    c.from("orders").select("total_grosze").eq("payment_status", "paid"),
  ]);
  const orders = ordersRes.data ?? [];
  const revenueGrosze = (paidRes.data ?? []).reduce((s, o) => s + ((o as { total_grosze: number }).total_grosze ?? 0), 0);
  const paid = orders.filter((o) => (o as { payment_status: string }).payment_status === "paid").length;
  const pending = orders.filter((o) => (o as { status: string }).status === "pending").length;
  const { count: products } = await c.from("products").select("id", { count: "exact", head: true });
  return { orders: ordersRes.count ?? orders.length, revenueGrosze, paid, pending, products: products ?? 0 };
}
