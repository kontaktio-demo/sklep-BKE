import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/nav";
import { cn } from "@/lib/utils";

// Assety wycinane z brand/logo.png przez scripts/gen-brand.mjs.
// Wariant "-dark": czarna sylwetka psa podniesiona do grafitu, żeby nie znikała na czerni.
const ASSETS = {
  // pełna sylwetka (głowa + popiersie z zawieszką) - tam, gdzie jest miejsce: stopka
  mark: { src: "/brand/pakt-mark.png", dark: "/brand/pakt-mark-dark.png", w: 238, h: 445 },
  // sam kadr głowy - pasek nawigacyjny, gdzie pionowa sylwetka robi się wąskim paskiem
  head: { src: "/brand/pakt-head.png", dark: "/brand/pakt-head-dark.png", w: 216, h: 270 },
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
  /** sygnet na czarnym tle */
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

  return (
    <Link
      href={href}
      aria-label={`${BRAND}, strona główna`}
      className={cn("flex items-center gap-2.5", className)}
    >
      {variant !== "wordmark" && (
        <Image
          src={onDark ? asset.dark : asset.src}
          alt=""
          width={asset.w}
          height={asset.h}
          priority
          className={cn("w-auto", markSize)}
        />
      )}
      {variant !== "mark" && (
        <Image
          src={WORDMARK}
          alt=""
          width={289}
          height={89}
          priority
          className={cn("w-auto", wordmarkClassName)}
        />
      )}
      <span className="sr-only">{BRAND}</span>
    </Link>
  );
}
