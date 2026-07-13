import { Button } from "@/components/ui/Button";

// Strona główna celowo minimalna: produkty pokazujemy dopiero w kolekcji.
export default function Home() {
  return (
    <section className="flex min-h-[70svh] flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-nf-red-bright">
        Sprzęt dla psów pracujących
      </p>
      <h1 className="font-display text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-6xl">
        Dla psów,
        <br />
        które pracują
      </h1>
      <p className="max-w-md text-nf-muted">Kolekcja obroży jest już dostępna.</p>
      <Button href="/collections/collars" size="lg">
        Zobacz obroże
      </Button>
    </section>
  );
}
