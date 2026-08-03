import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProCategories } from "@/lib/data";
import { ProHero } from "@/components/pro/ProHero";
import { ProCategoryGrid } from "@/components/pro/ProCategoryGrid";
import { ProStandards } from "@/components/pro/ProStandards";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pro");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

// Kolejnosc sekcji: hero (bilbord) -> siatka kategorii -> standard (editorial).
// Pas parametrow (ProSpecStrip) odszedl na zyczenie wlasciciela - zadnych
// poziomych strip-ow z odczytami. Newsletter i stopka przyjezdzaja z ukladu
// strony i dziedzicza tozsamosc Dog Store Pro z trasy.
export default async function ProPage() {
  const categories = await getProCategories();

  return (
    <div className="bg-pro-bg">
      <ProHero />
      <ProCategoryGrid categories={categories} />
      <ProStandards />
    </div>
  );
}
