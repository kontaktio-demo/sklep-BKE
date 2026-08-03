# PLAN — Migracja Kotecki → DogStore (JEDNA aplikacja, jedna baza)

Cel: DogStore ma **wszystkie funkcje Koteckiego (parytet lub wyżej)**, ale jako **jeden
spójny system**, nie trzy osobne aplikacje. Warstwa wizualna DogStore zostaje i wyznacza
styl całości (też panelu). Rozdział na dwa sklepy: DogStore (cywilny) i DogStore Pro
(służbowy). Zero śladów po Koteckim. Gałąź `feat/kotecki-backend-migration`, commity
przyrostowe, bez deployu.

## DECYZJA ARCHITEKTONICZNA (korekta właściciela: „nie rób dwóch aplikacji, dwóch baz")
Kotecki był 3 aplikacjami (Next front + Express/Render backend + Vite/PWA panel) na jednej
bazie Supabase. **DogStore konsolidujemy w JEDEN Next.js App Router:**
- **Backend** = route handlery `app/api/**` + serwerowe funkcje w `lib/server/*`, łączące się
  z Supabase kluczem `service_role` (tylko po stronie serwera). Zero osobnego serwera Express,
  zero Rendera. Cel deployu: Vercel (jedna aplikacja). Logikę Koteckiego z `backend/src/*`
  **przepisujemy** na idiom Next (nie kopiujemy Express).
- **Panel** = grupa tras `/panel` w tej samej aplikacji (React Server/Client Components,
  design DogStore), chroniona logowaniem admina. Instalowalny jako PWA (manifest + SW zakresu
  panelu). Zero osobnej aplikacji Vite.
- **Baza** = jeden projekt Supabase (Postgres + Auth + Storage). Jedno źródło prawdy dla
  produktów, zamówień, kont. Mock zostaje wyłącznie jako offline-fallback w dev.

Dzięki temu: jeden repo, jeden build, jeden deploy, jeden model danych — „całościowy sens".

## Docelowa struktura repo
```
dog-collar-store/
├── app/
│   ├── (storefront)  /  collections  /  products  /  pro  /  koszyk  /  kasa  /  konto ...
│   ├── panel/                        # NOWE: panel admina (design DogStore, PWA)
│   └── api/                          # NOWE: route handlery = backend
│       ├── catalog|products|categories|settings|promo
│       ├── checkout|payments/webhook
│       ├── account/*  |  reviews  |  newsletter  |  contact
│       └── admin/*                   # chronione: products, orders, categories, promotions,
│                                     #   customers, reviews, settings, stats, push
├── lib/
│   ├── data/index.ts                 # SEAM → Supabase (fallback mock)
│   ├── server/                       # NOWE: supabase service client, stripe, inpost, email,
│   │                                 #   metaCapi, push, order logic (z Koteckiego, przepisane)
│   └── supabase/                     # klient anon (browser) + server (SSR)
├── supabase/                         # skrypty SQL (jeden schemat, rozdział sklepów, seed DogStore)
├── .env.example  /  DEPLOY.md  /  docs/
```

## Kroki

### Faza 1 (domknięcie) — dokumenty
1. INVENTORY.md ✓, MIGRATION_MAP.md ✓, PLAN.md (ten), PYTANIA-NA-RANO.md, DANE-DO-UZUPELNIENIA.md.

### Faza 2 — Baza (fundament, jedno źródło prawdy)
2. `supabase/` — jeden zestaw SQL złożony z 7 skryptów Koteckiego, przemianowany, z rozdziałem
   `line` (shop/pro) na `products`/`categories`, kanoniczny `create_order` (configurator),
   RLS zachowane. Seed = realny katalog DogStore (skrypt generujący z danych DogStore).
3. Wyczyścić kocie seedy i testowe produkty; katalog = obroże DogStore (shop+pro).

### Faza 3 — Warstwa serwerowa + SEAM
4. `lib/supabase/*` (anon + server), ENV plumbing, `.env.example`.
5. `lib/server/*` — port logiki Koteckiego: order (`create_order`/`release`/`refund`), stripe,
   inpost, email (Resend), metaCapi, push — jako moduły serwerowe Next.
6. Przepiąć `lib/data/index.ts` (SEAM) na Supabase (server), z mockiem jako fallback. Trasy
   sklepu czytają `line='shop'`, `/pro/*` czyta `line='pro'`. Build zielony na każdym kroku.

### Faza 4 — API + commerce loop
7. `app/api/**` route handlery (parytet z ~35 endpointami Express, idiom Next). Publiczne:
   catalog/products/categories/settings/promo. Checkout: wycena serwerowa + `create_order` +
   Stripe (PaymentIntent/Checkout) + webhook. Konto (Bearer JWT Supabase). Recenzje, newsletter
   (double opt-in), kontakt.
8. Koszyk DogStore → kasa → płatność → potwierdzenie, komponentami DogStore.

### Faza 5 — Panel + konto + PWA
9. `/panel` (design DogStore): produkty (CRUD + **selektor sklepu DogStore/Pro** + zdjęcia
   Storage), zamówienia (statusy, etykiety InPost), kategorie, promocje, klienci, recenzje,
   ustawienia, statystyki, push. Auth admina (klucz/rola). Manifest+SW panelu (PWA, instalowalny).
10. Konto klienta (magic-link): zamówienia, adresy, profil — komponentami DogStore.

### Faza 6 — Config, bramka, audyt
11. `.env.example` (wszystkie klucze), `DEPLOY.md` (Supabase SQL w kolejności, Vercel env,
    Stripe webhook, InPost/Resend/VAPID/Meta). Bez deployu.
12. Bramka: grep=0 (MIGRATION_MAP §9), `next build`, `tsc`, lint, smoke-testy krytycznych
    ścieżek, audyt (self-review + ewentualnie code-review). PWA waliduje.
13. PYTANIA-NA-RANO.md + DANE-DO-UZUPELNIENIA.md kompletne; MIGRATION_NOTES.md z otwartymi TODO.

## Warianty produktu (decyzja)
Kotecki: `bundle_config` (zestawy pick/slots). DogStore: **rozmiar (S/M/L) + kolor + szerokość**
per produkt. Rozszerzamy `products` o model DogStore i `order_items.config jsonb` (wybrany
rozmiar/kolor/SKU wariantu). `bundle_config` zostaje w schemacie (neutralny), seed go nie używa.

## Zasady
- Kotecki: tylko odczyt. DogStore: commity przyrostowe, build zielony po każdym.
- Zero danych testowych w produkcji; wymyślone → DANE-DO-UZUPELNIENIA.md; pytania → PYTANIA-NA-RANO.md.
- Bez deployu i płatnych zasobów; sekrety w ENV/`.env.example`. Autonomicznie, bez checkpointów.
