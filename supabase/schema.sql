-- =============================================================
-- DOG STORE — schemat bazy (Supabase / Postgres). JEDEN plik.
-- Wklej całość do Supabase SQL Editor i kliknij RUN. Idempotentne
-- (if not exists / create or replace / on conflict) — można puścić ponownie.
-- Po nim uruchom seed.sql (katalog: obroże DogStore + Dog Store Pro).
--
-- Model danych przeniesiony z działającego sklepu (parytet funkcji) i podniesiony
-- pod DogStore: DWA SKLEPY (line: shop=DogStore, pro=Dog Store Pro) + WARIANTY
-- (rozmiar/kolor per produkt, własny stan magazynowy i SKU wariantu).
-- Backend (route handlery Next, service_role) omija RLS i robi zapisy.
-- =============================================================

create extension if not exists "pgcrypto";
create extension if not exists pg_trgm;

-- helper: automatyczny updated_at
create or replace function set_updated_at() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin new.updated_at = now(); return new; end;
$$;

-- ── Kategorie (należą do jednego sklepu) ─────────────────────
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  tagline     text,
  line        text not null default 'shop',   -- 'shop' (DogStore) | 'pro' (Dog Store Pro)
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
alter table categories add column if not exists line text not null default 'shop';
do $$ begin alter table categories add constraint categories_line_chk check (line in ('shop','pro')); exception when duplicate_object then null; end $$;

-- ── Produkty (model; jednostka kupna to wariant) ─────────────
create table if not exists products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  name                text not null,
  category_id         uuid references categories(id) on delete set null,
  line                text not null default 'shop',   -- shop | pro
  pro_category        text,                            -- dla line='pro': patrol|handle|e-collar|training|detection
  price_grosze        int not null default 0,          -- cena „od" (najtańszy wariant) do wyświetlania
  sale_price_grosze   int,
  currency            text not null default 'PLN',
  tagline             text,
  short_description   text,
  description         text,
  details             text[] not null default '{}',
  highlights          text[] not null default '{}',
  badges              text[] not null default '{}',
  colors              jsonb not null default '[]',     -- [{name,hex}] — kolory to swatch, nie osobny stan
  width               text,                            -- np. „4,5 cm" (cecha modelu)
  collar_type         text,                            -- nylon | chain (rodzaj)
  id_panel_compatible boolean not null default false,
  pro_standard        text,                            -- oznaczenie normy w sekcji Pro
  bestseller          boolean not null default false,
  bestseller_rank     int,
  in_stock            boolean not null default true,
  stock_qty           int,                             -- używane, gdy produkt nie ma wariantów
  active              boolean not null default true,
  sort_order          int not null default 0,
  bundle_config       jsonb,                           -- konfigurator zestawów (neutralny, na przyszłość)
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
-- kolumny dokładane dla istniejących baz:
alter table products add column if not exists line text not null default 'shop';
alter table products add column if not exists pro_category text;
alter table products add column if not exists tagline text;
alter table products add column if not exists highlights text[] not null default '{}';
alter table products add column if not exists colors jsonb not null default '[]';
alter table products add column if not exists width text;
alter table products add column if not exists collar_type text;
alter table products add column if not exists id_panel_compatible boolean not null default false;
alter table products add column if not exists pro_standard text;
alter table products add column if not exists bestseller_rank int;
alter table products add column if not exists bundle_config jsonb;
do $$ begin alter table products add constraint products_line_chk check (line in ('shop','pro')); exception when duplicate_object then null; end $$;
create index if not exists products_category_idx on products (category_id);
create index if not exists products_active_idx on products (active);
create index if not exists products_line_idx on products (line);
create index if not exists products_name_trgm on products using gin (name gin_trgm_ops);
create index if not exists products_desc_trgm on products using gin (short_description gin_trgm_ops);
drop trigger if exists products_set_updated on products;
create trigger products_set_updated before update on products
  for each row execute function set_updated_at();

