import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Ścieżka nawigacji">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-x-2">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="rounded-[2px] text-xs text-nf-muted transition-colors duration-250 ease-nf hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className="text-xs text-nf-text"
                >
                  {item.label}
                </span>
              )}
              {!last && (
                <span aria-hidden="true" className="text-xs text-nf-dim">
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
