# INVENTORY — Kotecki (źródło) → DogStore (cel)

Inwentaryzacja z pełnego, głębokiego przeglądu obu codebase'ów (Faza 0).

- **Źródło (tylko odczyt):** `../Strony internetowe/kotecki.pl`
- **Cel:** `dog-collar-store` (warstwa wizualna DogStore zostaje)

---

## A. Architektura Koteckiego — TRZY aplikacje w jednym repo

1. **Storefront** — Next.js 16 / React 19, Zustand (koszyk), Tailwind 4, Stripe (front),
   Supabase Auth (magic-link), Meta Pixel. **Brak `app/api/**`** (poza 2 route handlerami
   newslettera). Rozmawia z backendem przez `NEXT_PUBLIC_API_URL`.
2. **Backend** — Express 4 + TypeScript (ESM), deploy na **Render**, łączy się z Supabase
   kluczem `service_role`. ~35 endpointów. Jedyny komponent piszący do bazy.
3. **Panel** — osobna aplikacja **Vite + React 18 (PWA)** w `panel-mobile/`, admin mobilny,
   auth przez nagłówek `x-admin-key`, powiadomienia push (VAPID). Deploy statyczny.

Supabase = Postgres + Auth (konta klientów passwordless) + Storage (zdjęcia produktów).

## B. Cel — DogStore (dog-collar-store) dzisiaj

- Next.js 15 App Router, Tailwind 4, **dane z mocków** przez seam `lib/data/index.ts`.
- Koszyk w `localStorage` (`lib/cart.tsx`), **brak** auth / checkout / zamówień / panelu / bazy.
- **Ma już `line: "shop" | "pro"`** na produktach → to jest fundament pod dwa sklepy
  (DogStore + DogStorePro). Kategorie cywilne: `category` (working/non-working/e-collar),
  `type` (nylon/chain); Pro: `proCategory` (patrol/handle/e-collar/training/detection).
- Bogaty design system (Fraunces + General Sans, ziarno, motion, View Transitions) — ZOSTAJE.

## C. Co Kotecki MA, czego DogStore NIE MA (do przeniesienia)

| Obszar | Kotecki | DogStore dziś |
|---|---|---|
| Baza danych | Supabase Postgres, 18 tabel, RLS, RPC, CHECK-i | brak (mocki) |
| Backend | Express na Render, ~35 endpointów | brak |
| Auth klienta | Supabase magic-link, konta, adresy, historia | brak |
| Koszyk trwały | Zustand+persist, serwerowa wycena | localStorage, bez wyceny serwerowej |
| Checkout | 4 formy dostawy, Stripe (hosted+embedded), kody rabatowe | brak |
| Zamówienia | transakcyjny `create_order`, statusy, rezerwacja stanu | brak |
| Płatności | Stripe + webhook (idempotencja) | brak |
| Wysyłka | InPost ShipX (paczkomat/kurier, etykiety PDF) | brak |
| Mail | Resend (potwierdzenia, opinie, newsletter) | brak (mailto) |
| Recenzje | pełne + moderacja + JSON-LD aggregateRating | brak |
| Newsletter | double opt-in | mailto |
| Promocje | kody percent/fixed, progi, limity | brak |
| Panel admin | Vite PWA: produkty, zamówienia, kategorie, promocje, klienci, opinie, statystyki, ustawienia, push | brak |
| Analityka | Meta Pixel + CAPI | brak |
| Tryb „zamknięte" | middleware → /wkrotce | brak |

Co DogStore ma, a Kotecki nie: **dwa sklepy (shop/pro)**, design premium, sekcja Pro
z zapytaniami ofertowymi. To utrzymujemy i wnosimy do schematu + panelu.

## D. Schemat bazy (18 tabel) — markowo-NEUTRALNY

`categories`, `products`, `product_images`, `promotions`, `customers`, `orders`,
`order_items`, `admins`, `settings`, `stripe_events`, `push_subscriptions`,
`account_profiles`, `account_addresses`, `contact_messages`, `newsletter_subscribers`,
`reviews` (+ `auth.users` z Supabase).

Skrypty SQL (kolejność ładowania): `setup_all.sql` → `accounts.sql` → `configurator.sql`
→ `hardening.sql` → `reviews.sql` → `meta_tracking.sql` → `order_shipments.sql`.
Brak migration frameworka i `seed.sql` (seed w `setup_all.sql`).

