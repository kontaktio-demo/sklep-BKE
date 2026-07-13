import type { Metadata, Viewport } from "next";
import { Archivo, Fjalla_One, Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { CartProvider } from "@/lib/cart";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ThemeSync } from "@/components/layout/ThemeSync";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Newsletter } from "@/components/layout/Newsletter";
import { Footer } from "@/components/layout/Footer";
import { getProducts } from "@/lib/data";

// DWA SKLEPY = DWA KROJE PISMA. To nie jest niekonsekwencja, tylko konsekwencja podzialu:
// sklep cywilny idzie za referencja sklepowa (kondensowany Fjalla + Inter), a PAKT-K9 ma
// wlasna tozsamosc wizualna (K9_IDENTITY.md): Archivo 800/900 na naglowki, Geist Sans
// na tresc, Geist Mono na kazdy odczyt techniczny.

// ---- sklep cywilny ----
const display = Fjalla_One({
  variable: "--font-display-condensed",
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

// ---- PAKT-K9 ----
// Archivo: naglowki bilbordowe, uppercase, ciasny tracking (§2 K9_IDENTITY)
const archivo = Archivo({
  variable: "--font-k9-display",
  subsets: ["latin", "latin-ext"],
  weight: ["800", "900"],
});

// Geist Sans: tresc i interfejs K9. NIE Inter, NIE system-ui - to jest wprost zakazane w §6
const geist = Geist({
  variable: "--font-k9-sans",
  subsets: ["latin", "latin-ext"],
});

// Geist Mono: kazdy odczyt techniczny (1000D, ZERWANIE 380 KG, 168 g, K9-01).
// To ten kroj sprawia, ze sekcja czyta sie jak karta sprzetu, a nie jak strona sklepu
const geistMono = Geist_Mono({
  variable: "--font-k9-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

const DESCRIPTION =
  "Obroże klasy roboczej z nylonu i łańcuszka. Miejsce na panel ID, kompatybilność z e-obrożą, testy w terenie. Wysyłka w 24 h, 60 dni na zwrot.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "PAKT | Obroże i sprzęt dla psów pracujących",
    template: "%s | PAKT",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "PAKT",
    title: "PAKT | Obroże i sprzęt dla psów pracujących",
    description: DESCRIPTION,
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "PAKT" }],
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
    // suppressHydrationWarning: skrypt ponizej dopisuje data-theme do <html> PRZED
    // hydracja (inaczej sekcja K9 mignelaby bielą sklepu). Serwer tego atrybutu nie zna,
    // wiec React zglaszal rozjazd. Tlumimy go na tym jednym wezle - i tylko tu.
    <html lang="pl" suppressHydrationWarning>
      <head>
        {/* motyw ustawiany przed pierwszym malowaniem: inaczej sekcja K9 mignie
            jasnym tlem sklepu cywilnego, zanim React zdazy sie uruchomic */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(/^\\/k9(\\/|$)/.test(location.pathname)){document.documentElement.dataset.theme='dark'}",
          }}
        />
      </head>
      <body
        className={`${display.variable} ${inter.variable} ${archivo.variable} ${geist.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#tresc"
          // kolory z tokenow kontrastu, nie literalne: ten sam link laduje i na jasnym
          // sklepie, i na graficie K9
          className="sr-only z-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-[2px] focus:bg-nf-white focus:px-4 focus:py-3 focus:text-sm focus:text-nf-bg"
        >
          Przejdź do treści
        </a>
        <ThemeSync />
        <LenisProvider>
          <CartProvider>
            <AnnouncementBar />
            <Header />
            <main id="tresc">{children}</main>
            <Newsletter />
            <Footer />
            <CartDrawer crossSell={crossSell} />
          </CartProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
