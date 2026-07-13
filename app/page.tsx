import { HomeHero } from "@/components/home/HomeHero";
import { HomeIntro } from "@/components/home/HomeIntro";
import { HomeGateways } from "@/components/home/HomeGateways";

// Strona glowna: jasna i neutralna. Prowadzi do dwoch swiatow - sklepu i sekcji PAKT-K9.
// Produktow tu nie ma; pokazujemy je dopiero po wejsciu w wybrany swiat.
export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeIntro />
      <HomeGateways />
    </>
  );
}
