"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/utils";
import { useOverlayA11y } from "./useOverlay";

// Czas wyjscia = najdluzsze przejscie panelu. Po nim zdejmujemy panel z drzewa.
const EXIT_MS = 300;

// Szuflada jest przedluzeniem strony, wiec stoi na tle strony (nf-bg) - tokeny semantyczne
// odwracaja ja razem ze swiatem: papier w sklepie cywilnym, grafit w sekcji Pro. Rozni sie tylko
// gestosc welonu: nad papierem 40%, na graficie 60%.
const SURFACE = {
  dark: {
    scrim: "bg-nf-black/60",
    panel: "bg-nf-bg",
    line: "border-nf-border",
    title: "text-nf-white",
    close: "text-nf-muted hover:text-nf-white",
  },
  light: {
    scrim: "bg-nf-black/40",
    panel: "bg-nf-bg",
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

export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  children,
  footer,
  widthClassName,
  // Domyslny swiat to sklep cywilny, nie sekcja Pro. Przy domyslnym "dark" koszyk, filtry mobilne
  // i szybki podglad (jedyne wywolania bez jawnego theme) potrafily wyjsc grafitowe na
  // jasnej trasie. W sekcji Pro panel i tak zostaje ciemny: tokeny odwraca html[data-theme="dark"].
  theme = "light",
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClassName?: string;
  theme?: "light" | "dark";
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const surface = SURFACE[theme];
  const { mounted, entered } = useOverlayTransition(open, EXIT_MS);
  useOverlayA11y(open, onClose, panelRef);

  if (!mounted) return null;

  // Stan otwarty nie ma klasy translate: `translate: none` zamiast `translate: 0 0`.
  // Niezerowa wartosc translate tworzy blok zawierajacy dla potomkow position:fixed.
  const offscreen = side === "right" ? "translate-x-full" : "-translate-x-full";

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
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        inert={!open}
        className={cn(
          "fixed top-0 bottom-0 z-50 flex w-full flex-col transition-[translate] duration-300 ease-nf motion-reduce:transition-none",
          surface.panel,
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          surface.line,
          widthClassName ?? "max-w-md",
          !entered && offscreen
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between border-b py-3 pl-5 pr-3",
            surface.line
          )}
        >
          {/* type-h3, nie wlasny rozmiar z font-bold: Fjalla One ma JEDNA wage (400),
              wiec font-bold kazal przegladarce dorysowac sztuczne pogrubienie i naglowek
              szuflady robil sie brudny. Skala naglowkow zyje w globals.css, nie w komponencie. */}
          <h2 id={titleId} className={cn("type-h3", surface.title)}>
            {title}
          </h2>
          <button
            type="button"
            aria-label="Zamknij"
            onClick={onClose}
            className={cn(
              "flex h-11 w-11 items-center justify-center transition-colors duration-250 ease-nf",
              surface.close
            )}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className={cn("border-t", surface.line)}>{footer}</div>}
      </div>
    </>
  );
}
