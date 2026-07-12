# BUILD PROMPT — Dog Collar Store (Frontend Only, Phase 1)

> Paste this whole file into the repo as `BUILD_PROMPT.md` and tell Claude Code:
> *"Follow BUILD_PROMPT.md exactly. Build phase by phase. This document overrides any design instinct or skill that would deviate from it."*

---

## 0. WHAT WE ARE BUILDING

A **frontend-only, visual e-commerce experience** for a premium/tactical dog-gear brand, centered on the **collar collection (PLP / product listing page)** plus the full site shell needed to make it feel real (header, mega-nav, cart drawer, footer, quick-view modal).

**Phase 1 = visual + interaction only.** No backend, no real checkout, no auth, no CMS, no payment. All data comes from a typed mock layer. Phase 2 (later) swaps that layer for a real backend (Supabase) + integrations — so **the data seam must be built cleanly now** (see §5).

This build is a **faithful translation of two best-in-class reference sites into a modern Next.js stack, unified under a Netflix visual identity.**

Reference sites (structure encoded in §8 — treat §8 as authoritative; you do NOT need to fetch them):
- **NSDW** — Non-stop Dogwear collars: `nonstopdogwear.com/collections/collars` (clean Scandinavian premium, outdoor, whitespace-heavy)
- **K9TG** — K9 Tactical Gear collars: `k9tacticalgear.com/collections/all-collars` (tactical / working-dog, deep faceted filtering)

---

## 1. PRIME DIRECTIVE — REPLICATE, DON'T IMPROVISE

This is the most important section. Read it twice.

**You are replicating, not redesigning.** For every section, reproduce the chosen reference's *layout, structure, spacing rhythm, component anatomy, hierarchy, and interaction pattern* as faithfully as possible — 1:1 in intent.

Hard rules:
- **DO NOT** invent your own layouts, section orders, or component structures.
- **DO NOT** "improve," "modernize," or "clean up" the reference layout because you think it's better. It isn't your call.
- **DO NOT** substitute generic template/skill patterns (hero-with-centered-blob, three-feature-cards, etc.) where the reference does something specific.
- **DO NOT** let any design skill, taste heuristic, or house style override this document. If a skill wants to redesign a section, suppress it. Skills are allowed ONLY for mechanical correctness (accessibility, performance, semantic HTML, responsive math) — **never** to change the visual/structural design away from the references.

**The ONLY sanctioned deviations from the references are:**
1. The **Netflix color system** (§6) — replaces the references' palettes entirely.
2. The **Netflix layer** enhancements (§7) — billboard hero, horizontal rows, hover-zoom cards, Top 10 row. These are *additions*, applied on top of the replicated structure.
3. **Tech-stack translation** — Shopify Liquid → React/Next. Behaviour stays the same; implementation is ours.
4. The **performance & a11y guardrails** (§10).