-- ── Warianty produktu (rozmiar → własny stan i SKU) ──────────
create table if not exists product_variants (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products(id) on delete cascade,
  size         text,                             -- S | M | L (albo NULL dla produktu bez rozmiarów)
  sku          text unique not null,
  price_grosze int not null default 0,
  stock_qty    int,                              -- NULL = brak limitu
  in_stock     boolean not null default true,
  neck         text,                             -- obwód szyi, np. „38-46 cm"
  weight_grams int,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists product_variants_product_idx on product_variants (product_id);

-- ── Zdjęcia produktów (pliki w Supabase Storage) ─────────────
create table if not exists product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products(id) on delete cascade,
  url          text not null,
  storage_path text,
  alt          text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists product_images_product_idx on product_images (product_id);

-- ── Promocje (kody rabatowe) ─────────────────────────────────
create table if not exists promotions (
  id               uuid primary key default gen_random_uuid(),
  code             text unique not null,
  name             text,
  kind             text not null default 'percent',   -- 'percent' | 'fixed'
  value            int not null default 0,             -- procent (0-100) lub grosze
  min_order_grosze int not null default 0,
  active           boolean not null default true,
  starts_at        timestamptz,
  ends_at          timestamptz,
  usage_limit      int,
  used_count       int not null default 0,
  created_at       timestamptz not null default now()
);

-- ── Klienci ──────────────────────────────────────────────────
create table if not exists customers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  name       text,
  phone      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists customers_email_idx on customers (lower(email));
create index if not exists customers_email_plain_idx on customers (email);
drop trigger if exists customers_set_updated on customers;
create trigger customers_set_updated before update on customers
  for each row execute function set_updated_at();

-- ── Zamówienia ───────────────────────────────────────────────
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  number           text unique not null,
  customer_id      uuid references customers(id) on delete set null,
  user_id          uuid references auth.users(id) on delete set null,   -- konto (gość = NULL)
  email            text not null,
  phone            text,
  line             text not null default 'shop',   -- z którego sklepu zamówienie (shop|pro)
  status           text not null default 'pending',
  payment_status   text not null default 'unpaid',
  payment_provider text,
  payment_ref      text,
  subtotal_grosze  int not null default 0,
  discount_grosze  int not null default 0,
  shipping_grosze  int not null default 0,
  total_grosze     int not null default 0,
  currency         text not null default 'PLN',
  promo_code       text,
  shipping_method  text,                            -- inpost_locker | inpost_courier | pickup
  shipping_address jsonb,
  parcel_locker    text,
  tracking_number  text,
  label_url        text,
  shipping_ref     text,
  shipments        jsonb not null default '[]',
  meta_tracking    jsonb,
  review_token     uuid not null default gen_random_uuid(),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table orders add column if not exists line text not null default 'shop';
alter table orders add column if not exists shipping_ref text;
alter table orders add column if not exists shipments jsonb not null default '[]';
alter table orders add column if not exists meta_tracking jsonb;
alter table orders add column if not exists review_token uuid not null default gen_random_uuid();
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_created_idx on orders (created_at);
create index if not exists orders_customer_idx on orders (customer_id);
create index if not exists orders_user_idx on orders (user_id);
create index if not exists orders_email_lower_idx on orders (lower(email));
create index if not exists orders_email_plain_idx on orders (email);
create index if not exists orders_status_created_idx on orders (status, created_at desc);
create index if not exists orders_paid_created_idx on orders (created_at) where payment_status = 'paid';
create index if not exists orders_payment_ref_idx on orders (payment_ref);
create unique index if not exists orders_review_token_idx on orders (review_token);
do $$ begin alter table orders add constraint orders_status_chk check (status in ('pending','paid','packed','shipped','delivered','cancelled','failed','refunded')) not valid; exception when duplicate_object then null; end $$;
do $$ begin alter table orders add constraint orders_payment_status_chk check (payment_status in ('unpaid','paid','failed','refunded','review')) not valid; exception when duplicate_object then null; end $$;
do $$ begin alter table orders add constraint orders_currency_chk check (currency = 'PLN') not valid; exception when duplicate_object then null; end $$;
do $$ begin alter table orders add constraint orders_total_chk check (total_grosze = subtotal_grosze - discount_grosze + shipping_grosze) not valid; exception when duplicate_object then null; end $$;
do $$ begin alter table orders add constraint orders_amounts_nonneg check (subtotal_grosze >= 0 and discount_grosze >= 0 and shipping_grosze >= 0 and total_grosze >= 0); exception when duplicate_object then null; end $$;
drop trigger if exists orders_set_updated on orders;
create trigger orders_set_updated before update on orders
  for each row execute function set_updated_at();

-- ── Pozycje zamówienia ───────────────────────────────────────
create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  variant_id   uuid references product_variants(id) on delete set null,
  slug         text,
  name         text not null,
  variant_sku  text,
  price_grosze int not null,
  qty          int not null default 1,
  image_url    text,
  config       jsonb                              -- {size, color} (albo wybór zestawu)
);
alter table order_items add column if not exists variant_id uuid references product_variants(id) on delete set null;
alter table order_items add column if not exists variant_sku text;
alter table order_items add column if not exists config jsonb;
create index if not exists order_items_order_idx on order_items (order_id);
do $$ begin alter table order_items add constraint order_items_price_nonneg check (price_grosze >= 0); exception when duplicate_object then null; end $$;
do $$ begin alter table order_items add constraint order_items_qty_pos check (qty > 0); exception when duplicate_object then null; end $$;

