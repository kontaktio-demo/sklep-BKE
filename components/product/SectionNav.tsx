"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "opis", label: "Opis" },
  { id: "specyfikacja", label: "Specyfikacja" },
  { id: "rozmiary", label: "Rozmiary" },
  { id: "dostawa", label: "Dostawa i zwroty" },
];

export function SectionNav() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (n): n is HTMLElement => n !== null
    );
    if (nodes.length === 0) return;

    // aktywna = ostatnia sekcja, której początek minął próg pod sticky headerem
    const THRESHOLD = 140;
    let frame = 0;

    const update = () => {
      frame = 0;
      let current = nodes[0];
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= THRESHOLD) current = node;
      }
      setActive(current.id);
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <nav aria-label="Sekcje produktu" className="hidden lg:block">
      <ul className="sticky top-28 space-y-1 border-l border-nf-border">
        {SECTIONS.map((section) => {
          const isActive = active === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "-ml-px flex min-h-11 items-center border-l-2 pl-4 text-sm transition-colors duration-250 ease-nf",
                  isActive
                    ? "border-nf-red text-white"
                    : "border-transparent text-nf-muted hover:border-nf-border-strong hover:text-nf-text"
                )}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
