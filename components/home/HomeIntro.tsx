import { Reveal } from "@/components/motion/Reveal";

const POINTS = [
  {
    code: "01",
    title: "Parametry, nie hasła",
    body: "Przy każdej obroży podajemy szerokość taśmy, obwód szyi i wagę. Wytrzymałość podajemy z testu, a nie z ulotki.",
  },
  {
    code: "02",
    title: "Najpierw teren",
    body: "Nowy model trafia do przewodników na kilka miesięcy pracy. Do sprzedaży wchodzi wtedy, gdy wraca bez uwag.",
  },
  {
    code: "03",
    title: "Naprawiamy",
    body: "Rozprute szwy i zużyte okucia wymieniamy u siebie. Nie odsyłamy do producenta, bo producentem jesteśmy my.",
  },
];

// Sekcja "co robimy": asymetryczna, oparta na linii i numeracji, bez ikon i ozdobników.
export function HomeIntro() {
  return (
    <section className="bg-pk-paper">
      <div className="mx-auto max-w-[1600px] px-4 py-24 md:px-6 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            {/* eyebrow: oznaczenie sekcji, nie akcja - czerwien schodzi do tuszu */}
            <p className="type-meta text-pk-ink-muted">Jak pracujemy</p>
            <h2 className="type-h2 mt-6 text-pk-ink">
              Sprzęt oceniamy
              <br />
              po tym, co z niego
              <br />
              zostaje po sezonie
            </h2>
          </div>

          <Reveal
            as="ul"
            selector="[data-point]"
            stagger={0.08}
            className="grid gap-px bg-pk-line lg:col-span-7"
          >
            {POINTS.map((point) => (
              <li key={point.code} data-point className="bg-pk-paper py-8 first:pt-0">
                <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-8">
                  <span className="type-meta text-pk-ink-muted">{point.code}</span>
                  <div>
                    <h3 className="type-h3 text-pk-ink">{point.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-pk-ink-2">
                      {point.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
