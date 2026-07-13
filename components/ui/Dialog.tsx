"use client";

import { useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useOverlayA11y } from "./useOverlay";

const NF_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

// Domyślnie ciemny (sklep). "light" obsługuje jasną stronę główną - patrz components/layout/theme.ts.
// Panel odcina się od tła mocniejszą krawędzią, a nie cieniem: shadow-2xl/shadow-xl
// dawały rozmytą poświatę pod modalem, czego język PAKT nie używa.
const SURFACE = {
  dark: {
    scrim: "bg-black/60",
    panel: "border-nf-border-strong bg-nf-elevated",
    line: "border-nf-border",
    title: "text-nf-white",
    close: "text-nf-muted hover:text-nf-white",
  },
  light: {
    scrim: "bg-pk-ink/40",
    panel: "border-pk-line-strong bg-pk-paper",
    line: "border-pk-line",
    title: "text-pk-ink",
    close: "text-pk-ink-muted hover:text-pk-ink",
  },
} as const;

export function Dialog({
  open,
  onClose,
  title,
  children,
  maxWidthClassName,
  hideTitle = false,
  theme = "dark",
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
  const reduced = useReducedMotion();
  const titleId = useId();
  const surface = SURFACE[theme];
  useOverlayA11y(open, onClose, panelRef);

  const panelMotion = reduced
    ? {
        initial: { opacity: 1, scale: 1 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 1, scale: 1 },
      }
    : {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
      };

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
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            aria-hidden="true"
            className={cn("fixed inset-0 z-50", surface.scrim)}
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reduced ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : 0.25, ease: NF_EASE }}
            onClick={onClose}
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className={cn(
                "pointer-events-auto relative mx-4 max-h-[90dvh] w-full overflow-y-auto rounded-[2px] border",
                surface.panel,
                maxWidthClassName ?? "max-w-lg"
              )}
              transition={{ duration: reduced ? 0 : 0.25, ease: NF_EASE }}
              {...panelMotion}
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
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
