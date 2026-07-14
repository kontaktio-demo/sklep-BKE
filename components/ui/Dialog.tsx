"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/utils";
import { useOverlayA11y } from "./useOverlay";

// Czas wyjscia = przejscie panelu i przycienienia. Po nim zdejmujemy je z drzewa.
const EXIT_MS = 250;

// Powierzchnia panelu stoi na tokenach semantycznych, wiec sama odwraca sie razem ze swiatem:
// na jasnej trasie karta jest biala z tuszem, w sekcji Pro grafitowa z biela. Rozni sie welon: czarny
// w obu swiatach, ale nad papierem wystarczy 40% - 60% robi z jasnej strony noc.
// Panel odcina się od tła mocniejszą krawędzią, a nie cieniem: shadow-2xl/shadow-xl
// dawały rozmytą poświatę pod modalem, czego język Dog Store nie używa.
const SURFACE = {
  dark: {
    scrim: "bg-nf-black/60",
    panel: "border-nf-border-strong bg-nf-elevated",
    line: "border-nf-border",
    title: "text-nf-white",
    close: "text-nf-muted hover:text-nf-white",
  },
  light: {
    scrim: "bg-nf-black/40",
    panel: "border-nf-border-strong bg-nf-elevated",
    line: "border-nf-border",
    title: "text-nf-white",
    close: "text-nf-muted hover:text-nf-white",
  },
} as const;

// Montowanie sterowane recznie, zamiast AnimatePresence.
// Wejscie: mount -> po dwoch klatkach klasa docelowa (jedna klatka nie wystarcza,
// przegladarka potrafi scalic wstawienie wezla ze zmiana klasy i przejscie nie rusza).
// Wyjscie: zdjecie klasy docelowej -> odmontowanie po czasie przejscia.
// Przy prefers-reduced-motion oba kierunki sa natychmiastowe.
function useOverlayTransition(open: boolean, exitMs: number) {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(open && reduced);

  // Aktualizacja w trakcie renderu: panel trafia do drzewa w tym samym commicie,
  // w ktorym open zmienia sie na true. Dzieki temu useOverlayA11y widzi juz ref
  // panelu i nie gubi ustawienia focusu ani pulapki focusu.
  if (open && !mounted) {
    setMounted(true);
    if (reduced) setEntered(true);
  }

  useEffect(() => {
    if (!mounted) return;

    if (open) {
      if (reduced) {
        setEntered(true);
        return;
      }
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }

    setEntered(false);
    if (reduced) {
      setMounted(false);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), exitMs);
    return () => window.clearTimeout(timer);
  }, [open, mounted, reduced, exitMs]);

  return { mounted, entered };
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  maxWidthClassName,
  hideTitle = false,
  // Domyslny swiat to sklep cywilny, nie sekcja Pro - patrz Drawer. Szybki podglad w kolekcji jest
  // jedynym wywolaniem bez jawnego theme i przy "dark" wychodzil grafitowy na jasnej trasie.
  theme = "light",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClassName?: string;
  hideTitle?: boolean;
  theme?: "light" | "dark";
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const surface = SURFACE[theme];
  const { mounted, entered } = useOverlayTransition(open, EXIT_MS);
  useOverlayA11y(open, onClose, panelRef);

  if (!mounted) return null;

  const closeButton = (
    <button
      type="button"
      aria-label="Zamknij"
      onClick={onClose}
      className={cn(
        "flex h-11 w-11 items-center justify-center transition-colors duration-250 ease-nf",
        surface.close,
        hideTitle && "absolute right-2 top-2 z-10"
      )}
    >
      <CloseIcon />
    </button>
  );

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-250 ease-nf motion-reduce:transition-none",
          surface.scrim,
          entered ? "opacity-100" : "opacity-0",
          !open && "pointer-events-none"
        )}
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          inert={!open}
          className={cn(
            // Stan otwarty nie ma klasy scale: `scale: none` zamiast `scale: 1`.
            // Niezerowa wartosc scale tworzy blok zawierajacy dla potomkow position:fixed.
            "pointer-events-auto relative mx-4 max-h-[90dvh] w-full overflow-y-auto rounded-[2px] border transition-[opacity,scale] duration-250 ease-nf motion-reduce:transition-none",
            surface.panel,
            maxWidthClassName ?? "max-w-lg",
            entered ? "opacity-100" : "scale-[0.96] opacity-0",
            !open && "pointer-events-none"
          )}
        >
          {hideTitle ? (
            <>
              <h2 id={titleId} className="sr-only">
                {title}
              </h2>
              {closeButton}
            </>
          ) : (
            <div
              className={cn(
                "flex items-center justify-between border-b py-3 pl-5 pr-3",
                surface.line
              )}
            >
              <h2 id={titleId} className={cn("type-h3", surface.title)}>
                {title}
              </h2>
              {closeButton}
            </div>
          )}
          {children}
        </div>
      </div>
    </>
  );
}
