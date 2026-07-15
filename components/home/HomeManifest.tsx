import Link from "next/link";

/**
 * Blackout: JEDYNE pelnoekranowe ciecie grafitu na trasie cywilnej. Rytm strony
 * to papier (dlugi) -> grafit (krotki) -> papier; twarda krawedz, zero gradientow.
 * Wewnatrz wyspy wolno duzej skali - ciemne tlo ja usprawiedliwia, a serif na
 * graficie to podpis calej dyrekcji (cywilny glos w swiecie ciemnosci).
 *
 * Tresc to dawna deklaracja z hero - zdanie, ktore NIESIE marke, dostaje wlasna
 * scene zamiast ginac pod naglowkiem.
 */
export function HomeManifest() {
  return (
    <section data-shell="dark" className="bg-nf-bg">
      <div className="mx-auto max-w-[1600px] px-4 py-24 md:px-6 md:py-36">
        {/* jedyna czerwien wyspy */}
        <span aria-hidden="true" className="block h-0.5 w-14 bg-nf-red-bright" />
        <p className="type-kicker mt-6 text-nf-dim">Nasza robota</p>

        <blockquote className="type-display mt-10 max-w-5xl text-nf-white">
          Te same szwy i okucia trafiają do psa służbowego i&nbsp;do psa, który
          wychodzi na spacer.
        </blockquote>

        {/* wyjscie z manifestu zakotwiczone do PRAWEJ - asymetria domyka wyspe */}
        <div className="mt-14 flex justify-end">
          <Link
            href="/o-nas"
            className="type-label flex min-h-11 items-center text-nf-muted transition-colors duration-250 ease-nf hover:text-nf-white"
          >
            Jak testujemy sprzęt&nbsp;&nbsp;→
          </Link>
        </div>
      </div>
    </section>
  );
}
