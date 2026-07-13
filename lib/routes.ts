import type { Product } from "./types";

/**
 * Adres karty produktu. Dwa sklepy = dwie przestrzenie adresow:
 *   sklep cywilny  ->  /products/<slug>
 *   PAKT-K9        ->  /k9/produkt/<slug>
 *
 * To nie jest kosmetyka URL. Motyw wlacza sie z TRASY (ciemny na /k9/*), wiec karta
 * sprzetu sluzbowego pod adresem sklepu renderowalaby sie w cywilnym, jasnym ubraniu.
 * Przy okazji adres sam mowi, z ktorego katalogu pochodzi pozycja.
 */
export function productHref(product: Pick<Product, "slug" | "line">): string {
  return product.line === "k9" ? `/k9/produkt/${product.slug}` : `/products/${product.slug}`;
}
