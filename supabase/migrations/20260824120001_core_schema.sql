-- ============================================================================
-- Broastin App 1 — Core Schema
-- Customer Ordering PWA: restaurants, branches, menu, customers, addresses.
--
-- SAFETY: every statement is written to be re-runnable without data loss.
-- No DROP, no TRUNCATE, no destructive ALTER. Safe to apply to an empty
-- project or re-apply after a partial failure.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Reusable "touch updated_at" trigger function
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- restaurants
-- ---------------------------------------------------------------------------
create table if not exists public.restaurants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  tagline     text,
  logo_url    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace trigger trg_restaurants_updated_at
before update on public.restaurants
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- branches (multi-branch ready; Broastin currently operates one)
-- ---------------------------------------------------------------------------
create table if not exists public.branches (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  name           text not null,
  branch_code    text,                       -- reserved for future order-number prefixing (e.g. VEM)
  address        text,
  phone          text,
  latitude       numeric(9,6),
  longitude      numeric(9,6),
  is_active      boolean not null default true,
  opening_hours  jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_branches_restaurant_id on public.branches(restaurant_id);

create or replace trigger trg_branches_updated_at
before update on public.branches
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- menu_categories
-- ---------------------------------------------------------------------------
create table if not exists public.menu_categories (
  id             uuid primary key default gen_random_uuid(),
  branch_id      uuid references public.branches(id) on delete cascade,
  name           text not null,
  display_order  integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_menu_categories_branch_id on public.menu_categories(branch_id);

create or replace trigger trg_menu_categories_updated_at
before update on public.menu_categories
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid not null references public.menu_categories(id) on delete cascade,
  name           text not null,
  description    text,
  price          numeric(10,2) not null check (price >= 0),
  image_url      text,
  is_available   boolean not null default true,
  display_order  integer not null default 0,
  is_demo        boolean not null default false,   -- true for seed/demo menu items only
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_products_category_id on public.products(category_id);

create or replace trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- customers
--
-- auth_user_id links this CRM record to a Supabase Auth identity. In App 1
-- MVP this is populated by anonymous sign-in (no credentials collected).
-- When phone OTP auth is introduced later, Supabase's anonymous → permanent
-- identity linking keeps this same auth.uid() in place, so no data migration
-- is required. Phone number alone is never sufficient to read this table —
-- see the RLS migration for the enforcement.
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id             uuid primary key default gen_random_uuid(),
  auth_user_id   uuid unique references auth.users(id) on delete set null,
  phone          text not null unique check (phone ~ '^\+91[6-9][0-9]{9}$'),
  name           text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_customers_auth_user_id on public.customers(auth_user_id);

create or replace trigger trg_customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- customer_addresses
-- ---------------------------------------------------------------------------
create table if not exists public.customer_addresses (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null references public.customers(id) on delete cascade,
  label            text not null default 'Home' check (label in ('Home', 'Work', 'Other')),
  house_building   text not null,
  street           text,
  area             text,
  landmark         text,
  pincode          text not null check (pincode ~ '^[0-9]{6}$'),
  latitude         numeric(9,6),
  longitude        numeric(9,6),
  delivery_notes   text,
  is_default       boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_customer_addresses_customer_id on public.customer_addresses(customer_id);

create or replace trigger trg_customer_addresses_updated_at
before update on public.customer_addresses
for each row execute function public.set_updated_at();
