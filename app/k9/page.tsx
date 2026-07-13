import type { Metadata } from "next";
import { getK9Categories } from "@/lib/data";
import { K9Hero } from "@/components/k9/K9Hero";
import { K9Marquee } from "@/components/k9/K9Marquee";
import { K9CategoryGrid } from "@/components/k9/K9CategoryGrid";
import { K9Standards } from "@/components/k9/K9Standards";

export const metadata: Metadata = {
  title: "PAKT-K9",
  description:
    "Sprzęt służbowy dla psów pracujących. Patrol, praca węchowa, szkolenie.",
};

export default async function K9Page() {
  const categories = await getK9Categories();

  return (
    <div className="bg-nf-bg">
      <K9Hero />
      {/* K9Marquee ma border-y, wiec siatka kategorii nie dokłada juz border-t (bez podwojnej kreski) */}
      <K9Marquee />
      <K9CategoryGrid categories={categories} />
      <K9Standards />
    </div>
  );
}
