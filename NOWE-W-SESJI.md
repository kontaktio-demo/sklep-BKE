# Co nowego (sesja autonomiczna) — do konfiguracji i wiedzy właściciela

Wszystko zbudowane, przetestowane (build/tsc/lint zielone, 100 stron), wypchnięte na `main`.

## 1. Dwujęzyczność PL / EN (kompletna)
- Przełącznik PL/EN w nagłówku i menu mobilnym. Angielski pod adresem `/en/...` (prefiks SEO,
  `hreflang` + `canonical`). Panel i PWA zostają po polsku (zgodnie z decyzją).
- Przetłumaczone: całe UI, strony, formularze, komunikaty, **maile** (temat + treść w języku klienta),
  **Stripe** (język pola płatności), błędy.
- **Treści produktów**: kolumny EN w bazie + w panelu przycisk **„Przetłumacz na EN"** (model Claude).
  Bez tłumaczenia front pokazuje polskie (fallback).

## 2. Nowe zmienne środowiskowe (Vercel → Environment Variables)
```
# Auto-tłumaczenie treści produktów w panelu (bez tego pola EN wpisuje się ręcznie)
ANTHROPIC_API_KEY=            # klucz Anthropic API
ANTHROPIC_MODEL=             # opcjonalnie (domyślnie claude-3-5-sonnet-latest)

# Sprzątanie porzuconych rezerwacji (Vercel Cron) — chroni magazyn
CRON_SECRET=                 # długi losowy; Vercel dokłada go do nagłówka crona
STALE_ORDER_HOURS=2          # po ilu h zwalniać nieopłacone zamówienie

# Geowidget InPost w kasie (mapa wyboru paczkomatu) — bez tego kasa pokazuje pole na kod
NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN=
```

## 3. Baza — ponownie uruchom `supabase/schema.sql`
Dodane kolumny (ALTER-y są idempotentne, bezpieczne na istniejącej bazie):
- `orders.locale`, `newsletter_subscribers.locale` (język maili),
- `products.*_en` (name/tagline/short_description/description/details/highlights),
- `categories.name_en`, `categories.tagline_en`.

## 4. Vercel Cron
`vercel.json` zawiera cron `/api/admin/sweep` co 15 min (zwalnia porzucone rezerwacje + przycina
`stripe_events`). Częstotliwość zależy od planu Vercel — na Hobby dostosuj do dobowej.

## 5. Nowe funkcje (poza i18n)
- **Recenzje na karcie produktu** + średnia + `aggregateRating` (gwiazdki w Google) + strona
  **`/opinie?t=…`** (formularz z maila „prośba o opinię").
- **Panel — nowe zakładki**: Kategorie (CRUD), Opinie (moderacja), Wiadomości, Klienci, Newsletter.
- **SEO**: `sitemap.xml` z wersjami PL/EN, `robots.txt` z wykluczeniami, JSON-LD Organization/WebSite.
- **Bezpieczeństwo**: rate-limiting API, escapowanie maili (XSS), whitelist uploadu zdjęć.
- **Sweeper** porzuconych rezerwacji (jak wyżej).

## 6. Audyt
Pełny audyt (bezpieczeństwo/integralność/kompletność/AI) w `AUDYT.md` — krytyczne i wysokie
znaleziska naprawione (m.in. sprzeczność „zamówienia mailem" vs Stripe, urwane zdania, próg 299→149).
