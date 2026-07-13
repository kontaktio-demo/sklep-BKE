"use client";

// §8-B [BASE: NSDW column structure, DEPTH: K9TG dropdowns]
// Accessible standard per spec: top-level label is a link; panel opens on hover/focus-within.
// The panel is positioned against the sticky <header> (nearest positioned ancestor) -
// no ancestor between here and the header may be `relative`.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { K9_NAV_LABEL, NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { SHELL, type Theme } from "./theme";

const CLOSE_DELAY_MS = 150;

const LINK_BASE =
  "flex h-11 items-center gap-1 px-3 text-[13px] font-semibold uppercase tracking-wide transition-colors duration-250 ease-nf";

// PAKT-K9 to nie kolejna zakladka sklepu, ale pasek nawigacji stoi w sklepie cywilnym,
// gdzie monospace nie ma czego oznaczac. Odcinamy ja kolorem linii K9 zamiast krojem.
const K9_LINK = "text-nf-red-bright";

export function MegaMenu({ theme = "dark" }: { theme?: Theme }) {
  const t = SHELL[theme];
  const linkFor = (label: string) =>
    cn(LINK_BASE, t.navLink, label === K9_NAV_LABEL && K9_LINK);
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
                <Link href={item.href} className={linkFor(item.label)}>
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
                className={linkFor(item.label)}
              >
                {item.label}
                <ChevronDownIcon
                  width={14}
                  height={14}
                  className={cn(
                    "transition-transform duration-250 ease-nf",
                    t.navChevron,
                    open && "rotate-180"
                  )}
                />
              </Link>
              {open && (
                <div className={cn("absolute inset-x-0 top-full border-b", t.panel)}>
                  {/* panel jest absolutny wzgledem <header>, wiec jego kolumny musza
                      lezec na tej samej siatce co pasek i tresc stron: max-w-[1600px] */}
                  <div
                    className="mx-auto grid w-full max-w-[1600px] gap-10 px-4 py-10 md:px-6"
                    style={{
                      gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {columns.map((col) => (
                      <div key={col.title}>
                        {/* type-label, nie type-meta: mono zostaje w swiecie K9 */}
                        <h3 className={cn("type-label mb-3", t.panelHeading)}>{col.title}</h3>
                        <ul>
                          {col.links.map((link) => (
                            <li key={link.label}>
                              <Link
                                href={link.href}
                                onClick={() => setOpenIndex(null)}
                                className={cn(
                                  "block py-1.5 text-sm transition-colors duration-250 ease-nf",
                                  t.panelLink
                                )}
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
