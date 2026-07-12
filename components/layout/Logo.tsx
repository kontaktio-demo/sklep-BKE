import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/nav";
import { cn } from "@/lib/utils";

// Assety wycinane z brand/logo.png przez scripts/gen-brand.mjs.
// Wariant "-dark": czarna sylwetka psa podniesiona do grafitu, żeby nie znikała na czerni.
const MARK = "/brand/pakt-mark.png";
const MARK_DARK = "/brand/pakt-mark-dark.png";
const WORDMARK = "/brand/pakt-wordmark.png";

type LogoVariant = "wordmark" | "lockup" | "mark";

interface LogoProps {
  href?: string;
  className?: string;
  /**
   * "wordmark" - sam napis (header: sygnet w tej skali gubi detal),
   * "lockup"   - sygnet + napis (stopka, gdzie sygnet może być duży),
   * "mark"     - sam sygnet.
   */
  variant?: LogoVariant;
  markClassName?: string;
  wordmarkClassName?: string;
  /** sygnet na czarnym tle (stopka) */
  onDark?: boolean;
}

export function Logo({
  href = "/",
  className,
  variant = "wordmark",
  markClassName = "h-16 w-auto",
  wordmarkClassName = "h-5 w-auto lg:h-6",
  onDark = false,
}: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={`${BRAND}, strona główna`}
      className={cn("flex items-center gap-3", className)}
    >
      {variant !== "wordmark" && (
        <Image
          src={onDark ? MARK_DARK : MARK}
          alt=""
          width={238}
          height={445}
          priority
          className={cn("w-auto", markClassName)}
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
