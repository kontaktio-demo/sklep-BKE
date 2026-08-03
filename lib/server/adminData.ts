import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { products as mockProducts } from "@/lib/data/products.mock";
import { proProducts } from "@/lib/data/pro.mock";
import { createShipment, fetchLabel, inpostConfigured } from "./inpost";

/**
 * Dane dla panelu. Zapisy wymagają bazy; część odczytów ma fallback na katalog wbudowany,
 * żeby panel działał także przed połączeniem bazy (tryb podglądu, tylko do odczytu).
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

// Pełny produkt (do edytora w panelu): pola + warianty + zdjęcia + kategoria.
export async function getProductFull(id: string) {
  const { data, error } = await db()
    .from("products")
    .select("*,product_variants(*),product_images(*),categories(slug,name)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface VariantInput {
  size?: string | null;
  sku: string;
  price_grosze: number;
  stock_qty?: number | null;
  in_stock?: boolean;
  neck?: string | null;
  weight_grams?: number | null;
}

const PRODUCT_FIELDS = [
  "name",
  "slug",
  "line",
  "pro_category",
  "category_id",
  "price_grosze",
  "sale_price_grosze",
  "currency",
  "tagline",
  "short_description",
  "description",
  "details",
  "highlights",
  "badges",
  "colors",
  "width",
  "collar_type",
  "id_panel_compatible",
  "pro_standard",
  "bestseller",
  "bestseller_rank",
  "in_stock",
  "stock_qty",
  "active",
  "sort_order",
  "bundle_config",
];

/** Zapis produktu z panelu: pola + warianty (upsert po SKU, kasowanie usuniętych). */
export async function saveProductFull(id: string | null, input: Record<string, unknown>) {
  const c = db();
  const fields: Record<string, unknown> = {};
  for (const k of PRODUCT_FIELDS) if (k in input) fields[k] = input[k];

  let productId = id;
  if (!productId) {
    if (!fields.slug || !fields.name) throw new Error("SLUG_NAME_REQUIRED");
    const { data, error } = await c.from("products").insert(fields).select("id").single();
    if (error) throw error;
    productId = data.id as string;
  } else if (Object.keys(fields).length) {
    const { error } = await c.from("products").update(fields).eq("id", productId);
    if (error) throw error;
  }

  const variants = input.variants as VariantInput[] | undefined;
  if (variants) {
    const skus = variants.map((v) => v.sku);
    const { data: existing } = await c.from("product_variants").select("id,sku").eq("product_id", productId);
    const toDelete = (existing ?? []).filter((v) => !skus.includes((v as { sku: string }).sku)).map((v) => (v as { id: string }).id);
    if (toDelete.length) await c.from("product_variants").delete().in("id", toDelete);
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const { error } = await c.from("product_variants").upsert(
        {
          product_id: productId,
          size: v.size ?? null,
          sku: v.sku,
          price_grosze: v.price_grosze,
          stock_qty: v.stock_qty ?? null,
          in_stock: v.in_stock ?? true,
          neck: v.neck ?? null,
          weight_grams: v.weight_grams ?? null,
          sort_order: i,
        },
        { onConflict: "sku" }
      );
      if (error) throw error;
    }
  }
  return { id: productId };
}

// Zdjęcia produktu (Supabase Storage: bucket product-images).
const BUCKET = "product-images";

