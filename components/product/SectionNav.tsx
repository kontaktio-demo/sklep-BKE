"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
}

// Spis tresci czyta sekcje z DOM (data-section-label), a nie z zaszytej listy:
// karta produktu pokazuje rozne sekcje zaleznie od typu (zgodnosc tylko dla e-obrozy),
// wiec twarda lista rozjezdzala sie z trescia strony.
//
// mono = rytm Dog Store Pro. Spis stoi pod obiema kartami, a monospace nalezy do sprzetu
// sluzbowego: w sklepie cywilnym nazwy sekcji ida groteskiem (type-label).
export function SectionNav({ mono = false }: { mono?: boolean }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section-label]")
    );
    const found = nodes
      .filter((node) => node.id)
      .map((node) => ({ id: node.id, label: node.dataset.sectionLabel ?? node.id }));

    setSections(found);
    if (found.length === 0) return;
    setActive(found[0].id);

    // aktywna = ostatnia sekcja, ktorej poczatek minal prog pod sticky headerem
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

  if (sections.length === 0) return null;

  return (
    <nav aria-label="Sekcje produktu" className="hidden lg:block">
      <ul className="sticky top-28 space-y-1 border-l border-nf-border">
        {sections.map((section) => {
          const isActive = active === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  // min-h-11 trzyma cel dotykowy na 44px mimo drobnego kroju
                  "-ml-px flex min-h-11 items-center border-l-2 pl-4 transition-colors duration-250 ease-nf motion-reduce:transition-none",
                  mono ? "type-meta" : "type-label",
                  isActive
                    ? "border-nf-red text-nf-white"
                    : "border-transparent text-nf-dim hover:text-nf-text"
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
