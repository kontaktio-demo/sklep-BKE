/**
 * Pas parametrow (K9_IDENTITY.md §4: "spec strip / data blocks"). To sygnaturowy element
 * sekcji: monospace, wersaliki, wlosowe separatory, czerwona kropka jako znacznik.
 * Ma czytac sie jak ODCZYT z karty sprzetu, nie jak lista punktowana.
 *
 * Statyczna siatka, nie przewijany ticker: napis w nieskonczonej petli jest nie do
 * przeczytania, nie da sie go zaznaczyc ani wyszukac. Dokument dopuszcza "mono grid
 * OR ticker" - wybieram grid, bo tylko on niesie informacje.
 *
 * Wartosci nie sa haslami: kazda z nich stoi w specyfikacji pozycji K9 w katalogu.
 */
const SPECS = [
  "Taśma 1000D",
  "Klamra stalowa",
  "Zerwanie 380 kg",
  "Panel ID",
  "Moduł do 45 mm",
  "Szyte w Polsce",
];

export function K9SpecStrip() {
  return (
    <section
      aria-label="Parametry linii K9"
      className="border-y border-k9-border bg-k9-surface"
    >
      <div className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-12">
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {SPECS.map((spec, i) => (
            <li
              key={spec}
              className={[
                "type-k9-spec flex items-center gap-2.5 py-4 text-k9-text",
                // wlosowe linie zamiast odstepow: struktura rysowana linia (§3)
                "border-k9-border",
                i % 2 === 1 ? "border-l pl-4" : "",
                "md:border-l md:pl-4 md:first:border-l-0 md:first:pl-0",
                "lg:first:border-l-0 lg:first:pl-0",
              ].join(" ")}
            >
              <span aria-hidden="true" className="size-1 shrink-0 bg-k9-red" />
              {spec}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
