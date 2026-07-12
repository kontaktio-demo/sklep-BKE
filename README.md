# PAKT — sklep z obrożami (Phase 1, frontend only)

A frontend-only, **Polish-language** e-commerce experience for a premium/tactical dog-gear
brand: the collar collection PLP plus the full site shell (announcement bar, header +
mega-nav, cart drawer, quick view, newsletter, footer), unified under a Netflix visual
identity. Built per [BUILD_PROMPT.md](./BUILD_PROMPT.md) — layouts replicate NSDW/K9TG
reference patterns; the Netflix layer (billboard hero, horizontal rows, Top 10, hover-zoom
cards) sits on top. All copy is Polish, prices are PLN (`pl-PL` formatting).

**Phase 1 = visual + interaction only.** No backend, auth, checkout, or persistence.
All data flows through a typed mock layer behind a clean seam (see below).

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000/collections/collars
pnpm build      # production build + type check
```

Node 20+, pnpm. Stack: Next.js 15 (App Router, RSC, TS strict), Tailwind CSS v4
(CSS-first `@theme` tokens in `app/globals.css`), GSAP + ScrollTrigger, Lenis,
Framer Motion, React Three Fiber (hero billboard only).

## Phase-2 backend seam — READ THIS BEFORE INTEGRATING SUPABASE

**The entire UI reads data through exactly one file: [`lib/data/index.ts`](./lib/data/index.ts).**
Nothing outside `lib/data/` imports the `*.mock.ts` files. To go live, reimplement the
bodies of these three async functions against Supabase — signatures must stay identical:

```ts
getCollection(handle: string): Promise<Collection>
getProducts(handle: string): Promise<Product[]>
getFilters(handle: string): Promise<FilterGroup[]>
```

The shapes the backend must return are defined in [`lib/types.ts`](./lib/types.ts):

- **`Product`** — `id`, `slug`, `name`, `price` (number, whole PLN), `fromPrice` (render
  "od X zł"), `currency` (`"PLN"`), `images: [primary, hover]` (exactly two URLs), `colors:
  { name, hex }[]`, `badges: ("bestseller" | "new" | "sold-out" | "last-chance")[]`,
  `category: "working" | "non-working" | "e-collar"`, `type: "nylon" | "chain"`,
  `width: "1" | "1.5" | "1.75"`, `size: "small" | "medium" | "large"`,
  `idPanelCompatible`, `inStock`, `bestsellerRank?` (1–10, drives the Top 10 row),
  `productType` (label under the price), `createdAt` (ISO date, drives date sorts).
- **`FilterGroup`** — `id`, `label`, `options: { value, label, count }[]`. Facet counts
  must be derived from the product set (the mock layer computes them — keep that
  behavior server-side).
- **`Collection`** — `handle`, `title`, `description`, `heroImage`, `productCount`.

Filtering and sorting are client-side pure functions in [`lib/filtering.ts`](./lib/filtering.ts)
and keep working unchanged as long as the seam returns the shapes above. The in-memory
cart lives in [`lib/cart.tsx`](./lib/cart.tsx) (deliberately no persistence in phase 1).

## Where things live

```
app/collections/[handle]/page.tsx   PLP server component — awaits the seam
components/collection/              hero, toolbar, filters, grid, cards, rows, quick view
components/layout/                  announcement bar, header, mega-menu, cart drawer, newsletter, footer
components/ui/                      Button, Badge, PriceTag, ColorSwatch, RangeSlider, Drawer, Dialog, Skeleton
components/motion/                  LenisProvider, Reveal (GSAP), Billboard3D (R3F, hero only)
lib/data/                           THE SEAM + mocks
public/placeholder/                 generated placeholder imagery (scripts/gen-placeholders.mjs)
```

All motion is gated by `prefers-reduced-motion`. WebGL is restricted to the hero
billboard, lazy-loaded with a static-image fallback (§10 of the build prompt).
