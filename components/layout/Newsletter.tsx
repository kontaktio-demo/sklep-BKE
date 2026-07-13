"use client";

// Pas z zapisem na newsletter. Grafitowa wyspa nad stopka: razem z nia tworzy blok
// domykajacy strone, i to samo dzieje sie w obu sklepach.

import { usePathname } from "next/navigation";
import { useId } from "react";
import { Button } from "@/components/ui/Button";
import { COMPANY, isK9Route } from "@/lib/nav";

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
  const pathname = usePathname();
  const k9 = isK9Route(pathname);
  const copy = k9 ? K9_COPY : SHOP_COPY;
  const headingId = useId();

  return (
    // data-shell="dark" odwraca tokeny w calym poddrzewie: te same klasy nf-* stoja
    // tu ciemno takze wtedy, gdy strona wokol jest jasna.
    <section
      aria-labelledby={headingId}
      data-shell="dark"
      data-surface="dark"
      className="border-y border-nf-border bg-nf-bg py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 md:px-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-5">
          {/* monospace zostaje na oznaczenia techniczne w K9; w sklepie zwykla etykieta */}
          <p className={k9 ? "type-meta text-nf-dim" : "type-label text-nf-dim"}>
            {copy.eyebrow}
          </p>
          <h2 id={headingId} className="type-h2 mt-4 text-nf-white">
            {copy.heading[0]}
            <br />
            {copy.heading[1]}
          </h2>
          {copy.lead && (
            <p className="mt-5 max-w-md text-sm leading-relaxed text-nf-muted">{copy.lead}</p>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="flex flex-col items-start gap-4 border-t border-nf-border pt-6 sm:flex-row sm:items-center">
            <Button href={copy.mailto} className="h-12">
              {copy.cta}
            </Button>
            <p className="text-sm text-nf-muted">{copy.email}</p>
          </div>
          <p className="mt-3 text-xs text-nf-dim">{copy.note}</p>
        </div>
      </div>
    </section>
  );
}
