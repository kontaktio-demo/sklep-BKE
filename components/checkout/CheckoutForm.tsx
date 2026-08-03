"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/Button";
import { cn, formatPrice } from "@/lib/utils";

type Method = "inpost_locker" | "inpost_courier";
const METHODS: { id: Method; label: string; grosze: number; freeAbove: boolean; needsAddress: boolean; needsLocker: boolean }[] = [
  { id: "inpost_locker", label: "Paczkomat InPost", grosze: 1699, freeAbove: true, needsAddress: false, needsLocker: true },
  { id: "inpost_courier", label: "Kurier InPost", grosze: 2999, freeAbove: true, needsAddress: true, needsLocker: false },
];
const INPUT = "h-11 w-full rounded-[2px] border border-nf-control bg-nf-elevated px-3 text-sm text-nf-text";
const LABEL = "type-label mb-1.5 block text-nf-dim";

export function CheckoutForm() {
  const router = useRouter();
  const { lines, subtotal, clearCart } = useCart();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<Method>("inpost_locker");
  const [locker, setLocker] = useState("");
  const [addr, setAddr] = useState({ first_name: "", last_name: "", street: "", building: "", apartment: "", postal_code: "", city: "" });
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState<string | null>(null);
  const [freeThreshold, setFreeThreshold] = useState(14900);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/settings/public")
      .then((r) => r.json())
      .then((d) => typeof d.freeShippingGrosze === "number" && setFreeThreshold(d.freeShippingGrosze))
      .catch(() => {});
  }, []);

  const subtotalG = Math.round(subtotal * 100);
  const chosen = METHODS.find((m) => m.id === method)!;
  const shippingG = chosen.freeAbove && subtotalG >= freeThreshold ? 0 : chosen.grosze;
  const totalG = Math.max(0, subtotalG - discount + shippingG);
  const line = lines[0]?.product.line ?? "shop";

  const applyPromo = async () => {
    setPromoMsg(null);
    if (!promo.trim()) return;
    const res = await fetch("/api/promo/validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: promo.trim(), subtotal_grosze: subtotalG }),
    }).then((r) => r.json());
    if (res.ok) {
      setDiscount(res.discountGrosze);
      setPromoMsg(`Kod zastosowany: -${formatPrice(res.discountGrosze / 100)}`);
    } else {
      setDiscount(0);
      setPromoMsg(res.message ?? "Nieprawidłowy kod.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (lines.length === 0) return;
    setBusy(true);
    const items = lines.map((l) => ({ slug: l.product.slug, variant_sku: l.variant.sku, qty: l.qty, color: l.color?.name ?? null }));
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items,
        email: email.trim(),
        phone: phone.trim() || null,
        shipping_method: method,
        shipping_address: chosen.needsAddress ? addr : undefined,
        parcel_locker: chosen.needsLocker ? locker.trim() : null,
        promo_code: promo.trim() || null,
        line,
      }),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "NETWORK" }));
    setBusy(false);

    if (!res.ok) {
      const map: Record<string, string> = {
        OUT_OF_STOCK: "Któregoś rozmiaru zabrakło w magazynie.",
        STORE_CLOSED: "Sklep jest chwilowo zamknięty.",
        ADDRESS_REQUIRED: "Uzupełnij adres dostawy.",
        LOCKER_REQUIRED: "Wybierz paczkomat.",
      };
      setError(map[res.error as string] ?? "Nie udało się złożyć zamówienia. Spróbuj ponownie.");
      return;
    }
    if (res.clientSecret) {
      sessionStorage.setItem("dogstore-pay", JSON.stringify({ clientSecret: res.clientSecret, number: res.number, total: res.total_grosze }));
      router.push("/kasa/platnosc");
      return;
    }
    clearCart();
    router.push(`/kasa/dziekujemy?order=${encodeURIComponent(res.number)}`);
  };

  const summary = useMemo(
    () => (
      <div className="rounded-[3px] border border-nf-border bg-nf-elevated p-5">
        <h2 className="type-h3 text-nf-white">Podsumowanie</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-3 text-nf-muted">
              <span>
                {l.product.name} · {l.variant.size.toUpperCase()}
                {l.color ? ` · ${l.color.name}` : ""} × {l.qty}
              </span>
              <span className="tabular-nums text-nf-text">{formatPrice(l.variant.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1.5 border-t border-nf-border pt-4 text-sm">
          <Row label="Wartość" value={formatPrice(subtotalG / 100)} />
          {discount > 0 && <Row label="Rabat" value={`-${formatPrice(discount / 100)}`} />}
          <Row label="Dostawa" value={shippingG === 0 ? "gratis" : formatPrice(shippingG / 100)} />
          <div className="flex justify-between pt-2 text-base font-semibold text-nf-white">
            <span>Razem</span>
            <span className="tabular-nums">{formatPrice(totalG / 100)}</span>
          </div>
        </div>
      </div>
    ),
    [lines, subtotalG, discount, shippingG, totalG]
  );

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-20 text-center">
        <h1 className="type-h1 text-nf-white">Koszyk jest pusty</h1>
        <p className="mt-3 text-nf-muted">Dodaj produkty, aby przejść do kasy.</p>
        <Button href="/collections/collars" className="mt-6">
          Przejdź do sklepu
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-[1100px] gap-8 px-4 py-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <section>
          <h2 className="type-h3 text-nf-white">Dane kontaktowe</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>E-mail</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Telefon</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="type-h3 text-nf-white">Dostawa</h2>
          <div className="mt-4 space-y-2">
            {METHODS.map((m) => {
              const free = m.freeAbove && subtotalG >= freeThreshold;
              return (
                <label
                  key={m.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-[2px] border px-4 py-3 text-sm",
                    method === m.id ? "border-nf-white bg-nf-elevated" : "border-nf-border"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-[var(--color-nf-red)]" />
                    <span className="text-nf-text">{m.label}</span>
                  </span>
                  <span className="tabular-nums text-nf-muted">{free ? "gratis" : formatPrice(m.grosze / 100)}</span>
                </label>
              );
            })}
          </div>

          {chosen.needsLocker && (
            <div className="mt-4">
              <label className={LABEL}>Kod paczkomatu</label>
              <input value={locker} onChange={(e) => setLocker(e.target.value)} placeholder="np. KRA010" required className={INPUT} />
            </div>
          )}
          {chosen.needsAddress && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Imię" v={addr.first_name} on={(v) => setAddr({ ...addr, first_name: v })} />
              <Field label="Nazwisko" v={addr.last_name} on={(v) => setAddr({ ...addr, last_name: v })} />
              <Field label="Ulica" v={addr.street} on={(v) => setAddr({ ...addr, street: v })} required />
              <Field label="Nr domu / mieszkania" v={addr.building} on={(v) => setAddr({ ...addr, building: v })} />
              <Field label="Kod pocztowy" v={addr.postal_code} on={(v) => setAddr({ ...addr, postal_code: v })} />
              <Field label="Miasto" v={addr.city} on={(v) => setAddr({ ...addr, city: v })} required />
            </div>
          )}
        </section>

        <section>
          <h2 className="type-h3 text-nf-white">Kod rabatowy</h2>
          <div className="mt-3 flex gap-3">
            <input value={promo} onChange={(e) => setPromo(e.target.value)} className={INPUT} placeholder="Kod" />
            <Button type="button" variant="ghost" onClick={applyPromo}>
              Zastosuj
            </Button>
          </div>
          {promoMsg && <p className="mt-2 text-xs text-nf-muted">{promoMsg}</p>}
        </section>

        {error && <p className="rounded-[2px] border border-nf-red/40 bg-nf-red/10 px-4 py-3 text-sm text-nf-red-bright">{error}</p>}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {summary}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Przetwarzanie…" : `Zamawiam i płacę · ${formatPrice(totalG / 100)}`}
        </Button>
        <p className="text-center text-xs text-nf-dim">Płatność: karta, BLIK, Przelewy24 (Stripe).</p>
      </aside>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-nf-muted">
      <span>{label}</span>
      <span className="tabular-nums text-nf-text">{value}</span>
    </div>
  );
}
function Field({ label, v, on, required }: { label: string; v: string; on: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input value={v} onChange={(e) => on(e.target.value)} required={required} className={INPUT} />
    </div>
  );
}
