import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STANDARDS = [
  {
    no: "01",
    title: "Testy w terenie",
    body: "Nowa pozycja idzie najpierw do przewodników i pracuje z psami przez pełny sezon. Do sprzedaży wchodzi to, co wróciło z terenu bez pękniętego szwu i bez rozklepanego okucia.",
  },
  {
    no: "02",
    title: "Parametry, nie hasła",
    body: "Przy każdej pozycji podajemy wytrzymałość na zerwanie i wagę w gramach. Jeżeli obroża waży 168 g i puszcza przy 380 kg, to jest napisane w karcie, a nie schowane za słowem wytrzymała.",
  },
  {
    no: "03",
    title: "Serwis",
    body: "Naprawiamy szwy i wymieniamy okucia u siebie, bez odsyłania sprzętu do producenta. Obroża wraca do służby, a nie czeka w kolejce reklamacyjnej przez kwartał.",
  },
];

export function K9Standards() {
  return (
    <section className="border-t border-nf-border bg-nf-bg">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-24">
        <div className="flex items-center gap-4">
          {/* numer sekcji to oznaczenie porzadkowe, nie alarm - stad nf-dim zamiast czerwieni */}
          <span className="type-meta text-nf-dim">02</span>
          <h2 className="type-h2 text-white">Standard</h2>
          <span aria-hidden="true" className="hatch h-px flex-1" />
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-0">
          {STANDARDS.map((item, i) => (
            <li
              key={item.no}
              className={cn(
                "md:px-8",
                i === 0 ? "md:pl-0" : "md:border-l md:border-nf-border"
              )}
            >
              <span className="type-meta text-nf-dim">{item.no}</span>
              <h3 className="type-h3 mt-4 text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-nf-muted">{item.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-16 flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
          <Button size="lg" href="/k9/patrol" className="shrink-0">
            Przejdź do patrolu
          </Button>
          <span
            aria-hidden="true"
            className="hatch h-8 min-w-0 flex-1 border-y border-nf-border"
          />
        </div>
      </div>
    </section>
  );
}
