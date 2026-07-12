"use client";

// §8-G card - [BASE: NSDW two-image hover-swap card, ACTIONS: K9TG quick view + type label, MOTION: Netflix §7-4]

import Image from "next/image";
import Link from "next/link";
import { useQuickView } from "@/components/collection/QuickViewModal";
import { Badge } from "@/components/ui/Badge";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { PriceTag } from "@/components/ui/PriceTag";
import { PlusIcon } from "@/components/ui/icons";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

// accounts for the lg+ filter sidebar and the 1600px container cap - 25vw/33vw
// over-requested 1.5-2.2x once real photography replaces the SVG placeholders
const DEFAULT_SIZES =
  "(min-width:1600px) 300px, (min-width:1280px) calc((100vw - 390px) / 4), (min-width:1024px) calc((100vw - 340px) / 3), (min-width:768px) 33vw, 50vw";
const MAX_SWATCHES = 4;

export function ProductCard({
  product,
  className,
  sizes = DEFAULT_SIZES,
}: {
  product: Product;
  className?: string;
  sizes?: string;
}) {
  const { openQuickView } = useQuickView();
  const { addLine, openCart } = useCart();

  return (
    <article className={cn("group/card relative hover:z-10 focus-within:z-10", className)}>
      <div className="relative transition-transform duration-300 ease-nf motion-reduce:transition-none motion-safe:group-hover/card:-translate-y-1 motion-safe:group-hover/card:scale-[1.06] motion-safe:group-focus-within/card:-translate-y-1 motion-safe:group-focus-within/card:scale-[1.06]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-nf-elevated">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes={sizes}
            className={cn("object-cover", !product.inStock && "brightness-75")}
          />
          <Image
            src={product.images[1]}
            alt=""
            aria-hidden="true"
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-300 ease-nf group-hover/card:opacity-100 group-focus-within/card:opacity-100 motion-reduce:transition-none"
          />

          {/* touch/keyboard path (§7-4): the whole image is the quick-view trigger */}
          <button
            type="button"
            aria-label={`Szybki podgląd: ${product.name}`}
            onClick={() => openQuickView(product)}
            className="absolute inset-0 z-[1] w-full cursor-pointer"
          />

          {product.badges.length > 0 && (
            <div className="pointer-events-none absolute left-2 top-2 z-[2] flex flex-col items-start gap-1">
              {product.badges.map((badge) => (
                <Badge key={badge} badge={badge} />
              ))}
            </div>
          )}

          {/* pointer-events gating: while hidden (opacity-0) these buttons must not be
              hit-testable, or touch taps would invisibly add to cart instead of opening
              quick view (§7-4) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex translate-y-2 items-center gap-2 p-3 opacity-0 scrim-bottom transition duration-300 ease-nf group-hover/card:pointer-events-auto group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:pointer-events-auto group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100 motion-reduce:transition-none">
            <button
              type="button"
              onClick={() => openQuickView(product)}
              className="h-11 flex-1 rounded-[4px] bg-white px-3 text-xs font-semibold text-black transition-colors duration-250 ease-nf hover:bg-nf-text"
            >
              Szybki podgląd
            </button>
            {product.inStock && (
              <button
                type="button"
                aria-label={`Dodaj ${product.name} do koszyka`}
                onClick={() => {
                  addLine(product);
                  openCart();
                }}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-nf-red text-white transition-colors duration-250 ease-nf hover:bg-nf-red-dark"
              >
                <PlusIcon width={18} height={18} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1 pt-3">
          <h3 className="text-[15px] font-medium leading-snug">
            <Link
              href={`/products/${product.slug}`}
              className="relative z-[3] rounded-[2px] text-nf-text transition-colors duration-250 ease-nf hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {product.name}
            </Link>
          </h3>
          <div className="flex items-baseline gap-2">
            <PriceTag
              price={product.price}
              fromPrice={product.fromPrice}
              currency={product.currency}
            />
            <span className="text-xs uppercase tracking-wide text-nf-dim">{product.productType}</span>
          </div>
          {product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              {product.colors.slice(0, MAX_SWATCHES).map((color) => (
                <ColorSwatch key={color.name} color={color} size="sm" />
              ))}
              {product.colors.length > MAX_SWATCHES && (
                <span className="text-xs text-nf-dim">+{product.colors.length - MAX_SWATCHES}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
