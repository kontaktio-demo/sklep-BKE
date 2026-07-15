"use client";

// Karta produktu: kadr ze zdjeciem + spokojna typografia pod kadrem.
// Bez skalowania calej karty, bez cienia, bez przeskokow z-index (to wygladalo jak Netflix,
// nie jak sklep). Na hover rusza sie tylko zdjecie wewnatrz kadru, a ramka kadru jasnieje.
// Dodawanie do koszyka zostalo z karty usuniete - robi to szybki podglad i strona produktu.

import Image from "next/image";
import { Link } from "next-view-transitions";
import { useRef, useState } from "react";
import { useQuickView } from "@/components/collection/QuickViewModal";
import { Badge } from "@/components/ui/Badge";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { PriceTag } from "@/components/ui/PriceTag";
import { productHref } from "@/lib/routes";
import { SIZE_NAME, SIZE_SHORT } from "@/lib/sizes";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

// accounts for the lg+ filter sidebar and the 1600px container cap - 25vw/33vw
// over-requested 1.5-2.2x once real photography replaces the SVG placeholders
const DEFAULT_SIZES =
  "(min-width:1600px) 300px, (min-width:1280px) calc((100vw - 390px) / 4), (min-width:1024px) calc((100vw - 340px) / 3), (min-width:768px) 33vw, 50vw";
const MAX_SWATCHES = 4;

// Morf karta -> karta produktu (View Transitions API). Nazwe dostaje WYLACZNIE
// klikana karta - dwa elementy z ta sama nazwa w drzewie wywracaja przejscie
// w twardy swap, wiec przed nadaniem czyscimy poprzednika.
let lastNamedFrame: HTMLElement | null = null;

function armSharedTransition(frame: HTMLElement | null) {
  if (lastNamedFrame && lastNamedFrame !== frame) {
    lastNamedFrame.style.viewTransitionName = "";
  }
  if (frame) {
    frame.style.viewTransitionName = "pdp-hero";
    lastNamedFrame = frame;
  }
}

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

  // Druga warstwa zdjecia montuje sie DOPIERO, gdy kursor wejdzie na TE karte (albo gdy
  // karta dostanie fokus z klawiatury). Wczesniej wystarczylo, ze urzadzenie ma kursor,
  // i wszystkie 26 kart ladowalo drugi obraz od razu: 52 obrazy na liscie kolekcji,
  // z czego 26 niewidocznych. To bylo widac nie tylko na laczu - kazdy z nich trzeba bylo
  // zdekodowac i trzymac w pamieci, a przy przewijaniu przemalowac.
  const [hoverLayer, setHoverLayer] = useState(false);
  const hasSecondImage = product.images.length > 1;
  const frameRef = useRef<HTMLDivElement | null>(null);

  const armHoverLayer = () => {
    if (hasSecondImage) setHoverLayer(true);
  };

  return (
    <article
      className={cn("group/card relative", className)}
      onPointerEnter={armHoverLayer}
      onFocus={armHoverLayer}
    >
      <div
        ref={frameRef}
        className="relative aspect-[4/5] overflow-hidden rounded-[2px] border border-nf-border bg-nf-elevated transition-colors duration-300 ease-nf group-hover/card:border-nf-border-strong group-focus-within/card:border-nf-border-strong motion-reduce:transition-none"
      >
        {/* rusza sie tylko warstwa ze zdjeciami - ramka, plakietki i pasek stoja w miejscu */}
        <div className="absolute inset-0 transition-transform duration-500 ease-out motion-safe:group-hover/card:scale-[1.03] motion-safe:group-focus-within/card:scale-[1.03] motion-reduce:transition-none">
          {/* Wyprzedane: odbarwienie + wygaszenie. Samo przyciemnienie (brightness) na jasnym
              tle robilo ze zdjecia tylko odrobine ciemniejsze zdjecie, a nie stan "niedostepne".
              Szarosc czyta sie jako brak w obu swiatach. */}
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes={sizes}
            className={cn("object-cover", !product.inStock && "grayscale opacity-60")}
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
          className="absolute inset-0 z-[1] w-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-nf-white focus-visible:shadow-none"
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
          // bez backdrop-blur i bez przezroczystosci: warstwa rozmywajaca tlo istniala
          // w KAZDEJ z 26 kart naraz. Pasek jest teraz pelnym tlem - wyglada tak samo,
          // a przegladarka nie musi rozmywac zdjecia pod nim przy kazdym przemalowaniu
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-11 w-full translate-y-1 border-t border-nf-border bg-nf-bg text-sm text-nf-text opacity-0 transition duration-300 ease-nf hover:text-nf-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-nf-white focus-visible:shadow-none group-hover/card:pointer-events-auto group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:pointer-events-auto group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100 motion-reduce:transition-none"
        >
          Szybki podgląd
        </button>
      </div>

      <div className="space-y-1.5 pt-4">
        <h3 className="text-[15px] font-medium leading-snug">
          <Link
            href={productHref(product)}
            onClick={() => armSharedTransition(frameRef.current)}
            className="rounded-[2px] text-nf-text transition-colors duration-250 ease-nf hover:text-nf-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nf-white"
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
          {/* type-label (zwykly grotesk), nie rozstrzelony 0.2em: takie napisy w sklepie
              cywilnym czytaly sie jak panel techniczny, a nie jak metka produktu */}
          <span className="type-label text-nf-dim">{product.productType}</span>
        </div>

        {/* Rozmiary stoja pod cena, bo tlumacza cene "od": pokazuja, miedzy iloma wariantami
            ta cena sie rozklada i ktore z nich mozna faktycznie kupic. Niedostepny wariant
            gasnie I zostaje przekreslony - dwa kanaly, bo sam kolor nie wystarczy przy
            zaburzeniach rozroznienia barw. Przekreslenie widzi tylko oko, wiec ten sam stan
            niesie odczyt w sr-only. */}
        {product.variants.length > 0 && (
          <ul aria-label="Rozmiary" className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {product.variants.map((variant) => (
              <li
                key={variant.size}
                className={cn(
                  "type-label",
                  variant.inStock ? "text-nf-muted" : "text-nf-dim line-through"
                )}
              >
                <span aria-hidden="true">{SIZE_SHORT[variant.size]}</span>
                <span className="sr-only">
                  {SIZE_NAME[variant.size]}: {variant.inStock ? "dostępny" : "brak"}
                </span>
              </li>
            ))}
          </ul>
        )}

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
