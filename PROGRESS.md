# PROGRESS — Migracja backendu Kotecki → DogStore

Gałąź robocza: `feat/kotecki-backend-migration` (żywy `main`/Vercel nietknięty).
Źródło (tylko do odczytu): `../Strony internetowe/kotecki.pl`.
Cel: `dog-collar-store` (warstwa wizualna DogStore zostaje).

## Wymaganie kluczowe od właściciela
- **Dwa sklepy: DogStore (cywilny) + DogStorePro (służbowy).** Produkt musi wiedzieć, do
  którego sklepu należy — rozdzielenie na poziomie **bazy** (kolumna/enum `line`/`storefront`)
  i **panelu** (przy dodawaniu/edycji produktu wybierasz sklep). Frontend już to ma
  (`line: "shop" | "pro"`), więc schemat i panel dopinam do tego samego podziału.
- Wszystkie nazwy (zmienne, tabele, kolumny, typy, route'y, ENV) → nomenklatura DogStore,
  ale **sensownie pod DogStore** (dobre kategorie, logiczne nazwy), nie mechaniczna kalka.
- Zero śladów po Koteckim. Zero danych testowych/placeholderów w stanie produkcyjnym.
- Rzeczy wymyślone (dane firmowe, klucze) → `DANE-DO-UZUPELNIENIA.md` do podmiany rano.

## STAN: migracja funkcjonalna UKOŃCZONA (parytet Kotecki, styl DogStore, jedna aplikacja)
Wszystko na gałęzi `feat/kotecki-backend-migration`, build/tsc/lint zielone, grep „kotecki"=0.
Sklep działa bez konfiguracji (mock); realny backend włącza ENV (DEPLOY.md). Zbudowane:
baza (schema+seed), katalog z bazy (SEAM+fallback), koszyk→kasa→Stripe→webhook→mail/push/CAPI,
zamówienia (create_order), konto (magic-link), recenzje/newsletter/kontakt, panel /panel
(DogStore/Pro, płaskie tło, PWA+push). Otwarte kwestie: MIGRATION_NOTES.md; pytania:
PYTANIA-NA-RANO.md; dane do wklejenia: DANE-DO-UZUPELNIENIA.md.

## Status faz
- [~] Faza 0 — Rozpoznanie (2 agenci Explore inwentaryzują Kotecki; lokalizacja potwierdzona)
- [ ] Faza 1 — PLAN.md + MIGRATION_MAP.md
- [ ] Faza 2 — Kopiowanie warstwy funkcjonalnej (schema, API, auth, koszyk, checkout, zamówienia)
- [ ] Faza 3 — Przemianowanie na DogStore (bramka grep = 0)
- [ ] Faza 4 — Panel PWA w designie DogStore
- [ ] Faza 5 — Config Supabase + Render, .env.example, DEPLOY.md
- [ ] Faza 6 — Bramka jakości (grep=0, build, typecheck, lint, smoke-testy)

## Stan trwały (dla kontynuacji po kompaktacji — CZYTAJ TO NAJPIERW)
- Gałąź `feat/kotecki-backend-migration`. Kotecki (źródło, tylko odczyt):
  `../Strony internetowe/kotecki.pl`. Schemat Koteckiego już PRZECZYTANY w całości.
- **Architektura docelowa: JEDEN Next.js + JEDNA baza Supabase.** Backend = `app/api/**`
  + `lib/server/*` (service_role). Panel = `app/panel/**`. Bez Rendera, bez osobnego Vite.
- **Zrobione:**
  - Faza 0/1 docs: INVENTORY, MIGRATION_MAP, PLAN, PYTANIA-NA-RANO, DANE-DO-UZUPELNIENIA, PROGRESS.
  - `supabase/schema.sql` — pełny schemat (port Koteckiego + rozdział `line` shop/pro na
    products/categories/orders + tabela `product_variants` (rozmiar/SKU/stan) + kolory jsonb;
    RLS, CHECK-i, RPC wariantowe: create_order/release_order/refund_order/delete_customer_account/
    admin_account_stats). Statusy jak Kotecki.
  - `scripts/gen-supabase-seed.ts` + `supabase/seed.sql` — 26 shop + 12 pro produktów,
    81 wariantów, wygenerowane z lib/data/*.mock (żywy katalog). Kategorie shop = working/
    non-working/e-collar; pro = patrol/handle/e-collar/training/detection.
- **Następne (kolejność):** deps (@supabase/supabase-js, @supabase/ssr, zod, stripe, web-push)
  → `lib/supabase/{browser,server}.ts` + `lib/server/*` (order, stripe, inpost, email, push,
  metaCapi) → przepiąć SEAM `lib/data/index.ts` na Supabase (fallback mock) → `app/api/**`
  → koszyk/checkout/konto → `/panel` → .env.example/DEPLOY.md → bramka+audyt.
- **Zasady:** build zielony po każdym commicie; mock zostaje jako offline-fallback; dane
  wymyślone → DANE-DO-UZUPELNIENIA.md; pytania → PYTANIA-NA-RANO.md; grep „kotecki/kot/…"=0.

## Dziennik
- **Start**: potwierdzono ścieżki. Kotecki = Next.js App Router + Supabase + backend/ +
  panel-mobile (Vite/React PWA). Cel = dog-collar-store.
- **Faza 0/1 done**: dokumenty + decyzja jednej aplikacji/bazy.
- **Faza 2 (baza) done**: schema.sql + seed.sql (generator z żywego katalogu).
