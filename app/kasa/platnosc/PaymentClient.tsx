"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/Button";

/**
 * Płatność wbudowana (PaymentElement: karta / BLIK / Przelewy24) — jak w działającym sklepie.
 * clientSecret przychodzi z /api/checkout przez sessionStorage. Bez klucza publikowalnego
 * Stripe strona informuje o konfiguracji (płatność włączy się po uzupełnieniu ENV).
 */
const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (!pubKey) return null;
  if (!stripePromise) stripePromise = loadStripe(pubKey);
  return stripePromise;
}

interface Pending {
  clientSecret: string;
  number: string;
  total: number;
}

export function PaymentClient() {
  const router = useRouter();
  const t = useTranslations("checkout");
  const locale = useLocale();
  const [pending, setPending] = useState<Pending | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("dogstore-pay");
      if (raw) setPending(JSON.parse(raw) as Pending);
    } catch {
      // brak sesji płatności
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!pending) {
    return (
      <Wrap>
        <p className="text-nf-muted">{t("payment.noActive")}</p>
        <Button href="/koszyk" className="mt-4">
          {t("payment.backToCart")}
        </Button>
      </Wrap>
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return (
      <Wrap>
        <h1 className="type-h2 text-nf-white">{t("payment.orderNumber", { number: pending.number })}</h1>
        <p className="mt-3 text-nf-muted">{t("payment.notConfigured")}</p>
        <Button
          className="mt-6"
          onClick={() => {
            sessionStorage.removeItem("dogstore-pay");
            router.push(`/kasa/dziekujemy?order=${encodeURIComponent(pending.number)}`);
          }}
        >
          {t("payment.next")}
        </Button>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <h1 className="type-h2 text-nf-white">{t("payment.title")}</h1>
      <p className="mt-1 text-sm text-nf-muted">{t("payment.orderNumber", { number: pending.number })}</p>
      <div className="mt-6">
        {/* Stripe PaymentElement w języku klienta (pl/en) */}
        <Elements
          stripe={stripe}
          options={{ clientSecret: pending.clientSecret, locale: locale === "en" ? "en" : "pl" }}
        >
          <PayInner number={pending.number} />
        </Elements>
      </div>
    </Wrap>
  );
}

function PayInner({ number }: { number: string }) {
  const t = useTranslations("checkout");
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    const { error: err } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/kasa/dziekujemy?order=${encodeURIComponent(number)}` },
    });
    if (err) {
      setError(err.message ?? t("payment.failed"));
      setBusy(false);
    }
  };

  return (
    <div>
      <PaymentElement />
      {error && <p className="mt-3 text-sm text-nf-red-bright">{error}</p>}
      <Button className="mt-6 w-full" onClick={pay} disabled={busy}>
        {busy ? t("submit.processing") : t("payment.pay")}
      </Button>
    </div>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md px-4 py-16">{children}</div>;
}
