"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

/**
 * Analityka za zgodą (GDPR): Google Analytics 4 + Meta Pixel ładują się DOPIERO po
 * akceptacji cookies. Bez ustawionych ID (NEXT_PUBLIC_GA4_ID / NEXT_PUBLIC_FB_PIXEL_ID)
 * skrypty się nie pojawiają — banner i tak działa. CAPI (serwerowy Purchase) jest osobno.
 */
const GA = process.env.NEXT_PUBLIC_GA4_ID ?? "";
const PIXEL = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? "";
const KEY = "dogstore-consent";

type Consent = "unknown" | "granted" | "denied";

export function SiteAnalytics() {
  const [consent, setConsent] = useState<Consent>("unknown");

  useEffect(() => {
    const v = localStorage.getItem(KEY);
    setConsent(v === "granted" ? "granted" : v === "denied" ? "denied" : "unknown");
  }, []);

  const decide = (v: Exclude<Consent, "unknown">) => {
    localStorage.setItem(KEY, v);
    setConsent(v);
  };

  return (
    <>
      {consent === "granted" && GA && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA}');`}
          </Script>
        </>
      )}
      {consent === "granted" && PIXEL && (
        <Script id="fbpixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');`}
        </Script>
      )}

      {consent === "unknown" && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-nf-border bg-nf-elevated px-4 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex max-w-[1100px] flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-nf-muted">
              Używamy plików cookie do statystyk i marketingu. Możesz zaakceptować albo zostać
              przy niezbędnych.{" "}
              <a href="/polityka-prywatnosci" className="text-nf-text underline underline-offset-4">
                Polityka prywatności
              </a>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => decide("denied")}
                className="h-10 rounded-[2px] border border-nf-control px-4 text-sm text-nf-text transition-colors hover:bg-nf-elevated-2"
              >
                Tylko niezbędne
              </button>
              <button
                type="button"
                onClick={() => decide("granted")}
                className="h-10 rounded-[2px] bg-nf-white px-4 text-sm font-semibold text-nf-bg transition-colors hover:bg-nf-text"
              >
                Akceptuję
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