-- ── Administratorzy (na przyszłość; na start panel chroni ADMIN_API_KEY) ──
create table if not exists admins (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  name          text,
  created_at    timestamptz not null default now()
);

-- ── Ustawienia (klucz → wartość JSON) ────────────────────────
create table if not exists settings (
  key        text primary key,
  value      jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
insert into settings (key, value) values
  ('store', '{"free_shipping_grosze": 29900, "currency": "PLN", "open": true}')
  on conflict (key) do nothing;

-- ── Idempotencja webhooków Stripe ────────────────────────────
create table if not exists stripe_events (
  id          text primary key,
  received_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
create index if not exists stripe_events_created_idx on stripe_events (created_at);

-- ── Subskrypcje push (panel) ─────────────────────────────────
create table if not exists push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  endpoint     text unique not null,
  subscription jsonb not null,
  created_at   timestamptz not null default now()
);

-- ── Konta klientów (passwordless, Supabase Auth) ─────────────
create table if not exists account_profiles (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  full_name             text,
  phone                 text,
  marketing_consent     boolean not null default false,
  marketing_consent_at  timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
alter table account_profiles add column if not exists marketing_consent_at timestamptz;
drop trigger if exists account_profiles_set_updated on account_profiles;
create trigger account_profiles_set_updated before update on account_profiles
  for each row execute function set_updated_at();

create table if not exists account_addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text,
  first_name  text,
  last_name   text,
  street      text,
  building    text,
  apartment   text,
  postal_code text,
  city        text,
  phone       text,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists account_addresses_user_idx on account_addresses (user_id);
drop trigger if exists account_addresses_set_updated on account_addresses;
create trigger account_addresses_set_updated before update on account_addresses
  for each row execute function set_updated_at();

-- ── Wiadomości z formularza kontaktowego ─────────────────────
create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  subject    text,
  message    text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on contact_messages (created_at desc);

-- ── Newsletter (double opt-in) ───────────────────────────────
create table if not exists newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  consent       boolean not null default true,
  consent_at    timestamptz not null default now(),
  source        text,
  confirmed     boolean not null default false,
  confirm_token text,
  unsub_token   text,
  created_at    timestamptz not null default now()
);
create unique index if not exists newsletter_email_uidx on newsletter_subscribers (lower(email));

-- ── Recenzje ─────────────────────────────────────────────────
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references products(id) on delete cascade,
  order_id    uuid references orders(id) on delete set null,
  author_name text,
  rating      int,
  content     text,
  status      text not null default 'published',
  verified    boolean not null default false,
  created_at  timestamptz not null default now()
);
do $$ begin alter table reviews add constraint reviews_rating_check check (rating between 1 and 5); exception when duplicate_object then null; end $$;
create unique index if not exists reviews_order_product_idx on reviews (order_id, product_id);
create index if not exists reviews_product_pub_idx on reviews (product_id) where status = 'published';

-- =============================================================
-- RLS / POLITYKI
-- Backend (service_role) omija RLS. Publicznie (anon) tylko ODCZYT katalogu.
-- =============================================================
alter table categories             enable row level security;
alter table products               enable row level security;
alter table product_variants       enable row level security;
alter table product_images         enable row level security;
alter table promotions             enable row level security;
alter table customers              enable row level security;
alter table orders                 enable row level security;
alter table order_items            enable row level security;
alter table admins                 enable row level security;
alter table settings               enable row level security;
alter table stripe_events          enable row level security;
alter table push_subscriptions     enable row level security;
alter table account_profiles       enable row level security;
alter table account_addresses      enable row level security;
alter table contact_messages       enable row level security;
alter table newsletter_subscribers enable row level security;
alter table reviews                enable row level security;

drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (true);

drop policy if exists "public read active products" on products;
create policy "public read active products" on products for select using (active = true);

drop policy if exists "public read variants of active" on product_variants;
create policy "public read variants of active" on product_variants for select using (
  exists (select 1 from products p where p.id = product_variants.product_id and p.active = true)
);

drop policy if exists "public read product images" on product_images;
create policy "public read product images" on product_images for select using (
  exists (select 1 from products p where p.id = product_images.product_id and p.active = true)
);

drop policy if exists "public read published reviews" on reviews;
create policy "public read published reviews" on reviews for select using (status = 'published');

