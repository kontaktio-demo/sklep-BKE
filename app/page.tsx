import { HomeHero } from "@/components/home/HomeHero";
import { HomeSeries } from "@/components/home/HomeSeries";
import { HomeBestsellers } from "@/components/home/HomeBestsellers";
import { HomeIntro } from "@/components/home/HomeIntro";
import { HomeTrust } from "@/components/home/HomeTrust";

// Strona glowna prowadzi do dwoch osobnych sklepow: cywilnego PAKT i sluzbowego PAKT-K9.
// Po kaflach wejsciowych stoi pas handlowy z bestsellerami SKLEPU - strona glowna sklepu
// musi pokazac towar, cene i droge do koszyka. Sprzetu K9 tu nie ma: jego katalog zaczyna
// sie dopiero po wejsciu w sekcje.
export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeSeries />
      <HomeBestsellers />
      <HomeTrust />
      <HomeIntro />
    </>
  );
}
