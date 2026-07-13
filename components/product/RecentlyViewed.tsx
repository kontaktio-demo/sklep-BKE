"use client";

import { useEffect, useState } from "react";
import { ProductRow } from "@/components/collection/ProductRow";
import { getRecent, pushRecent } from "@/lib/recent";
import type { Product } from "@/lib/types";

// Rzad pokazuje mniej niz trzyma historia (MAX_RECENT = 8): dwie ostatnie pozycje sa
// buforem na slugi, ktore wypadly z katalogu.
const MAX_TILES = 6;

/** Katalog przychodzi z serwera, historia z dysku. Skladamy je dopiero po montazu,
 *  bo serwer nie wie, co ten uzytkownik ogladal - pierwszy render musi byc pusty,
 *  inaczej HTML z serwera rozjedzie sie z hydracja. */
export function RecentlyViewed({
  products,
  currentSlug,
}: {
  products: Product[];
  currentSlug: string;
}) {
  const [recent, setRecent] = useState<Product[]>([]);

  useEffect(() => {
    // biezaca karta trafia na czolo historii, ale w rzedzie jej nie pokazujemy:
    // nikt nie szuka linku do strony, na ktorej stoi
    const history = pushRecent(currentSlug);
    const bySlug = new Map(products.map((p) => [p.slug, p]));

    setRecent(
      history
        .filter((slug) => slug !== currentSlug)
        .map((slug) => bySlug.get(slug))
        .filter((p): p is Product => p !== undefined)
        .slice(0, MAX_TILES)
    );
  }, [currentSlug, products]);

  // pusta historia nie zostawia po sobie pustego stanu ani naglowka - takze ramka
  // sekcji siedzi tutaj, zeby przy pierwszej wizycie nie zostala po niej sama kreska
  if (recent.length === 0) return null;

  return (
    <div className="border-t border-nf-border pb-20 pt-14">
      <ProductRow title="Ostatnio oglądane" products={recent} />
    </div>
  );
}
