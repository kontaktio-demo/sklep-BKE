"use client";

// §8-A [COMBINE: K9TG rotating message + NSDW trust triad]

import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { isLightRoute } from "@/components/layout/ThemeSync";
import { ANNOUNCEMENTS, K9_STATUS, TRUST_TRIAD, isK9Route } from "@/lib/nav";
import { cn } from "@/lib/utils";

const ROTATE_MS = 4500;
const FADE_MS = 250;

// h-11: pasek musi pomiescic przycisk pauzy o celu dotykowym 44 px
const BAR = "flex h-11 items-center justify-center bg-nf-black px-4";

function Highlighted({ text, highlight }: { text: string; highlight: string }) {
  const at = text.indexOf(highlight);
  if (at === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      {/* red stays reserved for the CTA; the bar highlights with weight, not color */}
      <span className="font-semibold text-white">{highlight}</span>
      {text.slice(at + highlight.length)}
    </>
  );
}

function Sep({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("px-3 text-nf-border-strong", className)}>
      |
    </span>
  );
}

// Sekcja K9 nie sprzedaje darmowej dostawy - pasek niesie status linii. Statycznie,
// bez rotacji: to naglowek katalogu, nie karuzela promocji.
function K9StatusBar() {
  // type-meta = mono 11px uppercase 0.2em (globals.css)
  return (
    <div className={cn(BAR, "type-meta text-nf-dim")}>
      {/* czerwien = stan aktywny: jestes w linii K9, nie w sklepie cywilnym */}
      <span className="text-nf-red-bright">{K9_STATUS.line}</span>
      <Sep />
      <span>{K9_STATUS.scope}</span>
      {/* adres znika ponizej md - w 360 px trzy segmenty z tym trackingiem nie wchodza */}
      <Sep className="hidden md:inline" />
      <span className="hidden md:inline">
        {K9_STATUS.contactLabel}{" "}
        <span className="normal-case text-nf-muted">{K9_STATUS.contactEmail}</span>
      </span>
    </div>
  );
}

export function AnnouncementBar() {
  const pathname = usePathname();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  const k9 = isK9Route(pathname);
  const hidden = isLightRoute(pathname);

  useEffect(() => {
    // pasek K9 jest statyczny, a na jasnej trasie paska nie ma - w obu razach zegar
    // tylko przemielalby stan bez odbiorcy
    if (k9 || hidden) return;
    if (ANNOUNCEMENTS.length < 2) return;
    // WCAG 2.2.2: uzytkownik zatrzymal rotacje - komunikat zostaje na aktualnym
    if (paused) return;
    // reduced motion -> first message shown statically, no rotation
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let fadeTimer: number | undefined;
    const interval = window.setInterval(() => {
      setVisible(false);
      fadeTimer = window.setTimeout(() => {
        setIndex((i) => (i + 1) % ANNOUNCEMENTS.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => {
      window.clearInterval(interval);
      if (fadeTimer !== undefined) window.clearTimeout(fadeTimer);
    };
  }, [k9, hidden, paused]);

  // pauza w trakcie wygaszania zabralaby zegar, ktory przywraca widocznosc - komunikat
  // zostalby przezroczysty, dlatego kazde przelaczenie odsłania biezacy tekst
  const togglePause = () => {
    setPaused((p) => !p);
    setVisible(true);
  };

  // Strona główna jest landingiem marki, nie sklepem: czarny pasek użytkowy nad
  // jasnym hero psuł kadr i nie niósł treści potrzebnej w tym miejscu.
  if (hidden) return null;

  if (k9) return <K9StatusBar />;

  return (
    <div
      className={cn(
        BAR,
        "relative text-[11px] uppercase tracking-[0.15em] text-nf-muted"
      )}
    >
      {/* px-11: tekst jest wysrodkowany w calym pasku, wiec musi trzymac dystans
          od przycisku pauzy przyklejonego do prawej krawedzi */}
      <p
        aria-hidden="true"
        className={cn(
          "px-11 text-center transition-opacity duration-250 ease-nf motion-reduce:transition-none",
          visible ? "opacity-100" : "opacity-0"
        )}
      >
        <Highlighted
          text={ANNOUNCEMENTS[index].text}
          highlight={ANNOUNCEMENTS[index].highlight}
        />
      </p>
      {/* static equivalent so screen readers aren't spammed by the rotation */}
      <ul className="sr-only">
        {ANNOUNCEMENTS.map((a) => (
          <li key={a.text}>{a.text}</li>
        ))}
      </ul>
      <p className="absolute right-12 hidden items-center gap-3 text-nf-dim lg:flex lg:right-14">
        {TRUST_TRIAD.map((item, i) => (
          <Fragment key={item}>
            {i > 0 && <span aria-hidden="true" className="h-3 border-l border-nf-border" />}
            <span>{item}</span>
          </Fragment>
        ))}
      </p>

      {/* WCAG 2.2.2: rotacja co 4,5 s musi dac sie zatrzymac. motion-reduce:hidden, bo przy
          wylaczonym ruchu rotacji nie ma i przycisk nie mialby czego pauzowac */}
      {ANNOUNCEMENTS.length > 1 && (
        <button
          type="button"
          onClick={togglePause}
          aria-label={
            paused ? "Wznów rotację komunikatów" : "Zatrzymaj rotację komunikatów"
          }
          className="absolute right-0 top-0 flex size-11 items-center justify-center font-mono text-[11px] tracking-[0.1em] text-nf-dim transition-colors duration-250 ease-nf hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white motion-reduce:hidden motion-reduce:transition-none"
        >
          <span aria-hidden="true">{paused ? ">" : "II"}</span>
        </button>
      )}
    </div>
  );
}
