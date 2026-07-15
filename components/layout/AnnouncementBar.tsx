"use client";

import Link from "next/link";
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

// Sekcja Pro: pasek niesie POWROT do sklepu cywilnego (lewa) i status linii (prawa).
// Powrot jest na kazdej trasie /pro/*, bo pasek stoi nad kazda z nich - to stala droga
// wyjscia z ciemnego swiata Pro z powrotem do Dog Store. justify-between zamiast center,
// zeby powrot mial staly kotwica po lewej.
function ProStatusBar() {
  // type-meta = mono 11px uppercase 0.12em (globals.css)
  // Czern na graficie: pasek jest juz w swiecie Dog Store Pro, wiec tokeny nf-* czytaja sie jasno
  return (
    <div
      className={cn(
        BAR,
        "type-meta justify-between whitespace-nowrap bg-nf-black text-nf-dim"
      )}
    >
      {/* strzalka + nazwa sklepu cywilnego: klikalny powrot do "normalnego" sklepu */}
      <Link
        href="/"
        className="inline-flex shrink-0 items-center gap-2 text-nf-muted transition-colors duration-250 ease-nf hover:text-white"
      >
        <span aria-hidden="true">&larr;</span>
        Dog Store
      </Link>

      <span className="flex items-center">
        {/* czerwien = stan aktywny: jestes w linii Pro, nie w sklepie cywilnym */}
        <span className="shrink-0 text-nf-red-bright">{PRO_STATUS.line}</span>
        {/* scope znika ponizej 480 px - mono z trackingiem nie miesci obu segmentow
            obok powrotu na najwezszych telefonach i pasek rozpychal sie w poziomie */}
        <Sep className="hidden border-white/20 min-[480px]:inline" />
        <span className="hidden shrink-0 min-[480px]:inline">{PRO_STATUS.scope}</span>
        {/* adres znika ponizej lg */}
        <Sep className="hidden border-white/20 lg:inline" />
        <span className="hidden shrink-0 lg:inline">
          {PRO_STATUS.contactLabel}{" "}
          <span className="normal-case text-nf-muted">{PRO_STATUS.contactEmail}</span>
        </span>
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