export async function addProductImage(productId: string, file: ArrayBuffer, contentType: string, name: string) {
  const c = db();
  const ext = (contentType.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const up = await c.storage.from(BUCKET).upload(path, Buffer.from(file), { contentType, upsert: false });
  if (up.error) throw up.error;
  const { data: pub } = c.storage.from(BUCKET).getPublicUrl(path);
  const { count } = await c.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", productId);
  const { error } = await c
    .from("product_images")
    .insert({ product_id: productId, url: pub.publicUrl, storage_path: path, alt: name, sort_order: count ?? 0 });
  if (error) throw error;
  return { url: pub.publicUrl, path };
}

export async function deleteProductImage(imageId: string) {
  const c = db();
  const { data } = await c.from("product_images").select("storage_path").eq("id", imageId).maybeSingle();
  if (data?.storage_path) await c.storage.from(BUCKET).remove([data.storage_path as string]);
  await c.from("product_images").delete().eq("id", imageId);
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

  // Po oznaczeniu jako dostarczone wysyłamy prośbę o opinię (link z tokenem, w języku klienta).
  if (clean.status === "delivered") {
    const { data: o } = await db()
      .from("orders")
      .select("email,number,review_token,locale")
      .eq("id", id)
      .maybeSingle();
    if (o?.email && o.review_token) {
      const { sendReviewRequest } = await import("./email");
      await sendReviewRequest({
        to: o.email as string,
        number: o.number as string,
        reviewToken: o.review_token as string,
        locale: (o.locale as "pl" | "en") ?? "pl",
      }).catch(() => {});
    }
  }
}

// ---------- WYSYŁKA (InPost ShipX) ----------
interface ShipmentEntry {
  id: string;
  tracking: string | null;
  status: string;
}

export function inpostReady(): boolean {
  return inpostConfigured();
}

/** Tworzy przesyłkę InPost dla zamówienia i zapisuje ją (shipments/shipping_ref/tracking, status=packed). */
export async function createOrderLabel(orderId: string): Promise<{ created: number; shipments: ShipmentEntry[] }> {
  if (!inpostConfigured()) throw new Error("INPOST_NOT_CONFIGURED");
  const c = db();
  const { data: o } = await c
    .from("orders")
    .select("id,number,email,phone,shipping_method,parcel_locker,shipping_address,shipping_ref,shipments")
    .eq("id", orderId)
    .maybeSingle();
  if (!o) throw new Error("ORDER_NOT_FOUND");

  const existing: ShipmentEntry[] = Array.isArray(o.shipments) ? (o.shipments as ShipmentEntry[]) : [];
  if (existing.length) return { created: 0, shipments: existing }; // już utworzona — nie dubluj

  const addr = (o.shipping_address ?? {}) as Record<string, string>;
  const method = o.shipping_method === "inpost_courier" ? "courier" : "locker";
  const shipment = await createShipment({
    method,
    reference: o.number as string,
    lockerCode: (o.parcel_locker as string) ?? null,
    receiver: {
      first_name: addr.first_name ?? "",
      last_name: addr.last_name ?? "",
      email: o.email as string,
      phone: (o.phone as string) ?? null,
      address: { street: addr.street, building_number: addr.building, city: addr.city, post_code: addr.postal_code },
    },
  });
  const next: ShipmentEntry[] = [{ id: shipment.id, tracking: shipment.tracking_number, status: shipment.status }];
  await c
    .from("orders")
    .update({ shipments: next, shipping_ref: shipment.id, tracking_number: shipment.tracking_number, status: "packed" })
    .eq("id", orderId);
  return { created: 1, shipments: next };
}

/** Pobiera etykietę PDF przesyłki zamówienia. */
export async function getOrderLabelPdf(orderId: string): Promise<Buffer | null> {
  const c = db();
  const { data: o } = await c.from("orders").select("shipping_ref,shipments").eq("id", orderId).maybeSingle();
  const list: ShipmentEntry[] = Array.isArray(o?.shipments) ? (o!.shipments as ShipmentEntry[]) : [];
  const sid = list[0]?.id ?? (o?.shipping_ref as string) ?? "";
  if (!sid) return null;
  return fetchLabel(String(sid));
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

// ---------- KLIENCI ----------
export async function listCustomers() {
  if (!hasDb()) return [];
  const { data } = await db()
    .from("customers")
    .select("id,email,name,phone,created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  return data ?? [];
}

// ---------- WIADOMOŚCI (formularz kontaktowy) ----------
export async function listMessages() {
  if (!hasDb()) return [];
  const { data } = await db()
    .from("contact_messages")
    .select("id,name,email,subject,message,created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  return data ?? [];
}
export async function deleteMessage(id: string) {
  const { error } = await db().from("contact_messages").delete().eq("id", id);
  if (error) throw error;
}

// ---------- NEWSLETTER (subskrybenci) ----------
export async function listSubscribers() {
  if (!hasDb()) return [];
  const { data } = await db()
    .from("newsletter_subscribers")
    .select("id,email,confirmed,consent_at,source,created_at")
    .order("created_at", { ascending: false })
    .limit(1000);
  return data ?? [];
}
export async function deleteSubscriber(id: string) {
  const { error } = await db().from("newsletter_subscribers").delete().eq("id", id);
  if (error) throw error;
}

// ---------- RECENZJE (moderacja) ----------
export async function listReviews() {
  if (!hasDb()) return [];
  const { data } = await db()
    .from("reviews")
    .select("id,author_name,rating,content,status,verified,created_at,products(name,slug)")
    .order("created_at", { ascending: false })
    .limit(500);
  return data ?? [];
}
export async function moderateReview(id: string, status: string) {
  const { error } = await db().from("reviews").update({ status }).eq("id", id);
  if (error) throw error;
}
export async function deleteReview(id: string) {
  const { error } = await db().from("reviews").delete().eq("id", id);
  if (error) throw error;
}
