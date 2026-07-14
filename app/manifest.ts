import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dog Store | Obroże i sprzęt dla psów pracujących",
    short_name: "Dog Store",
    description:
      "Obroże klasy roboczej z nylonu i łańcuszka. Panel ID, zgodność z e-obrożą, wysyłka w 24 h.",
    lang: "pl",
    start_url: "/",
    display: "standalone",
    background_color: "#141414",
    theme_color: "#141414",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
