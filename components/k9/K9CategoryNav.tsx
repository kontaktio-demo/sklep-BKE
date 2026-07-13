import Link from "next/link";
import type { K9Category, K9CategoryInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

// Server component: stan aktywnej zakladki przychodzi z trasy, hover robi CSS.
// Zero JS po stronie klienta.
//
// Zakladki stoja flush (-ml-px zbija dwie ramki w jedna linie 1px), przez co pasek
// czyta sie jak listwa sterownicza, a nie jak rzad przyciskow. Aktywna zakladka dostaje
// relative z-10, zeby jej czerwona ramka nie znikala pod ramka sasiada.

const ITEM_BASE =
  "inline-flex min-h-11 items-center whitespace-nowrap border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors duration-250 ease-nf motion-reduce:transition-none";
const ITEM_ACTIVE = "relative z-10 border-nf-red text-nf-white";
const ITEM_IDLE =
  "border-nf-border text-nf-dim hover:border-nf-border-strong hover:text-nf-white";

export function K9CategoryNav({
  categories,
  active,
  className,
}: {
  categories: K9CategoryInfo[];
  /** brak wartosci = jestesmy na /k9, aktywne jest "Wszystkie" */
  active?: K9Category;
  className?: string;
}) {
  const allActive = active === undefined;

  return (
    <nav aria-label="Kategorie PAKT-K9" className={className}>
      <ul className="no-scrollbar flex overflow-x-auto">
        <li className="shrink-0">
          <Link
            href="/k9"
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
                href={`/k9/${category.slug}`}
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
