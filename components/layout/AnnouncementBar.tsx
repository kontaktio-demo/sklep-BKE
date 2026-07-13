"use client";

// §8-A [COMBINE: K9TG rotating message + NSDW trust triad]

import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { isLightRoute } from "@/components/layout/ThemeSync";
import { ANNOUNCEMENTS, TRUST_TRIAD } from "@/lib/nav";
import { cn } from "@/lib/utils";

const ROTATE_MS = 4500;
const FADE_MS = 250;

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

export function AnnouncementBar() {
  const pathname = usePathname();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
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
  }, []);

  // Strona główna jest landingiem marki, nie sklepem: czarny pasek użytkowy nad
  // jasnym hero psuł kadr i nie niósł treści potrzebnej w tym miejscu.
  if (isLightRoute(pathname)) return null;

  return (
    <div className="relative flex h-9 items-center justify-center bg-nf-black px-4 text-[11px] uppercase tracking-[0.15em] text-nf-muted">
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
