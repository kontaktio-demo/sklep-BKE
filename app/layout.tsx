import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
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
import { StoreChrome } from "@/components/layout/StoreChrome";
import { AuthProvider } from "@/components/account/AuthProvider";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
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

// ---- glos display: Satoshi (Fontshare, licencja FFL obok fontu) ----
// Ten sam duet co na stronie referencyjnej wlasciciela (amico.kontaktio.pl):
// Satoshi na naglowki, General Sans na korpus. Serif odszedl na zyczenie.
const display = localFont({
  src: [
    { path: "./fonts/Satoshi-Variable.woff2", weight: "300 900", style: "normal" },
    { path: "./fonts/Satoshi-VariableItalic.woff2", weight: "300 900", style: "italic" },
  ],
  variable: "--font-display-brand",
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

// Ścieżka bez prefiksu /en — do budowy adresów PL/EN dla canonical + hreflang.
function stripLocale(path: string): string {
  if (path === "/en") return "/";
  if (path.startsWith("/en/")) return path.slice(3);
  return path;
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const publicPath = h.get("x-dogstore-path") || "/";
  const locale = h.get("x-dogstore-locale") === "en" ? "en" : "pl";
  const bare = stripLocale(publicPath);
  const suffix = bare === "/" ? "" : bare;
  const plUrl = `${SITE_URL}${suffix}`;
  const enUrl = `${SITE_URL}/en${suffix}`;

  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: t("titleTemplate") },
    description,
    alternates: {
      canonical: locale === "en" ? enUrl : plUrl,
      languages: { pl: plUrl, en: enUrl, "x-default": plUrl },
    },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "pl_PL",
      alternateLocale: locale === "en" ? "pl_PL" : "en_US",
      url: locale === "en" ? enUrl : plUrl,
      siteName: "Dog Store",
      title,
      description,
      images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: t("ogAlt") }],
    },
  };
}

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

  // Język + słowniki dla całego drzewa (klient dostaje je przez NextIntlClientProvider).
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("a11y");

  return (
    // ViewTransitions (next-view-transitions): owija nawigacje routera w
    // document.startViewTransition. Morf wspolnego elementu robi para
    // view-transition-name nadawana w ProductCard (klik) i ProductGallery (cel).
    // Przegladarki bez API dostaja zwykla nawigacje - zero degradacji.
    <ViewTransitions>
      {/* suppressHydrationWarning: skrypt ponizej dopisuje data-theme do <html> PRZED
          hydracja (inaczej sekcja Pro mignelaby biela sklepu). Serwer tego atrybutu nie
          zna, wiec React zglaszal rozjazd. Tlumimy go na tym jednym wezle - i tylko tu. */}
      <html lang={locale} suppressHydrationWarning>
      <head>
        {/* motyw ustawiany przed pierwszym malowaniem: inaczej sekcja Dog Store Pro
            mignie jasnym tlem sklepu cywilnego, zanim React zdazy sie uruchomic.
            Obejmuje tez wersje z prefiksem /en (np. /en/pro). Wzorzec musi zgadzac
            sie z isDarkRoute() z components/layout/ThemeSync.tsx */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(/^\\/(en\\/)?pro(\\/|$)/.test(location.pathname)){document.documentElement.dataset.theme='dark'}",
          }}
        />
      </head>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} ${archivo.variable} antialiased`}
      >
        {/* NextIntlClientProvider udostepnia slownik komponentom klienckim (useTranslations). */}
        <NextIntlClientProvider messages={messages}>
        <a
          href="#tresc"
          // kolory z tokenow kontrastu, nie literalne: ten sam link laduje i na jasnym
          // sklepie, i na graficie Dog Store Pro
          className="sr-only z-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-[2px] focus:bg-nf-white focus:px-4 focus:py-3 focus:text-sm focus:text-nf-bg"
        >
          {t("skipToContent")}
        </a>
        <ThemeSync />
        {/* Lenis wraca, ale W RYZACH (components/motion/MotionProvider): jeden zegar
            GSAP, krotki lerp, scroll natywny na dotyku i pelne wylaczenie przy
            prefers-reduced-motion. Poprzednia "guma" brala sie z dwoch niezaleznych
            rAF-ow i zywych filtrow SVG w tresci - obu juz nie ma. */}
        <MotionProvider>
          <Reveals />
          <AuthProvider>
            <CartProvider>
              <StoreChrome>
                <AnnouncementBar />
                <Header />
              </StoreChrome>
              <main id="tresc">{children}</main>
              <StoreChrome>
                <Newsletter />
                <Footer />
                <CartDrawer crossSell={crossSell} />
                <SiteAnalytics />
              </StoreChrome>
            </CartProvider>
          </AuthProvider>
        </MotionProvider>
        </NextIntlClientProvider>
      </body>
      </html>
    </ViewTransitions>
  );
}
