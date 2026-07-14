import Link from "next/link";
import type { Collection } from "@/lib/types";
import { Button } from "@/components/ui/Button";

// Naglowek kolekcji: czysty, typograficzny, na tle strony (nf-bg - papier w swiecie
// cywilnym, grafit w sekcji Pro). Bez zdjecia w tle i bez WebGL - rozmyta grafika z poswiata
// wygladala tanio.
export function CollectionHero({ collection }: { collection: Collection }) {
  return (
    <section className="border-b border-nf-border bg-nf-bg">
      <div className="mx-auto max-w-[1600px] px-4 pb-12 pt-10 md:px-6 md:pb-16 md:pt-14">
        <nav aria-label="Ścieżka nawigacji" className="mb-8">
          <ol className="flex items-center gap-2 text-xs text-nf-muted">
            <li>
              <Link
                href="/"
                className="transition-colors duration-250 ease-nf hover:text-nf-white"
              >
                Strona główna
              </Link>
            </li>
            <li aria-hidden="true" className="text-nf-dim">
              /
            </li>
            <li aria-current="page" className="text-nf-text">
              {collection.title}
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <div className="max-w-3xl">
            {/* eyebrow jest oznaczeniem, nie akcja - czerwien zostaje dla CTA i stanu aktywnego.
                type-label, nie type-meta: kolekcja zyje w sklepie cywilnym, a monospace jest
                jezykiem katalogu Dog Store Pro */}
            <p className="type-label text-nf-dim">Kolekcja</p>
            <h1 className="type-h1 mt-4 text-nf-white">{collection.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-nf-muted">
              {collection.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" href="#product-grid">
              Przeglądaj
            </Button>
            <Button size="lg" variant="ghost" href="#bestsellery">
              Bestsellery
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