RPC (tylko `service_role`): `create_order` (atomowe, rezerwuje stan, `OUT_OF_STOCK`/
`PROMO_EXHAUSTED`; kanoniczna wersja w `configurator.sql` — obsługuje sloty zestawów),
`release_order`, `refund_order`, `delete_customer_account` (RODO), `admin_account_stats`.
Statusy przez CHECK-i, nie natywne enumy.

**Zmiana pod DogStore:** `products` dostaje kolumny rozdzielające sklepy —
`line` ('shop'|'pro') i `pro_category` (dla linii pro). Publiczny katalog i panel filtrują po `line`.

## E. Integracje + ENV (nazwy kluczy)

- **Stripe** (hosted + embedded, karta/BLIK/Przelewy24): `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- **InPost ShipX**: `INPOST_TOKEN`, `INPOST_ORG_ID`, `INPOST_BASE_URL`, `INPOST_PARCEL_TEMPLATE`,
  `INPOST_SERVICE_LOCKER`, `INPOST_SERVICE_COURIER`.
- **Resend**: `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_NOTIFY_EMAIL`, `NEWSLETTER_WELCOME_CODE`.
- **web-push/VAPID**: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.
- **Meta CAPI**: `FB_PIXEL_ID`, `FB_CAPI_TOKEN`, `FB_TEST_EVENT_CODE`.
- **hCaptcha**: `HCAPTCHA_SECRET`, `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`.
- **Supabase**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`,
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Admin/infra**: `ADMIN_API_KEY`, `PORT`, `NODE_ENV`, `CLIENT_ORIGIN`, `SITE_URL`,
  `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`.

## F. Ślady marki Koteckiego (do wycięcia — pełna mapa w MIGRATION_MAP.md)

151 wystąpień w 62 plikach. Struktura bazy NIE zawiera marki. Ślady w:
- nazwy paczek: `pankotecki`, `pan-kotecki-backend`, panel-mobile
- domena `pankotecki.pl` (zaszyta w `backend/src/lib/email.ts`, `metaCapi.ts`), FROM `biuro@pankotecki.pl`
- wartość dostawy `kotecki_personal` (żartobliwa „dostawa przez Pana Koteckiego", 1000 zł)
- kod newslettera `KOT10`
- adres odbioru „ul. Brzezińska 84, 95-020 Bedoń Wieś"
- stringi Stripe/maili („Pan Kotecki", „pod czujnym okiem kota 🐾"), health `pan-kotecki-backend`
- kocie seedy: kategorie (`zabawki/akcesoria/kubki/dla-wlasciciela`) + 20 produktów
  (`mysz-fela`, `kubek-poranny-mruczek`, `bluza-mow-do-kota`…), zdublowane w `lib/products.ts`
- asset `avatar_pan_kotecki.svg`, docs `SETUP.md`/`ARCHITECTURE.md`

## G. Funkcje użytkownika Koteckiego (checklista do parytetu)

Wyszukiwarka, filtry (kategoria/cena/dostępność/sort), warianty/zestawy (konfigurator),
koszyk (drawer+strona), checkout gość+zalogowany, 4 formy dostawy, wybór paczkomatu,
Stripe (karta/BLIK/P24), kody rabatowe, newsletter double opt-in, recenzje+moderacja,
konto (magic-link, zamówienia, adresy, profil), formularz kontaktowy, cookie consent,
Meta Pixel/CAPI, tryb „sklep zamknięty", SEO (sitemap/robots/OG/JSON-LD).
**Brak (nie przenosimy):** wishlista (martwy artefakt), push dla klienta.

## H. Uwagi migracyjne (pełny plan w PLAN.md)

- Trzy odrębne deploye zostają: Next.js front (Vercel), Express backend (Render), Vite PWA panel.
- `create_order` istnieje 3× — bierzemy kanoniczną z `configurator.sql`.
- Dane produktowe w DWÓCH miejscach (SQL seed + `lib/products.ts` fallback) — oba na DogStore.
- Seed DogStore = obecny katalog obroży (26 shop + 12 pro), rozdzielony kolumną `line`.
