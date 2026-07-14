import type { Metadata } from "next";
import { getProCategories } from "@/lib/data";
import { ProHero } from "@/components/pro/ProHero";
import { ProSpecStrip } from "@/components/pro/ProSpecStrip";
import { ProCategoryGrid } from "@/components/pro/ProCategoryGrid";
import { ProStandards } from "@/components/pro/ProStandards";

export const metadata: Metadata = {
  title: "Dog Store Pro",
  description:
    "Sprzęt służbowy dla psów pracujących. Patrol, praca węchowa, szkolenie.",
};

// Kolejnosc sekcji jest podana wprost w PRO_IDENTITY.md §7:
// eyebrow + hero (bilbord) -> pas parametrow (odczyt mono) -> siatka kategorii ->
// standard (editorial, nie kafle z ikonami) -> newsletter -> stopka.
// Newsletter i stopka przyjezdzaja z ukladu strony i dziedzicza tozsamosc Dog Store Pro z trasy.
export default async function ProPage() {
  const categories = await getProCategories();

  return (
    <div className="bg-pro-bg">
      <ProHero />
      <ProSpecStrip />
      <ProCategoryGrid categories={categories} />
      <ProStandards />
    </div>
  );
}
