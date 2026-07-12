"use client";

import { Fragment, useMemo, useRef } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/collection/ProductCard";
import {
  RowScroller,
  RowSkeletonTrack,
  useLazyMount,
} from "@/components/collection/NetflixRow";

const CARD_SIZES = "(min-width:1024px) 230px, (min-width:640px) 210px, 42vw";
const CARD_WIDTH_CLASS = "w-[42vw] sm:w-[210px] lg:w-[230px]";

// §8-H / §7-3 [VERDICT: NEW, sanctioned Netflix layer — Top 10 ranked row]
export function TopTenRow({
  products,
  title = "Top 10 bestsellerów",
  id = "top-ten",
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
        .slice(0, 10),
    [products]
  );

  if (ranked.length === 0) return null;

  return (
    <section ref={sectionRef} id={id} className="scroll-mt-24 space-y-3">
      <div className="mx-auto max-w-[1600px]">
        <div className="px-4 md:px-6">
          <h2 className="font-display text-xl font-bold tracking-tight text-white md:text-2xl">
            {title}
          </h2>
        </div>

        {mounted ? (
          // li must be `relative`: the sr-only rank spans are absolutely positioned and
          // would otherwise anchor to the row wrapper outside the scroll container,
          // leaking horizontal overflow onto the page
          <RowScroller itemClassName="relative flex items-end">
            {ranked.map((p, i) => (
              <Fragment key={p.id}>
                <span className="sr-only">Miejsce {i + 1}</span>
                {/* giant outlined rank bleeding behind the card, Netflix Top 10 style */}
                <span
                  aria-hidden="true"
                  className="text-stroke-rank relative z-0 -mr-6 select-none font-display text-[7rem] font-black leading-[0.8] sm:-mr-8 sm:text-[9rem] lg:text-[11rem]"
                >
                  {i + 1}
                </span>
                <div className={`relative z-[1] ${CARD_WIDTH_CLASS}`}>
                  <ProductCard product={p} sizes={CARD_SIZES} />
                </div>
              </Fragment>
            ))}
          </RowScroller>
        ) : (
          <RowSkeletonTrack itemClassName={CARD_WIDTH_CLASS} />
        )}
      </div>
    </section>
  );
}
