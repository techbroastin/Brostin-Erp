-- ============================================================================
-- Broastin App 1 — Orders Schema
-- orders, order_items, and safe concurrent order-number generation.
--
-- SAFETY: idempotent/re-runnable. No DROP, no TRUNCATE, no destructive ALTER.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- order_number_sequences
-- One row per (branch, day). Incremented atomically via ON CONFLICT DO
-- UPDATE, which takes a row lock in Postgres — safe under concurrent orders,
-- no dependency on client-side counting.
-- ---------------------------------------------------------------------------
create table if not exists public.order_number_sequences (
  branch_id      uuid not null references public.branches(id) on delete cascade,
  sequence_date  date not null,
  last_number    integer not null default 0,
  primary key (branch_id, sequence_date)
);

-- ---------------------------------------------------------------------------
-- orders
--
-- order_number is customer/reception/kitchen-facing (format BR-YYYYMMDD-####,
-- see generate_order_number()); id (uuid) is the internal key used by every
-- foreign key and future service (Operations OS, POS, KDS, etc.).
--
-- unit_price/product_name in order_items are snapshotted at order time —
-- historical orders are never recalculated from current product data.
--
-- subtotal and grand_total are populated by the client at insert time as a
-- best-effort value for instant UI feedback, but they are NOT trusted: once
-- order_items exist, recalculate_order_totals() below recomputes both
-- server-side from the actual (server-priced) line items and overwrites
-- whatever the client sent. A client cannot under-report a total by
-- tampering with these columns directly.
--
-- discount is hard-locked to 0 for now (check constraint below) because no
-- coupon/discount system exists yet — see the MVP scope note. Removing that
-- constraint is a one-line future migration once a real discount engine is
-- designed; it is not something client input should be able to bypass in
-- the meantime.
--
-- delivery_charge integrity (i.e. that it matches a real delivery-fee rule
-- for the chosen address) is NOT yet validated here — there is no delivery
-- zone/fee table in App 1 MVP. This is a known, deliberately deferred gap;
-- see the security review notes for why it is left for Step 11.
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text unique,                 -- generated server-side, see trigger below
  customer_id       uuid not null references public.customers(id),
  branch_id         uuid not null references public.branches(id),
  address_id        uuid references public.customer_addresses(id),
  order_type        text not null check (order_type in ('takeaway', 'delivery')),
  order_source      text not null default 'qr' check (order_source in ('qr', 'web')),
  subtotal          numeric(10,2) not null check (subtotal >= 0),
  delivery_charge   numeric(10,2) not null default 0 check (delivery_charge >= 0),
  discount          numeric(10,2) not null default 0 check (discount = 0),
  grand_total       numeric(10,2) not null check (grand_total >= 0),
  payment_method    text not null check (payment_method in ('cash', 'upi')),
  payment_status    text not null default 'pending'
                       check (payment_status in ('pending', 'paid', 'failed', 'cancelled')),
  order_status      text not null default 'placed'
                       check (order_status in (
                         'placed', 'confirmed', 'preparing', 'ready',
                         'out_for_delivery', 'delivered', 'completed', 'cancelled'
                       )),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint delivery_requires_address
    check (order_type <> 'delivery' or address_id is not null),
  constraint takeaway_has_no_delivery_charge
    check (order_type <> 'takeaway' or delivery_charge = 0)
);

create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_branch_id on public.orders(branch_id);
create index if not exists idx_orders_created_at on public.orders(created_at);

create or replace trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- order_items
--
-- product_name, variant_name, unit_price and line_total are ALL written by
-- set_order_item_snapshot() below, not by the client. The client only ever
-- supplies product_id, variant_id (if any) and quantity — everything
-- price-related is looked up server-side at insert time so a tampered
-- client request (e.g. calling the REST API directly with a fabricated
-- unit_price) cannot under-price an item.
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  product_id     uuid not null references public.products(id),
  variant_id     uuid references public.product_variants(id),
  product_name   text not null,                 -- server-assigned snapshot at order time
  variant_name   text,                           -- server-assigned snapshot at order time
  unit_price     numeric(10,2) not null check (unit_price >= 0),  -- server-assigned snapshot
  quantity       integer not null check (quantity > 0),
  line_total     numeric(10,2) not null check (line_total >= 0),  -- server-assigned (unit_price * quantity)
  created_at     timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_order_items_variant_id on public.order_items(variant_id);

