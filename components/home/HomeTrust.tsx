import { TRUST_TRIAD } from "@/lib/nav";

// Pas zaufania: trzy fakty, ktore sklep faktycznie realizuje. Zadnych ikon-ozdobnikow
// i zadnej obietnicy, ktorej interfejs nie dotrzyma.
export function HomeTrust() {
  return (
    <section className="border-t border-nf-border bg-nf-bg">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6">
        <ul className="grid divide-y divide-nf-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {TRUST_TRIAD.map((item) => (
            <li
              key={item}
              className="py-6 text-center text-[13px] font-semibold uppercase tracking-[0.04em] text-nf-white"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
