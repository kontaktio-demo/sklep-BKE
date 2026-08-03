import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Wkrótce otwieramy",
  robots: { index: false, follow: false },
};

// Strona zastępcza, gdy sklep jest zamknięty (ustawienie open=false w panelu).
export default function ComingSoonPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <span aria-hidden="true" className="block h-0.5 w-14 bg-nf-red" />
      <p className="type-kicker mt-6 text-nf-dim">Dog Store</p>
      <h1 className="type-h1 mt-2 text-nf-white">Wkrótce otwieramy</h1>
      <p className="mt-4 max-w-md text-nf-muted">
        Sklep jest chwilowo niedostępny. Zapisz się do newslettera — poinformujemy o otwarciu.
      </p>
      <Button href="/o-nas" variant="ghost" className="mt-8">
        Poznaj Dog Store
      </Button>
    </div>
  );
}
