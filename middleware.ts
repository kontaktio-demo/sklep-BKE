import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE } from "@/i18n/config";

/**
 * Middleware łączy dwie rzeczy:
 *
 * 1. JĘZYK PRZEZ PREFIKS /en (SEO): adres /en/... jest przepisywany na tę samą stronę
 *    renderowaną w języku angielskim (widoczny URL się nie zmienia). Wybór języka
 *    utrwalamy w cookie i przekazujemy do renderu nagłówkiem `x-dogstore-locale`.
 *    Publiczną ścieżkę (z ew. /en) podajemy nagłówkiem `x-dogstore-path` — z niej
 *    root layout buduje canonical + hreflang.
 *
 * 2. TRYB „SKLEP ZAMKNIĘTY": gdy w ustawieniach open=false, trasy zakupowe idą na
 *    /wkrotce. Ustawienie z krótkim cache (30 s) i FAIL-OPEN (błąd => sklep działa).
 */
const TTL_MS = 30_000;
let cache: { open: boolean; ts: number } | null = null;

async function storeOpen(origin: string): Promise<boolean> {
  if (cache && Date.now() - cache.ts < TTL_MS) return cache.open;
  try {
    const res = await fetch(`${origin}/api/settings/public`, { cache: "no-store" });
    const data = (await res.json()) as { open?: boolean };
    const open = data.open !== false;
    cache = { open, ts: Date.now() };
    return open;
  } catch {
    return true; // fail-open — nigdy nie blokujemy sklepu z powodu błędu ustawień
  }
}

// Trasy objęte trybem „sklep zamknięty" (po zdjęciu prefiksu językowego).
const SHOP_RE = /^\/(collections|products|koszyk|kasa|pro|szukaj)(\/|$)/;

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // 1. Prefiks językowy
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const locale: "pl" | "en" = isEn ? "en" : "pl";
  const internalPath = isEn ? pathname.slice(3) || "/" : pathname;

  const headers = new Headers(req.headers);
  headers.set("x-dogstore-locale", locale);
  headers.set("x-dogstore-path", pathname);

  // 2. Sklep zamknięty — tylko trasy zakupowe (sprawdzamy ścieżkę bez prefiksu)
  if (SHOP_RE.test(internalPath) && !(await storeOpen(url.origin))) {
    const to = url.clone();
    to.pathname = "/wkrotce";
    return NextResponse.rewrite(to, { request: { headers } });
  }

  // 3. Rewrite prefiksu /en → ścieżka wewnętrzna; poza tym przepuść z nagłówkami
  let res: NextResponse;
  if (internalPath !== pathname) {
    const to = url.clone();
    to.pathname = internalPath;
    res = NextResponse.rewrite(to, { request: { headers } });
  } else {
    res = NextResponse.next({ request: { headers } });
  }

  // Utrwal wybór EN wynikający z prefiksu URL (żeby nawigacja klientem trzymała język).
  if (isEn) {
    res.cookies.set(LOCALE_COOKIE, "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return res;
}

// Middleware na wszystkich trasach stron oprócz API, zasobów Next, panelu i plików z rozszerzeniem.
export const config = {
  matcher: ["/((?!api|_next|panel|.*\\.[\\w]+$).*)"],
};
