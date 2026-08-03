# AUDYT DogStore — backlog (z audytu wieloagentowego + weryfikacji adwersaryjnej)

Data: 2026-08-03. 33 znaleziska, 12 poważnych POTWIERDZONYCH. `[ ]` = do zrobienia, `[x]` = zrobione.

## KRYTYCZNE / copy (naprawiane przy tłumaczeniu stron — jeden przebieg PL+EN)
- [ ] **dostawa-i-platnosci**: sekcja „Płatności" opisuje zamówienia mailem / przelew / za pobraniem —
      SPRZECZNE z działającym Stripe (karta/BLIK/P24). Przepisać na płatność online Stripe. (KRYTYCZNE)
- [ ] **dostawa-i-platnosci**: `metadata.description` ma stare ceny (12,99/15,99/299 + „mailem/pobraniem").
      Złożyć ze stałych SHIPPING_OPTIONS + FREE_SHIPPING_THRESHOLD.
- [ ] **dostawa-i-platnosci**: `COD`/`EU` = `find(...)` po nieistniejących pozycjach → renderuje „koszt ."
      i „kurier , .". Usunąć wątki pobranie/UE (albo dać realne pozycje).
- [ ] **ProductSections.tsx:9**: lokalna `FREE_SHIPPING_THRESHOLD = 299` vs 149 w reszcie sklepu.
      Import z `@/lib/nav`.
- [ ] **Newsletter.tsx**: copy „na maila"/„bez rabatów"/„Zapisz się mailem" sprzeczne z double opt-in +
      kodem powitalnym. Przepisać; usunąć martwe pola email/mailto.
- [ ] **Footer.tsx:98**: widoczny link do surowego `/foto/PHOTO-CREDITS.md` („— autorzy"). Ukryć/HTML.
- [ ] **strony info**: łącznik `-` zamiast pauzy `—` (o-nas:50, gwarancja:30/63, zwroty:26, kontakt:78).
- [ ] **PanelApp/ProductEditor**: glify `✓` w statusach — usunąć (panel PL, niski prio).

## BEZPIECZEŃSTWO
- [ ] **Rate-limiting** /api/* (checkout, contact, newsletter, promo/validate, reviews, magic-link).
      Per-IP limiter. + ujednolicić komunikaty `promo/validate` (usunąć enumerację kodów). (WYSOKI)
- [ ] **email.ts**: `escapeHtml()` na WSZYSTKich polach usera w mailu kontaktowym (name/email/subject/
      message) — HTML injection/XSS w skrzynce właściciela + panelu. (ŚREDNI)
- [ ] **upload zdjęć**: whitelist rastrowych typów, ODRZUCAĆ svg, magic-bytes, walidacja productId=UUID. (ŚREDNI)
- [ ] **account/addresses/[id] PATCH**: brak zod → mass assignment własnego wiersza. `AddressBody.partial()`. (NISKI)
- [ ] **account/orders .or()**: interpolacja e-maila do filtra PostgREST → dwa sparametryzowane zapytania. (NISKI)
- [ ] **promo .ilike(code)**: `%`/`_` działają jak wildcardy → `eq`/escape. (NISKI)
- [ ] admin key w localStorage — świadomy kompromis (docelowo httpOnly cookie). (NISKI, notatka)
- middleware fail-open — OK (nie jest kontrolą bezpieczeństwa). (potwierdzone jako bezpieczne)

## KOMPLETNOŚĆ (parytet Kotecki)
- [ ] **Recenzje na PDP**: lista+średnia (GET /api/reviews/product/[slug]) + formularz (POST /api/reviews,
      token) + JSON-LD aggregateRating. Backend gotowy. (WYSOKI)
- [ ] **sendReviewRequest**: mail „prośba o opinię" z linkiem `?t=review_token` przy statusie delivered. (WYSOKI)
- [ ] **Geowidget InPost** (LockerPicker) zamiast ręcznego pola kodu paczkomatu. Wymaga
      NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN. (WYSOKI)
- [ ] **Panel — zakładki UI**: Recenzje, Wiadomości, Klienci, Kategorie, Subskrybenci (API gotowe). (WYSOKI)
- [ ] **Sweeper**: Vercel Cron → chroniony `/api/admin/sweep` = release_order dla pending/unpaid >Xh +
      czyszczenie starych stripe_events. (WYSOKI)
- [ ] **Koszyk shop/pro**: mieszany koszyk → jedno zamówienie z jednym prefiksem. Wymusić jednorodność linii. (ŚREDNI)
- [ ] **FreeShippingBar/CartView**: próg 149 na sztywno, ignoruje settings.free_shipping_grosze z kasy. (ŚREDNI)
- [ ] **newsletter/confirm**: po potwierdzeniu wysłać mail z kodem powitalnym. (ŚREDNI)
- [ ] **newsletter — kampania**: POST /api/admin/subscribers/send + sendBatch + UI. (ŚREDNI)
- [ ] **etykiety InPost**: multi-paczka (A/B/C) + DELETE przesyłki. (ŚREDNI)
- [ ] **order-status publiczny**: śledzenie gościa numer+token; użyć na /kasa/dziekujemy. (ŚREDNI)
- [ ] **statystyki miesięczne**: revenueByDay, top produkty, nowi klienci + wykres w panelu. (ŚREDNI)
- [ ] **BundleConfigurator na PDP** (jeśli oferta ma zestawy z wyborem). (ŚREDNI)
- [ ] **panel OrderDetail**: pokazać wiersze subtotal/wysyłka/rabat przed „Razem". (NISKI)
- [ ] **checkout**: zwracać zastosowany discount i sygnalizować odrzucony kod. (NISKI)
