import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * mono = rytm sekcji Dog Store Pro (oznaczenia techniczne). Sklep cywilny zostaje na kroju
 * podstawowym, zeby okruszki nie udawaly karty katalogowej.
 */
export function Breadcrumbs({
  items,
  mono = false,
}: {
  items: BreadcrumbItem[];
  mono?: boolean;
}) {
  return (
    <nav aria-label="Ścieżka nawigacji">
      {/* focus-visible bierze się z globalnego :focus-visible w globals.css */}
      <ol
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 text-nf-dim",
          // type-meta = mono 11px uppercase 0.2em (globals.css), ten sam rytm co okruszki
          // na /pro/[category] i pasek techniczny w BuyBox
          mono ? "type-meta" : "text-xs"
        )}
      >
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-x-2">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="rounded-[2px] transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={last ? "text-nf-muted" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!last && (
                <span aria-hidden="true" className="text-nf-border-strong">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
