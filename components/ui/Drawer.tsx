"use client";

import { useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useOverlayA11y } from "./useOverlay";

const NF_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

// Domyślnie ciemny (sklep, koszyk, filtry). "light" obsługuje jasną stronę główną.
const SURFACE = {
  dark: {
    scrim: "bg-black/60",
    panel: "bg-nf-bg",
    line: "border-nf-border",
    title: "text-nf-white",
    close: "text-nf-muted hover:text-nf-white",
  },
  light: {
    scrim: "bg-pk-ink/40",
    panel: "bg-pk-paper",
    line: "border-pk-line",
    title: "text-pk-ink",
    close: "text-pk-ink-muted hover:text-pk-ink",
  },
} as const;

export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  children,
  footer,
  widthClassName,
  theme = "dark",
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
  const reduced = useReducedMotion();
  const titleId = useId();
  const surface = SURFACE[theme];
  useOverlayA11y(open, onClose, panelRef);

  const offscreen = side === "right" ? "100%" : "-100%";
  const panelMotion = reduced
    ? { initial: { x: 0 }, animate: { x: 0 }, exit: { x: 0 } }
    : { initial: { x: offscreen }, animate: { x: 0 }, exit: { x: offscreen } };

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
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={cn(
              "fixed top-0 bottom-0 z-50 flex w-full flex-col",
              surface.panel,
              side === "right" ? "right-0 border-l" : "left-0 border-r",
              surface.line,
              widthClassName ?? "max-w-md"
            )}
            transition={{ duration: reduced ? 0 : 0.3, ease: NF_EASE }}
            {...panelMotion}
          >
            <div
              className={cn(
                "flex items-center justify-between border-b py-3 pl-5 pr-3",
                surface.line
              )}
            >
              <h2
                id={titleId}
                className={cn(
                  "font-display text-lg font-bold uppercase tracking-wide",
                  surface.title
                )}
              >
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
