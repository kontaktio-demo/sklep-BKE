"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/Button";

export function ThankYou() {
  const { clearCart } = useCart();
  const [order, setOrder] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrder(params.get("order"));
    clearCart();
    try {
      sessionStorage.removeItem("dogstore-pay");
    } catch {
      // brak sesji płatności
    }
  }, [clearCart]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <span aria-hidden="true" className="mx-auto block h-0.5 w-14 bg-nf-red" />
      <h1 className="type-h1 mt-6 text-nf-white">Dziękujemy za zamówienie</h1>
      {order && (
        <p className="mt-3 text-nf-muted">
          Numer zamówienia: <span className="font-mono text-nf-text">{order}</span>
        </p>
      )}
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-nf-muted">
        Potwierdzenie trafi na Twój adres e-mail. Zamówienie jest już w realizacji — poinformujemy o nadaniu przesyłki.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/collections/collars">Wróć do sklepu</Button>
        <Button href="/konto/zamowienia" variant="ghost">
          Moje zamówienia
        </Button>
      </div>
    </div>
  );
}
