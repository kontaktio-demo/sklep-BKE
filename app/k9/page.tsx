import type { Metadata } from "next";
import { getK9Categories } from "@/lib/data";
import { K9Hero } from "@/components/k9/K9Hero";
import { K9SpecStrip } from "@/components/k9/K9SpecStrip";
import { K9CategoryGrid } from "@/components/k9/K9CategoryGrid";
import { K9Standards } from "@/components/k9/K9Standards";

export const metadata: Metadata = {
  title: "PAKT-K9",
  description:
    "Sprzęt służbowy dla psów pracujących. Patrol, praca węchowa, szkolenie.",
};

// Kolejnosc sekcji jest podana wprost w K9_IDENTITY.md §7:
// eyebrow + hero (bilbord) -> pas parametrow (odczyt mono) -> siatka kategorii ->
// standard (editorial, nie kafle z ikonami) -> newsletter -> stopka.
// Newsletter i stopka przyjezdzaja z ukladu strony i dziedzicza tozsamosc K9 z trasy.
export default async function K9Page() {
  const categories = await getK9Categories();

  return (
    <div className="bg-k9-bg">
      <K9Hero />
      <K9SpecStrip />
      <K9CategoryGrid categories={categories} />
      <K9Standards />
    </div>
  );
}
