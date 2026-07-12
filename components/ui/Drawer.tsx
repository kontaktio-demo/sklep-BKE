"use client";

import { useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useOverlayA11y } from "./useOverlay";

const NF_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  children,
  footer,
  widthClassName,
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClassName?: string;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const titleId = useId();
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
            className="fixed inset-0 z-50 bg-black/60"
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
              "fixed top-0 bottom-0 z-50 flex w-full flex-col bg-nf-bg",
              side === "right"
                ? "right-0 border-l border-nf-border"
                : "left-0 border-r border-nf-border",
              widthClassName ?? "max-w-md"
            )}
            transition={{ duration: reduced ? 0 : 0.3, ease: NF_EASE }}
            {...panelMotion}
          >
            <div className="flex items-center justify-between border-b border-nf-border py-3 pl-5 pr-3">
              <h2
                id={titleId}
                className="font-display text-lg font-bold uppercase tracking-wide text-nf-white"
              >
                {title}
              </h2>
              <button
                type="button"
                aria-label="Zamknij"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center text-nf-muted transition-colors duration-250 ease-nf hover:text-nf-white"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="border-t border-nf-border">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
