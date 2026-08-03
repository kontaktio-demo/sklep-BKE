"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/Button";
import { LockerPicker } from "./LockerPicker";
import { cn, formatPrice } from "@/lib/utils";

type Method = "inpost_locker" | "inpost_courier";
const METHODS: { id: Method; label: string; grosze: number; freeAbove: boolean; needsAddress: boolean; needsLocker: boolean }[] = [
  { id: "inpost_locker", label: "shipping.methods.inpost_locker", grosze: 1699, freeAbove: true, needsAddress: false, needsLocker: true },
  { id: "inpost_courier", label: "shipping.methods.inpost_courier", grosze: 2999, freeAbove: true, needsAddress: true, needsLocker: false },
];
const INPUT = "h-11 w-full rounded-[2px] border border-nf-control bg-nf-elevated px-3 text-sm text-nf-text";
const LABEL = "type-label mb-1.5 block text-nf-dim";

export function CheckoutForm() {
  const router = useRouter();
  const t = useTranslations("checkout");
  const locale = useLocale();
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
      setPromoMsg(t("promo.applied", { amount: formatPrice(res.discountGrosze / 100) }));
    } else {
      setDiscount(0);
      setPromoMsg(res.message ?? t("promo.invalid"));
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
        OUT_OF_STOCK: t("errors.OUT_OF_STOCK"),
        STORE_CLOSED: t("errors.STORE_CLOSED"),
        ADDRESS_REQUIRED: t("errors.ADDRESS_REQUIRED"),
        LOCKER_REQUIRED: t("errors.LOCKER_REQUIRED"),
      };
      setError(map[res.error as string] ?? t("errors.generic"));
      return;
    }
    // Rabat mógł stracić ważność między walidacją a złożeniem — pokaż zaktualizowaną kwotę,
    // zanim przejdziemy do płatności (klient nie zapłaci więcej „po cichu").
    const applied = typeof res.discount_grosze === "number" ? res.discount_grosze : discount;
    if (discount > 0 && applied < discount) {
      setDiscount(applied);
      setPromoMsg(t("promo.rejected"));
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
        <h2 className="type-h3 text-nf-white">{t("summary.title")}</h2>
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
          <Row label={t("summary.value")} value={formatPrice(subtotalG / 100)} />
          {discount > 0 && <Row label={t("summary.discount")} value={`-${formatPrice(discount / 100)}`} />}
          <Row label={t("summary.shipping")} value={shippingG === 0 ? t("shipping.free") : formatPrice(shippingG / 100)} />
          <div className="flex justify-between pt-2 text-base font-semibold text-nf-white">
            <span>{t("summary.total")}</span>
            <span className="tabular-nums">{formatPrice(totalG / 100)}</span>
          </div>
        </div>
      </div>
    ),
    [lines, subtotalG, discount, shippingG, totalG, t]
  );

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-20 text-center">
        <h1 className="type-h1 text-nf-white">{t("empty.title")}</h1>
        <p className="mt-3 text-nf-muted">{t("empty.text")}</p>
        <Button href="/collections/collars" className="mt-6">
          {t("empty.cta")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-[1100px] gap-8 px-4 py-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <section>
          <h2 className="type-h3 text-nf-white">{t("contact.title")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>{t("contact.email")}</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>{t("contact.phone")}</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="type-h3 text-nf-white">{t("shipping.title")}</h2>
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
                    <span className="text-nf-text">{t(m.label)}</span>
                  </span>
                  <span className="tabular-nums text-nf-muted">{free ? t("shipping.free") : formatPrice(m.grosze / 100)}</span>
                </label>
              );
            })}
          </div>

          {chosen.needsLocker && (
            <div className="mt-4">
              <label className={LABEL}>{t("shipping.lockerLabel")}</label>
              <LockerPicker
                value={locker}
                onChange={setLocker}
                locale={locale}
                inputClass={INPUT}
                placeholder={t("shipping.lockerPlaceholder")}
                chosenLabel={t("shipping.lockerChosen")}
              />
            </div>
          )}
          {chosen.needsAddress && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t("address.firstName")} v={addr.first_name} on={(v) => setAddr({ ...addr, first_name: v })} />
              <Field label={t("address.lastName")} v={addr.last_name} on={(v) => setAddr({ ...addr, last_name: v })} />
              <Field label={t("address.street")} v={addr.street} on={(v) => setAddr({ ...addr, street: v })} required />
              <Field label={t("address.building")} v={addr.building} on={(v) => setAddr({ ...addr, building: v })} />
              <Field label={t("address.postalCode")} v={addr.postal_code} on={(v) => setAddr({ ...addr, postal_code: v })} />
              <Field label={t("address.city")} v={addr.city} on={(v) => setAddr({ ...addr, city: v })} required />
            </div>
          )}
        </section>

        <section>
          <h2 className="type-h3 text-nf-white">{t("promo.title")}</h2>
          <div className="mt-3 flex gap-3">
            <input value={promo} onChange={(e) => setPromo(e.target.value)} className={INPUT} placeholder={t("promo.placeholder")} />
            <Button type="button" variant="ghost" onClick={applyPromo}>
              {t("promo.apply")}
            </Button>
          </div>
          {promoMsg && <p className="mt-2 text-xs text-nf-muted">{promoMsg}</p>}
        </section>

        {error && <p className="rounded-[2px] border border-nf-red/40 bg-nf-red/10 px-4 py-3 text-sm text-nf-red-bright">{error}</p>}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {summary}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? t("submit.processing") : t("submit.pay", { amount: formatPrice(totalG / 100) })}
        </Button>
        <p className="text-center text-xs text-nf-dim">{t("submit.note")}</p>
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
