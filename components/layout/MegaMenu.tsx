"use client";

// §8-B [BASE: NSDW column structure, DEPTH: K9TG dropdowns]
// Accessible standard per spec: top-level label is a link; panel opens on hover/focus-within.
// The panel is positioned against the sticky <header> (nearest positioned ancestor) -
// no ancestor between here and the header may be `relative`.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

const CLOSE_DELAY_MS = 150;

const LINK_CLASSES =
  "flex h-11 items-center gap-1 px-3 text-[13px] font-semibold uppercase tracking-wide text-nf-text transition-colors duration-250 ease-nf hover:text-white";

export function MegaMenu() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpenIndex(null), CLOSE_DELAY_MS);
  };
  useEffect(() => cancelClose, []);

  return (
    <nav aria-label="Nawigacja główna">
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((item, i) => {
          const columns = item.columns ?? [];
          if (columns.length === 0) {
            return (
              <li
                key={item.label}
                onMouseEnter={() => {
                  cancelClose();
                  setOpenIndex(null);
                }}
              >
                <Link href={item.href} className={LINK_CLASSES}>
                  {item.label}
                </Link>
              </li>
            );
          }

          const open = openIndex === i;
          return (
            <li
              key={item.label}
              onMouseEnter={() => {
                cancelClose();
                setOpenIndex(i);
              }}
              onMouseLeave={scheduleClose}
              onFocus={() => {
                cancelClose();
                setOpenIndex(i);
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                  setOpenIndex(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape" && open) {
                  setOpenIndex(null);
                  linkRefs.current[i]?.focus();
                }
              }}
            >
              <Link
                ref={(el) => {
                  linkRefs.current[i] = el;
                }}
                href={item.href}
                aria-haspopup="true"
                aria-expanded={open}
                className={LINK_CLASSES}
              >
                {item.label}
                <ChevronDownIcon
                  width={14}
                  height={14}
                  className={cn(
                    "text-nf-dim transition-transform duration-250 ease-nf",
                    open && "rotate-180"
                  )}
                />
              </Link>
              {open && (
                <div className="absolute inset-x-0 top-full border-b border-nf-border bg-nf-bg/98 backdrop-blur">
                  <div
                    className="container mx-auto grid gap-10 px-4 py-10 lg:px-6"
                    style={{
                      gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {columns.map((col) => (
                      <div key={col.title}>
                        <h3 className="mb-3 text-[11px] uppercase tracking-widest text-nf-dim">
                          {col.title}
                        </h3>
                        <ul>
                          {col.links.map((link) => (
                            <li key={link.label}>
                              <Link
                                href={link.href}
                                onClick={() => setOpenIndex(null)}
                                className="block py-1.5 text-sm text-nf-muted transition-colors duration-250 ease-nf hover:text-white"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
