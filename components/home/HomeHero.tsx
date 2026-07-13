import Image from "next/image";
import Link from "next/link";
import { photo } from "@/lib/photos";
import { cn } from "@/lib/utils";

/**
 * Baner otwierajacy. Struktura jak w sklepach z branzy: kadr na cala szerokosc,
 * krotki podpis, jeden przycisk. Zadnej bilbordowej typografii na pol ekranu -
 * to byl najmocniejszy sygnal "prezentacja, nie sklep".
 *
 * Zdjecia jeszcze nie ma (public/foto jest puste, wlasciciel poda wlasne). Do tego czasu
 * baner stoi na materiale CYWILNYM: jasna plaszczyzna, tusz jako tekst. Wczesniej stal na
 * graficie z siatka techniczna, czyli na materiale sekcji K9 - jasny sklep otwieral sie
 * wielkim czarnym prostokatem i pokazywal wzor, ktory nalezy do drugiego sklepu.
 *
 * Welon (ciemny gradient) wlacza sie WYLACZNIE nad zdjeciem: bez fotografii nie ma czego
 * przyciemniac, a sam z siebie tylko zaciemnia jasna strone.
 */
const CTA_BASE =
  "inline-flex h-12 items-center rounded-[4px] px-8 text-[13px] font-semibold uppercase tracking-[0.04em] transition-colors duration-250 ease-nf motion-reduce:transition-none";

export function HomeHero() {
  const src = photo("hero.jpg");
  const onPhoto = src !== null;

  return (
    <section className="relative isolate min-h-[58svh] overflow-hidden border-b border-nf-border bg-nf-bg md:min-h-[66svh]">
      {onPhoto ? (
        <>
          <Image src={src} alt="" fill priority sizes="100vw" className="object-cover" />
          {/* welon: pod tekstem gesty, u gory lekki - napis musi byc czytelny na kazdym zdjeciu */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25"
          />
        </>
      ) : (
        // Papier, nie grafit: delikatny jasny gradient z tokenow jasnego swiata. Zadnej siatki
        // technicznej i zadnej szrafury - te wzory niosa sekcje sluzbowa i tylko tam maja sens.
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-nf-elevated to-nf-elevated-2"
        />
      )}

      <div className="relative mx-auto flex min-h-[58svh] max-w-[1600px] flex-col items-center justify-center px-4 py-20 text-center md:min-h-[66svh] md:px-6">
        {/* Na zdjeciu tekst jest bialy (welon jest ciemny). Bez zdjecia jedzie na tokenie
            maksymalnego kontrastu, czyli w sklepie cywilnym na tuszu. */}
        <h1 className={cn("type-display max-w-3xl", onPhoto ? "text-white" : "text-nf-white")}>
          Sprzęt dla psów, które pracują
        </h1>
        <p
          className={cn(
            "mt-4 max-w-xl text-base leading-relaxed",
            onPhoto ? "text-white/85" : "text-nf-muted"
          )}
        >
          Obroże nylonowe i łańcuszkowe szyte w Polsce. Te same szwy i okucia trafiają
          do psa służbowego i do psa, który wychodzi na spacer.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/collections/collars"
            className={cn(
              CTA_BASE,
              onPhoto
                ? "bg-white text-nf-black hover:bg-white/85"
                : // ten sam przycisk glowny co w reszcie sklepu (Button variant="primary"):
                  // tusz jako tlo, papier jako litery
                  "bg-nf-white text-nf-bg hover:bg-nf-text"
            )}
          >
            Przejdź do sklepu
          </Link>
          <Link
            href="/k9"
            className={cn(
              CTA_BASE,
              onPhoto
                ? "border border-white/40 text-white hover:border-white hover:bg-white/10"
                : "border border-nf-control text-nf-white hover:bg-nf-elevated"
            )}
          >
            Sekcja PAKT-K9
          </Link>
        </div>
      </div>
    </section>
  );
}
