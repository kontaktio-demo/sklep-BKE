import { Button } from "@/components/ui/Button";

/**
 * "Standard" (K9_IDENTITY.md §7: editorial, NOT icon-circles).
 *
 * Trzy rowne kafle z ikona w kolku sa wprost zakazane (§6), i sluszznie: to uklad, ktory
 * nie niesie zadnej informacji poza swoim ksztaltem. Zamiast tego karta danych: naglowek
 * po lewej (zakotwiczony, nie wysrodkowany), po prawej wiersze rozdzielone wlosowa linia,
 * kazdy z mono-etykieta po lewej i trescia po prawej. Czyta sie jak protokol, a nie jak
 * strona marketingowa.
 *
 * Sekcja oddechowa: rytm 96-160 px, w odroznieniu od gestego pasa kategorii (§3).
 */
const ENTRIES = [
  {
    label: "Test w terenie",
    body: "Nowa pozycja idzie najpierw do przewodników i pracuje z psami przez pełny sezon. Do sprzedaży wchodzi to, co wróciło bez pękniętego szwu i bez rozklepanego okucia.",
  },
  {
    label: "Parametry",
    body: "Przy każdej pozycji podajemy wytrzymałość na zerwanie i wagę w gramach. Jeżeli obroża waży 168 g i puszcza przy 380 kg, to stoi w karcie, a nie za słowem wytrzymała.",
  },
  {
    label: "Serwis",
    body: "Naprawiamy szwy i wymieniamy okucia u siebie, bez odsyłania sprzętu do producenta. Obroża wraca do służby, a nie czeka w kolejce reklamacyjnej przez kwartał.",
  },
];

export function K9Standards() {
  return (
    <section
      aria-labelledby="standard-naglowek"
      className="border-t border-k9-border bg-k9-bg"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-[clamp(96px,12vw,160px)] md:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-20">
          <div>
            <p className="type-k9-eyebrow text-k9-muted">
              Standard
              <span aria-hidden="true" className="px-2 text-k9-red">
                {"//"}
              </span>
              Linia K9
            </p>
            <span aria-hidden="true" className="mt-5 block h-0.5 w-16 bg-k9-red" />
            <h2 id="standard-naglowek" className="type-k9-h2 mt-6 text-k9-white">
              Sprzęt wraca
              <br />
              do służby
            </h2>
          </div>

          <dl>
            {ENTRIES.map((entry) => (
              <div
                key={entry.label}
                className="grid gap-3 border-t border-k9-border py-7 sm:grid-cols-[minmax(0,160px)_minmax(0,1fr)] sm:gap-8 last:border-b"
              >
                <dt className="type-k9-spec pt-1 text-k9-muted">{entry.label}</dt>
                <dd className="type-k9-body text-k9-text">{entry.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button size="lg" variant="danger" href="/k9/patrol">
            Przejdź do patrolu
          </Button>
          <Button size="lg" variant="ghost" href="/k9/zapytanie">
            Zapytanie dla jednostki
          </Button>
        </div>
      </div>
    </section>
  );
}
