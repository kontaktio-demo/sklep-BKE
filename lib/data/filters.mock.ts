import { SIZE_LABEL, SIZE_ORDER, WIDTH_LABEL, WIDTH_ORDER } from "../sizes";
import type { FilterGroup, Product } from "../types";
import { products } from "./products.mock";

function count(predicate: (p: Product) => boolean): number {
  return products.filter(predicate).length;
}

// facet counts are computed from the product set so they can never drift (§5)
export const filterGroups: FilterGroup[] = [
  {
    id: "category",
    label: "Kategoria",
    options: [
      { value: "working", label: "Robocze", count: count((p) => p.category === "working") },
      { value: "non-working", label: "Codzienne", count: count((p) => p.category === "non-working") },
      { value: "e-collar", label: "Kompatybilne z e-obrożą", count: count((p) => p.category === "e-collar") },
    ],
  },
  {
    id: "type",
    label: "Rodzaj",
    options: [
      { value: "nylon", label: "Nylonowe", count: count((p) => p.type === "nylon") },
      { value: "chain", label: "Łańcuszkowe", count: count((p) => p.type === "chain") },
    ],
  },
  {
    // etykiety ida z lib/sizes - filtr nie moze mowic czegos innego niz karta produktu
    id: "width",
    label: "Szerokość",
    options: WIDTH_ORDER.map((width) => ({
      value: width,
      label: WIDTH_LABEL[width],
      count: count((p) => p.width === width),
    })),
  },
  {
    id: "size",
    label: "Rozmiar",
    options: SIZE_ORDER.map((size) => ({
      value: size,
      label: SIZE_LABEL[size],
      count: count((p) => p.size === size),
    })),
  },
  {
    id: "idPanel",
    label: "Panel ID",
    options: [
      { value: "true", label: "Z miejscem na panel ID", count: count((p) => p.idPanelCompatible) },
    ],
  },
  {
    id: "availability",
    label: "Dostępność",
    options: [
      { value: "in-stock", label: "Dostępne", count: count((p) => p.inStock) },
      { value: "out-of-stock", label: "Wyprzedane", count: count((p) => !p.inStock) },
    ],
  },
  {
    id: "color",
    label: "Kolor",
    options: [...new Map(products.flatMap((p) => p.colors).map((c) => [c.name, c])).values()].map(
      (c) => ({
        value: c.name,
        label: c.name,
        count: count((p) => p.colors.some((pc) => pc.name === c.name)),
      })
    ),
  },
];
