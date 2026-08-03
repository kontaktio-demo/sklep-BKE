import { NextResponse } from "next/server";

/**
 * Lekki limiter częstotliwości per-IP (okno stałe, w pamięci procesu).
 *
 * Uwaga o skali: na Vercel (serverless) pamięć trwa w obrębie CIEPŁEJ instancji, więc limiter
 * działa najlepiej przeciw seriom żądań z jednej instancji i jako pierwsza bariera anty-abuse.
 * Backend można podmienić na współdzielony store (Upstash / Vercel KV) bez zmiany wywołań —
 * wystarczy zamienić implementację `hit()`. To realna ochrona: mail przez Resend (contact/
 * newsletter), enumeracja kodów (promo), masowe zamówienia (checkout).
 */
type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number) {
  // sprzątanie wygasłych kluczy co najwyżej raz na minutę, żeby Map nie rosła w nieskończoność
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of store) if (b.resetAt <= now) store.delete(k);
}

/** Adres klienta z nagłówków proxy (Vercel ustawia x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

export interface RateLimitResult {
  ok: boolean;
  retryAfter: number; // sekundy do zresetowania okna
}

/** Zlicza żądanie w oknie. Zwraca ok=false po przekroczeniu limitu. */
export function hit(key: string, limit: number, windowSec: number): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const b = store.get(key);
  if (!b || b.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true, retryAfter: 0 };
  }
  b.count += 1;
  if (b.count > limit) return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  return { ok: true, retryAfter: 0 };
}

/**
 * Sprawdza limit dla żądania w danym „koszyku" (np. "contact"). Zwraca null gdy OK,
 * albo gotową odpowiedź 429 (z nagłówkiem Retry-After) gdy limit przekroczony.
 */
export function checkRate(
  req: Request,
  bucket: string,
  limit: number,
  windowSec: number,
): NextResponse | null {
  const res = hit(`${bucket}:${clientIp(req)}`, limit, windowSec);
  if (res.ok) return null;
  return NextResponse.json(
    { ok: false, error: "RATE_LIMITED" },
    { status: 429, headers: { "Retry-After": String(res.retryAfter) } },
  );
}
