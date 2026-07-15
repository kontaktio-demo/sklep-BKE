import Image from "next/image";
import Link from "next/link";
import { photo } from "@/lib/photos";
import { cn } from "@/lib/utils";

/**
 * Otwarcie jak okladka magazynu terenowego, NIE pelnoekranowy baner: lewa kolumna
 * niesie kicker mono, serifowy display i CTA, prawa - kadr 4:5 osadzony w siatce.
 * Naglowek WCHODZI na zdjecie (kolumny 12-polowej siatki nachodza na siebie) - to
 * przelamanie robi kompozycje, ktorej nie da zaden wysrodkowany hero.
 *
 * Dyscyplina czerwieni: jedyna czerwien w kadrze to obroza na zdjeciu. Zadnego
 * czerwonego tekstu, zadnego czerwonego przycisku - sygnal nosi pies.
 */
const CTA_BASE =
  "inline-flex h-12 items-center rounded-[4px] px-7 text-[13px] font-semibold uppercase tracking-[0.04em] transition-colors duration-250 ease-nf motion-reduce:transition-none";

export function HomeHero() {
  const src = photo("hero.jpg");

  return (
    <section className="relative overflow-hidden border-b border-nf-border bg-nf-bg">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-start gap-y-10 px-4 pb-14 pt-10 md:px-6 lg:grid-cols-12 lg:gap-y-0 lg:pb-24 lg:pt-16">
        {/* tekst: kolumny 1-8; zdjecie zaczyna sie w kolumnie 8 - stad przeciecie */}
        <div className="relative z-10 lg:col-span-8 lg:col-start-1 lg:row-start-1 lg:pt-10">
          <p className="type-kicker text-nf-dim">
            Sprzęt dla psów pracujących&nbsp;&nbsp;·&nbsp;&nbsp;szyty w Polsce
          </p>

          <h1 className="type-display mt-7 max-w-[12ch] text-nf-white">
            Sprzęt dla psów, które{" "}
            <em className="italic" style={{ fontVariationSettings: '"SOFT" 60' }}>
              pracują
            </em>
          </h1>

          <p className="mt-8 max-w-md text-base leading-relaxed text-nf-muted">
            Obroże nylonowe i łańcuszkowe, szyte w Polsce i testowane przez
            przewodników — zanim trafią do sprzedaży.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/collections/collars"
              className={cn(CTA_BASE, "bg-nf-white text-nf-bg hover:bg-nf-text")}
            >
              Przejdź do sklepu
            </Link>
            <Link
              href="/pro"
              className={cn(
                CTA_BASE,
                "border border-nf-control text-nf-white hover:bg-nf-elevated-2"
              )}
            >
              Dog Store Pro
            </Link>
          </div>

          {/* metka terenowa: mono jako jezyk parametrow, nie dekoracja - kazda pozycja
              to fakt z katalogu */}
          <p className="type-meta mt-14 hidden text-nf-dim lg:block">
            Nylon 1000D&nbsp;&nbsp;/&nbsp;&nbsp;Okucia stalowe&nbsp;&nbsp;/&nbsp;&nbsp;26
            modeli&nbsp;&nbsp;/&nbsp;&nbsp;60 dni na zwrot
          </p>
        </div>

        {/* kadr: kolumny 7-13 - tekst zajmuje 1-8, wiec kursywa naglowka WCHODZI na
            rozmyte pole zdjecia (przeciecie o ~1.5 kolumny). Na mobile normalny przeplyw. */}
        {src && (
          <div className="lg:col-span-6 lg:col-start-7 lg:row-start-1">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] border border-nf-border">
              {/* paralaksa CZYTA scroll (scrub na transformie), nigdy go nie przejmuje;
                  scale-[1.12] daje kadru zapas, zeby przesuw nie odslanial krawedzi */}
              <div data-parallax="0.06" className="absolute inset-0 scale-[1.12]">
                <Image
                  src={src}
                  alt="Owczarek belgijski malinois w czerwonej obroży"
                  fill
                  priority
                  sizes="(min-width:1024px) 42vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
            {/* podpis jak w druku: u dolu kadru, mono, po prawej */}
            <p className="type-meta mt-3 text-right text-nf-dim">
              Malinois / obroża z serii roboczej
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
