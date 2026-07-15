const POINTS = [
  {
    title: "Parametry, nie hasła",
    body: "Przy każdej obroży podajemy szerokość taśmy, obwód szyi i wagę. Wytrzymałość podajemy z testu, a nie z ulotki.",
  },
  {
    title: "Najpierw teren",
    body: "Nowy model trafia do przewodników na kilka miesięcy pracy. Do sprzedaży wchodzi wtedy, gdy wraca bez uwag.",
  },
  {
    title: "Naprawiamy",
    body: "Rozprute szwy i zużyte okucia wymieniamy u siebie. Nie odsyłamy do producenta, bo producentem jesteśmy my.",
  },
];

// Zygzak zamiast rownego rzedu: kazdy punkt siedzi w innych kolumnach 12-polowej
// siatki (1-5, 7-11 nizej, 3-7), wiec oko idzie po stronie jak po rozkladowce,
// nie po tabeli. Na mobile punkty wracaja do pionu.
const PLACEMENTS = [
  "lg:col-start-1 lg:col-span-5",
  "lg:col-start-7 lg:col-span-5 lg:mt-24",
  "lg:col-start-3 lg:col-span-5 lg:mt-8",
];

export function HomeIntro() {
  return (
    <section className="border-t border-nf-border bg-nf-bg">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-28">
        <p className="type-kicker text-nf-dim">Jak pracujemy</p>
        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-y-0">
          {POINTS.map((point, i) => (
            <div key={point.title} className={PLACEMENTS[i]}>
              <div className="border-t border-nf-border pt-6">
                <h3 className="type-h2 text-nf-white">{point.title}</h3>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-nf-text">
                  {point.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
