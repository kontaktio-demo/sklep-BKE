"use client";

import { useMemo, useRef } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/collection/ProductCard";
import {
  RowScroller,
  RowSkeletonTrack,
  useLazyMount,
} from "@/components/collection/ProductRow";

const CARD_SIZES = "(min-width:1024px) 230px, (min-width:640px) 210px, 42vw";
const CARD_WIDTH_CLASS = "w-[42vw] sm:w-[210px] lg:w-[230px]";
const MAX_ITEMS = 10;

// §8-H - rzad bestsellerow z numeracja miejsc, sortowany po bestsellerRank.
export function BestsellerRow({
  products,
  title = "Top 10 bestsellerów",
  id = "bestsellery",
}: {
  products: Product[];
  title?: string;
  id?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const mounted = useLazyMount(sectionRef);

  const ranked = useMemo(
    () =>
      products
        .filter((p) => p.bestsellerRank != null)
        .sort((a, b) => (a.bestsellerRank ?? 0) - (b.bestsellerRank ?? 0))
        .slice(0, MAX_ITEMS),
    [products]
  );

  if (ranked.length === 0) return null;

  return (
    <section ref={sectionRef} id={id} className="scroll-mt-24 space-y-3">
      <div className="mx-auto max-w-[1600px]">
        <div className="px-4 md:px-6">
          <h2 className="type-h2 text-white">{title}</h2>
        </div>

        {mounted ? (
          <RowScroller itemClassName={CARD_WIDTH_CLASS}>
            {ranked.map((p, i) => (
              // z-0 scopes the card's hover:z-10 to this slot, so the rank chip can sit
              // above the hovered card without also painting over the row arrows
              <div key={p.id} className="relative z-0">
                <span className="sr-only">Miejsce {i + 1}</span>
                {/* licznik miejsca w prawym gornym rogu: ProductCard trzyma plakietki
                    w lewej kolumnie, a miejsca 1-6 maja plakietke */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2 top-2 z-20 flex size-7 items-center justify-center rounded-full border border-nf-border-strong bg-nf-bg/85 text-xs font-semibold tabular-nums text-nf-text backdrop-blur-sm"
                >
                  {i + 1}
                </span>
                <ProductCard product={p} sizes={CARD_SIZES} />
              </div>
            ))}
          </RowScroller>
        ) : (
          <RowSkeletonTrack itemClassName={CARD_WIDTH_CLASS} />
        )}
      </div>
    </section>
  );
}