-- ---------------------------------------------------------------------------
-- generate_order_number(): BEFORE INSERT trigger on orders.
--
-- Format: BR-YYYYMMDD-####  (e.g. BR-20260824-0001)
-- Future multi-branch numbering (e.g. BR-VEM-YYYYMMDD-####) only requires
-- changing this function's format string for new orders — existing
-- order_number values are static text and are never touched retroactively.
-- ---------------------------------------------------------------------------
create or replace function public.generate_order_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seq integer;
begin
  if new.order_number is not null then
    return new;
  end if;

  insert into public.order_number_sequences (branch_id, sequence_date, last_number)
  values (new.branch_id, current_date, 1)
  on conflict (branch_id, sequence_date)
  do update set last_number = public.order_number_sequences.last_number + 1
  returning last_number into v_seq;

  new.order_number := 'BR-' || to_char(current_date, 'YYYYMMDD') || '-' || lpad(v_seq::text, 4, '0');
  return new;
end;
$$;

create or replace trigger trg_generate_order_number
before insert on public.orders
for each row execute function public.generate_order_number();

revoke all on function public.generate_order_number() from public;

-- ---------------------------------------------------------------------------
-- set_order_item_snapshot(): BEFORE INSERT trigger on order_items.
--
-- Closes the client-side price-tampering gap: a client (or anyone calling
-- the REST API directly with the anon key, bypassing the Flutter UI
-- entirely) could otherwise submit any unit_price/product_name/line_total
-- it wants. This trigger discards whatever the client sent for those
-- columns and looks the real, current price up from products /
-- product_variants instead. It also rejects the item outright if the
-- product (or the specific variant) is not currently available, and
-- rejects a variant_id that does not actually belong to product_id.
--
-- This is what makes the earlier "unit_price is snapshotted at order time"
-- guarantee actually trustworthy, not just a naming convention.
-- ---------------------------------------------------------------------------
create or replace function public.set_order_item_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
begin
  select * into v_product from public.products where id = new.product_id;

  if v_product.id is null then
    raise exception 'Product % does not exist', new.product_id;
  end if;
  if not v_product.is_available then
    raise exception 'Product "%" is not currently available', v_product.name;
  end if;

  if new.variant_id is not null then
    select * into v_variant
    from public.product_variants
    where id = new.variant_id and product_id = new.product_id;

    if v_variant.id is null then
      raise exception 'Variant % does not belong to product %', new.variant_id, new.product_id;
    end if;
    if not v_variant.is_available then
      raise exception 'Variant "%" is not currently available', v_variant.name;
    end if;

    new.unit_price := v_variant.price;
    new.variant_name := v_variant.name;
  else
    new.unit_price := v_product.price;
    new.variant_name := null;
  end if;

  new.product_name := v_product.name;
  new.line_total := new.unit_price * new.quantity;

  return new;
end;
$$;

create or replace trigger trg_set_order_item_snapshot
before insert on public.order_items
for each row execute function public.set_order_item_snapshot();

revoke all on function public.set_order_item_snapshot() from public;

-- ---------------------------------------------------------------------------
-- recalculate_order_totals(): AFTER INSERT/UPDATE/DELETE trigger on
-- order_items.
--
-- Recomputes the parent order's subtotal and grand_total from the actual
-- (server-priced) order_items rows every time they change, and overwrites
-- whatever subtotal/grand_total the client originally sent when creating
-- the order. This, combined with set_order_item_snapshot() above, means
-- order totals are only ever derived from server-verified prices — never
-- from client-supplied numbers.
--
-- NOTE: delivery_charge itself is still client-supplied and not yet
-- validated against a real delivery-fee rule (no delivery zone/fee table
-- exists in App 1 MVP) — see the migration review notes on the orders
-- table above. This trigger correctly incorporates whatever delivery_charge
-- is on the order, but does not verify that charge is correct.
-- ---------------------------------------------------------------------------
create or replace function public.recalculate_order_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid := coalesce(new.order_id, old.order_id);
  v_subtotal numeric(10,2);
begin
  select coalesce(sum(line_total), 0) into v_subtotal
  from public.order_items
  where order_id = v_order_id;

  update public.orders
  set subtotal = v_subtotal,
      grand_total = v_subtotal + delivery_charge - discount
  where id = v_order_id;

  return null;
end;
$$;

create or replace trigger trg_recalculate_order_totals
after insert or update or delete on public.order_items
for each row execute function public.recalculate_order_totals();

revoke all on function public.recalculate_order_totals() from public;
