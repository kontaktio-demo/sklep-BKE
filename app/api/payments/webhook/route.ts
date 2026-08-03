import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { SERVER } from "@/lib/env";
import { getStripe } from "@/lib/server/stripe";
import { supabaseAdmin } from "@/lib/supabase/server";
import { markOrderPaid, refundOrder, releaseOrder } from "@/lib/server/order";
import { sendOrderConfirmation } from "@/lib/server/email";
import { notifyPanel } from "@/lib/server/push";
import { sendPurchase } from "@/lib/server/metaCapi";

// Stripe wymaga surowego body (weryfikacja podpisu) — dlatego req.text(), nie json().
export const dynamic = "force-dynamic";

async function finalizePaid(orderId: string) {
  const db = supabaseAdmin();
  if (!db) return;
  const { data: order } = await db
    .from("orders")
    .select("id,number,email,payment_status,subtotal_grosze,shipping_grosze,discount_grosze,total_grosze,meta_tracking,locale")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.payment_status === "paid") return;

  await markOrderPaid(orderId, null);
  const { data: items } = await db.from("order_items").select("name,qty,price_grosze").eq("order_id", orderId);

  await Promise.all([
    sendOrderConfirmation({
      to: order.email as string,
      number: order.number as string,
      items: (items ?? []) as { name: string; qty: number; price_grosze: number }[],
      subtotal_grosze: order.subtotal_grosze as number,
      shipping_grosze: order.shipping_grosze as number,
      discount_grosze: order.discount_grosze as number,
      total_grosze: order.total_grosze as number,
      locale: (order.locale as "pl" | "en") ?? "pl",
    }),
    notifyPanel("Nowe zamówienie", `${order.number} · ${((order.total_grosze as number) / 100).toFixed(2)} zł`),
    sendPurchase({
      orderNumber: order.number as string,
      email: order.email as string,
      valueGrosze: order.total_grosze as number,
      meta: (order.meta_tracking as { fbp?: string; fbc?: string } | null) ?? null,
    }),
  ]);
}

async function orderIdByPaymentRef(ref: string): Promise<string | null> {
  const db = supabaseAdmin();
  if (!db) return null;
  const { data } = await db.from("orders").select("id").eq("payment_ref", ref).maybeSingle();
  return (data?.id as string) ?? null;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  if (!stripe || !SERVER.stripeWebhookSecret || !sig) {
    return NextResponse.json({ ok: false, error: "STRIPE_NOT_CONFIGURED" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, SERVER.stripeWebhookSecret);
  } catch {
    return NextResponse.json({ ok: false, error: "BAD_SIGNATURE" }, { status: 400 });
  }

  // Idempotencja: każde zdarzenie przetwarzamy dokładnie raz.
  const db = supabaseAdmin();
  if (db) {
    const { error } = await db.from("stripe_events").insert({ id: event.id });
    if (error) return NextResponse.json({ ok: true, duplicate: true }); // konflikt PK = już obsłużone
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = (pi.metadata?.order_id as string) || (await orderIdByPaymentRef(pi.id));
        if (orderId) await finalizePaid(orderId);
        break;
      }
      case "payment_intent.payment_failed":
      case "payment_intent.canceled": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = (pi.metadata?.order_id as string) || (await orderIdByPaymentRef(pi.id));
        if (orderId) await releaseOrder(orderId);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const ref = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        const orderId = ref ? await orderIdByPaymentRef(ref) : null;
        if (orderId) await refundOrder(orderId);
        break;
      }
    }
  } catch {
    return NextResponse.json({ ok: false, error: "HANDLER_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
