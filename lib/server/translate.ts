import "server-only";

/**
 * Auto-tłumaczenie treści produktu PL → EN (model Claude przez Anthropic API).
 * Wypełnia pola *_en w edytorze; właściciel może je poprawić. Bez klucza API funkcja
 * zgłasza TRANSLATE_NOT_CONFIGURED (panel pokazuje komunikat, pola EN można wpisać ręcznie).
 *
 * Klucz i model z ENV: ANTHROPIC_API_KEY (wymagany), ANTHROPIC_MODEL (opcjonalny).
 */
const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-3-5-sonnet-latest";

export interface TranslatableProduct {
  name?: string | null;
  tagline?: string | null;
  short_description?: string | null;
  description?: string | null;
  details?: string[] | null;
  highlights?: string[] | null;
}

export function translateConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

// Zostawiamy tylko niepuste pola do tłumaczenia (mniej tokenów, brak pustych kluczy w wyniku).
function nonEmpty(input: TranslatableProduct): TranslatableProduct {
  const out: TranslatableProduct = {};
  if (input.name) out.name = input.name;
  if (input.tagline) out.tagline = input.tagline;
  if (input.short_description) out.short_description = input.short_description;
  if (input.description) out.description = input.description;
  if (input.details && input.details.length) out.details = input.details;
  if (input.highlights && input.highlights.length) out.highlights = input.highlights;
  return out;
}

export async function translateToEnglish(input: TranslatableProduct): Promise<TranslatableProduct> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("TRANSLATE_NOT_CONFIGURED");

  const payload = nonEmpty(input);
  if (Object.keys(payload).length === 0) return {};

  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const prompt =
    "Przetłumacz poniższe polskie pola produktu e-commerce na profesjonalny, naturalny angielski " +
    "dla premium marki sprzetu dla psow pracujacych (Dog Store / Dog Store Pro). Zachowaj nazwy marek, " +
    "SKU, jednostki (cm, kg, mm, D) oraz strukture Etykieta: wartosc w elementach tablic. Tlumacz kazdy " +
    "element tablicy osobno. Rejestr: sklep = konsument, linia Pro = sluzby/przewodnicy K9. Zwroc WYLACZNIE " +
    "obiekt JSON z tymi samymi kluczami co wejscie (bez komentarzy, bez markdown). Wejscie:\n" +
    JSON.stringify(payload);

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`TRANSLATE_FAILED_${res.status}`);

  const data = (await res.json()) as { content?: { text?: string }[] };
  const text = data.content?.[0]?.text ?? "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("TRANSLATE_PARSE");
  return JSON.parse(text.slice(start, end + 1)) as TranslatableProduct;
}
