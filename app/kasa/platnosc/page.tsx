import type { Metadata } from "next";
import { PaymentClient } from "./PaymentClient";

export const metadata: Metadata = { title: "Płatność", robots: { index: false, follow: false } };

export default function PaymentPage() {
  return (
    <div className="bg-nf-bg">
      <PaymentClient />
    </div>
  );
}
