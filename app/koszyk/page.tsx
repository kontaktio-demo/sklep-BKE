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
    <div className="mx-auto max-w-[1600px] px-4 py-12 md:px-6 md:py-16">
      <Breadcrumbs
        items={[
          { label: "Sklep", href: "/collections/collars" },
          { label: "Koszyk" },
        ]}
      />

      <h1 className="mt-6 font-display text-3xl font-bold uppercase leading-tight tracking-tight text-nf-white md:text-4xl">
        Koszyk
      </h1>

      <div className="mt-10">
        <CartView />
      </div>
    </div>
  );
}
