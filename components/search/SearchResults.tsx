"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
import { ProductGrid } from "@/components/collection/ProductGrid";
import { QuickViewProvider } from "@/components/collection/QuickViewModal";
import { ProProductCard } from "@/components/pro/ProProductCard";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { POPULAR_SEARCHES, searchHref } from "@/lib/search";
import type { Product } from "@/lib/types";
import { cn, plural } from "@/lib/utils";

// Wyniki z dwoch linii lezacych obok siebie, ale nie zmieszanych: sklep zostaje sklepem
// (siatka kafli, szybki podglad), Dog Store Pro katalogiem (kafle techniczne, bez koszyka).
// Wspolna jest tylko fraza.

// pigulka frazy to przycisk konturowy: jej ramka jest jedynym sygnalem kontrolki, wiec
// idzie na nf-control (3:1, WCAG 1.4.11), a nie na cicha linie dekoracyjna
const CHIP =
  "inline-flex min-h-11 items-center rounded-[2px] border border-nf-control px-3 text-sm text-nf-muted transition-colors duration-250 ease-nf hover:border-nf-control-hover hover:text-nf-white motion-reduce:transition-none";

function PopularSearches({ className }: { className?: string }) {
  return (
    <div className={className}>
      {/* /szukaj to trasa sklepu cywilnego (takze sekcja z wynikami z linii Pro na niej lezy),
          wiec etykiety ida groteskiem - monospace zostaje w swiecie Dog Store Pro */}
      <h2 className="type-label text-nf-dim">Popularne wyszukiwania</h2>
      <ul className="mt-3 flex flex-wrap justify-center gap-2">
        {POPULAR_SEARCHES.map((term) => (
          <li key={term}>
            <Link href={searchHref(term)} className={CHIP}>
              {term}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionHeading({
  id,
  title,
  count,
  href,
  linkLabel,
}: {
  id: string;
  title: string;
  count: number;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-nf-border pb-4">
      <h2 id={id} className="type-h2 text-nf-white">
        {title}
      </h2>
      <div className="flex items-baseline gap-4">
        <p className="type-label text-nf-dim">
          {count} {plural(count, "wynik", "wyniki", "wyników")}
        </p>
        <Link
          href={href}
          className="type-label text-nf-muted transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none"
        >
          {linkLabel}
        </Link>
      </div>
    </div>
  );
}

export function SearchResults({
  query,
  shopHits,
  proHits,
}: {
  query: string;
  shopHits: Product[];
  proHits: Product[];
}) {
  const router = useRouter();
  const inputId = useId();
  const [draft, setDraft] = useState(query);

  // fraza zmienia sie bez odmontowania komponentu (pigulka klikniete z tej samej strony),
  // wiec pole musi nadazyc za adresem
  useEffect(() => setDraft(query), [query]);

  const total = shopHits.length + proHits.length;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = draft.trim();
    if (!next || next === query) return;
    router.push(searchHref(next));
  };

  return (
    <QuickViewProvider>
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-24">
        {/* ten sam naglowek strony co w koszyku i na stronach informacyjnych:
            okruszki, potem H1 ze skali - zeby /szukaj nie wygladalo na obcy serwis */}
        <header className="border-b border-nf-border pb-10">
          <Breadcrumbs items={[{ label: "Strona główna", href: "/" }, { label: "Szukaj" }]} />
          <h1 className="type-h1 mt-6 text-nf-white">Szukaj</h1>

          <form role="search" onSubmit={submit} className="mt-8 flex max-w-2xl gap-2">
            <label htmlFor={inputId} className="sr-only">
              Czego szukasz?
            </label>
            {/* nf-control: pole wyszukiwarki bez widocznej ramki nie wyglada na pole (WCAG 1.4.11) */}
            <input
              id={inputId}
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Czego szukasz?"
              className="h-12 min-w-0 flex-1 rounded-[2px] border border-nf-control bg-nf-elevated px-4 text-sm text-nf-text placeholder:text-nf-dim"
            />
            <Button type="submit" className="h-12 shrink-0">
              Szukaj
            </Button>
          </form>

          {query !== "" && (
            <p aria-live="polite" className="mt-6 text-sm text-nf-muted">
              {total > 0
                ? `${total} ${plural(total, "wynik", "wyniki", "wyników")} dla frazy: ${query}`
                : `Brak wyników dla frazy: ${query}`}
            </p>
          )}
        </header>

        {query === "" && (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold text-nf-white">
              Wpisz frazę, żeby przeszukać sklep i katalog Dog Store Pro.
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-nf-muted">
              Szukamy po nazwie, opisie, SKU, kategorii, kolorze i specyfikacji.
            </p>
            <PopularSearches className="mt-10" />
          </div>
        )}

        {query !== "" && total === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold text-nf-white">
              Nic nie pasuje do frazy: {query}
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-nf-muted">
              Sprawdź pisownię albo skróć zapytanie do jednego słowa. Cały asortyment jest w
              sklepie i w katalogu Dog Store Pro.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/collections/collars">Przejdź do sklepu</Button>
              <Button variant="ghost" href="/pro">
                Katalog Dog Store Pro
              </Button>
            </div>
            <PopularSearches className="mt-12" />
          </div>
        )}

        {shopHits.length > 0 && (
          <section aria-labelledby="wyniki-sklep" className="pt-12">
            <SectionHeading
              id="wyniki-sklep"
              title="Sklep"
              count={shopHits.length}
              href="/collections/collars"
              linkLabel="Wszystkie obroże"
            />
            <div className="pt-8">
              <ProductGrid products={shopHits} />
            </div>
          </section>
        )}

        {proHits.length > 0 && (
          <section
            aria-labelledby="wyniki-pro"
            className={cn("pt-16", shopHits.length === 0 && "pt-12")}
          >
            <SectionHeading
              id="wyniki-pro"
              title="Dog Store Pro"
              count={proHits.length}
              href="/pro"
              linkLabel="Katalog Dog Store Pro"
            />
            {/* sprzet sluzbowy trzyma swoj jezyk: kafel techniczny, bez szybkiego podgladu */}
            <ul className="grid grid-cols-1 gap-4 pt-8 sm:grid-cols-2 xl:grid-cols-3">
              {proHits.map((product) => (
                <li key={product.id} className="flex">
                  <ProProductCard
                    product={product}
                    className="w-full border border-nf-border hover:border-nf-border-strong"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </QuickViewProvider>
  );
}
