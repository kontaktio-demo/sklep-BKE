import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Wtyczka next-intl ładuje ./i18n/request.ts (słowniki + wybór języka PL/EN).
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    // placeholder imagery is local SVG (phase 1); real photography replaces it in phase 2
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withNextIntl(nextConfig);
