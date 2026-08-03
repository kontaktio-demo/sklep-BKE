import "server-only";

/**
 * Wycena po stronie serwera — NIGDY nie ufamy cenom z klienta (wzorzec z działającego
 * sklepu). Metody i koszty dostawy = realna konfiguracja DogStore (lib/nav.ts),
 * nie wartości ze źródła. Próg darmowej dostawy z ustawień sklepu (settings.store).
 */

export type ShippingMethod = "inpost_locker" | "inpost_courier" | "cod" | "eu";

export interface ShippingOptionDef {
  label: string;
  grosze: number;
  freeAbove: boolean; // czy powyżej progu darmowa
  needsAddress: boolean;
  needsLocker: boolean;
}

export const SHIPPING: Record<ShippingMethod, ShippingOptionDef> = {
  inpost_locker: { label: "Paczkomat InPost", grosze: 1299, freeAbove: true, needsAddress: false, needsLocker: true },
  inpost_courier: { label: "Kurier InPost", grosze: 1599, freeAbove: true, needsAddress: true, needsLocker: false },
  cod: { label: "Kurier za pobraniem", grosze: 1999, freeAbove: false, needsAddress: true, needsLocker: false },
  eu: { label: "Kurier, Unia Europejska", grosze: 3999, freeAbove: false, needsAddress: true, needsLocker: false },
};

export const DEFAULT_FREE_SHIPPING_GROSZE = 29900; // 299 zł (spójne z frontem)

export function isShippingMethod(v: unknown): v is ShippingMethod {
  return typeof v === "string" && v in SHIPPING;
}

export function shippingGrosze(
  method: ShippingMethod,
  subtotalGrosze: number,
  freeThresholdGrosze = DEFAULT_FREE_SHIPPING_GROSZE
): number {
  const def = SHIPPING[method];
  if (def.freeAbove && freeThresholdGrosze > 0 && subtotalGrosze >= freeThresholdGrosze) return 0;
  return def.grosze;
}

export interface PromoRow {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  value: number;
  min_order_grosze: number;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  used_count: number;
}

export type PromoError = "NOT_FOUND" | "INACTIVE" | "NOT_STARTED" | "EXPIRED" | "MIN_ORDER" | "EXHAUSTED";

/** Waliduje promocję względem koszyka. Zwraca zniżkę w groszach lub błąd. */
export function evaluatePromo(
  promo: PromoRow | null,
  subtotalGrosze: number,
  now = new Date()
): { ok: true; discountGrosze: number } | { ok: false; error: PromoError } {
  if (!promo) return { ok: false, error: "NOT_FOUND" };
  if (!promo.active) return { ok: false, error: "INACTIVE" };
  if (promo.starts_at && new Date(promo.starts_at) > now) return { ok: false, error: "NOT_STARTED" };
  if (promo.ends_at && new Date(promo.ends_at) < now) return { ok: false, error: "EXPIRED" };
  if (subtotalGrosze < promo.min_order_grosze) return { ok: false, error: "MIN_ORDER" };
  if (promo.usage_limit != null && promo.used_count >= promo.usage_limit) return { ok: false, error: "EXHAUSTED" };

  const raw = promo.kind === "percent" ? Math.round((subtotalGrosze * promo.value) / 100) : promo.value;
  const discountGrosze = Math.max(0, Math.min(raw, subtotalGrosze));
  return { ok: true, discountGrosze };
}
