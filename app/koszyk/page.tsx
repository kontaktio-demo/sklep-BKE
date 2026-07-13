import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";

export const metadata: Metadata = {
  title: "Koszyk",
  description:
    "Sprawdź pozycje w koszyku, ilości i wartość zamówienia. Darmowa dostawa od 299 zł, 60 dni na zwrot.",
  alternates: { canonical: "/koszyk" },
  // koszyk jest inny dla kazdego i nie ma czego indeksowac
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-24">
      <Breadcrumbs
        items={[
          { label: "Sklep", href: "/collections/collars" },
          { label: "Koszyk" },
        ]}
      />

      <h1 className="type-h1 mt-6 text-nf-white">Koszyk</h1>

      <div className="mt-12">
        <CartView />
      </div>
    </div>
  );
}
