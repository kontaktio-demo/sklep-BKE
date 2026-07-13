import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Ścieżka nawigacji">
      {/* focus-visible bierze się z globalnego :focus-visible w globals.css */}
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-nf-dim">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-x-2">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="rounded-[2px] transition-colors duration-250 ease-nf hover:text-white"
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
