// §8-K [VERDICT: NSDW mega-footer] - komponent serwerowy

import Link from "next/link";
import { BRAND, FOOTER_COLUMNS, LEGAL_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { PaymentIcons } from "./PaymentIcons";
import { FOOTER, type Theme } from "./theme";

// Stopka jest zawsze grafitowa, takze pod jasnym sklepem: to blok domykajacy strone,
// nie kolejna sekcja tresci. data-shell="dark" przelacza tokeny w calym poddrzewie,
// wiec te same klasy (nf-*) renderuja sie tu ciemno niezaleznie od trasy.
export function Footer() {
  const theme: Theme = "dark";
  const t = FOOTER[theme];

  return (
    <footer data-shell="dark" className={cn("border-t", t.shell)}>
      {/* ta sama siatka co naglowek i tresc stron - kolumny stopki nie moga sie
          rozjezdzac z trescia powyzej na szerokich ekranach */}
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-24">
        <div
          className={cn(
            "mb-12 flex flex-col gap-4 border-b pb-10 md:flex-row md:items-end md:justify-between",
            t.line
          )}
        >
          <Logo
            variant="lockup"
            onDark
            markClassName="h-24 w-auto"
            wordmarkClassName="h-8 w-auto"
            className="gap-4"
          />
          <p className={cn("max-w-sm text-sm leading-relaxed", t.lead)}>
            Obroże i sprzęt dla psów pracujących. Projektujemy i szyjemy w Polsce,
            testujemy z przewodnikami.
          </p>
        </div>
        {/* 5 kolumn od lg: doszla kolumna PAKT-K9 (FOOTER_COLUMNS). Przy grid-cols-4
            piata kolumna spadala do drugiego wiersza i wygladala jak dopisek */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              {/* type-label, nie type-meta: monospace zostaje wylacznie na oznaczenia
                  techniczne w sekcji K9 */}
              <h3 className={cn("type-label mb-4", t.heading)}>{col.title}</h3>
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
          {/* Byl tu selektor regionu i waluty z EUR, USD i GBP - martwy (bez stanu, bez
              obslugi) i klamliwy: sklep liczy w zlotowkach i wysyla do Polski oraz Unii.
              Zostaje sama informacja, bo tyle jest prawda. */}
          <p className={cn("text-sm", t.lead)}>Polska (PLN)</p>
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
                {/* min-h-11 jak w kolumnach wyzej: 16 px wysokosci tekstu to nie jest cel,
                    w ktory da sie trafic kciukiem */}
                <Link
                  href={link.href}
                  className={cn(
                    "flex min-h-11 items-center transition-colors duration-250 ease-nf",
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
