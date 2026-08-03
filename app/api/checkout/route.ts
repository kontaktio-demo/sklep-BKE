import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { resolveCart } from "@/lib/server/catalog-resolve";
import { getStoreSettings } from "@/lib/server/settings";
import { SHIPPING, evaluatePromo, isShippingMethod, shippingGrosze, type PromoRow } from "@/lib/server/pricing";
import { createOrder, genOrderNumber, upsertCustomer } from "@/lib/server/order";
import { createPaymentIntent } from "@/lib/server/stripe";
import { getCustomerFromRequest } from "@/lib/server/customerAuth";
import { checkRate } from "@/lib/server/rateLimit";
import { getUserLocale } from "@/i18n/locale";

const Item = z.object({
  slug: z.string().min(1),
  variant_sku: z.string().nullable().optional(),
  qty: z.number().int().positive().max(99),
  color: z.string().nullable().optional(),
});
const Address = z
  .object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    street: z.string().optional(),
    building: z.string().optional(),
    apartment: z.string().optional(),
    postal_code: z.string().optional(),
    city: z.string().optional(),
  })
  .optional();
const Body = z.object({
  items: z.array(Item).min(1),
  email: z.string().email(),
  phone: z.string().trim().min(6).max(20).optional().nullable(),
  shipping_method: z.string(),
  shipping_address: Address,
  parcel_locker: z.string().nullable().optional(),
  promo_code: z.string().trim().max(64).nullable().optional(),
  line: z.enum(["shop", "pro"]).optional(),
});

export async function POST(req: Request) {
  const limited = checkRate(req, "checkout", 12, 60); // maks. 12 zamówień / min / IP (anty-flood)
  if (limited) return limited;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
  const body = parsed.data;

  if (!isShippingMethod(body.shipping_method)) {
    return NextResponse.json({ ok: false, error: "BAD_SHIPPING" }, { status: 400 });
  }
  const method = body.shipping_method;
  const def = SHIPPING[method];
  if (def.needsLocker && !body.parcel_locker) {
    return NextResponse.json({ ok: false, error: "LOCKER_REQUIRED" }, { status: 400 });
  }
  if (def.needsAddress && !body.shipping_address?.street) {
    return NextResponse.json({ ok: false, error: "ADDRESS_REQUIRED" }, { status: 400 });
  }

  // 1) Wycena z ZAUFANEGO źródła (baza/mock) — nie z klienta. Nazwy pozycji w języku klienta.
  const locale = await getUserLocale();
  const lines = await resolveCart(body.items, locale);
  if (lines.length === 0) return NextResponse.json({ ok: false, error: "EMPTY_CART" }, { status: 400 });
  const subtotal = lines.reduce((s, l) => s + l.price_grosze * l.qty, 0);

  const settings = await getStoreSettings();
  if (!settings.open) return NextResponse.json({ ok: false, error: "STORE_CLOSED" }, { status: 409 });
  const shipping = shippingGrosze(method, subtotal, settings.free_shipping_grosze);

  // 2) Promocja (opcjonalna) — walidacja serwerowa.
  const db = supabaseAdmin();
  let discount = 0;
  let promoId: string | null = null;
  let promoCode: string | null = null;
  if (body.promo_code && db) {
    const { data } = await db
      .from("promotions")
      .select("id,code,kind,value,min_order_grosze,active,starts_at,ends_at,usage_limit,used_count")
      .eq("code", body.promo_code.toUpperCase())
      .maybeSingle();
    const res = evaluatePromo((data as PromoRow) ?? null, subtotal);
    if (res.ok) {
      discount = res.discountGrosze;
      promoId = (data as PromoRow).id;
      promoCode = (data as PromoRow).code;
    }
  }

  const total = subtotal - discount + shipping;
  const orderLine = body.line ?? lines[0]?.line ?? "shop";
  const number = genOrderNumber(orderLine);

  // 3) Bez bazy = tryb demo: pełny przepływ UI bez zapisu (do konfiguracji).
  if (!db) {
    return NextResponse.json({
      ok: true,
      demo: true,
      number,
      subtotal_grosze: subtotal,
      discount_grosze: discount,
      shipping_grosze: shipping,
      total_grosze: total,
    });
  }

  // 4) Zamówienie (atomowe, rezerwuje stan).
  const customer = await getCustomerFromRequest(req).catch(() => null);
  const customerId = await upsertCustomer(body.email, null, body.phone ?? null).catch(() => null);
  let orderId: string;
  try {
    const created = await createOrder({
      number,
      line: orderLine,
      email: body.email,
      phone: body.phone ?? null,
      customer_id: customerId,
      user_id: customer?.userId ?? null,
      subtotal_grosze: subtotal,
      discount_grosze: discount,
      shipping_grosze: shipping,
      total_grosze: total,
      promo_id: promoId,
      promo_code: promoCode,
      shipping_method: method,
      shipping_address: body.shipping_address ?? null,
      parcel_locker: body.parcel_locker ?? null,
      items: lines,
      locale,
    });
    orderId = created.order_id;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.startsWith("OUT_OF_STOCK")) return NextResponse.json({ ok: false, error: "OUT_OF_STOCK" }, { status: 409 });
    if (msg.includes("PROMO_EXHAUSTED")) return NextResponse.json({ ok: false, error: "PROMO_EXHAUSTED" }, { status: 409 });
    return NextResponse.json({ ok: false, error: "ORDER_FAILED" }, { status: 500 });
  }

  // 5) Płatność Stripe (jeśli skonfigurowana). total=0 → od razu opłacone.
  if (total === 0) {
    await db.from("orders").update({ status: "paid", payment_status: "paid", payment_provider: "free" }).eq("id", orderId);
    return NextResponse.json({ ok: true, number, total_grosze: 0, paid: true });
  }
  const pay = await createPaymentIntent({ amountGrosze: total, orderNumber: number, orderId, email: body.email }).catch(
    () => null
  );
  if (pay) {
    await db.from("orders").update({ payment_provider: "stripe", payment_ref: pay.paymentRef }).eq("id", orderId);
    return NextResponse.json({ ok: true, number, total_grosze: total, discount_grosze: discount, clientSecret: pay.clientSecret });
  }

  // Baza jest, ale brak Stripe — zamówienie czeka na konfigurację płatności.
  return NextResponse.json({ ok: true, number, total_grosze: total, discount_grosze: discount, payment: "unconfigured" });
}
