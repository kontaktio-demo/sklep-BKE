import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { productHref } from "@/lib/routes";
import { SIZE_NAME, SIZE_SHORT } from "@/lib/sizes";
import type { Product, ProductSpec } from "@/lib/types";
import { cn } from "@/lib/utils";

// Karta katalogowa, nie karta sklepowa: zero szybkiego podgladu, zero dodawania do koszyka,
// zero swatchy. Kafel ma wlasne tlo (bg-nf-bg) i w siatce hairline z odstepem 1px
// wyglada jak wiersz tabeli sprzetowej. Server component - nie potrzebuje stanu.

// szerokosc kafla = kolumna siatki (1 / sm:2 / xl:3) minus ramka siatki i padding kafla (p-5)
const CARD_SIZES =
  "(min-width:1600px) 480px, (min-width:1280px) calc((100vw - 100px) / 3), (min-width:640px) calc((100vw - 100px) / 2), calc(100vw - 74px)";

// Obwod szyi i waga to cechy wariantu, nie produktu. Jedna wartosc w tabeli klamalaby
// przy produkcie z trzema rozmiarami ("48-60 cm" przy modelu, ktory idzie takze w M),
// wiec oba wiersze zastepuje jeden wiersz "Rozmiary" budowany z wariantow. Z listy
// specyfikacji sa usuwane, zeby nie wrocily tylnymi drzwiami jako wiersz dobijajacy.
const VARIANT_SPECS = ["Obwód szyi", "Waga"];

// dane, ktore przewodnik porownuje miedzy modelami; reszta specyfikacji zostaje na karcie produktu
const PREFERRED_SPECS = ["Szerokość", "Materiał", "Wytrzymałość"];
// 3 wiersze + wiersz "Rozmiary" = tabela ma tyle samo wierszy co wczesniej
const MAX_SPEC_ROWS = 3;

function catalogSpecs(specs: ProductSpec[]): ProductSpec[] {
  const usable = specs.filter((spec) => !VARIANT_SPECS.includes(spec.label));

  const picked = PREFERRED_SPECS.map((label) =>
    usable.find((spec) => spec.label === label)
  ).filter((spec): spec is ProductSpec => spec !== undefined);

  if (picked.length >= MAX_SPEC_ROWS) return picked.slice(0, MAX_SPEC_ROWS);

  // produkt bez kompletu preferowanych pol (np. lancuszek) dobija wiersze z reszty specyfikacji
  const rest = usable.filter((spec) => !picked.includes(spec));
  return [...picked, ...rest].slice(0, MAX_SPEC_ROWS);
}

