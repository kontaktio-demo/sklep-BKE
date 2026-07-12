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
    id: "width",
    label: "Szerokość",
    options: [
      { value: "1", label: "2,5 cm", count: count((p) => p.width === "1") },
      { value: "1.5", label: "4 cm", count: count((p) => p.width === "1.5") },
      { value: "1.75", label: "4,5 cm", count: count((p) => p.width === "1.75") },
    ],
  },
  {
    id: "size",
    label: "Rozmiar",
    options: [
      { value: "small", label: "Mały (28–36 cm)", count: count((p) => p.size === "small") },
      { value: "medium", label: "Średni (38–46 cm)", count: count((p) => p.size === "medium") },
      { value: "large", label: "Duży (48 cm+)", count: count((p) => p.size === "large") },
    ],
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
