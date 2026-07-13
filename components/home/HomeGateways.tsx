"use client";

import Link from "next/link";
import { SeamTransition } from "@/components/motion/SeamTransition";
import { ArrowRightIcon } from "@/components/ui/icons";

// Dwa wejscia do sklepu. Panel cywilny (papier) zostaje przykryty panelem K9 (grafit)
// w rytmie scrolla - to jest przejscie miedzy swiatami, nie efekt dla efektu.

function ShopPanel() {
  return (
    <div className="flex h-full w-full flex-col justify-between bg-pk-paper px-4 py-16 md:px-6">
      <div className="type-meta mx-auto flex w-full max-w-[1600px] items-center justify-between border-b border-pk-line pb-4 text-pk-ink-muted">
        <span>01 / Sklep</span>
        <span>Dla każdego psa</span>
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] flex-1 items-center gap-10 py-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {/* type-h1, nie type-display: skala hero nalezy do dwoch naglowkow otwierajacych
              (strona glowna, K9). Panele wejsciowe stoja o stopien nizej */}
          <h2 className="type-h1 text-pk-ink">Sklep</h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-pk-ink-2">
            Obroże nylonowe i łańcuszkowe, od codziennych po robocze. Filtry po
            szerokości, obwodzie i kolorze. Wysyłka w 24 h.
          </p>
        </div>

        <div className="lg:col-span-5 lg:justify-self-end">
          <Link
            href="/collections/collars"
            className="type-meta group inline-flex min-h-14 items-center gap-4 rounded-[2px] border border-pk-line-strong px-6 py-4 text-pk-ink transition-colors duration-300 ease-nf hover:border-pk-ink hover:bg-pk-ink hover:text-pk-paper motion-reduce:transition-none"
          >
            Przejdź do sklepu
            <ArrowRightIcon
              width={16}
              height={16}
              className="transition-transform duration-300 ease-out-expo motion-safe:group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>

      <div className="type-meta mx-auto w-full max-w-[1600px] border-t border-pk-line pt-4 text-pk-ink-muted">
        26 pozycji
      </div>
    </div>
  );
}

function K9Panel() {
  return (
    // data-shell="dark": header probkuje, co lezy pod nim, i przelacza sie na ciemny
    <div
      data-shell="dark"
      className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-nf-bg px-4 py-16 md:px-6"
    >
      <div
        aria-hidden="true"
        className="grid-tech pointer-events-none absolute inset-0 opacity-60"
        style={{ ["--grid-size" as string]: "72px" }}
      />
      {/* pas ostrzegawczy na krawędzi styku obu światów */}
      <div aria-hidden="true" className="hatch-red absolute inset-x-0 top-0 h-1.5" />

      {/* "Sprzęt służbowy" to opis linii, nie ostrzeżenie - czerwień zostaje w CTA panelu */}
      <div className="type-meta relative mx-auto flex w-full max-w-[1600px] items-center justify-between border-b border-nf-border pb-4 text-nf-dim">
        <span>02 / PAKT-K9</span>
        <span>Sprzęt służbowy</span>
      </div>

      <div className="relative mx-auto grid w-full max-w-[1600px] flex-1 items-center gap-10 py-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="type-h1 text-white">PAKT-K9</h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-nf-muted">
            Osobna linia dla psów służbowych: patrol, praca węchowa, szkolenie.
            Uchwyty kontrolne, prowadnice pod moduł, stalowe okucia. Tego sprzętu
            nie ma w zwykłym sklepie.
          </p>
        </div>

        <div className="lg:col-span-5 lg:justify-self-end">
          <Link
            href="/k9"
            className="type-meta group inline-flex min-h-14 items-center gap-4 rounded-[2px] border border-nf-border-strong px-6 py-4 text-white transition-colors duration-300 ease-nf hover:border-nf-red hover:bg-nf-red motion-reduce:transition-none"
          >
            Wejdź do sekcji K9
            <ArrowRightIcon
              width={16}
              height={16}
              className="transition-transform duration-300 ease-out-expo motion-safe:group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>

      <div className="type-meta relative mx-auto w-full max-w-[1600px] border-t border-nf-border pt-4 text-nf-dim">
        5 kategorii / 12 pozycji
      </div>
    </div>
  );
}

export function HomeGateways() {
  return <SeamTransition from={<ShopPanel />} to={<K9Panel />} />;
}
