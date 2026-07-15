"use client";

import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { FREE_SHIPPING_THRESHOLD, PRO_STATUS, TRUST_TRIAD, isProRoute } from "@/lib/nav";
import { cn } from "@/lib/utils";

// Pasek uzytkowy jest STATYCZNY. Rotator z przyciskiem pauzy odszedl z dwoch powodow:
// czerwony baner na kazdej stronie byl najwieksza masa czerwieni w serwisie (czerwien
// ma byc sygnalem, nie tapeta), a wirujacy komunikat z glifem pauzy "II" czytal sie
// jak literowka i najbardziej generyczny efekt sklepowy. Tusz + drobny tekst = metka,
// nie promocja.
const BAR = "flex h-10 items-center justify-center px-4";

function Sep({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("mx-3 h-3 border-l border-white/25", className)}
    />
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
      <Sep className="border-white/20" />
      <span>{PRO_STATUS.scope}</span>
      {/* adres znika ponizej md - w 360 px trzy segmenty z tym trackingiem nie wchodza */}
      <Sep className="hidden border-white/20 md:inline" />
      <span className="hidden md:inline">
        {PRO_STATUS.contactLabel}{" "}
        <span className="normal-case text-nf-muted">{PRO_STATUS.contactEmail}</span>
      </span>
    </div>
  );
}

export function AnnouncementBar() {
  const pathname = usePathname();
  if (isProRoute(pathname)) return <ProStatusBar />;

  return (
    <div className={cn(BAR, "bg-nf-black text-[12px] tracking-[0.02em] text-white/80")}>
      {/* mobile: jeden fakt, ten z progiem - reszta wraca na wiekszych ekranach */}
      <p className="lg:hidden">
        Darmowa dostawa od{" "}
        <span className="font-semibold text-white">{FREE_SHIPPING_THRESHOLD} zł</span>
      </p>
      <p className="hidden items-center lg:flex">
        <span>
          Darmowa dostawa od{" "}
          <span className="font-semibold text-white">{FREE_SHIPPING_THRESHOLD} zł</span>
        </span>
        {TRUST_TRIAD.map((item) => (
          <Fragment key={item}>
            <Sep />
            <span>{item}</span>
          </Fragment>
        ))}
      </p>
    </div>
  );
}
