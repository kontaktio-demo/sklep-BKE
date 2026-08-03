import type { MetadataRoute } from "next";

import { SITE_URL as BASE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Ścieżki nieindeksowalne (transakcyjne / prywatne / API). Warianty /en analogicznie.
      disallow: [
        "/panel",
        "/api/",
        "/kasa",
        "/konto",
        "/logowanie",
        "/opinie",
        "/sledzenie",
        "/wkrotce",
        "/en/kasa",
        "/en/konto",
        "/en/logowanie",
        "/en/opinie",
        "/en/wkrotce",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
