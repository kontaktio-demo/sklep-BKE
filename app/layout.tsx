import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { ViewTransitions } from "next-view-transitions";
import { CartProvider } from "@/lib/cart";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Reveals } from "@/components/motion/Reveals";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ThemeSync } from "@/components/layout/ThemeSync";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Newsletter } from "@/components/layout/Newsletter";
import { Footer } from "@/components/layout/Footer";
import { getProducts } from "@/lib/data";

// DWA SKLEPY = DWA GLOSY TYPOGRAFICZNE, jeden korpus.
//
// Sklep cywilny mowi editorialowym serifem (Fraunces) - katalog terenowy zlozony jak
// magazyn, nie landing. Dog Store Pro zostaje przy bilbordowym Archivo 800/900. Napiecie
// miedzy tymi glosami to fundament calej dyrekcji (spec: 2026-07-15-awwwards-redesign).
//
// Inter i Geist odeszly SWIADOMIE: to najczestsze kroje stron generowanych automatycznie
// i najsilniejszy pojedynczy sygnal "template". Korpus obu swiatow to General Sans
// (Fontshare, licencja FFL - plik obok fontu), mono to JetBrains Mono - jeden na caly
// serwis, do kazdego odczytu technicznego (SKU, 1000D, ZERWANIE 380 KG, PRO-01).

// ---- glos cywilny: serif display ----
// Osie variable: opsz (optical size - duze naglowki dostaja ostrzejszy rysunek same z
// siebie), SOFT/WONK zostaja w wartosciach domyslnych - charakter ma niesc skala i sklad.
const display = Fraunces({
  variable: "--font-display-serif",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "SOFT", "WONK"],
});

// ---- korpus obu swiatow ----
const sans = localFont({
  src: [
    { path: "./fonts/GeneralSans-Variable.woff2", weight: "200 700", style: "normal" },
    { path: "./fonts/GeneralSans-VariableItalic.woff2", weight: "200 700", style: "italic" },
  ],
  variable: "--font-sans-brand",
});

// Monospace odczytow technicznych w komponentach WSPOLDZIELONYCH (SKU, kody, okruszki,
// pasek zapowiedzi) - klasa type-meta i font-mono. Jeden kroj w obu swiatach: to samo
// oznaczenie katalogowe ma wygladac tak samo na papierze i na graficie.
const mono = JetBrains_Mono({
  variable: "--font-mono-tech",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

// ---- glos Dog Store Pro: bilbord ----
// Archivo: naglowki bilbordowe, uppercase, ciasny tracking (§2 PRO_IDENTITY)
const archivo = Archivo({
  variable: "--font-pro-display",
  subsets: ["latin", "latin-ext"],
  weight: ["800", "900"],
});

const DESCRIPTION =
  "Obroże klasy roboczej z nylonu i łańcuszka. Miejsce na panel ID, kompatybilność z e-obrożą, testy w terenie. Wysyłka w 24 h, 60 dni na zwrot.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dog Store | Obroże i sprzęt dla psów pracujących",
    template: "%s | Dog Store",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Dog Store",
    title: "Dog Store | Obroże i sprzęt dla psów pracujących",
    description: DESCRIPTION,
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "Dog Store" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f0f0ee",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // cross-sell candidates for the cart drawer (§8-C) - fetched through the seam
  const crossSell = (await getProducts("collars"))
    .filter((p) => p.inStock && p.bestsellerRank != null)
    .sort((a, b) => (a.bestsellerRank ?? 99) - (b.bestsellerRank ?? 99))
    .slice(0, 6);

  return (
    // ViewTransitions (next-view-transitions): owija nawigacje routera w
    // document.startViewTransition. Morf wspolnego elementu robi para
    // view-transition-name nadawana w ProductCard (klik) i ProductGallery (cel).
    // Przegladarki bez API dostaja zwykla nawigacje - zero degradacji.
    <ViewTransitions>
      {/* suppressHydrationWarning: skrypt ponizej dopisuje data-theme do <html> PRZED
          hydracja (inaczej sekcja Pro mignelaby biela sklepu). Serwer tego atrybutu nie
          zna, wiec React zglaszal rozjazd. Tlumimy go na tym jednym wezle - i tylko tu. */}
      <html lang="pl" suppressHydrationWarning>
      <head>
        {/* motyw ustawiany przed pierwszym malowaniem: inaczej sekcja Dog Store Pro
            mignie jasnym tlem sklepu cywilnego, zanim React zdazy sie uruchomic.
            Wzorzec musi zgadzac sie z isDarkRoute() z components/layout/ThemeSync.tsx */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(/^\\/pro(\\/|$)/.test(location.pathname)){document.documentElement.dataset.theme='dark'}",
          }}
        />
      </head>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} ${archivo.variable} antialiased`}
      >
        <a
          href="#tresc"
          // kolory z tokenow kontrastu, nie literalne: ten sam link laduje i na jasnym
          // sklepie, i na graficie Dog Store Pro
          className="sr-only z-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-[2px] focus:bg-nf-white focus:px-4 focus:py-3 focus:text-sm focus:text-nf-bg"
        >
          Przejdź do treści
        </a>
        <ThemeSync />
        {/* Lenis wraca, ale W RYZACH (components/motion/MotionProvider): jeden zegar
            GSAP, krotki lerp, scroll natywny na dotyku i pelne wylaczenie przy
            prefers-reduced-motion. Poprzednia "guma" brala sie z dwoch niezaleznych
            rAF-ow i zywych filtrow SVG w tresci - obu juz nie ma. */}
        <MotionProvider>
          <Reveals />
          <CartProvider>
            <AnnouncementBar />
            <Header />
            <main id="tresc">{children}</main>
            <Newsletter />
            <Footer />
            <CartDrawer crossSell={crossSell} />
          </CartProvider>
        </MotionProvider>
      </body>
      </html>
    </ViewTransitions>
  );
}
