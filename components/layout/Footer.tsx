// §8-K [VERDICT: NSDW mega-footer] - komponent serwerowy

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FOOTER_COLUMNS, LEGAL_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { PaymentIcons } from "./PaymentIcons";
import { FOOTER, type Theme } from "./theme";

// Stopka jest zawsze grafitowa, takze pod jasnym sklepem: to blok domykajacy strone,
// nie kolejna sekcja tresci. data-shell="dark" przelacza tokeny w calym poddrzewie,
// wiec te same klasy (nf-*) renderuja sie tu ciemno niezaleznie od trasy.
export async function Footer() {
  const theme: Theme = "dark";
  const t = FOOTER[theme];
  const tn = await getTranslations("nav");

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
          {/* Stopka nosi znak calego serwisu (Dog Store) takze pod sekcja Pro: to blok
              domykajacy strone, a nie naglowek sekcji. Do sklepu sluzbowego prowadzi
              wlasna kolumna linkow obok. */}
          <Logo
            variant="lockup"
            onDark
            markClassName="h-20 w-auto"
            wordmarkClassName="h-11 w-auto"
            className="gap-4"
          />
          <p className={cn("max-w-sm text-sm leading-relaxed", t.lead)}>
            {tn("footer.tagline")}
          </p>
        </div>
        {/* 5 kolumn od lg: doszla kolumna Dog Store Pro (FOOTER_COLUMNS). Przy grid-cols-4
            piata kolumna spadala do drugiego wiersza i wygladala jak dopisek */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={tn(col.title)}>
              {/* type-label, nie type-meta: monospace zostaje wylacznie na oznaczenia
                  techniczne w sekcji Pro */}
              <h3 className={cn("type-label mb-4", t.heading)}>{tn(col.title)}</h3>
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
                      {tn(link.label)}
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
          <p className={cn("text-sm", t.lead)}>{tn("footer.region")}</p>
          <PaymentIcons theme={theme} />
        </div>
        <div
          className={cn(
            "mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs",
            t.legal
          )}
        >
          <p>{tn("footer.rights")}</p>
          {/* Atrybucja zdjęć tymczasowych (Wikimedia Commons, CC BY / CC BY-SA). Zwykły
              tekst, nie link do surowego pliku. Znika razem z placeholderami po sesji
              własnej fotografki. */}
          <p>{tn("footer.photoCredits")}</p>
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
                  {tn(link.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
