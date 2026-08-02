import type { Metadata } from "next";
import { PanelApp } from "@/components/panel/PanelApp";

export const metadata: Metadata = {
  title: "Panel — Dog Store",
  robots: { index: false, follow: false },
};

// Panel administracyjny (jedna aplikacja z resztą sklepu). Skorupa sklepu jest ukryta
// na /panel (components/layout/StoreChrome).
export default function PanelPage() {
  return <PanelApp />;
}
