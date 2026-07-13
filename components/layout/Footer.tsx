"use client";

// §8-K [VERDICT: NSDW mega-footer]
// Client component wyłącznie po to, żeby poznać ścieżkę: stopka chodzi w dwóch motywach
// ("/" = papier, reszta = czerń). Layout nie zna ścieżki, więc czytamy ją usePathname.
// Select regionu zostaje niekontrolowany (defaultValue) - bez stanu, bez zmiany zachowania.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlobeIcon } from "@/components/ui/icons";
import { BRAND, FOOTER_COLUMNS, LEGAL_LINKS, REGIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { PaymentIcons } from "./PaymentIcons";
import { FOOTER, type Theme } from "./theme";
import { isLightRoute } from "./ThemeSync";

export function Footer() {
  const pathname = usePathname();
  const light = isLightRoute(pathname);
  const theme: Theme = light ? "light" : "dark";
  const t = FOOTER[theme];

  return (
    <footer className={cn("border-t", t.shell)}>
      <div className="container mx-auto px-4 py-14 lg:px-6">
        <div
          className={cn(
            "mb-12 flex flex-col gap-4 border-b pb-10 md:flex-row md:items-end md:justify-between",
            t.line
          )}
        >
          <Logo
            variant="lockup"
            onDark={!light}
            markClassName="h-24 w-auto"
            wordmarkClassName="h-8 w-auto"
            className="gap-4"
          />
          <p className={cn("max-w-sm text-sm leading-relaxed", t.lead)}>
            Obroże i sprzęt dla psów pracujących. Projektujemy i szyjemy w Polsce,
            testujemy z przewodnikami.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className={cn("mb-4 text-[11px] uppercase tracking-widest", t.heading)}>
                {col.title}
              </h3>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex min-h-11 items-center text-sm transition-colors duration-250 ease-nf",
                        t.link
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div
          className={cn(
            "mt-12 flex flex-wrap items-center justify-between gap-6 border-t pt-6",
            t.line
          )}
        >
          <div className="flex items-center gap-2">
            <GlobeIcon aria-hidden="true" className={cn("shrink-0", t.globe)} />
            <select
              aria-label="Region i waluta"
              defaultValue={REGIONS[0]}
              className={cn("h-11 rounded-[4px] border px-3 text-sm", t.select)}
            >
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <PaymentIcons theme={theme} />
        </div>
        <div
          className={cn(
            "mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs",
            t.legal
          )}
        >
          <p>© 2026 {BRAND}. Wszystkie prawa zastrzeżone.</p>
          <ul className="flex flex-wrap gap-x-4">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={cn(
                    "transition-colors duration-250 ease-nf",
                    t.legalLink
                  )}
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
