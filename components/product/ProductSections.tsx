import { SectionNav } from "@/components/product/SectionNav";
import { CheckIcon } from "@/components/ui/icons";
import { SIZE_NAME, SIZE_NECK, SIZE_ORDER, SIZE_WEIGHT } from "@/lib/sizes";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

// tabela czyta zakresy z lib/sizes - ten sam slownik, ktory zasila filtry i BuyBox
const FREE_SHIPPING_THRESHOLD = 299;

const SECTION = "border-t border-nf-border pt-10 mt-12";
const HEADING = "type-h2 text-white";
const CELL = "px-4 py-3.5 text-left";

export function ProductSections({ product }: { product: Product }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
      <SectionNav />
      <div className="min-w-0">
        <section id="opis" className="scroll-mt-28" aria-labelledby="opis-heading">
          <h2 id="opis-heading" className={HEADING}>
            Opis
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-nf-text">{product.description}</p>
          <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2 text-sm text-nf-text">
                {/* znacznik jest neutralny - czerwień zostaje dla CTA i stanu aktywnego */}
                <CheckIcon width={16} height={16} className="mt-0.5 shrink-0 text-nf-dim" />
                {highlight}
              </li>
            ))}
          </ul>
        </section>

        <section
          id="specyfikacja"
          className={cn(SECTION, "scroll-mt-28")}
          aria-labelledby="specyfikacja-heading"
        >
          <h2 id="specyfikacja-heading" className={HEADING}>
            Specyfikacja
          </h2>
          <dl className="mt-4 max-w-3xl">
            {product.specs.map((spec) => (
              <div
                key={spec.label}
                className="grid grid-cols-[minmax(0,180px)_1fr] gap-4 border-b border-nf-border py-3.5"
              >
                <dt className="text-sm text-nf-dim">{spec.label}</dt>
                <dd className="text-sm text-nf-text">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          id="rozmiary"
          className={cn(SECTION, "scroll-mt-28")}
          aria-labelledby="rozmiary-heading"
        >
          <h2 id="rozmiary-heading" className={HEADING}>
            Rozmiary
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-nf-text">
            Zmierz obwód szyi w najszerszym miejscu i dodaj 2-3 cm luzu. Waga psa jest tylko
            orientacyjna, decyduje pomiar.
          </p>
          {/* focusable so the scroll container is reachable from the keyboard (WCAG 2.1.1) */}
          <div
            tabIndex={0}
            role="region"
            aria-label="Tabela rozmiarów"
            className="mt-6 max-w-3xl overflow-x-auto"
          >
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-nf-border-strong">
                  <th scope="col" className={cn(CELL, "font-medium text-nf-dim")}>
                    Rozmiar
                  </th>
                  <th scope="col" className={cn(CELL, "font-medium text-nf-dim")}>
                    Obwód szyi
                  </th>
                  <th scope="col" className={cn(CELL, "font-medium text-nf-dim")}>
                    Waga psa (orientacyjnie)
                  </th>
                </tr>
              </thead>
              <tbody>
                {SIZE_ORDER.map((size) => {
                  const current = size === product.size;
                  return (
                    <tr key={size} className="border-b border-nf-border">
                      <th
                        scope="row"
                        className={cn(
                          CELL,
                          "font-medium",
                          // wiersz produktu znaczy czerwona krawędź i biel tekstu, nie tło;
                          // sr-only note keeps it perceivable without color
                          current
                            ? "border-l-2 border-nf-red text-white"
                            : "text-nf-muted"
                        )}
                      >
                        {SIZE_NAME[size]}
                        {current && <span className="sr-only"> (rozmiar tego produktu)</span>}
                      </th>
                      <td className={cn(CELL, current ? "text-white" : "text-nf-muted")}>
                        {SIZE_NECK[size]}
                      </td>
                      <td className={cn(CELL, current ? "text-white" : "text-nf-muted")}>
                        {SIZE_WEIGHT[size]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="dostawa"
          className={cn(SECTION, "scroll-mt-28")}
          aria-labelledby="dostawa-heading"
        >
          <h2 id="dostawa-heading" className={HEADING}>
            Dostawa i zwroty
          </h2>
          <div className="mt-4 grid max-w-4xl gap-6 sm:grid-cols-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-nf-text">Wysyłka</h3>
              <p className="text-sm leading-relaxed text-nf-muted">
                Wysyłka w 24 h w dni robocze. Do wyboru kurier lub paczkomat, sposób dostawy
                wskazujesz w koszyku.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-nf-text">Koszt dostawy</h3>
              <p className="text-sm leading-relaxed text-nf-muted">
                Darmowa dostawa od {formatPrice(FREE_SHIPPING_THRESHOLD)}. Poniżej tej kwoty koszt
                zależy od przewoźnika i widać go w koszyku.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-nf-text">Zwroty i gwarancja</h3>
              <p className="text-sm leading-relaxed text-nf-muted">
                60 dni na zwrot lub wymianę rozmiaru. Na szwy i okucia udzielamy 2 lat gwarancji.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
