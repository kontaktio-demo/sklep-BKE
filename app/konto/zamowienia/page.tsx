import type { Metadata } from "next";
import { OrdersView } from "@/components/account/AccountPages";

export const metadata: Metadata = { title: "Zamówienia", robots: { index: false, follow: false } };

export default function OrdersPage() {
  return (
    <div className="bg-nf-bg">
      <OrdersView />
    </div>
  );
}
