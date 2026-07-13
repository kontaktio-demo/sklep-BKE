"use client";

import { motion, useReducedMotion } from "framer-motion";

// Przejscie miedzy stronami: krotkie, bez przeladowania kadru.
// Template (nie layout) montuje sie ponownie przy kazdej nawigacji, wiec animacja
// wejscia odpala sie za kazdym razem, a stan koszyka w layoucie zostaje nietkniety.
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
