import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { photo } from "@/lib/photos";

/**
 * Hero sekcji PAKT-K9 (K9_IDENTITY.md §7, kolejnosc: eyebrow -> bilbord -> CTA).
 *
 * Zakotwiczony do LEWEJ i do DOLU, nie wysrodkowany: srodkowanie wszystkiego to jeden
 * z sygnalow, ktore dokument nazywa slopem. Naglowek jest bilbordowy (Archivo 900,
 * clamp 3rem..6.5rem), a czerwien pada na JEDNO slowo - to caly jej udzial w tym kadrze.
 *
 * Zdjecia jeszcze nie ma (public/foto/, wlasciciel poda wlasne - generowanie zabronione).
 * Do tego czasu kadr stoi na czerni sekcji z welonem po lewej, dokladnie tam, gdzie
 * pojawi sie scrim, gdy zdjecie wejdzie: uklad nie drgnie.
 */
const SCRIM =
  "linear-gradient(90deg, #0E0E0E 0%, rgba(14,14,14,0.7) 35%, transparent 70%)";

export function K9Hero() {
  const src = photo("k9-hero.jpg");

  return (
    <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-k9-bg md:min-h-[86svh]">
      {src && <Image src={src} alt="" fill priority sizes="100vw" className="object-cover" />}

      {/* scrim: tekst siedzi po lewej, wiec welon gasnie w prawo. Do tego dolne wygaszenie,
          zeby naglowek nie lezal na przypadkowym jasnym fragmencie zdjecia */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: SCRIM }} />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-k9-bg to-transparent"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-16 pt-32 md:px-8 md:pb-24 lg:px-12">
        <p className="type-k9-eyebrow text-k9-muted">
          PAKT-K9
          {/* separator w wyrazeniu, nie jako tekst: dwa ukosniki w tresci JSX linter
              (i czlowiek) czyta jako poczatek komentarza */}
          <span aria-hidden="true" className="px-2 text-k9-red">
            {"//"}
          </span>
          Sprzęt służbowy
        </p>

        {/* 2 px czerwona linia jako znacznik sekcji - struktura rysowana LINIA, nie cieniem */}
        <span aria-hidden="true" className="mt-5 block h-0.5 w-16 bg-k9-red" />

        <h1 className="type-k9-hero mt-6 max-w-[16ch] text-k9-white">
          Psy, które pracują pod{" "}
          <span className="text-k9-red">obciążeniem</span>
        </h1>

        <p className="type-k9-body mt-6 max-w-xl text-k9-text">
          Sprzęt do służby patrolowej, pracy węchowej i szkolenia. Pies służbowy obciąża
          obrożę inaczej niż pies rodzinny, więc taśma, okucia i przeszycia są tu dobierane
          pod inne wartości.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button size="lg" variant="danger" href="#kategorie">
            Zobacz kategorie
          </Button>
          <Button size="lg" variant="ghost" href="/k9/zapytanie">
            Zapytanie dla jednostki
          </Button>
        </div>
      </div>
    </section>
  );
}
