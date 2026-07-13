"use client";

// §8-G grid + §11 columns (2 -> 3 md -> 4 xl). No pagination at 26 items (§10 allows).

import { ProductCard } from "@/components/collection/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
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
      {/* Reveal stays mounted across filter changes: its effect runs once on mount
          (ScrollTrigger once + clearProps), so only the initial grid staggers in -
          filtered re-renders paint instantly. */}
      <Reveal selector="[data-card]" stagger={0.04}>
        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-lg font-bold text-white">
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
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <li key={product.id} data-card>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </div>
  );
}
