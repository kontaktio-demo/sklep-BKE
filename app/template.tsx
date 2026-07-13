"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/utils";

// Przejscie miedzy stronami: krotkie, bez przeladowania kadru.
// Template (nie layout) montuje sie ponownie przy kazdej nawigacji, wiec animacja
// wejscia odpala sie za kazdym razem, a stan koszyka w layoucie zostaje nietkniety.
// Stan otwarty nie ma klasy translate (`translate: none`, nie `translate: 0 0`):
// niezerowy translate tworzylby blok zawierajacy dla kazdego position:fixed w drzewie
// strony, czyli dla szuflad i modali.
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }
    // dwie klatki: pierwsza oddaje przegladarce styl startowy, druga uruchamia przejscie
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(true));
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
        shown ? "opacity-100" : "translate-y-3 opacity-0"
      )}
    >
      {children}
    </div>
  );
}
