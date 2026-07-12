import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // placeholder imagery is local SVG (phase 1); real photography replaces it in phase 2
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