export function K9ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const specs = catalogSpecs(product.specs);
  const isNew = product.badges.includes("new");
  const href = productHref(product);

  return (
    <article
      className={cn(
        "group/card flex h-full flex-col bg-k9-bg p-5 transition-colors duration-250 ease-nf hover:bg-k9-surface motion-reduce:transition-none",
        className
      )}
    >
      {/* naglowek techniczny kafla: oznaczenie po lewej, klasyfikacja po prawej.
          Jedna klasa dla kazdego odczytu w K9 (type-k9-spec, Geist Mono 12 px / 0.08em) -
          wczesniej ten sam napis mial trzy rozne trackingi i kody nie stały w jednej linii */}
      <div className="type-k9-spec flex items-baseline gap-4 text-k9-muted">
        <span className="shrink-0">{product.sku}</span>
        {product.k9Standard && (
          // line-clamp-2 zamiast truncate: dluga klasyfikacja (np. "Zgodna z modułami do
          // 45 mm") miesci sie w dwoch wierszach. Wczesniej byla ucinana wizualnie, a pelna
          // wartosc siedziala w title - niedostepnym z klawiatury i na dotyku
          <span className="ml-auto line-clamp-2 min-w-0 text-right">
            {product.k9Standard}
          </span>
        )}
      </div>

      {/* Elewacja to ROZJASNIENIE OBWODKI i przyblizenie kadru, nigdy miekki cien (§4, §6) */}
      <div className="relative mt-4 aspect-[4/3] overflow-hidden border border-k9-border bg-k9-raised transition-colors duration-250 ease-nf group-hover/card:border-k9-border-hi motion-reduce:transition-none">
        {/* alt="": nazwa produktu stoi w naglowku obok, wiec opis zdjecia tylko dublowalby
            odczyt. Zdjecie nie niesie tu informacji ponad tekst karty */}
        <Image
          src={product.images[0]}
          alt=""
          fill
          sizes={CARD_SIZES}
          className={cn("object-cover", !product.inStock && "brightness-75")}
        />

        {(!product.inStock || isNew) && (
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {/* plakietki: ostre prostokaty, monospace wersalikami (§4). Czerwien dostaje
                TYLKO ta, ktora niesie stan wart uwagi - reszta zostaje konturowa */}
            {!product.inStock && (
              <span className="type-k9-spec border border-k9-border-hi bg-k9-bg/90 px-2 py-1 text-k9-text">
                Brak
              </span>
            )}
            {isNew && (
              <span className="type-k9-spec bg-k9-red px-2 py-1 text-k9-white">
                Nowość
              </span>
            )}
          </div>
        )}
      </div>

      {/* tytul karty: Geist 16 px / 600, NIE wersaliki (§2). Wersaliki naleza do naglowkow
          sekcji - gdyby zeszly do kart, cala strona by krzyczala */}
      <h3 className="type-k9-h3 mt-4 text-k9-white">
        <Link
          href={href}
          className="underline-offset-[6px] transition-colors duration-250 ease-nf hover:underline hover:decoration-k9-red hover:decoration-2 motion-reduce:transition-none"
        >
          {product.name}
        </Link>
      </h3>

      <p className="type-k9-meta mt-1.5 text-k9-muted">{product.tagline}</p>

      <dl className="mt-5">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="flex items-baseline justify-between gap-4 border-t border-k9-border py-2"
          >
            <dt className="type-k9-spec shrink-0 text-k9-muted">
              {spec.label}
            </dt>
            <dd className="type-k9-meta text-right text-k9-text">{spec.value}</dd>
          </div>
        ))}

        {product.variants.length > 0 && (
          <div className="flex items-baseline justify-between gap-4 border-t border-k9-border py-2">
            <dt className="type-k9-spec shrink-0 text-k9-muted">
              Rozmiary
            </dt>
            {/* Wartosc jest tekstem plynacym, nie flexem: przy trzech wariantach lamie sie
                na dwa wiersze, a przecinki zostaja przy poprzednim rozmiarze. Przecinek stoi
                poza przekreslonym spanem, inaczej separator tez bylby przekreslony.

                Warstwa widoczna idzie w calosci pod aria-hidden, bo kod rozmiaru i
                przekreslenie to skroty dla oka. Odczyt dostaje to samo rozwiniete: pelna
                nazwa, obwod i stan magazynowy - bez dublowania "M" i "Sredni". */}
            <dd className="type-k9-meta text-right text-k9-text">
              {product.variants.map((variant, i) => (
                <Fragment key={variant.size}>
                  {i > 0 && (
                    <span aria-hidden="true" className="text-k9-muted">
                      ,{" "}
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className={cn(!variant.inStock && "text-k9-muted line-through")}
                  >
                    {SIZE_SHORT[variant.size]} ({variant.neck})
                  </span>
                  <span className="sr-only">
                    {SIZE_NAME[variant.size]}, {variant.neck}:{" "}
                    {variant.inStock ? "dostępny" : "brak"}.{" "}
                  </span>
                </Fragment>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {/* mt-auto: stopki wszystkich kafli w wierszu staja w jednej linii mimo roznej dlugosci danych */}
      <div className="mt-auto flex items-center justify-between gap-4 border-t border-k9-border pt-5">
        <PriceTag
          price={product.price}
          fromPrice={product.fromPrice}
          currency={product.currency}
          className="text-lg font-semibold"
        />
        {/* ghost, nie czerwony: 12 czerwonych przyciskow w siatce zrobiloby z katalogu
            choinke, a czerwien ma byc uzywana OSZCZEDNIE (§1) */}
        <Button size="sm" variant="ghost" href={href} className="min-h-11">
          Karta produktu
          {/* Button z href nie przekazuje aria-label do Linka, wiec nazwa dostepna
              rozroznia sie trescia: bez tego lista linkow to 12x "Karta produktu" */}
          <span className="sr-only">: {product.name}</span>
        </Button>
      </div>
    </article>
  );
}
