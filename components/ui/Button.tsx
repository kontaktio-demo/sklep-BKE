import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  FocusEventHandler,
  MouseEventHandler,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // Przycisk glowny stoi na tokenach maksymalnego kontrastu, wiec sam sie odwraca:
  // na papierze wychodzi ciemny przycisk z jasnymi literami, na graficie odwrotnie.
  // Hover schodzi o stopien (nf-text), zeby reakcja byla widoczna w obu swiatach.
  primary: "bg-nf-white text-nf-bg hover:bg-nf-text",
  // Jedyny przycisk pieniedzy: dodanie do koszyka i zlozenie zamowienia. Biale litery na
  // plaskiej czerwieni czytaja sie w obu swiatach, ale hover musi ciemniec (nf-red-dark):
  // biel na nf-red-hover spada ponizej AA 4.5:1.
  danger: "bg-nf-red text-white hover:bg-nf-red-dark",
  // Obwodka jest JEDYNYM sygnalem "to jest kontrolka", wiec jedzie na nf-control (>=3:1),
  // a nie na nf-border-strong (1.93:1 na papierze - linia dekoracyjna udajaca przycisk).
  ghost:
    "border border-nf-control bg-transparent text-nf-white hover:border-nf-control-hover hover:bg-nf-elevated-2",
};

// Wysokosc jest STALA, nie liczona z paddingu pionowego: md i lg musza trafic w cel
// dotykowy 44 px niezaleznie od tego, ile linii ma etykieta. Rozmiar tekstu trzyma sie
// 13/14 px - przy uppercase i trackingu wieksze stopnie robia z przycisku naglowek.
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-10 px-6 text-[13px]",
  md: "h-11 px-8 text-[13px]",
  lg: "h-12 px-8 text-[14px]",
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string): string {
  return cn(
    // JEDEN ksztalt przycisku w calym serwisie: prostokat 4 px, UPPERCASE, waga 600.
    // Wczesniej zyly rownolegle cztery jezyki (Button bez uppercase, recznie pisane CTA
    // strony glownej, przyciski w kaflach, linki-CTA) i sklep rozjezdzal sie wizualnie.
    // Bez skalowania na hover - odbijajace sie CTA to slad poprzedniego kierunku,
    // przycisk reaguje wylacznie kolorem.
    // rounded-control, nie rounded-[4px]: promien jest tokenem. Sklep cywilny ma 4 px,
    // a PAKT-K9 schodzi do 2 px (tozsamosc K9 jest ostra) - ten sam przycisk, dwa sklepy.
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold uppercase leading-none tracking-[0.04em] transition-colors duration-250 ease-nf motion-reduce:transition-none",
    // Stan wylaczony ma WLASNE kolory, nie przezroczystosc. opacity-50 na czerwonym CTA
    // dawalo na papierze rozowy przycisk z biala etykieta (okolo 2.6:1), a etykieta niesie
    // tresc ("Chwilowo niedostepna"), wiec musi zostac czytelna.
    "disabled:pointer-events-none disabled:border-transparent disabled:bg-nf-elevated-2 disabled:text-nf-dim",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className
  );
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  type,
  ...rest
}: ButtonProps) {
  const classes = buttonClasses(variant, size, className);

  if (href) {
    // anchor-compatible handlers are forwarded; button-only attrs (type, disabled...) are dropped
    const { onClick, onMouseEnter, onMouseLeave, onFocus, onBlur } = rest;
    return (
      <Link
        href={href}
        className={classes}
        onClick={onClick as MouseEventHandler | undefined}
        onMouseEnter={onMouseEnter as MouseEventHandler | undefined}
        onMouseLeave={onMouseLeave as MouseEventHandler | undefined}
        onFocus={onFocus as FocusEventHandler | undefined}
        onBlur={onBlur as FocusEventHandler | undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type ?? "button"} className={classes} {...rest}>
      {children}
    </button>
  );
}
