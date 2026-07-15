import { HomeHero } from "@/components/home/HomeHero";
import { HomeSeries } from "@/components/home/HomeSeries";
import { HomeBestsellers } from "@/components/home/HomeBestsellers";
import { HomeManifest } from "@/components/home/HomeManifest";
import { HomeIntro } from "@/components/home/HomeIntro";

// Strona glowna prowadzi do dwoch osobnych sklepow: cywilnego Dog Store i sluzbowego
// Dog Store Pro. Kolejnosc sekcji buduje RYTM WARTOSCI, nie stos rownych prostokatow:
//   papier (hero + zaufanie + dwa sklepy)
//   -> papier zatopiony (bestsellery: towar, cena, droga do koszyka)
//   -> GRAFIT (manifest - jedyne pelnoekranowe ciecie ciemnosci na trasie cywilnej)
//   -> papier (jak pracujemy).
// Sprzetu z linii Pro tu nie ma: jego katalog zaczyna sie dopiero po wejsciu w sekcje.
export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeSeries />
      <HomeBestsellers />
      <HomeManifest />
      <HomeIntro />
    </>
  );
}
