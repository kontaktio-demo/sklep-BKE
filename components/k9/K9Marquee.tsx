"use client";

import { Fragment, useState } from "react";
import { cn } from "@/lib/utils";

// Pas parametrow linii K9. Tor jest CSS-owy (marquee-track + motion-safe), ale ruch trwa
// dluzej niz 5 s, wiec WCAG 2.2.2 wymaga sterowania - stad przycisk pauzy i stan po stronie
// klienta. Dodatkowo tor staje pod kursorem i przy fokusie w obrebie paska.

const ITEMS = [
  "Taśma 1000D",
  "Klamra stalowa",
  "Zerwanie 380 kg",
  "Panel ID",
  "Szyte w Polsce",
  "Moduł do 45 mm",
  "Test w terenie",
];

function Strip() {
  return (
    <div className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <Fragment key={item}>
          <span className="type-meta whitespace-nowrap text-nf-muted">{item}</span>
          {/* separator, nie akcent: czerwona kropka co kilka slow tapetowala pas czerwienia */}
          <span className="mx-6 size-1 shrink-0 bg-nf-border-strong" />
        </Fragment>
      ))}
    </div>
  );
}

export function K9Marquee() {
  const [paused, setPaused] = useState(false);

  return (
    <section
      aria-labelledby="k9-parametry"
      className="border-y border-nf-border bg-nf-elevated"
    >
      <h2 id="k9-parametry" className="sr-only">
        Parametry linii K9
      </h2>
      <ul className="sr-only">
        {ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="group/marquee flex items-stretch">
        {/* dwie identyczne kopie: marquee-track przesuwa tor o -50%, wiec petla jest ciagla */}
        <div aria-hidden="true" className="edge-fade-x min-w-0 flex-1 overflow-hidden py-4">
          <div
            className={cn(
              "flex w-max motion-safe:marquee-track",
              // hover i focus-within: tor staje, gdy uzytkownik probuje czytac pozycje
              "group-hover/marquee:[animation-play-state:paused]",
              "group-focus-within/marquee:[animation-play-state:paused]",
              paused && "[animation-play-state:paused]"
            )}
          >
            <Strip />
            <Strip />
          </div>
        </div>

        {/* motion-reduce:hidden: przy wylaczonym ruchu tor stoi (motion-safe:marquee-track),
            wiec przycisk nie mialby czego zatrzymywac */}
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? "Wznów przewijanie" : "Zatrzymaj przewijanie"}
          className="type-meta flex min-h-11 min-w-11 shrink-0 items-center justify-center border-l border-nf-border px-4 text-nf-dim transition-colors duration-250 ease-nf hover:bg-nf-elevated-2 hover:text-nf-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white motion-reduce:hidden motion-reduce:transition-none"
        >
          <span aria-hidden="true">{paused ? ">" : "II"}</span>
        </button>
      </div>
    </section>
  );
}
