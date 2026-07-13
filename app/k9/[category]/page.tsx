import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { K9CategoryNav } from "@/components/k9/K9CategoryNav";
import { K9ProductCard } from "@/components/k9/K9ProductCard";
import { getK9Categories, getK9Category, getK9Products } from "@/lib/data";
import { cn } from "@/lib/utils";

// Lista sprzetu K9. Rytm celowo inny niz /collections/collars: bez filtrow, bez sortowania,
// bez szybkiego podgladu i bez rzedow Netflix. Kategoria = zamknieta karta katalogowa,
// wiec strona ma tylko naglowek, pasek kategorii, tabele pozycji i stopke z liczba pozycji.
// Z tego samego powodu strona NIE jest owinieta w QuickViewProvider - nic tu go nie otwiera.

const CONTAINER = "mx-auto max-w-[1600px] px-4 md:px-6";

const SM_COLS = 2;
const XL_COLS = 3;

// Siatka hairline: kafle maja tlo bg-nf-bg, a odstep gap-px odslania tlo kontenera i tworzy
// linie 1px. Niepelny ostatni wiersz odslonilby to tlo jako jasna plame na calej pustej
// przestrzeni, wiec domykamy wiersz pustymi kaflami. Liczba kafli zalezy od liczby kolumn,
// dlatego kazdy dostaje wlasna widocznosc per breakpoint (1 kol.: zaden, sm: 2, xl: 3).
function fillerCells(count: number): { sm: boolean; xl: boolean }[] {
  const sm = (SM_COLS - (count % SM_COLS)) % SM_COLS;
  const xl = (XL_COLS - (count % XL_COLS)) % XL_COLS;
  return Array.from({ length: Math.max(sm, xl) }, (_, i) => ({ sm: i < sm, xl: i < xl }));
}

export async function generateStaticParams(): Promise<{ category: string }[]> {
  const categories = await getK9Categories();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getK9Category(slug);

  // nieznany slug: strona renderuje notFound(), metadane nie moga rzucic bledem
  if (!category) {
    return { title: { absolute: "Kategoria niedostępna | PAKT-K9" } };
  }

  return {
    // absolute: szablon "%s | PAKT" z layoutu dokleilby druga marke ("... | PAKT-K9 | PAKT")
    title: { absolute: `${category.title} | PAKT-K9` },
    description: category.description,
    alternates: { canonical: `/k9/${category.slug}` },
  };
}

export default async function K9CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = await getK9Category(slug);
  if (!category) notFound();

  // category.slug jest juz typu K9Category - zadnego rzutowania z params nie trzeba
  const [products, categories] = await Promise.all([
    getK9Products(category.slug),
    getK9Categories(),
  ]);

  return (
    <>
      <header className="relative overflow-hidden border-b border-nf-border">
        <div
          aria-hidden="true"
          className="grid-tech pointer-events-none absolute inset-0 [--grid-size:48px]"
        />

        <div className={cn(CONTAINER, "relative pb-10 pt-8 lg:pb-14")}>
          <nav aria-label="Ścieżka nawigacji">
            {/* type-meta: jedno zrodlo dla oznaczen technicznych w K9. Recznie skladany
                font-mono z innym trackingiem rozjezdzal sie z kodami na kaflach */}
            <ol className="type-meta flex flex-wrap items-center gap-x-2 text-nf-dim">
              <li>
                <Link
                  href="/k9"
                  className="transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none"
                >
                  PAKT-K9
                </Link>
              </li>
              <li aria-hidden="true" className="text-nf-border-strong">
                /
              </li>
              <li aria-current="page" className="text-nf-muted">
                {category.title}
              </li>
            </ol>
          </nav>

          {/* bez znacznikow naroznikowych i bez maskowanego wjazdu naglowka: to byly
              ozdobniki, ktore nie niosly zadnej informacji */}
          <div className="mt-8">
            {/* pas ostrzegawczy - jedyne uzycie szrafury na stronie */}
            <div aria-hidden="true" className="hatch-red h-1.5 w-24" />

            <p className="type-meta mt-5 text-nf-dim">
              {category.code}
              <span aria-hidden="true" className="px-2 text-nf-border-strong">
                /
              </span>
              Sprzęt służbowy
            </p>

            <h1 className="type-h1 mt-4 text-nf-white">{category.title}</h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-nf-muted md:text-base">
              {category.description}
            </p>
          </div>
        </div>
      </header>

      <div className="border-b border-nf-border">
        <div className={cn(CONTAINER, "py-4")}>
          <K9CategoryNav categories={categories} active={category.slug} />
        </div>
      </div>

      <div className={cn(CONTAINER, "pb-20 pt-10")}>
        {products.length === 0 ? (
          <div className="border border-nf-border p-10 text-center">
            <p className="type-meta text-nf-dim">
              Brak pozycji w tej kategorii
            </p>
            <p className="mt-3 text-sm text-nf-muted">
              Pozostały sprzęt K9 znajdziesz w kategoriach na pasku powyżej.
            </p>
          </div>
        ) : (
          <>
            {/* h1 (tytul kategorii) -> h3 (nazwy pozycji) bylo przeskokiem poziomu.
                Naglowek jest sr-only: uklad zostaje, konspekt sie domyka */}
            <h2 id="k9-pozycje" className="sr-only">
              Pozycje w kategorii {category.title}
            </h2>

            {/* katalog renderuje sie od razu: animacja wjazdu trzymala kafle na opacity 0
                do momentu przewiniecia, a bez JS zostawialaby je niewidoczne */}
            <ul
              aria-labelledby="k9-pozycje"
              className="grid grid-cols-1 gap-px border border-nf-border bg-nf-border sm:grid-cols-2 xl:grid-cols-3"
            >
              {products.map((product) => (
                <li key={product.id} className="flex">
                  <K9ProductCard product={product} className="w-full" />
                </li>
              ))}

              {fillerCells(products.length).map((filler, i) => (
                <li
                  key={`filler-${i}`}
                  aria-hidden="true"
                  className={cn(
                    "hidden bg-nf-bg",
                    filler.sm ? "sm:block" : "sm:hidden",
                    filler.xl ? "xl:block" : "xl:hidden"
                  )}
                />
              ))}
            </ul>

            <div className="type-meta mt-4 flex items-center justify-between text-nf-dim">
              <span>Pozycji: {products.length}</span>
              <span aria-hidden="true">{category.code}</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
