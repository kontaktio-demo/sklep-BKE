"use client";

// §8-A [COMBINE: K9TG rotating message + NSDW trust triad]

import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { ANNOUNCEMENTS, PRO_STATUS, TRUST_TRIAD, isProRoute } from "@/lib/nav";
import { cn } from "@/lib/utils";

const ROTATE_MS = 4500;
const FADE_MS = 250;

// h-11: pasek musi pomiescic przycisk pauzy o celu dotykowym 44 px
const BAR = "flex h-11 items-center justify-center px-4";

function Highlighted({ text, highlight }: { text: string; highlight: string }) {
  const at = text.indexOf(highlight);
  if (at === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      {/* pasek jest juz czerwony, wiec wyroznienie idzie grubosci, nie kolorem */}
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

// Sekcja Pro nie sprzedaje darmowej dostawy - pasek niesie status linii. Statycznie,
// bez rotacji: to naglowek katalogu, nie karuzela promocji.
function ProStatusBar() {
  // type-meta = mono 11px uppercase 0.2em (globals.css)
  // Czern na graficie: pasek jest juz w swiecie Dog Store Pro, wiec tokeny nf-* czytaja sie jasno
  return (
    <div className={cn(BAR, "type-meta bg-nf-black text-nf-dim")}>
      {/* czerwien = stan aktywny: jestes w linii Pro, nie w sklepie cywilnym */}
      <span className="text-nf-red-bright">{PRO_STATUS.line}</span>
      <Sep />
      <span>{PRO_STATUS.scope}</span>
      {/* adres znika ponizej md - w 360 px trzy segmenty z tym trackingiem nie wchodza */}
      <Sep className="hidden md:inline" />
      <span className="hidden md:inline">
        {PRO_STATUS.contactLabel}{" "}
        <span className="normal-case text-nf-muted">{PRO_STATUS.contactEmail}</span>
      </span>
    </div>
  );
}

export function AnnouncementBar() {
  const pathname = usePathname();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  const pro = isProRoute(pathname);

  useEffect(() => {
    // pasek w sekcji Pro jest statyczny - zegar tylko przemielalby stan bez odbiorcy
    if (pro) return;
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
  }, [pro, paused]);

  // pauza w trakcie wygaszania zabralaby zegar, ktory przywraca widocznosc - komunikat
  // zostalby przezroczysty, dlatego kazde przelaczenie odsłania biezacy tekst
  const togglePause = () => {
    setPaused((p) => !p);
    setVisible(true);
  };

  if (pro) return <ProStatusBar />;

  // Pasek uzytkowy w kolorze marki, na kazdej trasie sklepu lacznie ze strona glowna:
  // niesie darmowa dostawe i triade zaufania, czyli dokladnie to, po co klient patrzy
  // na gore strony. Biel na plaskiej czerwieni ma 5.9:1, wiec drobny tekst trzyma AA.
  return (
    <div className={cn(BAR, "relative bg-nf-red text-[13px] text-white/90")}>
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
      {/* text-white/90, nie /75: przy 13 px na #c20812 biel z 75% dawala 3,93:1, czyli
          ponizej AA. Pelna biel ma 5,9:1, biel z 90% okolo 5,2:1 - z zapasem. */}
      <p className="absolute right-12 hidden items-center gap-3 text-white/90 lg:flex lg:right-14">
        {TRUST_TRIAD.map((item, i) => (
          <Fragment key={item}>
            {i > 0 && <span aria-hidden="true" className="h-3 border-l border-white/30" />}
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
          className="absolute right-0 top-0 flex size-11 items-center justify-center text-[12px] font-semibold text-white/90 transition-colors duration-250 ease-nf hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white motion-reduce:hidden motion-reduce:transition-none"
        >
          <span aria-hidden="true">{paused ? ">" : "II"}</span>
        </button>
      )}
    </div>
  );
}