-- konta: klient widzi/zmienia tylko swoje (obrona w głąb; backend i tak na service_role)
drop policy if exists "own profile select" on account_profiles;
create policy "own profile select" on account_profiles for select using (auth.uid() = user_id);
drop policy if exists "own profile insert" on account_profiles;
create policy "own profile insert" on account_profiles for insert with check (auth.uid() = user_id);
drop policy if exists "own profile update" on account_profiles;
create policy "own profile update" on account_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own profile delete" on account_profiles;
create policy "own profile delete" on account_profiles for delete using (auth.uid() = user_id);

drop policy if exists "own address select" on account_addresses;
create policy "own address select" on account_addresses for select using (auth.uid() = user_id);
drop policy if exists "own address insert" on account_addresses;
create policy "own address insert" on account_addresses for insert with check (auth.uid() = user_id);
drop policy if exists "own address update" on account_addresses;
create policy "own address update" on account_addresses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own address delete" on account_addresses;
create policy "own address delete" on account_addresses for delete using (auth.uid() = user_id);

grant select, insert, update, delete on account_profiles  to authenticated;
grant select, insert, update, delete on account_addresses to authenticated;

-- =============================================================
-- RPC (tylko service_role): atomowe składanie/zwolnienie/zwrot zamówienia.
-- Wariantowe: zdejmuje stan z product_variants (po variant_id), a gdy pozycja
-- nie ma wariantu — z products.stock_qty (zgodność z produktami bez rozmiarów).
-- =============================================================
create or replace function create_order(p jsonb)
returns jsonb
language plpgsql set search_path = public, pg_temp as $$
declare
  it       jsonb;
  v_qty    int;
  v_var    uuid;
  v_prod   uuid;
  v_order  uuid;
  v_number text := p->>'number';
  v_promo  uuid := nullif(p->>'promo_id', '')::uuid;
  v_rows   int;
begin
  for it in select * from jsonb_array_elements(p->'items')
  loop
    v_qty  := (it->>'qty')::int;
    v_var  := nullif(it->>'variant_id', '')::uuid;
    v_prod := nullif(it->>'product_id', '')::uuid;
    if v_var is not null then
      update product_variants
         set stock_qty = stock_qty - v_qty
       where id = v_var and (stock_qty is null or stock_qty >= v_qty);
    else
      update products
         set stock_qty = stock_qty - v_qty
       where id = v_prod and (stock_qty is null or stock_qty >= v_qty);
    end if;
    get diagnostics v_rows = row_count;
    if v_rows = 0 then
      raise exception 'OUT_OF_STOCK:%', (it->>'slug') using errcode = 'P0001';
    end if;
  end loop;

  if v_promo is not null then
    update promotions
       set used_count = used_count + 1
     where id = v_promo and active = true
       and (usage_limit is null or used_count < usage_limit);
    get diagnostics v_rows = row_count;
    if v_rows = 0 then
      raise exception 'PROMO_EXHAUSTED' using errcode = 'P0001';
    end if;
  end if;

  insert into orders (
    number, customer_id, user_id, email, phone, line, status, payment_status,
    subtotal_grosze, discount_grosze, shipping_grosze, total_grosze, currency,
    promo_code, shipping_method, shipping_address, parcel_locker
  ) values (
    v_number,
    nullif(p->>'customer_id', '')::uuid,
    nullif(p->>'user_id', '')::uuid,
    p->>'email',
    nullif(p->>'phone', ''),
    coalesce(nullif(p->>'line', ''), 'shop'),
    'pending', 'unpaid',
    (p->>'subtotal_grosze')::int,
    (p->>'discount_grosze')::int,
    (p->>'shipping_grosze')::int,
    (p->>'total_grosze')::int,
    coalesce(nullif(p->>'currency', ''), 'PLN'),
    nullif(p->>'promo_code', ''),
    p->>'shipping_method',
    case when jsonb_typeof(p->'shipping_address') = 'object' then p->'shipping_address' else null end,
    nullif(p->>'parcel_locker', '')
  )
  returning id into v_order;

  insert into order_items (order_id, product_id, variant_id, slug, name, variant_sku, price_grosze, qty, image_url, config)
  select
    v_order,
    nullif(elem->>'product_id','')::uuid,
    nullif(elem->>'variant_id','')::uuid,
    elem->>'slug',
    elem->>'name',
    nullif(elem->>'variant_sku',''),
    (elem->>'price_grosze')::int,
    (elem->>'qty')::int,
    nullif(elem->>'image_url', ''),
    case when jsonb_typeof(elem->'config') = 'object' then elem->'config' else null end
  from jsonb_array_elements(p->'items') as elem;

  return jsonb_build_object('order_id', v_order, 'number', v_number);
