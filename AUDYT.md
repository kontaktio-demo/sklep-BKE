# AUDYT DogStore — backlog (z audytu wieloagentowego + weryfikacji adwersaryjnej)

Data: 2026-08-03. 33 znaleziska, 12 poważnych POTWIERDZONYCH. `[ ]` = do zrobienia, `[x]` = zrobione.

## KRYTYCZNE / copy — ZROBIONE (przy tłumaczeniu stron, jeden przebieg PL+EN)
- [x] **dostawa-i-platnosci**: sekcja „Płatności" przepisana na płatność online Stripe (karta/BLIK/P24).
- [x] **dostawa-i-platnosci**: `metadata.description` złożony ze stałych (16,99/29,99/149, online).
- [x] **dostawa-i-platnosci**: usunięte urwane „koszt ." / „kurier , ." (wątki COD/UE wycięte).
- [x] **ProductSections**: 299 → import FREE_SHIPPING_THRESHOLD z `@/lib/nav` (149).
- [x] **cart meta**: 299 → 149 (pl+en).
- [x] **Newsletter.tsx**: copy pod realny double opt-in + kod -10%; usunięte martwe pola mailto.
- [x] **Footer.tsx**: usunięty link do surowego `.md`; profesjonalna atrybucja CC (tekst).
- [x] **strony info/prawne**: łącznik `-` → pauza `—` w prozie.
- [ ] **PanelApp/ProductEditor**: glify `✓` w statusach — usunąć (panel PL, niski prio).

## BEZPIECZEŃSTWO — ZROBIONE
- [x] **Rate-limiting** /api/* (checkout 12/min, contact 5/h, newsletter 5/h, promo 15/min, reviews 10/h)
      + generyczny komunikat `promo/validate` (anty-enumeracja). (WYSOKI)
- [x] **email.ts**: `esc()` na wszystkich polach usera (contact + nazwy pozycji). (ŚREDNI)
- [x] **upload zdjęć**: whitelist rastrów, odrzucenie svg, magic-bytes, walidacja productId=UUID. (ŚREDNI)
## BEZPIECZEŃSTWO — pozostaje
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
