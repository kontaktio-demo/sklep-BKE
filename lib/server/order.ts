import "server-only";
import { requireSupabaseAdmin } from "@/lib/supabase/server";
import type { ResolvedLine } from "./catalog-resolve";
import type { ShippingMethod } from "./pricing";

/** Numer zamówienia: DS- (sklep) / DSP- (Pro) + znacznik czasu i losowość. Unikat pilnuje baza. */
export function genOrderNumber(line: "shop" | "pro"): string {
  const prefix = line === "pro" ? "DSP" : "DS";
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `${prefix}-${t}${r}`;
}

/** Upsert klienta po e-mailu (bez natywnego on-conflict — unikat jest na lower(email)). */
export async function upsertCustomer(email: string, name: string | null, phone: string | null): Promise<string | null> {
  const db = requireSupabaseAdmin();
  const { data: existing } = await db.from("customers").select("id").ilike("email", email).maybeSingle();
  if (existing?.id) {
    await db.from("customers").update({ name, phone }).eq("id", existing.id);
    return existing.id as string;
  }
  const { data, error } = await db.from("customers").insert({ email, name, phone }).select("id").single();
  if (error) return null;
  return data.id as string;
}

export interface CreateOrderInput {
  number: string;
  line: "shop" | "pro";
  email: string;
  phone: string | null;
  customer_id: string | null;
  user_id: string | null;
  subtotal_grosze: number;
  discount_grosze: number;
  shipping_grosze: number;
  total_grosze: number;
  promo_id: string | null;
  promo_code: string | null;
  shipping_method: ShippingMethod;
  shipping_address: Record<string, unknown> | null;
  parcel_locker: string | null;
  items: ResolvedLine[];
}

/** Atomowe złożenie zamówienia przez RPC (rezerwuje stan, licznik promocji). */
export async function createOrder(input: CreateOrderInput): Promise<{ order_id: string; number: string }> {
  const db = requireSupabaseAdmin();
  const payload = {
    number: input.number,
    line: input.line,
    email: input.email,
    phone: input.phone ?? "",
    customer_id: input.customer_id ?? "",
    user_id: input.user_id ?? "",
    subtotal_grosze: input.subtotal_grosze,
    discount_grosze: input.discount_grosze,
    shipping_grosze: input.shipping_grosze,
    total_grosze: input.total_grosze,
    currency: "PLN",
    promo_id: input.promo_id ?? "",
    promo_code: input.promo_code ?? "",
    shipping_method: input.shipping_method,
    shipping_address: input.shipping_address,
    parcel_locker: input.parcel_locker ?? "",
    items: input.items.map((l) => ({
      product_id: l.product_id ?? "",
      variant_id: l.variant_id ?? "",
      slug: l.slug,
      name: l.name,
      variant_sku: l.variant_sku ?? "",
      price_grosze: l.price_grosze,
      qty: l.qty,
      image_url: l.image_url ?? "",
      config: l.config,
    })),
  };
  const { data, error } = await db.rpc("create_order", { p: payload });
  if (error) throw error;
  return data as { order_id: string; number: string };
}

export async function releaseOrder(orderId: string): Promise<void> {
  const db = requireSupabaseAdmin();
  await db.rpc("release_order", { p_order: orderId });
}

export async function refundOrder(orderId: string): Promise<void> {
  const db = requireSupabaseAdmin();
  await db.rpc("refund_order", { p_order: orderId });
}

export async function markOrderPaid(orderId: string, paymentRef: string | null): Promise<void> {
  const db = requireSupabaseAdmin();
  await db
    .from("orders")
    .update({ status: "paid", payment_status: "paid", payment_ref: paymentRef })
    .eq("id", orderId);
}
