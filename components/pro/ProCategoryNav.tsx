import Link from "next/link";
import type { ProCategory, ProCategoryInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

// Server component: stan aktywnej zakladki przychodzi z trasy, hover robi CSS.
// Zero JS po stronie klienta.
//
// Zakladki stoja flush (-ml-px zbija dwie ramki w jedna linie 1px), przez co pasek
// czyta sie jak listwa sterownicza, a nie jak rzad przyciskow. Aktywna zakladka dostaje
// relative z-10, zeby jej czerwona ramka nie znikala pod ramka sasiada.

const ITEM_BASE =
  "type-meta inline-flex min-h-11 items-center whitespace-nowrap border px-4 py-3 transition-colors duration-250 ease-nf motion-reduce:transition-none";
const ITEM_ACTIVE = "relative z-10 border-nf-red text-nf-white";
const ITEM_IDLE =
  "border-nf-border text-nf-dim hover:border-nf-border-strong hover:text-nf-white";

export function ProCategoryNav({
  categories,
  active,
  className,
}: {
  categories: ProCategoryInfo[];
  /** brak wartosci = jestesmy na /pro, aktywne jest "Wszystkie" */
  active?: ProCategory;
  className?: string;
}) {
  const allActive = active === undefined;

  return (
    <nav aria-label="Kategorie Dog Store Pro" className={className}>
      {/* Tor przewija sie w poziomie, a overflow-x: auto wymusza tez overflow-y: auto -
          czyli przycina rowniez gore i dol. Obwodka fokusu to 2px linii + 2px odstepu
          + 4px czarnej otoczki, razem 8px poza zakladka, wiec bez zapasu ginela w calosci.
          p-2 daje ten zapas wewnatrz toru, -m-2 zdejmuje go z ukladu (zakladki stoja tam,
          gdzie stały), a scroll-p-2 pilnuje, zeby zakladka wjezdzajaca w kadr przy tabowaniu
          zatrzymala sie za krawedzia, a nie na niej. */}
      <ul className="no-scrollbar -m-2 flex overflow-x-auto scroll-p-2 p-2">
        <li className="shrink-0">
          <Link
            href="/pro"
            aria-current={allActive ? "page" : undefined}
            className={cn(ITEM_BASE, allActive ? ITEM_ACTIVE : ITEM_IDLE)}
          >
            Wszystkie
          </Link>
        </li>

        {categories.map((category) => {
          const isActive = category.slug === active;
          return (
            <li key={category.slug} className="-ml-px shrink-0">
              <Link
                href={`/pro/${category.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(ITEM_BASE, isActive ? ITEM_ACTIVE : ITEM_IDLE)}
              >
                {category.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
