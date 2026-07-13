"use client";

// §8-J [VERDICT: NSDW] - pas z zapisem na newsletter, w motywie strony

import { usePathname } from "next/navigation";
import { useId } from "react";
import { Button } from "@/components/ui/Button";
import { COMPANY, isK9Route } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface NewsletterCopy {
  eyebrow: string;
  heading: [string, string];
  lead?: string;
  note: string;
  cta: string;
  /** Adres zapisu. Sklep i linia K9 maja osobne skrzynki, wiec adres idzie razem z trescia. */
  email: string;
  mailto: string;
}

// Sklep mowi o nowych modelach, linia K9 o zmianach w katalogu i wynikach testow. Zadna
// z wersji nie obiecuje rabatu: kodu nie ma jak wystawic, wiec znika tez z podpisu.
//
// Zapis idzie mailem, bo nie ma serwera, ktory przyjalby adres z pola. Formularz, ktory
// tylko podmienia stan w przegladarce, potwierdzalby zapis, ktorego nie ma - wiec go tu
// nie ma. Przycisk otwiera wiadomosc z gotowym tematem i to jest cala akcja.
const SHOP_COPY: NewsletterCopy = {
  eyebrow: "Newsletter",
  heading: ["Nowe modele trafiają", "najpierw do subskrybentów"],
  note: "Do listy dopisujemy ręcznie, po odebraniu wiadomości. Wypisujesz się jednym mailem.",
  cta: "Zapisz się mailem",
  email: COMPANY.shopEmail,
  mailto: `mailto:${COMPANY.shopEmail}?subject=${encodeURIComponent("Newsletter PAKT: zapis")}`,
};

const K9_COPY: NewsletterCopy = {
  eyebrow: "PAKT-K9",
  heading: ["Nowe pozycje", "w katalogu K9"],
  lead: "Wiadomość wychodzi, gdy do katalogu wchodzi nowa pozycja albo gdy zmieniamy konstrukcję istniejącej. Do tego wyniki testów: obciążenia statyczne, ścieranie taśmy, zachowanie okuć po sezonie pracy.",
  note: "Bez ofert i bez rabatów. Do listy dopisujemy ręcznie, po odebraniu wiadomości. Wypisujesz się jednym mailem.",
  cta: "Zapisz się mailem",
  email: COMPANY.k9Email,
  mailto: `mailto:${COMPANY.k9Email}?subject=${encodeURIComponent("Katalog PAKT-K9: zapis")}`,
};

export function Newsletter() {
  // Ciemny na kazdej trasie: na stronie glownej lezy pod panelem PAKT-K9, wiec powrot
  // do papieru rozbijalby zejscie z jasnego swiata w ciemny.
  const light = false;
  const pathname = usePathname();
  const copy = isK9Route(pathname) ? K9_COPY : SHOP_COPY;
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      data-surface="dark"
      className={cn(
        "border-y py-16 md:py-24",
        light ? "border-pk-line bg-pk-paper-2" : "border-nf-border bg-nf-black"
      )}
    >
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 md:px-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-5">
          <p className={cn("type-meta", light ? "text-pk-ink-muted" : "text-nf-dim")}>
            {copy.eyebrow}
          </p>
          <h2
            id={headingId}
            className={cn("type-h2 mt-4", light ? "text-pk-ink" : "text-white")}
          >
            {copy.heading[0]}
            <br />
            {copy.heading[1]}
          </h2>
          {copy.lead && (
            <p
              className={cn(
                "mt-5 max-w-md text-sm leading-relaxed",
                light ? "text-pk-ink-2" : "text-nf-muted"
              )}
            >
              {copy.lead}
            </p>
          )}
        </div>

        <div className="lg:col-span-7">
          <div
            className={cn(
              "flex flex-col items-start gap-4 border-t pt-6 sm:flex-row sm:items-center",
              light ? "border-pk-line" : "border-nf-border"
            )}
          >
            <Button
              href={copy.mailto}
              className={cn("h-12", light && "bg-pk-ink text-pk-paper hover:bg-pk-red")}
            >
              {copy.cta}
            </Button>
            <p className={cn("text-sm", light ? "text-pk-ink-2" : "text-nf-muted")}>
              {copy.email}
            </p>
          </div>
          <p className={cn("mt-3 text-xs", light ? "text-pk-ink-muted" : "text-nf-dim")}>
            {copy.note}
          </p>
        </div>
      </div>
    </section>
  );
}
