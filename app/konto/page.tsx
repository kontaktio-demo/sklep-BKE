import type { Metadata } from "next";
import { AccountOverview } from "@/components/account/AccountPages";

export const metadata: Metadata = { title: "Konto", robots: { index: false, follow: false } };

export default function KontoPage() {
  return (
    <div className="bg-nf-bg">
      <AccountOverview />
    </div>
  );
}
