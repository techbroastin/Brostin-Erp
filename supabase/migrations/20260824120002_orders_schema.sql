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
  discount          numeric(10,2) not null default 0 check (discount >= 0),
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
    check (order_type <> 'delivery' or address_id is not null)
);

create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_branch_id on public.orders(branch_id);
create index if not exists idx_orders_created_at on public.orders(created_at);

create or replace trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  product_id     uuid not null references public.products(id),
  product_name   text not null,                 -- snapshot at order time
  unit_price     numeric(10,2) not null check (unit_price >= 0),  -- snapshot at order time
  quantity       integer not null check (quantity > 0),
  line_total     numeric(10,2) not null check (line_total >= 0),
  created_at     timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);

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
