"use client";

import Link from "next/link";
import { SplitLines } from "@/components/motion/SplitLines";
import { ArrowRightIcon } from "@/components/ui/icons";

// Hero strony glownej: papier, tusz, mocna typografia, asymetria.
// Bez zdjecia - miejsce na materialy zostaje puste swiadomie, nie zapychamy go ozdobnikiem.
export function HomeHero() {
  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-pk-paper pt-24">
      <div className="mx-auto flex min-h-[calc(92svh-6rem)] max-w-[1600px] flex-col justify-between px-4 pb-10 md:px-6">
        <div className="flex items-center justify-between border-b border-pk-line pb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-pk-ink-muted">
          <span>PAKT</span>
          <span className="hidden sm:block">Obroże dla psów pracujących</span>
          <span>PL / 2026</span>
        </div>

        <div className="grid flex-1 items-end gap-10 py-14 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-8">
            <SplitLines
              immediate
              as="h1"
              lines={["SPRZĘT,", "KTÓRY", "WRACA"]}
              className="font-display text-[clamp(3rem,11vw,9rem)] font-black uppercase leading-[0.86] tracking-[-0.02em] text-pk-ink"
            />
          </div>

          {/* blok tekstu celowo nie pod nagłówkiem, tylko przesunięty w prawo i w dół */}
          <div className="lg:col-span-4 lg:pb-6">
            <p className="max-w-sm text-base leading-relaxed text-pk-ink-2">
              Robimy obroże dla psów, które pracują: w patrolu, w tropieniu, na
              szkoleniu. Ten sam szew i te same okucia trafiają do psa, który po
              prostu wychodzi na spacer.
            </p>
            <Link
              href="/collections/collars"
              className="group mt-6 inline-flex min-h-11 items-center gap-3 border-b border-pk-ink pb-1 font-mono text-[11px] uppercase tracking-[0.25em] text-pk-ink transition-colors duration-300 ease-nf hover:border-pk-red hover:text-pk-red"
            >
              Zobacz obroże
              <ArrowRightIcon
                width={16}
                height={16}
                className="transition-transform duration-300 ease-out-expo motion-safe:group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-pk-line pt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-pk-ink-muted">
          <span>Przewiń</span>
          <span className="hidden md:block">Szyte w Polsce</span>
          <span>26 pozycji w sklepie</span>
        </div>
      </div>
    </section>
  );
}
