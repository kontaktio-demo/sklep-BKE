# MIGRATION_MAP — Kotecki → DogStore (źródło prawdy dla przemianowań)

Reguła: **zero śladów po Koteckim**, ale nazwy mają **mieć sens pod DogStore**, nie być
mechaniczną kalką. Schemat bazy jest neutralny — większość tabel/kolumn zostaje bez zmian
(nie niosą marki). Zmieniamy: marki, domenę, seedy, wartości enumowe kocie, kody, stringi,
i **dokładamy rozdział dwóch sklepów**.

## 1. Nazwy projektów / paczek
> KOREKTA ARCHITEKTURY (właściciel): jedna aplikacja, jedna baza. Nie ma osobnej paczki
> backendu ani osobnej paczki panelu — backend to `app/api/**`, panel to trasy `/panel`
> w tej samej aplikacji `dogstore`. Poniższe „nowe" nazwy backend/panel są więc historyczne.

| Stare | Nowe |
|---|---|
| `pankotecki` (front package.json) | `dogstore` (cała aplikacja) |
| `pan-kotecki-backend` (osobny serwer) | skonsolidowane w `app/api/**` (brak osobnej paczki) |
| `panel-mobile` (osobna aplikacja Vite) | skonsolidowane w `app/panel/**` (brak osobnej paczki) |
| health `service: "pan-kotecki-backend"` | `GET /api/health` → `service: "dogstore"` |

## 2. Domena / marka / e-mail
| Stare | Nowe |
|---|---|
| `pankotecki.pl` | `dogstore.pl` |
| `biuro@pankotecki.pl` (FROM/OWNER) | `sklep@dogstore.pl` (sklep), `pro@dogstore.pl` (Pro), `kontakt@dogstore.pl` (notify) |
| „Pan Kotecki" (nazwa marki w mailach/Stripe) | „Dog Store" / „Dog Store Pro" |
| stopka „sklep dla kotów i ich ludzi" | „sprzęt dla psów pracujących i ich przewodników" |
| Stripe submit „…pod czujnym okiem kota 🐾" | „Kompletujemy Twoje zamówienie 🐾" (neutralne, psie) |
| `avatar_pan_kotecki.svg` | usuwamy (DogStore ma własne logo `public/brand/ds-*`) |
| Render host `pan-kotecki-sklep.onrender.com` | `dogstore-backend.onrender.com` (do ustalenia przy deployu) |

## 3. Wartości danych / „kocie" enumy
| Stare | Nowe |
|---|---|
| dostawa `kotecki_personal` (1000 zł, żart) | **usuwamy** — DogStore ma paczkomat/kurier/odbiór; premium „osobista" nie pasuje |
| „Dostawa przez Pana Koteckiego" (label) | n/d (opcja usunięta) |
| kod newslettera `KOT10` | `DOG10` |
| adres odbioru „ul. Brzezińska 84, 95-020 Bedoń Wieś" | dane DogStore (patrz DANE-DO-UZUPELNIENIA.md — obecnie Kraków z lib/nav) |

## 4. Kategorie (seed) — NA DogStore
Kocie kategorie **wyrzucamy w całości**. DogStore ma dwa sklepy:

**DogStore (cywilny, `line='shop'`)** — kategorie odpowiadają obecnemu katalogowi obroży:
| slug | nazwa |
|---|---|
| `robocze` | Obroże robocze |
| `codzienne` | Obroże codzienne |
| `e-obroza` | Kompatybilne z e-obrożą |
| `lancuszkowe` | Łańcuszkowe / półzaciskowe |

**DogStore Pro (służbowy, `line='pro'`)** — kategorie = obecne `proCategory`:
| slug | nazwa |
|---|---|
| `patrol` | Patrol |
| `handle` | Z uchwytem |
| `e-collar` | Pod moduł |
| `training` | Szkolenie |
| `detection` | Praca węchowa |

## 5. Produkty (seed) — NA DogStore
- **Wyrzucamy 20 kocich produktów.** Seed = obecny katalog DogStore:
  26 obroży cywilnych (`line='shop'`) + 12 służbowych (`line='pro'`) z `lib/data/products.mock.ts`
  i `lib/data/pro.mock.ts`. Slugi/ceny/opisy/warianty już są po polsku i psie.
- Zestawy/konfigurator (`bundle_config`) w DogStore na starcie **nieużywane** (obroże mają
  rozmiary/kolory jako warianty, nie „zestawy pick/slots"). Zostawiamy mechanizm w schemacie
  i backendzie (działa, neutralny), ale seed go nie wypełnia. Wariant rozmiar/kolor mapujemy
  na model danych DogStore (patrz PLAN.md §Warianty).

## 6. Rozdział dwóch sklepów (NOWE — wymóg właściciela)
| Warstwa | Zmiana |
|---|---|
| DB `products` | + `line text not null default 'shop' check (line in ('shop','pro'))` |
| DB `products` | + `pro_category text` (nullable; dla `line='pro'`: patrol/handle/e-collar/training/detection) |
| DB `categories` | + `line text not null default 'shop'` (kategoria należy do jednego sklepu) |
| Backend katalog | `GET /api/products?sklep=shop|pro&kategoria=&szukaj=` (filtr po `line`) |
| Backend katalog | `GET /api/categories?sklep=shop|pro` |
| Panel Produkty | selektor „Sklep: DogStore / DogStore Pro" + kategoria zależna od sklepu |
| Storefront | trasy `/collections/*` i `/products/*` czytają `line='shop'`; `/pro/*` czyta `line='pro'` |

## 7. ENV — przemianowanie kluczy (wartości → DANE-DO-UZUPELNIENIA.md)
Nazwy kluczy są neutralne (Stripe/InPost/Supabase/VAPID/Resend/FB) — **zostają bez zmian**.
Zmieniamy tylko wartości domyślne/komentarze zawierające markę oraz:
| Stare (wartość/komentarz) | Nowe |
|---|---|
| `EMAIL_FROM="Pan Kotecki <biuro@pankotecki.pl>"` | `EMAIL_FROM="Dog Store <sklep@dogstore.pl>"` |
| `CONTACT_NOTIFY_EMAIL=biuro@pankotecki.pl` | `CONTACT_NOTIFY_EMAIL=kontakt@dogstore.pl` |
| `NEWSLETTER_WELCOME_CODE=KOT10` | `NEWSLETTER_WELCOME_CODE=DOG10` |
| `SITE_URL/CLIENT_ORIGIN` → pankotecki.pl | dogstore.pl |

## 8. Stringi UI / treści (front + maile + panel)
| Stare | Nowe |
|---|---|
| tytuły/meta „Pan Kotecki" | „Dog Store" / „Dog Store Pro" |
| „sklep dla kotów" | „sklep ze sprzętem dla psów" |
| kocie emoji/teksty | neutralne / psie (🐾 zostaje, jest gatunkowo-neutralne) |
| docs `SETUP.md`, `ARCHITECTURE.md` | przepisane na DogStore |

## 9. Bramka grep (Faza 6) — muszą dać 0 trafień (case-insensitive)
`kotecki`, `kotek`, `\bkot\b`, `\bcat\b`, `pankotecki`, `pan kotecki`, `mruczek`, `mysz-fela`,
`bedoń`, `brzezińska`, `KOT10`, `pankotecki.pl`, `zabawki|kubki|dla-wlasciciela` (jako kategorie),
+ każdy wiersz z tej mapy. Trafienia dozwolone tylko w: `MIGRATION_*.md`, `INVENTORY.md`,
`DANE-DO-UZUPELNIENIA.md`, `PROGRESS.md` (dokumentacja migracji) — i te są logowane.
