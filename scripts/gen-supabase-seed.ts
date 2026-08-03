/**
 * Generator seedu Supabase z ŻYWEGO katalogu DogStore (lib/data/*.mock).
 * Emituje supabase/seed.sql: kategorie (shop+pro), produkty, warianty, kolory, zdjęcia.
 * Zero ręcznego przepisywania — seed zawsze zgodny z katalogiem front-endu.
 *
 * Uruchom:  npx tsx scripts/gen-supabase-seed.ts
 *
 * UWAGA: stany magazynowe są PROWIZORYCZNE (mock ma tylko inStock, nie ilości).
 * Dla dostępnych wariantów ustawiamy DEFAULT_STOCK, dla wyprzedanych 0.
 * Do podmiany na realne stany — patrz DANE-DO-UZUPELNIENIA.md.
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../lib/data/products.mock";
import { proProducts, proCategories } from "../lib/data/pro.mock";
import type { Product, CollarSize } from "../lib/types";

const DEFAULT_STOCK = 25;
const SIZE_SHORT: Record<CollarSize, string> = { small: "S", medium: "M", large: "L" };

const s = (v: string | null | undefined) =>
  v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`;
const arr = (xs: string[]) =>
  xs.length ? `ARRAY[${xs.map(s).join(",")}]::text[]` : `'{}'::text[]`;
const jb = (o: unknown) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;
const bool = (b: boolean) => (b ? "true" : "false");
const num = (n: number | null | undefined) => (n == null ? "null" : String(Math.round(n)));

// Kategorie sklepu cywilnego = realne wartości CollarCategory (tak filtruje storefront).
const SHOP_CATS: Record<string, { name: string; tagline: string; sort: number }> = {
  working: { name: "Obroże robocze", tagline: "Szerokie taśmy, uchwyt, panel ID.", sort: 1 },
  "non-working": { name: "Obroże codzienne", tagline: "Lżejsze obroże na spacer i dom.", sort: 2 },
  "e-collar": { name: "Kompatybilne z e-obrożą", tagline: "Prowadnice i paski pod moduł.", sort: 3 },
};

const lines: string[] = [];
lines.push("-- =============================================================");
lines.push("-- DOG STORE — seed katalogu (wygenerowany z lib/data/*.mock).");
lines.push("-- Uruchom PO schema.sql. Idempotentny (on conflict do nothing / update).");
lines.push("-- NIE edytuj ręcznie — regeneruj: npx tsx scripts/gen-supabase-seed.ts");
lines.push("-- =============================================================\n");

// ---- KATEGORIE ----
lines.push("insert into categories (slug, name, tagline, line, sort_order) values");
const catRows: string[] = [];
for (const [slug, c] of Object.entries(SHOP_CATS))
  catRows.push(`  (${s(slug)}, ${s(c.name)}, ${s(c.tagline)}, 'shop', ${c.sort})`);
proCategories.forEach((c, i) =>
  catRows.push(`  (${s(c.slug)}, ${s(c.title)}, ${s(c.description)}, 'pro', ${i + 1})`)
);
lines.push(catRows.join(",\n") + "\non conflict (slug) do update set");
lines.push("  name = excluded.name, tagline = excluded.tagline, line = excluded.line, sort_order = excluded.sort_order;\n");

// ---- PRODUKTY + WARIANTY + KOLORY + ZDJĘCIA ----
function emitProduct(p: Product, sort: number) {
  const catSlug = p.line === "pro" ? p.proCategory : p.category;
  const priceGrosze = Math.round(p.price * 100);
  const details = p.specs.map((sp) => `${sp.label}: ${sp.value}`);
  const badges = p.badges.map(String);
  const bestseller = p.badges.includes("bestseller") || p.bestsellerRank != null;

  lines.push(`-- ${p.name}`);
  lines.push(
    `insert into products (slug, name, category_id, line, pro_category, price_grosze, currency, tagline, short_description, description, details, highlights, badges, colors, width, collar_type, id_panel_compatible, pro_standard, bestseller, bestseller_rank, in_stock, active, sort_order) values (`
  );
  lines.push(
    `  ${s(p.slug)}, ${s(p.name)}, (select id from categories where slug = ${s(catSlug)}), ${s(p.line)}, ${s(p.proCategory ?? null)}, ${priceGrosze}, 'PLN', ${s(p.tagline)}, ${s(p.tagline)}, ${s(p.description)}, ${arr(details)}, ${arr(p.highlights)}, ${arr(badges)}, ${jb(p.colors)}, ${s(p.width)}, ${s(p.type)}, ${bool(p.idPanelCompatible)}, ${s(p.proStandard ?? null)}, ${bool(bestseller)}, ${num(p.bestsellerRank)}, ${bool(p.inStock)}, true, ${sort}`
  );
  lines.push(`) on conflict (slug) do update set`);
  lines.push(
    `  name = excluded.name, category_id = excluded.category_id, line = excluded.line, pro_category = excluded.pro_category, price_grosze = excluded.price_grosze, tagline = excluded.tagline, short_description = excluded.short_description, description = excluded.description, details = excluded.details, highlights = excluded.highlights, badges = excluded.badges, colors = excluded.colors, width = excluded.width, collar_type = excluded.collar_type, id_panel_compatible = excluded.id_panel_compatible, pro_standard = excluded.pro_standard, bestseller = excluded.bestseller, bestseller_rank = excluded.bestseller_rank, in_stock = excluded.in_stock, sort_order = excluded.sort_order;`
  );

  // Warianty
  for (let i = 0; i < p.variants.length; i++) {
    const v = p.variants[i];
    const stock = v.inStock ? DEFAULT_STOCK : 0;
    lines.push(
      `insert into product_variants (product_id, size, sku, price_grosze, stock_qty, in_stock, neck, weight_grams, sort_order) values (`
    );
    lines.push(
      `  (select id from products where slug = ${s(p.slug)}), ${s(SIZE_SHORT[v.size])}, ${s(v.sku)}, ${Math.round(v.price * 100)}, ${stock}, ${bool(v.inStock)}, ${s(v.neck)}, ${num(v.weightGrams)}, ${i}`
    );
    lines.push(
      `) on conflict (sku) do update set size = excluded.size, price_grosze = excluded.price_grosze, stock_qty = excluded.stock_qty, in_stock = excluded.in_stock, neck = excluded.neck, weight_grams = excluded.weight_grams, sort_order = excluded.sort_order;`
    );
  }

  // Zdjęcia (placeholdery — realne wejdą przez panel/Storage)
  lines.push(`delete from product_images where product_id = (select id from products where slug = ${s(p.slug)});`);
  p.gallery.forEach((url, i) => {
    lines.push(
      `insert into product_images (product_id, url, alt, sort_order) values ((select id from products where slug = ${s(p.slug)}), ${s(url)}, ${s(p.name)}, ${i});`
    );
  });
  lines.push("");
}

let sort = 1;
for (const p of products.filter((x) => x.line === "shop")) emitProduct(p, sort++);
for (const p of proProducts) emitProduct(p, sort++);

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "supabase", "seed.sql");
writeFileSync(out, lines.join("\n"));
console.log(`seed.sql: ${products.filter((x) => x.line === "shop").length} shop + ${proProducts.length} pro produktów -> ${out}`);
