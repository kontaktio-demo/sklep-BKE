import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { CartProvider } from "@/lib/cart";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
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

export const metadata: Metadata = {
  title: "PAKT — obroże i sprzęt dla psów pracujących",
  description:
    "Obroże klasy służbowej z nylonu i łańcuszka. Miejsce na panel ID, kompatybilność z e-obrożą, testy w terenie. Wysyłka w 24 h, 60 dni na zwrot.",
};

export const viewport: Viewport = {
  themeColor: "#141414",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // cross-sell candidates for the cart drawer (§8-C) — fetched through the seam
  const crossSell = (await getProducts("collars"))
    .filter((p) => p.inStock && p.bestsellerRank != null)
    .sort((a, b) => (a.bestsellerRank ?? 99) - (b.bestsellerRank ?? 99))
    .slice(0, 6);

  return (
    <html lang="pl">
      <body className={`${archivo.variable} ${inter.variable} antialiased`}>
        <LenisProvider>
          <CartProvider>
            <AnnouncementBar />
            <Header />
            <main>{children}</main>
            <Newsletter />
            <Footer />
            <CartDrawer crossSell={crossSell} />
          </CartProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
