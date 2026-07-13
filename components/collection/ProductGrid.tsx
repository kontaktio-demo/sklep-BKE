"use client";

// §8-G grid + §11 columns (2 -> 3 md -> 4 xl). No pagination at 26 items (§10 allows).

import { ProductCard } from "@/components/collection/ProductCard";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/lib/types";

export function ProductGrid({
  products,
  onClearFilters,
}: {
  products: Product[];
  onClearFilters?: () => void;
}) {
  return (
    <div id="product-grid" className="scroll-mt-24">
      {/* Bez tego naglowka karty (h3) wpadaly pod h2 "Filtry" z panelu obok i konspekt
          sugerowal, ze produkty naleza do filtrow. sr-only: uklad zostaje bez zmian */}
      <h2 id="wyniki" className="sr-only">
        Wyniki
      </h2>

      {/* Siatka maluje sie od razu. Wjazd kafli ze staggerem znikl razem z reszta ruchu
          dla ruchu: przy filtrowaniu kazde przeliczenie listy migalo, a bez JS karty
          zostawaly przezroczyste. */}
      {products.length === 0 ? (
        <div className="py-24 text-center">
          {/* komunikat, nie naglowek: zostaje w kroju tekstowym, bez skali naglowkowej */}
          <p className="text-lg font-semibold text-nf-white">
            Nic nie pasuje do wybranych filtrów.
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-nf-muted">
            Usuń jeden z filtrów lub wyczyść wszystkie, aby zobaczyć całą kolekcję.
          </p>
          {onClearFilters && (
            <Button variant="ghost" className="mt-8" onClick={onClearFilters}>
              Wyczyść filtry
            </Button>
          )}
        </div>
      ) : (
        <ul
          aria-labelledby="wyniki"
          className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4"
        >
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
