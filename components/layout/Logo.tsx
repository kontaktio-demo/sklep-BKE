import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/nav";
import { cn } from "@/lib/utils";

// Assety wycinane z brand/logo.png przez scripts/gen-brand.mjs.
// Dwa warianty sygnetu, dobierane przez `onDark`:
//   light -> czarna sylwetka psa (na papierze, strona główna)
//   dark  -> ta sama sylwetka podniesiona do grafitu, żeby nie znikała na czerni
// Wordmark jest czerwony i czyta się na obu tłach - ma jeden plik.
const ASSETS = {
  // pełna sylwetka (głowa + popiersie z zawieszką) - tam, gdzie jest miejsce: stopka
  mark: {
    light: "/brand/pakt-mark.png",
    dark: "/brand/pakt-mark-dark.png",
    w: 238,
    h: 445,
  },
  // sam kadr głowy - pasek nawigacyjny, gdzie pionowa sylwetka robi się wąskim paskiem
  head: {
    light: "/brand/pakt-head.png",
    dark: "/brand/pakt-head-dark.png",
    w: 224,
    h: 305,
  },
};
const WORDMARK = "/brand/pakt-wordmark.png";

type LogoVariant = "header" | "lockup" | "mark" | "wordmark";

interface LogoProps {
  href?: string;
  className?: string;
  /**
   * "header"   - głowa psa + napis (pasek nawigacyjny)
   * "lockup"   - pełna sylwetka + napis (stopka)
   * "mark"     - sam sygnet
   * "wordmark" - sam napis
   */
  variant?: LogoVariant;
  markClassName?: string;
  wordmarkClassName?: string;
  /** true = sygnet leży na ciemnym tle (grafitowa sylwetka); false = na papierze (czarna) */
  onDark?: boolean;
}

export function Logo({
  href = "/",
  className,
  variant = "header",
  markClassName,
  wordmarkClassName = "h-4 w-auto lg:h-5",
  onDark = true,
}: LogoProps) {
  const useHead = variant === "header";
  const asset = useHead ? ASSETS.head : ASSETS.mark;
  const markSize = markClassName ?? (useHead ? "h-10 w-auto lg:h-12" : "h-16 w-auto");
  // priority tylko dla paska nawigacyjnego: sygnet w stopce jest poza pierwszym ekranem,
  // a bezwarunkowe priority wpychalo go do preloadu i konkurowalo o pasmo z LCP
  const priority = useHead;

  return (
    <Link
      href={href}
      aria-label={`${BRAND}, strona główna`}
      className={cn("flex items-center gap-2.5", className)}
    >
      {variant !== "wordmark" && (
        <Image
          src={onDark ? asset.dark : asset.light}
          alt=""
          width={asset.w}
          height={asset.h}
          priority={priority}
          className={cn("w-auto", markSize)}
        />
      )}
      {variant !== "mark" && (
        <Image
          src={WORDMARK}
          alt=""
          width={289}
          height={89}
          priority={priority}
          className={cn("w-auto", wordmarkClassName)}
        />
      )}
      <span className="sr-only">{BRAND}</span>
    </Link>
  );
}
