-- ============================================================================
-- Broastin App 1 — Row Level Security
--
-- Principle: customer identification (finding/creating a customer by phone)
-- is separate from authorization (who can read that customer's data).
-- Every customer/address/order policy is keyed off auth_user_id = auth.uid(),
-- never off phone number. See identify_or_create_customer() in the next
-- migration for how phone lookups are handled without leaking data across
-- sessions/devices.
--
-- SAFETY: idempotent (DROP POLICY IF EXISTS + CREATE POLICY). Enabling RLS
-- on a table that already has it enabled is a safe no-op. No data is
-- touched.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- restaurants — public read (branding/info is not sensitive)
-- ---------------------------------------------------------------------------
alter table public.restaurants enable row level security;

drop policy if exists "restaurants_public_read" on public.restaurants;
create policy "restaurants_public_read"
  on public.restaurants for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- branches — public read of active branches only
-- ---------------------------------------------------------------------------
alter table public.branches enable row level security;

drop policy if exists "branches_public_read_active" on public.branches;
create policy "branches_public_read_active"
  on public.branches for select
  to anon, authenticated
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- menu_categories — public read of active categories only
-- ---------------------------------------------------------------------------
alter table public.menu_categories enable row level security;

drop policy if exists "menu_categories_public_read_active" on public.menu_categories;
create policy "menu_categories_public_read_active"
  on public.menu_categories for select
  to anon, authenticated
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- products — public read of available products only
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;

drop policy if exists "products_public_read_available" on public.products;
create policy "products_public_read_available"
  on public.products for select
  to anon, authenticated
  using (is_available = true);

-- ---------------------------------------------------------------------------
-- customers — a session may only ever see/update its OWN customer row.
-- No INSERT policy: rows are only ever created via the SECURITY DEFINER
-- identify_or_create_customer() function, never by a direct client insert.
-- ---------------------------------------------------------------------------
alter table public.customers enable row level security;

drop policy if exists "customers_select_own" on public.customers;
create policy "customers_select_own"
  on public.customers for select
  to authenticated
  using (auth_user_id = auth.uid());

drop policy if exists "customers_update_own" on public.customers;
create policy "customers_update_own"
  on public.customers for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- customer_addresses — full CRUD, but only for addresses belonging to a
-- customer owned by the current session.
-- ---------------------------------------------------------------------------
alter table public.customer_addresses enable row level security;

drop policy if exists "customer_addresses_all_own" on public.customer_addresses;
create policy "customer_addresses_all_own"
  on public.customer_addresses for all
  to authenticated
  using (
    exists (
      select 1 from public.customers c
      where c.id = customer_addresses.customer_id
        and c.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.customers c
      where c.id = customer_addresses.customer_id
        and c.auth_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- orders — a session may read its own orders and create new ones for
-- itself. No UPDATE policy for customers: order/payment status transitions
-- are owned by future Operations OS / staff tooling, not the customer app.
-- ---------------------------------------------------------------------------
alter table public.orders enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using (
    exists (
      select 1 from public.customers c
      where c.id = orders.customer_id
        and c.auth_user_id = auth.uid()
    )
  );

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
  on public.orders for insert
  to authenticated
  with check (
    exists (
      select 1 from public.customers c
      where c.id = orders.customer_id
        and c.auth_user_id = auth.uid()
    )
    and order_status = 'placed'
    and payment_status = 'pending'
  );

-- ---------------------------------------------------------------------------
-- order_items — readable/insertable only via an order the session owns.
-- ---------------------------------------------------------------------------
alter table public.order_items enable row level security;

drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      join public.customers c on c.id = o.customer_id
      where o.id = order_items.order_id
        and c.auth_user_id = auth.uid()
    )
  );

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own"
  on public.order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders o
      join public.customers c on c.id = o.customer_id
      where o.id = order_items.order_id
        and c.auth_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- order_number_sequences — RLS enabled, deliberately zero client policies.
-- Only touched by generate_order_number() (SECURITY DEFINER, owned by the
-- migration role, which bypasses RLS as the table owner). No anon/
-- authenticated access of any kind.
-- ---------------------------------------------------------------------------
alter table public.order_number_sequences enable row level security;