end;
$$;
revoke all on function create_order(jsonb) from public, anon, authenticated;
grant execute on function create_order(jsonb) to service_role;

-- Zwolnienie zamówienia (porzucona/odrzucona płatność): zwrot stanu + promocji.
create or replace function release_order(p_order uuid)
returns void
language plpgsql set search_path = public, pg_temp as $$
declare
  v_status text; v_payment text; v_promo text; it record;
begin
  select status, payment_status, promo_code into v_status, v_payment, v_promo
    from orders where id = p_order for update;
  if not found then return; end if;
  if v_payment = 'paid' or v_status in ('cancelled','refunded') then return; end if;

  for it in select product_id, variant_id, qty from order_items where order_id = p_order loop
    if it.variant_id is not null then
      update product_variants set stock_qty = stock_qty + it.qty where id = it.variant_id and stock_qty is not null;
    else
      update products set stock_qty = stock_qty + it.qty where id = it.product_id and stock_qty is not null;
    end if;
  end loop;
  if v_promo is not null then
    update promotions set used_count = greatest(used_count - 1, 0) where code = v_promo;
  end if;
  update orders set status = 'cancelled', payment_status = 'failed' where id = p_order;
end;
$$;
revoke all on function release_order(uuid) from public, anon, authenticated;
grant execute on function release_order(uuid) to service_role;

-- Zwrot/chargeback dla OPŁACONYCH → 'refunded'.
create or replace function refund_order(p_order uuid)
returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare it record; v_promo text; v_payment text;
begin
  select payment_status, promo_code into v_payment, v_promo from orders where id = p_order for update;
  if not found then return; end if;
  if v_payment = 'refunded' then return; end if;
  for it in select product_id, variant_id, qty from order_items where order_id = p_order loop
    if it.variant_id is not null then
      update product_variants set stock_qty = stock_qty + it.qty where id = it.variant_id and stock_qty is not null;
    else
      update products set stock_qty = stock_qty + it.qty where id = it.product_id and stock_qty is not null;
    end if;
  end loop;
  if v_promo is not null then
    update promotions set used_count = greatest(used_count - 1, 0) where code = v_promo;
  end if;
  update orders set status = 'refunded', payment_status = 'refunded' where id = p_order;
end;
$$;
revoke all on function refund_order(uuid) from public, anon, authenticated;
grant execute on function refund_order(uuid) to service_role;

-- RODO: atomowe usunięcie konta (profil + adresy + PII w customers; zamówienia zostają).
create or replace function delete_customer_account(p_user uuid, p_email text)
returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_user is not null then
    delete from account_addresses where user_id = p_user;
    delete from account_profiles  where user_id = p_user;
    update orders set user_id = null where user_id = p_user;
  end if;
  if p_email is not null and length(p_email) > 0 then
    delete from customers where lower(email) = lower(p_email);
  end if;
end;
$$;
revoke all on function delete_customer_account(uuid, text) from public, anon, authenticated;
grant execute on function delete_customer_account(uuid, text) to service_role;

-- Agregat statystyk kont (pod skalę).
create or replace function admin_account_stats()
returns table(user_id uuid, orders int, spent_grosze bigint)
language sql security definer set search_path = public, pg_temp as $$
  select user_id, count(*)::int,
         coalesce(sum(total_grosze) filter (where payment_status = 'paid'), 0)::bigint
  from orders where user_id is not null group by user_id
$$;
revoke all on function admin_account_stats() from public, anon, authenticated;
grant execute on function admin_account_stats() to service_role;

-- Niezmienniki kwot/ilości.
do $$ begin alter table products         add constraint products_price_nonneg   check (price_grosze >= 0); exception when duplicate_object then null; end $$;
do $$ begin alter table products         add constraint products_stock_nonneg   check (stock_qty is null or stock_qty >= 0); exception when duplicate_object then null; end $$;
do $$ begin alter table product_variants add constraint variants_price_nonneg   check (price_grosze >= 0); exception when duplicate_object then null; end $$;
do $$ begin alter table product_variants add constraint variants_stock_nonneg   check (stock_qty is null or stock_qty >= 0); exception when duplicate_object then null; end $$;
do $$ begin alter table promotions       add constraint promotions_kind_chk     check (kind in ('percent','fixed')) not valid; exception when duplicate_object then null; end $$;
do $$ begin alter table promotions       add constraint promotions_value_nonneg check (value >= 0); exception when duplicate_object then null; end $$;
