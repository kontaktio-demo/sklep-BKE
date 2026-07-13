import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
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

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

// oznaczenia techniczne (kody kategorii, SKU, dane) - sekcja K9 i meta na stronie głównej
const mono = JetBrains_Mono({
  variable: "--font-mono-tech",
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
  themeColor: "#141414",
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
    <html lang="pl">
      <head>
        {/* motyw ustawiany przed pierwszym malowaniem: inaczej jasna strona glowna
            mignie grafitem, bo body startuje z ciemnym tlem sklepu */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(location.pathname==='/'){document.documentElement.dataset.theme='light'}",
          }}
        />
      </head>
      <body
        className={`${archivo.variable} ${inter.variable} ${mono.variable} antialiased`}
      >
        <a
          href="#tresc"
          className="sr-only z-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-[2px] focus:bg-nf-bg focus:px-4 focus:py-3 focus:text-sm focus:text-white"
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
