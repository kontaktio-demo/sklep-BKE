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

## Status faz
- [~] Faza 0 — Rozpoznanie (2 agenci Explore inwentaryzują Kotecki; lokalizacja potwierdzona)
- [ ] Faza 1 — PLAN.md + MIGRATION_MAP.md
- [ ] Faza 2 — Kopiowanie warstwy funkcjonalnej (schema, API, auth, koszyk, checkout, zamówienia)
- [ ] Faza 3 — Przemianowanie na DogStore (bramka grep = 0)
- [ ] Faza 4 — Panel PWA w designie DogStore
- [ ] Faza 5 — Config Supabase + Render, .env.example, DEPLOY.md
- [ ] Faza 6 — Bramka jakości (grep=0, build, typecheck, lint, smoke-testy)

## Dziennik
- **Start**: potwierdzono ścieżki. Kotecki = Next.js App Router + Supabase + backend/ +
  panel-mobile (Vite/React PWA). Supabase SQL: accounts, configurator, order_shipments,
  reviews, meta_tracking, hardening, setup_all. Cel = dog-collar-store (Next.js + mock data,
  seam `lib/data/index.ts` gotowy do podmiany na realny backend).
