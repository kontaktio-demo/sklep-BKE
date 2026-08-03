import { NextResponse, type NextRequest } from "next/server";

/**
 * Tryb „sklep zamknięty": gdy w ustawieniach (panel → Ustawienia) `open=false`,
 * trasy zakupowe są przekierowane na /wkrotce. Ustawienie czytamy z /api/settings/public,
 * z krótkim cache (30 s) i FAIL-OPEN (błąd/timeout => sklep działa normalnie).
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

export async function middleware(req: NextRequest) {
  const open = await storeOpen(req.nextUrl.origin);
  if (open) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/wkrotce";
  return NextResponse.rewrite(url);
}

// Tylko trasy zakupowe. Panel, konto, API, strony informacyjne działają zawsze.
export const config = {
  matcher: ["/collections/:path*", "/products/:path*", "/koszyk", "/kasa/:path*", "/pro/:path*"],
};
