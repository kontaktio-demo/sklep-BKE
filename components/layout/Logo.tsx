import Image from "next/image";
import Link from "next/link";
import { BRAND, PRO_NAV_LABEL, PRO_ROOT } from "@/lib/nav";
import { cn } from "@/lib/utils";

// Assety wycinane ze zrodlowych logotypow przez scripts/gen-brand.mjs.
// DWA SKLEPY = DWA LOGOTYPY. Nie warianty jednego znaku, tylko dwie marki:
//   shop -> Dog Store      okragly emblemat, sklep cywilny
//   pro  -> Dog Store Pro  kanciasta tarcza, sklep sluzbowy
//
// Sygnet ma JEDEN plik na marke: sylwetka lezy na wlasnym czerwonym polu, wiec czyta sie
// i na papierze sklepu, i na graficie sekcji Pro - nie potrzebuje wariantu.
// Wordmark ma dwa: napis "DOG" jest w zrodle bialy, wiec na papierze musi zejsc do tuszu.
//
// Kazda marka ma WLASNA domyslna wysokosc napisu, bo napisy maja rozna liczbe wierszy:
// "DOG / STORE" to dwa wiersze, "DOG / STORE / PRO" - trzy. Wspolna wysokosc scisnela
// trzeci wiersz do kilku pikseli, wiec napis "PRO" przestawal byc czytelny.
const BRANDS = {
  shop: {
    label: BRAND,
    href: "/",
    mark: { src: "/brand/ds-mark.png", w: 645, h: 517 },
    wordmark: {
      light: "/brand/ds-wordmark.png",
      dark: "/brand/ds-wordmark-dark.png",
      w: 794,
      h: 246,
      className: "h-7 w-auto lg:h-8", // dwa wiersze
    },
  },
  pro: {
    label: PRO_NAV_LABEL,
    href: PRO_ROOT,
    mark: { src: "/brand/ds-pro-mark.png", w: 820, h: 576 },
    wordmark: {
      light: "/brand/ds-pro-wordmark.png",
      dark: "/brand/ds-pro-wordmark-dark.png",
      w: 825,
      h: 415,
      className: "h-9 w-auto lg:h-11", // trzy wiersze - potrzebuja wiecej wysokosci
    },
  },
} as const;

export type LogoBrand = keyof typeof BRANDS;
type LogoVariant = "header" | "lockup" | "mark" | "wordmark";

interface LogoProps {
  /** ktora marka. Domyslnie sklep cywilny - sekcja Pro podaje "pro" jawnie */
  brand?: LogoBrand;
  /** domyslnie strona glowna wlasnej marki: "/" dla sklepu, "/pro" dla sekcji sluzbowej */
  href?: string;
  className?: string;
  /**
   * "header"   - sygnet + napis (pasek nawigacyjny)
   * "lockup"   - to samo, wiekszy (stopka)
   * "mark"     - sam sygnet
   * "wordmark" - sam napis
   */
  variant?: LogoVariant;
  markClassName?: string;
  wordmarkClassName?: string;
  /** true = logo lezy na ciemnym tle (bialy napis); false = na papierze (tusz) */
  onDark?: boolean;
}

export function Logo({
  brand = "shop",
  href,
  className,
  variant = "header",
  markClassName,
  wordmarkClassName,
  onDark = true,
}: LogoProps) {
  const b = BRANDS[brand];
  const inHeader = variant === "header";
  const markSize = markClassName ?? (inHeader ? "h-9 w-auto lg:h-11" : "h-16 w-auto");
  const wordSize = wordmarkClassName ?? b.wordmark.className;
  // priority tylko dla paska nawigacyjnego: logo w stopce jest poza pierwszym ekranem,
  // a bezwarunkowe priority wpychalo je do preloadu i konkurowalo o pasmo z LCP
  const priority = inHeader;

  return (
    <Link
      href={href ?? b.href}
      aria-label={`${b.label}, strona główna`}
      className={cn("flex items-center gap-2.5", className)}
    >
      {variant !== "wordmark" && (
        <Image
          src={b.mark.src}
          alt=""
          width={b.mark.w}
          height={b.mark.h}
          priority={priority}
          className={cn("w-auto", markSize)}
        />
      )}
      {variant !== "mark" && (
        <Image
          src={onDark ? b.wordmark.dark : b.wordmark.light}
          alt=""
          width={b.wordmark.w}
          height={b.wordmark.h}
          priority={priority}
          className={cn("w-auto", wordSize)}
        />
      )}
      <span className="sr-only">{b.label}</span>
    </Link>
  );
}
