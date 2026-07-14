import type { Metadata, Viewport } from "next";
import { Archivo, Fjalla_One, Geist, Geist_Mono, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ThemeSync } from "@/components/layout/ThemeSync";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Newsletter } from "@/components/layout/Newsletter";
import { Footer } from "@/components/layout/Footer";
import { getProducts } from "@/lib/data";

// DWA SKLEPY = DWA KROJE PISMA. To nie jest niekonsekwencja, tylko konsekwencja podzialu:
// sklep cywilny idzie za referencja sklepowa (kondensowany Fjalla + Inter), a Dog Store Pro
// ma wlasna tozsamosc wizualna (PRO_IDENTITY.md): Archivo 800/900 na naglowki, Geist Sans
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

// Monospace odczytow technicznych w komponentach WSPOLDZIELONYCH (SKU, kody, okruszki,
// pasek zapowiedzi) - czyli klasa type-meta i font-mono. To jest wartosc DOMYSLNA, dla
// sklepu cywilnego; w /pro globals.css przestawia --font-mono-tech na Geist Mono, zeby
// sekcja Pro mowila jednym krojem. Bez tego wpisu zmienna nie istnieje POZA /pro, a
// font-family: var(--font-mono-tech) jest wtedy niepoprawne w czasie wyliczania wartosci
// i po cichu dziedziczy Inter - monospace znikal z calego sklepu, nie wywalajac buildu.
const mono = JetBrains_Mono({
  variable: "--font-mono-tech",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

// ---- Dog Store Pro ----
// Archivo: naglowki bilbordowe, uppercase, ciasny tracking (§2 PRO_IDENTITY)
const archivo = Archivo({
  variable: "--font-pro-display",
  subsets: ["latin", "latin-ext"],
  weight: ["800", "900"],
});

// Geist Sans: tresc i interfejs Dog Store Pro. NIE Inter, NIE system-ui - zakazane w §6
const geist = Geist({
  variable: "--font-pro-sans",
  subsets: ["latin", "latin-ext"],
});

// Geist Mono: kazdy odczyt techniczny (1000D, ZERWANIE 380 KG, 168 g, PRO-01).
// To ten kroj sprawia, ze sekcja czyta sie jak karta sprzetu, a nie jak strona sklepu
const geistMono = Geist_Mono({
  variable: "--font-pro-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

const DESCRIPTION =
  "Obroże klasy roboczej z nylonu i łańcuszka. Miejsce na panel ID, kompatybilność z e-obrożą, testy w terenie. Wysyłka w 24 h, 60 dni na zwrot.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
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
    // suppressHydrationWarning: skrypt ponizej dopisuje data-theme do <html> PRZED
    // hydracja (inaczej sekcja Pro mignelaby bielą sklepu). Serwer tego atrybutu nie zna,
    // wiec React zglaszal rozjazd. Tlumimy go na tym jednym wezle - i tylko tu.
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
        className={`${display.variable} ${inter.variable} ${mono.variable} ${archivo.variable} ${geist.variable} ${geistMono.variable} antialiased`}
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
        {/* Bez smooth scrolla (Lenis). Biblioteka przejmowala kolko myszy i ANIMOWALA
            przewijanie w JS, wiec kazda ciezsza klatka zamieniala scroll w gume. Natywne
            przewijanie idzie po stronie kompozytora przegladarki i nie da sie go zaciac
            renderem. */}
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main id="tresc">{children}</main>
          <Newsletter />
          <Footer />
          <CartDrawer crossSell={crossSell} />
        </CartProvider>
      </body>
    </html>
  );
}