**When the two references disagree on a section**, use the verdict in §8 (I've already picked the stronger one). Replicate the winner 1:1. If — and only if — you find a concrete reason the *other* site's version is clearly better, you may switch, but you must (a) leave a one-line code comment `// switched to NSDW/K9TG for this section because …` and (b) still replicate it 1:1, not blend them arbitrarily.

**Before building each section**, restate in one sentence which reference you're replicating and the verdict. No silent redesigns.

---

## 2. TECH STACK (locked)

- **Next.js 15**, App Router, React Server Components, TypeScript **strict**.
- **Tailwind CSS v4** (CSS-first config, `@theme` tokens). Design tokens from §6 live here.
- **GSAP** + **ScrollTrigger** for scroll-driven motion and reveals.
- **Lenis** for smooth scroll (respect `prefers-reduced-motion`).
- **Three.js / React Three Fiber** — **hero billboard / brand moments ONLY.** Never on the product grid. Budgeted (see §10).
- **next/font** (self-hosted Google fonts, §6). **next/image** for all imagery.
- **Framer Motion** allowed for small UI transitions (drawers, modals, card hover) if it's cleaner than GSAP for that specific case. Don't duplicate motion libs pointlessly.
- Package manager: **pnpm**. Node **20+**.
- **No Vite** here — Next has its own bundler. (Vite is for our non-Next projects.)
- **No backend deps** in phase 1 (no Prisma/Supabase client yet). Just the mock layer.

Definition of "done" for the environment: `pnpm dev` runs clean, no TS errors, no console errors, `/collections/collars` renders the full experience.

---

## 3. PROJECT STRUCTURE

```
/
├─ app/
│  ├─ layout.tsx                # root: fonts, Lenis provider, <Header/> <Footer/>
│  ├─ page.tsx                  # minimal home → redirect or link into collection (phase 1 focus is the PLP)
│  ├─ globals.css               # Tailwind v4 @theme tokens (§6)
│  └─ collections/
│     └─ [handle]/
│        └─ page.tsx            # the PLP. default handle: "collars"
├─ components/
│  ├─ layout/
│  │  ├─ AnnouncementBar.tsx
│  │  ├─ Header.tsx             # sticky, transparent-over-hero → solid on scroll
│  │  ├─ MegaMenu.tsx
│  │  ├─ CartDrawer.tsx
│  │  └─ Footer.tsx
│  ├─ collection/
│  │  ├─ CollectionHero.tsx     # Netflix billboard
│  │  ├─ Toolbar.tsx            # sort + product count
│  │  ├─ FilterSidebar.tsx      # desktop
│  │  ├─ FilterDrawer.tsx       # mobile
│  │  ├─ FilterControls.tsx     # shared filter UI (price slider, swatches, checkbox groups)
│  │  ├─ ProductGrid.tsx
│  │  ├─ ProductCard.tsx        # 2-image hover-swap + Netflix hover-zoom + quick actions
│  │  ├─ NetflixRow.tsx         # horizontal scrolling category row
│  │  ├─ TopTenRow.tsx          # ranked best-seller row with number badges
│  │  └─ QuickViewModal.tsx
│  ├─ ui/
│  │  ├─ Button.tsx             # red CTA + ghost variants
│  │  ├─ Badge.tsx              # sold-out / last-chance / bestseller / new
│  │  ├─ PriceTag.tsx           # handles "From $X"
│  │  ├─ ColorSwatch.tsx
│  │  ├─ RangeSlider.tsx
│  │  ├─ Drawer.tsx             # a11y drawer primitive (focus trap, esc, scrim)
│  │  ├─ Dialog.tsx             # a11y modal primitive
│  │  └─ Skeleton.tsx
│  └─ motion/
│     ├─ LenisProvider.tsx
│     ├─ Reveal.tsx             # GSAP ScrollTrigger reveal wrapper
│     └─ Billboard3D.tsx        # R3F, hero only, lazy + guarded
├─ lib/
│  ├─ data/
│  │  ├─ index.ts               # THE SEAM. getCollection/getProducts/getFilters (async). §5
│  │  ├─ products.mock.ts       # ~24–28 collar items, typed
│  │  └─ filters.mock.ts        # facet definitions
│  ├─ types.ts                  # Product, Filter, Collection, etc. §5
│  ├─ filtering.ts              # pure client filter+sort logic over Product[]
│  └─ utils.ts
├─ public/
│  └─ placeholder/              # placeholder product imgs (own or royalty-free — NOT the refs' assets)
├─ BUILD_PROMPT.md              # this file
└─ README.md                    # must document the data seam location (§13)
```

---

## 4. HANDLING SKILLS (read this — it's the recurring failure mode)

You have design/taste skills available. **For this task they are demoted.** This document + the references are the spec. Concretely:
- Do **not** run a design skill to "propose a better hero" or re-theme sections. The theme is Netflix (§6). The layout is the references (§8).
- Use skills only to *verify* accessibility, performance, semantic correctness, responsive breakpoints — i.e. to make the replicated design *correct*, never *different*.
- If you catch yourself generating a layout that isn't traceable to a reference in §8 or a rule in §7, **stop and re-read §1.** That's the improvisation failure. Revert to the reference.

---

## 5. DATA LAYER — BACKEND-READY SEAM (build carefully)

Phase 2 replaces mocks with Supabase. To make that a one-file change, **all UI reads data only through `lib/data/index.ts`**, never importing mock files directly.

`lib/types.ts`:
```ts
export type CollarCategory = "working" | "non-working" | "e-collar";
export type CollarType = "nylon" | "chain";
export type CollarWidth = "1" | "1.5" | "1.75";
export type CollarSize = "small" | "medium" | "large";
export type ProductBadge = "bestseller" | "new" | "sold-out" | "last-chance";

export interface ProductColor { name: string; hex: string; }

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;            // in minor unit or number; keep consistent
  fromPrice: boolean;       // true → render "From $X"
  currency: string;         // "USD" for now
  images: [string, string]; // [primary, hover]
  colors: ProductColor[];
  badges: ProductBadge[];
  category: CollarCategory;
  type: CollarType;
  width: CollarWidth;
  size: CollarSize;
  idPanelCompatible: boolean;
  inStock: boolean;
  bestsellerRank?: number;  // for Top 10 row
  productType: string;      // "Collar" label shown under price (K9TG pattern)
}

export interface FilterGroup {
  id: string;
  label: string;
  options: { value: string; label: string; count: number }[];
}

export interface Collection {
  handle: string;
  title: string;
  description: string;
  heroImage: string;
  productCount: number;
}
```

`lib/data/index.ts` — the seam (async, so swapping to a DB call needs no signature change):
```ts
import { products } from "./products.mock";
import { filterGroups } from "./filters.mock";
import type { Product, FilterGroup, Collection } from "../types";

// PHASE 2: replace bodies with Supabase queries. Signatures stay identical.
export async function getCollection(handle: string): Promise<Collection> { /* mock */ }
export async function getProducts(handle: string): Promise<Product[]> { /* mock */ }
export async function getFilters(handle: string): Promise<FilterGroup[]> { /* mock */ }
```

Rules:
- The PLP `page.tsx` is a **server component** that `await`s `getCollection` + `getProducts` + `getFilters`.
- **Filtering & sorting happen client-side** in `lib/filtering.ts` over the fetched `Product[]` (phase 1). Keep it a pure function so it's testable and portable.
- Generate **24–28** realistic collar products in `products.mock.ts` with fields spread across all facet values so filters visibly work (some working/nylon/1.75"/large, some e-collar-compatible, a few sold-out / last-chance / bestseller, varied colors). Use placeholder imagery in `public/placeholder/`.
- Facet counts in `filters.mock.ts` must be derivable from the product set (or computed).

---

## 6. NETFLIX DESIGN SYSTEM (tokens — the only palette)

Replace both references' colors with this. Put in `globals.css` via Tailwind v4 `@theme`.

```css
@theme {
  /* surfaces */
  --color-nf-black: #000000;
  --color-nf-bg: #141414;          /* primary surface */
  --color-nf-elevated: #181818;    /* cards */
  --color-nf-elevated-2: #232323;  /* hover / raised */
  /* brand */
  --color-nf-red: #E50914;         /* primary CTA / accent */
  --color-nf-red-hover: #F40612;
  --color-nf-red-dark: #B20710;
  /* text */
  --color-nf-white: #FFFFFF;
  --color-nf-text: #E5E5E5;
  --color-nf-muted: #B3B3B3;
  --color-nf-dim: #808080;
  /* lines */
  --color-nf-border: rgba(255,255,255,0.10);
  --color-nf-border-strong: rgba(255,255,255,0.20);
}
```
- **Scrim gradient** (hero, card overlays): `linear-gradient(to top, #141414 0%, rgba(20,20,20,0.6) 30%, transparent 65%)`.
- **CTA buttons**: solid `--nf-red`, white text, hover `--nf-red-hover`, bold, generous padding, small radius (4–6px), subtle scale on hover. Ghost buttons: transparent with `--nf-border-strong`, white text.
- **Focus ring**: 2px `--nf-white` offset — must be visible on black.

**Typography** (Netflix Sans is proprietary — use close free stand-ins, self-hosted via next/font):
- **Display / hero / section titles**: `Archivo` (weights 700–900), tight tracking, UPPERCASE for the big hero title (matches NSDW's "DOG COLLARS").
- **UI / body / product names / prices**: `Inter` (400/500/600/700).
- Large, confident type. Product names ~14–16px medium; hero title clamp huge (`clamp(2.5rem, 8vw, 6rem)`).

**Motion language** (Netflix feel):
- UI ease: `cubic-bezier(0.4, 0, 0.2, 1)`.
- Card hover zoom: scale `1.0 → 1.06–1.08` + slight `translateY(-4px)` + elevate, ~250–300ms.
- Snappy, not floaty. No long 800ms fades on interactive elements.

---

## 7. THE NETFLIX LAYER (sanctioned enhancements)

Map Netflix homepage patterns onto the collar PLP. These sit **on top of** the replicated structure from §8:

1. **Billboard hero** — replaces NSDW's static collection hero (§8-D). Full-bleed featured-collar image (or short muted looping video / subtle R3F scene), **left-aligned** title + one-line description + red CTA + secondary ghost CTA, **bottom + left gradient scrim** so text is legible, content anchored lower-left. Header sits transparent over it.

2. **Horizontal "rows"** (`NetflixRow`) — below the main filterable grid, add category rows: *Working Collars*, *Everyday*, *E-Collar Compatible*, *Best Sellers*. Each is a horizontally scrolling track: drag/swipe, snap, left/right arrow buttons on hover (desktop), edge-fade masks. Cards are the same `ProductCard`. These are secondary discovery; the filterable grid stays the primary PLP.

3. **Top 10 row** (`TopTenRow`) — a "Best Sellers" row where each card has a giant outlined **rank number** (1–10) bleeding behind it, Netflix-style. Uses `bestsellerRank`.

4. **Hover-expand cards** — on hover the `ProductCard` scales up (Netflix), lifts, and reveals quick actions (Quick View, add-to-cart, color swatches). On touch, tap opens Quick View.

5. **Everything dark + red CTAs** — the whole UI lives on `--nf-bg`, accents in `--nf-red`.

Do **not** invent Netflix patterns beyond these five without saying so.

---

## 8. SECTION-BY-SECTION BLUEPRINT + VERDICTS (authoritative)

Build in this order. For each: **[VERDICT]** = which reference to replicate, then what to reproduce, then the Netflix treatment.

### A. Announcement / utility bar — [COMBINE: K9TG message + NSDW trust]
- Thin top bar. **Rotating/marquee message** like K9TG: e.g. `CURRENT LEAD TIME: 4–10 BUSINESS DAYS` / `LIMITED DROP IS LIVE` cycling. Plus NSDW's **trust triad** somewhere in the shell: `2-Year Warranty · Fast Dispatch · 60-Day Free Returns`.
- Netflix: black bar, muted text, red highlight on the active word.

### B. Header + mega-nav — [BASE: NSDW structure, DEPTH: K9TG dropdowns]
- Sticky header. **Transparent over the hero, transitions to solid `--nf-bg` on scroll** (Netflix). Logo left/center, nav, right-side: search icon (opens search dialog — K9TG pattern), account, cart.
- **Mega-menu** modeled on NSDW's *For Dogs / For Humans / Activities* column structure, with K9TG's dropdown depth for *Shop by Category* (Collars, Harnesses, Leashes, E-Collars, Training, ID Panels…). Columns, clean, dark.
- Mobile: full-screen slide-in nav with expandable submenus (K9TG mobile pattern).

### C. Cart drawer — [VERDICT: NSDW]
- Right-side slide-in drawer. Empty state + line items. **Cross-sell "You May Also Like"** strip (NSDW). Trust badges + **payment icons** row. Estimated total, "taxes included" line, checkout CTA (red, non-functional stub in phase 1).

### D. Collection hero — [VERDICT: NSDW → Netflix billboard]
- Replicate NSDW's hero *content model*: big UPPERCASE collection title (`DOG COLLARS`) + a short descriptive paragraph + a hero image. **Then Netflix-ify per §7-1**: full-bleed, left-anchored, scrim, red CTA. This is where R3F/WebGL is allowed (budgeted, lazy, reduced-motion fallback to static image).

### E. Toolbar (sort + count) — [VERDICT: NSDW]
- Row above the grid: **product count** (`28 products`) + **Sort by** dropdown. Options (from both, they align): Featured, Best selling, A–Z, Z–A, Price low→high, Price high→low, Date new→old, Date old→new. Add a mobile "Filter" button here that opens the filter drawer.

### F. Filters — [VERDICT: K9TG wins decisively, + NSDW price/color/availability]
This is K9TG's strongest area. Build a **deep faceted filter**:
- **Collar Category** — Working / Non-Working / E-Collar Compatible *(K9TG)*
- **Collar Type** — Nylon / Chain *(K9TG)*
- **Width** — 1" / 1.5" / 1.75" *(K9TG)*
- **Size** — Small (11–14") / Medium (15–18") / Large (19"+) *(K9TG)*
- **ID Panel Compatible** — toggle *(K9TG)*
- **Availability** — In stock / Out of stock *(NSDW)*
- **Price** — range slider with From/To inputs *(NSDW)*
- **Color** — clickable swatches *(NSDW)*
- Each option shows a **count** and is a checkbox/toggle. Selecting filters the grid live (client-side, `lib/filtering.ts`). "Clear all" + per-group clear.
- **Desktop**: left sidebar (`FilterSidebar`). **Mobile**: slide-up/side drawer (`FilterDrawer`) with the same controls, "Apply" + "Clear" (NSDW mobile UX). Share `FilterControls`.

### G. Product grid + card — [BASE: NSDW card, ACTIONS: K9TG, MOTION: Netflix]
- Responsive grid (see §11 for columns).
- **Card anatomy** replicates NSDW: **two images with hover-swap** (primary → alternate on hover), product name, price. Plus K9TG's **"Quick View" overlay button** and the **product-type label** ("Collar") near the price. Plus **"From $X"** pricing (K9TG).
- **Badges** (`Badge`): `Sold out`, `Last chance` (NSDW wording), `Best Seller`, `New`. Corner-placed.
- **Netflix hover** per §7-4: scale/lift/reveal quick actions + color swatches.
- Color swatches on the card switch the preview image if you model per-color images (optional; at minimum show swatches).

### H. Netflix rows — [NEW, sanctioned §7-2/7-3]
- Under the grid: `NetflixRow` per category + one `TopTenRow`. Same cards, horizontal, draggable, arrows, edge fades.

### I. Quick View modal — [VERDICT: K9TG pattern → Netflix styled]
- Opens from card/row. Dialog (`Dialog` primitive, focus-trapped): larger image(s), name, price, colors, size/width selectors, add-to-cart (stub), "view full details" link. Dark, elevated surface, red CTA.

### J. Newsletter — [VERDICT: NSDW]
- Section: `SIGN UP FOR OUR NEWSLETTER` + "get 10% off your next order" subcopy + email input + red submit (stub). Dark band.

### K. Footer — [VERDICT: NSDW — much richer than K9TG]
- Mega-footer with columns: **Help & Contact**, **Care & Warranty**, **Where to Buy**, **About**. Plus a **country/region selector** and a **payment-methods icon row** (Visa, Mastercard, Amex, Apple Pay, PayPal, Klarna, Shop Pay…). Newsletter can live here or as its own band (J). Legal row at the bottom.

---

## 9. INTERACTION & MOTION SPEC

- **Lenis** smooth scroll app-wide via `LenisProvider`. Disable when `prefers-reduced-motion: reduce`.
- **Reveals**: `Reveal` wrapper using GSAP ScrollTrigger — subtle staggered fade+rise on section entry (grid items stagger in). Keep it tasteful, short, once-only. No parallax on the grid.
- **Header**: transparent→solid transition on scroll past hero (GSAP or scroll listener), smooth.
- **Cart drawer / filter drawer**: slide + scrim fade, focus trap, ESC to close, body scroll lock.
- **Card hover**: Netflix zoom/lift/reveal (§6 motion tokens).
- **Rows**: pointer/touch drag with inertia, snap points, arrow controls appear on hover (desktop).
- **Image hover-swap**: crossfade primary↔alternate.
- **Loading**: `Skeleton` placeholders for grid/cards (useful for phase-2 async).
- **All motion** gated by `prefers-reduced-motion` — provide static/no-motion fallbacks.

---

## 10. PERFORMANCE & ACCESSIBILITY GUARDRAILS (non-negotiable)

Performance:
- **No Three.js / WebGL on the product grid or cards. Ever.** R3F only in the hero billboard, **lazy-loaded**, **dynamically imported** (`ssr: false`), with a **static image fallback** for reduced-motion / low-power / no-WebGL. Keep hero draw calls minimal.
- `next/image` for every image, correct `sizes`, priority only on the hero.
- Paginate or lazy-render the grid if it grows; lazy-mount Netflix rows below the fold.
- Targets: **LCP < 2.5s**, **CLS ≈ 0** (reserve image dimensions), **low INP** (don't jank the main thread with motion).

Accessibility:
- Semantic HTML. Filters are real, labeled checkboxes/toggles, keyboard-operable.
- Drawers & modals: focus trap, restore focus on close, ESC, `aria-modal`, labelled.
- Cards keyboard-focusable; quick actions reachable without hover (touch/keyboard opens Quick View).
- **Contrast**: Netflix red on black passes for large/bold text — **verify small text and muted grays meet WCAG AA**; bump if needed.
- Visible focus rings on the dark theme (§6).
- Respect `prefers-reduced-motion` throughout.

---

## 11. RESPONSIVE SPEC

- Mobile-first. Breakpoints ~ `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`.
- **Grid columns**: 2 (mobile) → 2–3 (sm/md) → 3 (lg) → 4 (xl+). Match the references' density (both run ~3–4 up on desktop).
- **Filters**: sidebar on `lg+`, drawer below `lg`.
- **Nav**: full mega-menu on `lg+`, slide-in on mobile.
- **Netflix rows**: horizontal swipe on all sizes; arrows only on `lg+` hover.
- Touch targets ≥ 44px. Hover-only affordances must have touch equivalents.

---

## 12. WHAT NOT TO DO (guardrails)

- ❌ No backend, DB, auth, real checkout, real payments, real email. Stubs only.
- ❌ Do **not** scrape or copy the references' **product copy, photographs, or logos**. Use placeholder/own/royalty-free imagery and write neutral placeholder product names. (Replicating *layout & interaction patterns* is fine; lifting *content & brand assets* is not.)
- ❌ No `localStorage`/`sessionStorage`-dependent core features (they can break in sandboxed previews). Use React state; if you want cart persistence, keep it in memory for phase 1.
- ❌ Don't invent extra pages/routes we didn't ask for. Focus: the collection page + shell (+ minimal home).
- ❌ Don't deviate from §8 layouts or add un-sanctioned "creative" sections. See §1.
- ❌ No WebGL on the grid (§10). No cookie/consent banners.
- ❌ Don't over-abstract. Ship the PLP, clean but not enterprise-gold-plated.

---

## 13. DELIVERABLES / DEFINITION OF DONE

- `pnpm dev` runs clean; `/collections/collars` shows the **full experience**: announcement bar → header/mega-nav → billboard hero → toolbar → deep filters (working live against mock data) → product grid with hover-swap + Netflix hover + badges + Quick View → Netflix rows + Top 10 → newsletter → rich footer, with cart drawer functional (UI).
- Fully **responsive** and **animated** per §9/§11, all gated by reduced-motion.
- Netflix theme (§6) applied consistently; layouts traceable to §8.
- **Mock data flows only through `lib/data/index.ts`.**
- `README.md` documents: how to run, and **exactly where the Phase-2 backend seam is** (`lib/data/index.ts` — the three async functions to reimplement against Supabase), plus the `Product`/`FilterGroup` shapes the backend must return.

---

## 14. BUILD ORDER (execute start → finish)

1. Scaffold Next 15 + TS strict + Tailwind v4 + fonts + Lenis provider. `pnpm dev` clean.
2. Design tokens & UI primitives (§6): `Button`, `Badge`, `PriceTag`, `ColorSwatch`, `RangeSlider`, `Drawer`, `Dialog`, `Skeleton`.
3. Types + data seam + mock data (§5): `types.ts`, `lib/data/*`, 24–28 products, facets, `lib/filtering.ts`.
4. Shell: `AnnouncementBar`, `Header` + `MegaMenu` (transparent→solid), `Footer`, `CartDrawer`. (§8 A/B/C/K)
5. Billboard hero (§8-D, §7-1) — static first, then optional guarded R3F.
6. Toolbar (§8-E) — sort + count wired to filtering.
7. Filters (§8-F) — sidebar + drawer, live filtering against mocks.
8. Product grid + card (§8-G) — hover-swap, badges, Netflix hover, quick actions.
9. Quick View modal (§8-I).
10. Netflix rows + Top 10 (§8-H, §7-2/3).
11. Newsletter (§8-J).
12. Motion pass (§9) — reveals, drawer/modal transitions, header transition, row drag.
13. Responsive pass (§11).
14. Perf + a11y pass (§10) — audit, fix contrast, reduced-motion, image sizing, lazy R3F.
15. README with the backend-seam docs (§13).

At each step, restate the reference/verdict you're following (§1), then build. Do not skip the restatement — it's the guard against drifting into improvisation.
