/**
 * Jedno zrodlo bazowego adresu serwisu dla metadanych, sitemap i robots.
 * Kolejnosc: jawna zmienna srodowiskowa -> adres deploymentu Vercela -> localhost.
 * Bez czlonu VERCEL_URL produkcja bez ustawionego NEXT_PUBLIC_SITE_URL emitowala
 * kanoniczne adresy i og:image na http://localhost:3000.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
