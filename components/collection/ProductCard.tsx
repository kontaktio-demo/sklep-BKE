"use client";

// Karta produktu: kadr ze zdjeciem + spokojna typografia pod kadrem.
// Bez skalowania calej karty, bez cienia, bez przeskokow z-index (to wygladalo jak Netflix,
// nie jak sklep). Na hover rusza sie tylko zdjecie wewnatrz kadru, a ramka kadru jasnieje.
// Dodawanie do koszyka zostalo z karty usuniete - robi to szybki podglad i strona produktu.

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuickView } from "@/components/collection/QuickViewModal";
import { Badge } from "@/components/ui/Badge";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { PriceTag } from "@/components/ui/PriceTag";
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

  // Druga warstwa zdjecia zyje wylacznie na hover/focus. Na dotyku nie pokaze sie nigdy,
  // a i tak byla pobierana - przy 26 kartach to 26 zbednych obrazow na lacze komorkowe.
  // Montujemy ja tylko na urzadzeniach z realnym kursorem albo po pierwszym fokusie
  // (klawiatura na sprzecie bez hovera). Sprawdzenie w efekcie, nie w renderze: SSR nie
  // zna matchMedia, a rozjazd hydracji kosztowalby wiecej niz sam obraz.
  const [hoverLayer, setHoverLayer] = useState(false);
  const hasSecondImage = product.images.length > 1;

  useEffect(() => {
    if (!hasSecondImage) return;
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setHoverLayer(true);
  }, [hasSecondImage]);

  return (
    <article
      className={cn("group/card relative", className)}
      onFocus={() => setHoverLayer(true)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] border border-nf-border bg-nf-elevated transition-colors duration-300 ease-nf group-hover/card:border-nf-border-strong group-focus-within/card:border-nf-border-strong motion-reduce:transition-none">
        {/* rusza sie tylko warstwa ze zdjeciami - ramka, plakietki i pasek stoja w miejscu */}
        <div className="absolute inset-0 transition-transform duration-500 ease-out motion-safe:group-hover/card:scale-[1.03] motion-safe:group-focus-within/card:scale-[1.03] motion-reduce:transition-none">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes={sizes}
            className={cn("object-cover", !product.inStock && "brightness-75")}
          />
          {hoverLayer && hasSecondImage && (
            <Image
              src={product.images[1]}
              alt=""
              aria-hidden="true"
              fill
              sizes={sizes}
              className="object-cover opacity-0 transition-opacity duration-500 ease-nf group-hover/card:opacity-100 group-focus-within/card:opacity-100 motion-reduce:transition-none"
            />
          )}
        </div>

        {/* touch/keyboard path (§7-4): the whole image is the quick-view trigger */}
        <button
          type="button"
          aria-label={`Szybki podgląd: ${product.name}`}
          onClick={() => openQuickView(product)}
          // obwodka wcieta do srodka: przycisk pokrywa caly kadr, a kadr ma overflow-hidden,
          // wiec zwykly pierscien na zewnatrz byl w calosci przycinany i fokus znikal.
          // outline-2, bo samo "outline" daje 1px - za cienko na tle zdjecia
          className="absolute inset-0 z-[1] w-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white focus-visible:shadow-none"
        />

        {product.badges.length > 0 && (
          <div className="pointer-events-none absolute left-2 top-2 z-[2] flex flex-col items-start gap-1">
            {product.badges.map((badge) => (
              <Badge key={badge} badge={badge} />
            ))}
          </div>
        )}

        {/* pointer-events gating: ukryty pasek nie moze byc hit-testowalny, bo dotyk
            trafialby w niewidoczny przycisk zamiast otwierac szybki podglad (§7-4) */}
        <button
          type="button"
          onClick={() => openQuickView(product)}
          // ten sam powod co wyzej: pasek siedzi przy krawedzi kadru z overflow-hidden,
          // wiec obwodka musi isc do srodka, inaczej fokus na nim jest niewidoczny
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-11 w-full translate-y-1 border-t border-nf-border bg-nf-bg/90 text-sm text-nf-text opacity-0 backdrop-blur-sm transition duration-300 ease-nf hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white focus-visible:shadow-none group-hover/card:pointer-events-auto group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:pointer-events-auto group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100 motion-reduce:transition-none"
        >
          Szybki podgląd
        </button>
      </div>

      <div className="space-y-1.5 pt-4">
        <h3 className="text-[15px] font-medium leading-snug">
          <Link
            href={`/products/${product.slug}`}
            className="rounded-[2px] text-nf-text transition-colors duration-250 ease-nf hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {product.name}
          </Link>
        </h3>
        <div className="flex items-baseline gap-2">
          <PriceTag
            price={product.price}
            fromPrice={product.fromPrice}
            currency={product.currency}
            className="font-semibold"
          />
          <span className="text-[10px] uppercase tracking-[0.2em] text-nf-dim">
            {product.productType}
          </span>
        </div>
        {product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 pt-2">
            {product.colors.slice(0, MAX_SWATCHES).map((color) => (
              <ColorSwatch key={color.name} color={color} size="sm" />
            ))}
            {product.colors.length > MAX_SWATCHES && (
              <span className="text-xs text-nf-dim">+{product.colors.length - MAX_SWATCHES}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
