import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import type { Product, ProductSpec } from "@/lib/types";
import { cn } from "@/lib/utils";

// Karta katalogowa, nie karta sklepowa: zero szybkiego podgladu, zero dodawania do koszyka,
// zero swatchy. Kafel ma wlasne tlo (bg-nf-bg) i w siatce hairline z odstepem 1px
// wyglada jak wiersz tabeli sprzetowej. Server component - nie potrzebuje stanu.

// szerokosc kafla = kolumna siatki (1 / sm:2 / xl:3) minus ramka siatki i padding kafla (p-5)
const CARD_SIZES =
  "(min-width:1600px) 480px, (min-width:1280px) calc((100vw - 100px) / 3), (min-width:640px) calc((100vw - 100px) / 2), calc(100vw - 74px)";

// dane, ktore przewodnik porownuje miedzy modelami; reszta specyfikacji zostaje na karcie produktu
const PREFERRED_SPECS = ["Szerokość", "Obwód szyi", "Waga", "Wytrzymałość"];
const MAX_SPEC_ROWS = 4;

function catalogSpecs(specs: ProductSpec[]): ProductSpec[] {
  const picked = PREFERRED_SPECS.map((label) =>
    specs.find((spec) => spec.label === label)
  ).filter((spec): spec is ProductSpec => spec !== undefined);

  if (picked.length >= MAX_SPEC_ROWS) return picked.slice(0, MAX_SPEC_ROWS);

  // produkt bez kompletu preferowanych pol (np. lancuszek) dobija wiersze z reszty specyfikacji
  const rest = specs.filter((spec) => !picked.includes(spec));
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
  const href = `/products/${product.slug}`;

  return (
    <article
      className={cn(
        "group/card flex h-full flex-col bg-nf-bg p-5 transition-colors duration-250 ease-nf hover:bg-nf-elevated motion-reduce:transition-none",
        className
      )}
    >
      {/* naglowek techniczny kafla: oznaczenie po lewej, klasyfikacja po prawej */}
      <div className="flex items-baseline gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-nf-dim">
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

      <div className="relative mt-4 aspect-[4/3] overflow-hidden border border-nf-border bg-nf-elevated transition-colors duration-250 ease-nf group-hover/card:border-nf-border-strong motion-reduce:transition-none">
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
            {!product.inStock && (
              <span className="border border-nf-border-strong bg-nf-bg/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-nf-muted">
                Brak
              </span>
            )}
            {isNew && (
              // czerwien wylacznie jako znacznik, nie jako wypelnienie
              <span className="border border-nf-red bg-nf-bg/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-nf-red-bright">
                Nowość
              </span>
            )}
          </div>
        )}
      </div>

      <h3 className="mt-4 font-display text-lg font-bold uppercase leading-tight tracking-tight text-nf-white">
        <Link
          href={href}
          className="underline-offset-[6px] transition-colors duration-250 ease-nf hover:underline hover:decoration-nf-red hover:decoration-2 motion-reduce:transition-none"
        >
          {product.name}
        </Link>
      </h3>

      <p className="mt-1.5 text-sm leading-relaxed text-nf-muted">{product.tagline}</p>

      <dl className="mt-5">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="flex items-baseline justify-between gap-4 border-t border-nf-border py-2"
          >
            <dt className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-nf-dim">
              {spec.label}
            </dt>
            <dd className="text-right text-sm text-nf-text">{spec.value}</dd>
          </div>
        ))}
      </dl>

      {/* mt-auto: stopki wszystkich kafli w wierszu staja w jednej linii mimo roznej dlugosci danych */}
      <div className="mt-auto flex items-center justify-between gap-4 border-t border-nf-border pt-5">
        <PriceTag
          price={product.price}
          fromPrice={product.fromPrice}
          currency={product.currency}
          className="text-lg font-semibold"
        />
        {/* ghost, nie primary: 12 czerwonych przyciskow w siatce zrobiloby z katalogu choinke.
            min-h-11 podnosi cel dotykowy do 44px, scale-100 zdejmuje odbicie przycisku ze sklepu. */}
        <Button
          size="sm"
          variant="ghost"
          href={href}
          className="min-h-11 rounded-none motion-safe:hover:scale-100"
        >
          Karta produktu
          {/* Button z href nie przekazuje aria-label do Linka, wiec nazwa dostepna
              rozroznia sie trescia: bez tego lista linkow to 12x "Karta produktu" */}
          <span className="sr-only">: {product.name}</span>
        </Button>
      </div>
    </article>
  );
}
