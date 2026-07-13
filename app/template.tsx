"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/utils";

// Przejscie miedzy stronami. KLUCZOWE: markup z serwera NIE moze byc ukryty.
// Wczesniej wrapper wychodzil z serwera z opacity-0 i translate, wiec bez JS cala
// witryna byla niewidoczna (a bezpieczny wariant SeamTransition tracil sens).
// Teraz stan startowy zakladamy dopiero po montazu: SSR oddaje tresc widoczna.
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<"ssr" | "start" | "shown">("ssr");

  useEffect(() => {
    if (reduced) {
      setPhase("shown");
      return;
    }
    setPhase("start");
    // dwie klatki: pierwsza oddaje przegladarce styl startowy, druga uruchamia przejscie
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setPhase("shown"));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [reduced]);

  return (
    <div
      className={cn(
        "transition-[opacity,translate] duration-500 ease-out-expo motion-reduce:transition-none",
        phase === "start" && "translate-y-3 opacity-0"
      )}
    >
      {children}
    </div>
  );
}
