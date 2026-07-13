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

// Trzy zdania o robocie. Bez numeracji monospace, bez asymetrii, bez ikon:
// to byla dekoracja udajaca tresc.
export function HomeIntro() {
  return (
    <section className="border-t border-nf-border bg-nf-elevated">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20">
        <h2 className="type-h2 text-nf-white">Jak pracujemy</h2>
        <ul className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
          {POINTS.map((point) => (
            <li key={point.title} className="border-t border-nf-border pt-5">
              <h3 className="type-h3 text-nf-white">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-nf-text">{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
