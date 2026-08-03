import "server-only";
import Stripe from "stripe";
import { SERVER, hasStripe } from "@/lib/env";

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!hasStripe()) return null;
  if (cached) return cached;
  // Bez pinowania apiVersion — SDK używa swojej domyślnej (uniknięcie łamania typu przy aktualizacjach).
  cached = new Stripe(SERVER.stripeSecret);
  return cached;
}

/**
 * PaymentIntent dla płatności wbudowanej (PaymentElement: karta / BLIK / Przelewy24).
 * Kwota w groszach. Metadane niosą numer zamówienia (dedup w webhooku).
 */
export async function createPaymentIntent(params: {
  amountGrosze: number;
  orderNumber: string;
  orderId: string;
  email: string;
}): Promise<{ clientSecret: string; paymentRef: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;
  const pi = await stripe.paymentIntents.create({
    amount: params.amountGrosze,
    currency: "pln",
    receipt_email: params.email,
    automatic_payment_methods: { enabled: true },
    metadata: { order_number: params.orderNumber, order_id: params.orderId },
    description: `Zamówienie ${params.orderNumber} — Dog Store`,
  });
  return { clientSecret: pi.client_secret ?? "", paymentRef: pi.id };
}
