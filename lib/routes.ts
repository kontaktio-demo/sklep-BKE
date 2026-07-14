import type { Product } from "./types";

/**
 * Adres karty produktu. Dwa sklepy = dwie przestrzenie adresow:
 *   Dog Store      ->  /products/<slug>
 *   Dog Store Pro  ->  /pro/produkt/<slug>
 *
 * To nie jest kosmetyka URL. Motyw wlacza sie z TRASY (ciemny na /pro/*), wiec karta
 * sprzetu sluzbowego pod adresem sklepu renderowalaby sie w cywilnym, jasnym ubraniu.
 * Przy okazji adres sam mowi, z ktorego katalogu pochodzi pozycja.
 */
export function productHref(product: Pick<Product, "slug" | "line">): string {
  return product.line === "pro" ? `/pro/produkt/${product.slug}` : `/products/${product.slug}`;
}
