import { TRUST_TRIAD } from "@/lib/nav";

// Pas zaufania: trzy fakty w mono, rozdzielone wlosowymi liniami. Mono, bo to sa
// PARAMETRY uslugi (jak 1000D czy 380 KG), a nie hasla - jezyk techniczny marki.
export function HomeTrust() {
  return (
    <section className="border-b border-nf-border bg-nf-bg">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6">
        <ul className="grid divide-y divide-nf-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {TRUST_TRIAD.map((item) => (
            <li key={item} className="type-meta py-5 text-center text-nf-text">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
