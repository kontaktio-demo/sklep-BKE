"use client";

import Link from "next/link";
import { SeamTransition } from "@/components/motion/SeamTransition";
import { ArrowRightIcon } from "@/components/ui/icons";

// Dwa wejscia do sklepu. Panel cywilny (papier) zostaje przykryty panelem K9 (grafit)
// w rytmie scrolla - to jest przejscie miedzy swiatami, nie efekt dla efektu.

function ShopPanel() {
  return (
    <div className="flex h-full w-full flex-col justify-between bg-pk-paper px-4 py-16 md:px-6">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between border-b border-pk-line pb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-pk-ink-muted">
        <span>01 / Sklep</span>
        <span>Dla każdego psa</span>
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] flex-1 items-center gap-10 py-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] font-black uppercase leading-[0.9] tracking-tight text-pk-ink">
            Sklep
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-pk-ink-2">
            Obroże nylonowe i łańcuszkowe, od codziennych po robocze. Filtry po
            szerokości, obwodzie i kolorze. Wysyłka w 24 h.
          </p>
        </div>

        <div className="lg:col-span-5 lg:justify-self-end">
          <Link
            href="/collections/collars"
            className="group inline-flex min-h-14 items-center gap-4 border border-pk-line-strong px-6 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-pk-ink transition-colors duration-300 ease-nf hover:border-pk-ink hover:bg-pk-ink hover:text-pk-paper"
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

      <div className="mx-auto w-full max-w-[1600px] border-t border-pk-line pt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-pk-ink-muted">
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

      <div className="relative mx-auto flex w-full max-w-[1600px] items-center justify-between border-b border-nf-border pb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-nf-dim">
        <span>02 / PAKT-K9</span>
        <span className="text-nf-red-bright">Sprzęt służbowy</span>
      </div>

      <div className="relative mx-auto grid w-full max-w-[1600px] flex-1 items-center gap-10 py-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
            PAKT-K9
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-nf-muted">
            Osobna linia dla psów służbowych: patrol, praca węchowa, szkolenie.
            Uchwyty kontrolne, prowadnice pod moduł, stalowe okucia. Tego sprzętu
            nie ma w zwykłym sklepie.
          </p>
        </div>

        <div className="lg:col-span-5 lg:justify-self-end">
          <Link
            href="/k9"
            className="group inline-flex min-h-14 items-center gap-4 border border-nf-border-strong px-6 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-white transition-colors duration-300 ease-nf hover:border-nf-red hover:bg-nf-red"
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

      <div className="relative mx-auto w-full max-w-[1600px] border-t border-nf-border pt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-nf-dim">
        5 kategorii / 12 pozycji
      </div>
    </div>
  );
}

export function HomeGateways() {
  return <SeamTransition from={<ShopPanel />} to={<K9Panel />} />;
}
