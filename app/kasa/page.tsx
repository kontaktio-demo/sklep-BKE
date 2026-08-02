import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Kasa",
  robots: { index: false, follow: false },
};

export default function KasaPage() {
  return (
    <div className="bg-nf-bg">
      <div className="mx-auto max-w-[1100px] px-4 pt-10">
        <p className="type-kicker text-nf-dim">Zamówienie</p>
        <h1 className="type-h1 mt-2 text-nf-white">Kasa</h1>
      </div>
      <CheckoutForm />
    </div>
  );
}
