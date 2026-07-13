import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";

// Charakter sekcji niosa MATERIALY: grafit, siatka techniczna, pas szrafury, monospace
// na oznaczeniach. Nie niesie go ruch. Zniknely: maskowany wjazd wierszy naglowka,
// animowany wskaznik przewijania i znaczniki naroznikowe - to byla dekoracja udajaca projekt.
// Komponent nie potrzebuje juz stanu ani JS, wiec jest serwerowy.
export function K9Hero() {
  return (
    <section className="relative overflow-hidden border-b border-nf-border bg-nf-bg">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-tech opacity-60"
        style={
          {
            "--grid-size": "72px",
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
          } as CSSProperties
        }
      />
      {/* pas szrafury: wojskowe oznaczenie krawedzi, nie ozdobnik */}
      <div aria-hidden="true" className="hatch-red absolute inset-x-0 top-0 h-1.5" />

      <div className="relative mx-auto max-w-[1600px] px-4 py-20 md:px-6 md:py-28">
        <div className="type-meta flex items-center justify-between border-b border-nf-border pb-4 text-nf-dim">
          <span>PAKT-K9</span>
          <span>Sprzęt służbowy</span>
        </div>

        <h1 className="type-display mt-10 max-w-3xl text-nf-white">
          Psy, które pracują pod obciążeniem
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-nf-muted">
          Linia K9 to sprzęt do służby patrolowej, pracy węchowej i szkolenia. Pies
          służbowy obciąża obrożę inaczej niż pies rodzinny, więc taśma, okucia i
          przeszycia są tu dobierane pod inne wartości. To osobna linia produktowa:
          tych pozycji nie znajdziesz w sklepie cywilnym.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" href="#kategorie">
            Zobacz kategorie
          </Button>
          <Button size="lg" variant="ghost" href="/collections/collars">
            Sklep cywilny
          </Button>
        </div>
      </div>
    </section>
  );
}
