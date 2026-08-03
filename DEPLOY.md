# DEPLOY — Dog Store (jedna aplikacja, jedna baza)

Sklep, backend (API), panel i konta to JEDNA aplikacja Next.js + JEDNA baza Supabase.
Deploy = Vercel (frontend + API) + Supabase (baza). Bez osobnego serwera/Rendera.

Sklep DZIAŁA bez konfiguracji (na danych mockowych). Poniższe kroki włączają realny backend.

## 1. Supabase (baza)
1. Załóż projekt na https://supabase.com.
2. SQL Editor → wklej i uruchom **`supabase/schema.sql`** (tabele, RLS, RPC, CHECK-i).
3. SQL Editor → wklej i uruchom **`supabase/seed.sql`** (katalog: 26 DogStore + 12 Pro).
   - Regeneracja seedu z katalogu front-endu: `npx tsx scripts/gen-supabase-seed.ts`.
4. Storage → utwórz publiczny bucket na zdjęcia produktów (np. `product-images`).
5. Settings → API: skopiuj `Project URL`, `anon key`, `service_role key`, `JWT secret`.

## 2. Zmienne środowiskowe (Vercel → Project → Settings → Environment Variables)
Skopiuj z `.env.example`. Minimum do uruchomienia sklepu na bazie:
```
NEXT_PUBLIC_SITE_URL=https://twoja-domena
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...
ADMIN_API_KEY=<długi losowy ciąg>     # dostęp do /panel
```
Płatności / wysyłka / mail / push / analityka — dołóż, gdy będą klucze (patrz `.env.example`).
Wartości do wklejenia zbiera **`DANE-DO-UZUPELNIENIA.md`**.

## 3. Płatności (Stripe)
1. Klucze: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. Webhook: URL `https://twoja-domena/api/payments/webhook`, zdarzenia:
   `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`,
   `charge.refunded`. Sekret → `STRIPE_WEBHOOK_SECRET`.

## 4. Wysyłka (InPost ShipX) — opcjonalnie na start
`INPOST_TOKEN`, `INPOST_ORG_ID`. Etykiety generuje panel (do dopięcia — patrz MIGRATION_NOTES).

## 5. Mail (Resend)
`RESEND_API_KEY`, `EMAIL_FROM` (zweryfikowana domena), `CONTACT_NOTIFY_EMAIL`.

## 6. Push do panelu (VAPID)
`npx web-push generate-vapid-keys` → `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.
W panelu: „Powiadomienia" (instaluje PWA i subskrybuje).

## 7. Deploy
- Vercel: podłącz repo, gałąź produkcyjną ustaw po akceptacji (obecnie praca na
  `feat/kotecki-backend-migration`; `main` = obecny sklep).
- `pnpm build` musi przejść (przechodzi lokalnie).
- Panel: `https://twoja-domena/panel` (klucz `ADMIN_API_KEY`).

## Kolejność „na już"
1. Supabase: schema.sql → seed.sql. 2. Vercel ENV (Supabase + ADMIN_API_KEY). 3. Deploy.
4. Reszta (Stripe/InPost/Resend/VAPID/Meta) — w miarę pozyskiwania kluczy, bez re-deployu kodu.
