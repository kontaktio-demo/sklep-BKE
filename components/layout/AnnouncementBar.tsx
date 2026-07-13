"use client";

// §8-A [COMBINE: K9TG rotating message + NSDW trust triad]

import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { isLightRoute } from "@/components/layout/ThemeSync";
import { ANNOUNCEMENTS, K9_STATUS, TRUST_TRIAD, isK9Route } from "@/lib/nav";
import { cn } from "@/lib/utils";

const ROTATE_MS = 4500;
const FADE_MS = 250;

const BAR = "flex h-9 items-center justify-center bg-nf-black px-4";

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

  const k9 = isK9Route(pathname);
  const hidden = isLightRoute(pathname);

  useEffect(() => {
    // pasek K9 jest statyczny, a na jasnej trasie paska nie ma - w obu razach zegar
    // tylko przemielalby stan bez odbiorcy
    if (k9 || hidden) return;
    if (ANNOUNCEMENTS.length < 2) return;
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
  }, [k9, hidden]);

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
      <p
        aria-hidden="true"
        className={cn(
          "transition-opacity duration-250 ease-nf motion-reduce:transition-none",
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
      <p className="absolute right-4 hidden items-center gap-3 text-nf-dim lg:flex lg:right-6">
        {TRUST_TRIAD.map((item, i) => (
          <Fragment key={item}>
            {i > 0 && <span aria-hidden="true" className="h-3 border-l border-nf-border" />}
            <span>{item}</span>
          </Fragment>
        ))}
      </p>
    </div>
  );
}
