import type { Metadata } from "next";
import { getK9Categories } from "@/lib/data";
import { K9Hero } from "@/components/k9/K9Hero";
import { K9CategoryGrid } from "@/components/k9/K9CategoryGrid";
import { K9Standards } from "@/components/k9/K9Standards";

export const metadata: Metadata = {
  title: "PAKT-K9",
  description:
    "Sprzęt służbowy dla psów pracujących. Patrol, praca węchowa, szkolenie.",
};

// Pas przewijanych parametrow (marquee) zostal usuniety: napisy w nieskonczonej petli nie
// daja sie przeczytac, nie da sie ich zaznaczyc ani wyszukac, a informacja o zerwaniu 380 kg
// i tak stoi w karcie produktu. To byl ruch dla ruchu.
export default async function K9Page() {
  const categories = await getK9Categories();

  return (
    <div className="bg-nf-bg">
      <K9Hero />
      <K9CategoryGrid categories={categories} />
      <K9Standards />
    </div>
  );
}
