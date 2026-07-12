// §8-K [VERDICT: NSDW mega-footer] — server component (uncontrolled select)

import Link from "next/link";
import { GlobeIcon } from "@/components/ui/icons";
import { BRAND, FOOTER_COLUMNS, LEGAL_LINKS, REGIONS } from "@/lib/nav";
import { PaymentIcons } from "./PaymentIcons";

export function Footer() {
  return (
    <footer className="border-t border-nf-border bg-nf-black">
      <div className="container mx-auto px-4 py-14 lg:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-4 text-[11px] uppercase tracking-widest text-nf-dim">
                {col.title}
              </h3>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="flex min-h-11 items-center text-sm text-nf-muted transition-colors duration-250 ease-nf hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-nf-border pt-6">
          <div className="flex items-center gap-2">
            <GlobeIcon aria-hidden="true" className="shrink-0 text-nf-dim" />
            <select
              aria-label="Region i waluta"
              defaultValue={REGIONS[0]}
              className="h-11 rounded-[4px] border border-nf-border bg-nf-elevated px-3 text-sm text-nf-text"
            >
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <PaymentIcons />
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-nf-dim">
          <p>© 2026 {BRAND}. Wersja demo — wszystkie produkty są przykładowe.</p>
          <ul className="flex flex-wrap gap-x-4">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="transition-colors duration-250 ease-nf hover:text-nf-muted"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
