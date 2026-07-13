import { Fragment } from "react";

// Pas parametrow linii K9. Bez "use client": tasma jest czysto CSS-owa
// (marquee-track + motion-safe), wiec komponent nie potrzebuje JS na kliencie.

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
  return (
    <section
      aria-labelledby="k9-parametry"
      className="overflow-hidden border-y border-nf-border bg-nf-elevated py-4"
    >
      <h2 id="k9-parametry" className="sr-only">
        Parametry linii K9
      </h2>
      <ul className="sr-only">
        {ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {/* dwie identyczne kopie: marquee-track przesuwa tor o -50%, wiec petla jest ciagla */}
      <div aria-hidden="true" className="edge-fade-x">
        <div className="flex w-max motion-safe:marquee-track">
          <Strip />
          <Strip />
        </div>
      </div>
    </section>
  );
}
