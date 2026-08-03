"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { adminFetch } from "@/lib/panel/api";

/**
 * Edytor produktu w panelu: pola, WARIANTY (rozmiar/SKU/cena/stan/obwód/waga), kolory,
 * kategoria (zależna od sklepu), zdjęcia (upload do Storage), zestaw (bundle_config JSON).
 * Nowy produkt: najpierw zapis (dostaje ID), potem można wgrywać zdjęcia.
 */
const INPUT = "h-10 w-full rounded-[2px] border border-nf-control bg-nf-bg px-3 text-sm text-nf-white outline-none focus:border-nf-white";
const LABEL = "type-label mb-1 block text-nf-dim";
const CARD = "rounded-[3px] border border-nf-border bg-nf-elevated p-4";

interface Variant {
  size: string;
  sku: string;
  price: string; // zł w UI
  stock: string;
  neck: string;
  weight: string;
}
interface Color {
  name: string;
  hex: string;
}
interface ImageRow {
  id: string;
  url: string;
}
interface Category {
  id: string;
  slug: string;
  name: string;
}

const PRO_CATS = ["patrol", "handle", "e-collar", "training", "detection"];
const emptyVariant = (): Variant => ({ size: "", sku: "", price: "", stock: "", neck: "", weight: "" });

export function ProductEditor({ productId, defaultLine, onClose }: { productId: string | null; defaultLine: "shop" | "pro"; onClose: () => void }) {
  const [id, setId] = useState<string | null>(productId);
  const [line, setLine] = useState<"shop" | "pro">(defaultLine);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [proCategory, setProCategory] = useState("patrol");
  const [price, setPrice] = useState("");
  const [tagline, setTagline] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [width, setWidth] = useState("");
  const [collarType, setCollarType] = useState("nylon");
  const [idPanel, setIdPanel] = useState(false);
  const [active, setActive] = useState(true);
  const [bestseller, setBestseller] = useState(false);
  const [badges, setBadges] = useState("");
  const [bundle, setBundle] = useState("");
  const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);
  const [colors, setColors] = useState<Color[]>([]);
  const [images, setImages] = useState<ImageRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void adminFetch<Category[]>(`/categories?sklep=${line}`).then((r) => setCategories(r.ok ? r.data ?? [] : []));
  }, [line]);

  useEffect(() => {
    if (!id) return;
    void adminFetch<Record<string, unknown>>(`/products/${id}`).then((r) => {
      const p = r.data as Record<string, unknown> | undefined;
      if (!p) return;
      setLine((p.line as "shop" | "pro") ?? "shop");
      setName((p.name as string) ?? "");
      setSlug((p.slug as string) ?? "");
      setCategoryId((p.category_id as string) ?? "");
      setProCategory((p.pro_category as string) ?? "patrol");
      setPrice(p.price_grosze ? String((p.price_grosze as number) / 100) : "");
      setTagline((p.tagline as string) ?? "");
      setShortDesc((p.short_description as string) ?? "");
      setDescription((p.description as string) ?? "");
      setWidth((p.width as string) ?? "");
      setCollarType((p.collar_type as string) ?? "nylon");
      setIdPanel(Boolean(p.id_panel_compatible));
      setActive(p.active !== false);
      setBestseller(Boolean(p.bestseller));
      setBadges(((p.badges as string[]) ?? []).join(", "));
      setBundle(p.bundle_config ? JSON.stringify(p.bundle_config, null, 2) : "");
      setColors((p.colors as Color[]) ?? []);
      const vs = (p.product_variants as Record<string, unknown>[]) ?? [];
      setVariants(
        vs.length
          ? vs
              .sort((a, b) => ((a.sort_order as number) ?? 0) - ((b.sort_order as number) ?? 0))
              .map((v) => ({
                size: (v.size as string) ?? "",
                sku: (v.sku as string) ?? "",
                price: v.price_grosze ? String((v.price_grosze as number) / 100) : "",
                stock: v.stock_qty == null ? "" : String(v.stock_qty),
                neck: (v.neck as string) ?? "",
                weight: v.weight_grams == null ? "" : String(v.weight_grams),
              }))
          : [emptyVariant()]
      );
      const imgs = (p.product_images as Record<string, unknown>[]) ?? [];
      setImages(imgs.map((i) => ({ id: i.id as string, url: i.url as string })));
    });
  }, [id]);

  const setVar = (i: number, key: keyof Variant, val: string) =>
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [key]: val } : v)));

  const save = async () => {
    setBusy(true);
    setMsg(null);
    let parsedBundle: unknown = null;
    if (bundle.trim()) {
      try {
        parsedBundle = JSON.parse(bundle);
      } catch {
        setBusy(false);
        setMsg("Zestaw (bundle) nie jest poprawnym JSON.");
        return;
      }
    }
    const priceG = Math.round(Number(price || 0) * 100);
    const payload = {
      line,
      name,
      slug,
      category_id: categoryId || null,
      pro_category: line === "pro" ? proCategory : null,
      price_grosze: priceG,
      tagline,
      short_description: shortDesc,
      description,
      width: width || null,
      collar_type: collarType,
      id_panel_compatible: idPanel,
      active,
      bestseller,
      badges: badges.split(",").map((b) => b.trim()).filter(Boolean),
      colors,
      bundle_config: parsedBundle,
      variants: variants
        .filter((v) => v.sku.trim())
        .map((v) => ({
          size: v.size || null,
          sku: v.sku.trim(),
          price_grosze: Math.round(Number(v.price || 0) * 100),
          stock_qty: v.stock === "" ? null : Math.max(0, Math.floor(Number(v.stock))),
          in_stock: v.stock === "" ? true : Number(v.stock) > 0,
          neck: v.neck || null,
          weight_grams: v.weight === "" ? null : Math.round(Number(v.weight)),
        })),
    };
    const res = id
      ? await adminFetch<{ id: string }>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
      : await adminFetch<{ id: string }>("/products", { method: "POST", body: JSON.stringify(payload) });
    setBusy(false);
    if (res.ok) {
      setMsg("Zapisano ✓");
      if (!id && res.data?.id) setId(res.data.id);
    } else {
      setMsg(res.message ?? "Nie udało się zapisać.");
    }
  };

  const upload = async (file: File) => {
    if (!id) {
      setMsg("Najpierw zapisz produkt, potem dodaj zdjęcia.");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/admin/products/${id}/images`, {
      method: "POST",
      headers: { "x-admin-key": localStorage.getItem("dogstore-admin-key") ?? "" },
      body: form,
    }).then((r) => r.json());
    if (res.ok) void adminFetch<Record<string, unknown>>(`/products/${id}`).then((r) => {
      const imgs = ((r.data as Record<string, unknown>)?.product_images as Record<string, unknown>[]) ?? [];
      setImages(imgs.map((i) => ({ id: i.id as string, url: i.url as string })));
    });
    else setMsg(res.message ?? "Nie udało się wgrać zdjęcia.");
  };

  const removeImage = async (imageId: string) => {
    await adminFetch(`/products/images/${imageId}`, { method: "DELETE" });
    setImages((prev) => prev.filter((i) => i.id !== imageId));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onClose} className="type-label text-nf-dim hover:text-nf-white">
          ← Lista produktów
        </button>
        <div className="flex items-center gap-3">
          {msg && <span className="text-xs text-nf-muted">{msg}</span>}
          <Button onClick={save} disabled={busy}>
            {busy ? "Zapisywanie…" : id ? "Zapisz zmiany" : "Utwórz produkt"}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className={`${CARD} space-y-3`}>
          <h3 className="type-h3 text-nf-white">Podstawowe</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Sklep</label>
              <select value={line} onChange={(e) => setLine(e.target.value as "shop" | "pro")} className={INPUT}>
                <option value="shop">Dog Store</option>
                <option value="pro">Dog Store Pro</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Kategoria</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={INPUT}>
                <option value="">— wybierz —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {line === "pro" && (
            <div>
              <label className={LABEL}>Kategoria Pro</label>
              <select value={proCategory} onChange={(e) => setProCategory(e.target.value)} className={INPUT}>
                {PRO_CATS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className={LABEL}>Nazwa</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Slug (adres)</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className={INPUT} placeholder="np. obroza-patrolowa" />
            </div>
            <div>
              <label className={LABEL}>Cena od (zł)</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} className={INPUT} inputMode="decimal" />
            </div>
          </div>
          <div>
            <label className={LABEL}>Krótki opis / tagline</label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Opis</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={`${INPUT} h-auto py-2`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Szerokość</label>
              <input value={width} onChange={(e) => setWidth(e.target.value)} className={INPUT} placeholder="np. 4,5 cm" />
            </div>
            <div>
              <label className={LABEL}>Rodzaj</label>
              <select value={collarType} onChange={(e) => setCollarType(e.target.value)} className={INPUT}>
                <option value="nylon">Nylon</option>
                <option value="chain">Łańcuszek</option>
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL}>Plakietki (po przecinku)</label>
            <input value={badges} onChange={(e) => setBadges(e.target.value)} className={INPUT} placeholder="bestseller, new" />
          </div>
          <div className="flex flex-wrap gap-4 pt-1 text-sm text-nf-text">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-4 accent-[var(--color-nf-red)]" /> Aktywny
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={bestseller} onChange={(e) => setBestseller(e.target.checked)} className="size-4 accent-[var(--color-nf-red)]" /> Bestseller
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={idPanel} onChange={(e) => setIdPanel(e.target.checked)} className="size-4 accent-[var(--color-nf-red)]" /> Panel ID
            </label>
          </div>
        </div>

        <div className="space-y-5">
          <div className={CARD}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="type-h3 text-nf-white">Warianty (rozmiary)</h3>
              <button type="button" onClick={() => setVariants((v) => [...v, emptyVariant()])} className="text-sm text-nf-red hover:underline">
                + Dodaj
              </button>
            </div>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-12 gap-1.5">
                  <input value={v.size} onChange={(e) => setVar(i, "size", e.target.value)} placeholder="S/M/L" className={`${INPUT} col-span-2`} />
                  <input value={v.sku} onChange={(e) => setVar(i, "sku", e.target.value)} placeholder="SKU" className={`${INPUT} col-span-3`} />
                  <input value={v.price} onChange={(e) => setVar(i, "price", e.target.value)} placeholder="zł" className={`${INPUT} col-span-2`} />
                  <input value={v.stock} onChange={(e) => setVar(i, "stock", e.target.value)} placeholder="stan" className={`${INPUT} col-span-2`} />
                  <input value={v.neck} onChange={(e) => setVar(i, "neck", e.target.value)} placeholder="obwód" className={`${INPUT} col-span-2`} />
                  <button type="button" onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))} className="col-span-1 text-nf-red">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={CARD}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="type-h3 text-nf-white">Kolory</h3>
              <button type="button" onClick={() => setColors((c) => [...c, { name: "", hex: "#333333" }])} className="text-sm text-nf-red hover:underline">
                + Dodaj
              </button>
            </div>
            <div className="space-y-2">
              {colors.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="color" value={c.hex} onChange={(e) => setColors((prev) => prev.map((x, idx) => (idx === i ? { ...x, hex: e.target.value } : x)))} className="h-9 w-12 rounded border border-nf-control bg-nf-bg" />
                  <input value={c.name} onChange={(e) => setColors((prev) => prev.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))} placeholder="Nazwa koloru" className={INPUT} />
                  <button type="button" onClick={() => setColors((prev) => prev.filter((_, idx) => idx !== i))} className="text-nf-red">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={CARD}>
            <h3 className="type-h3 mb-2 text-nf-white">Zdjęcia</h3>
            {!id && <p className="text-xs text-nf-dim">Zapisz produkt, aby dodać zdjęcia.</p>}
            {id && (
              <>
                <div className="flex flex-wrap gap-2">
                  {images.map((img) => (
                    <div key={img.id} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="h-20 w-20 rounded-[2px] object-cover" />
                      <button type="button" onClick={() => removeImage(img.id)} className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-nf-red text-xs text-white">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void upload(f);
                    e.target.value = "";
                  }}
                />
                <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 text-sm text-nf-red hover:underline">
                  + Wgraj zdjęcie
                </button>
              </>
            )}
          </div>

          <div className={CARD}>
            <h3 className="type-h3 mb-1 text-nf-white">Zestaw (opcjonalnie)</h3>
            <p className="mb-2 text-xs text-nf-dim">Konfigurator zestawu jako JSON (pick/slots). Puste = zwykły produkt.</p>
            <textarea value={bundle} onChange={(e) => setBundle(e.target.value)} rows={3} className={`${INPUT} h-auto py-2 font-mono text-xs`} placeholder='{"mode":"pick","pick":2,"options":[...]}' />
          </div>
        </div>
      </div>
    </div>
  );
}
