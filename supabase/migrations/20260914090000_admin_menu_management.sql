-- ============================================================================
-- Broastin App 1 — Admin Menu Management (Phase 14)
--
-- Adds:
--   1. products.is_featured — real backing column for the "Featured/popular"
--      admin toggle (the customer Menu screen's "Popular Picks" strip
--      previously faked this by showing the first category's products).
--   2. Admin read/write RLS policies for menu_categories/products/
--      product_variants, gated on public.is_app_admin() (see
--      20260913120000_owner_admin_foundation.sql).
--
-- Purely additive: no existing policy is dropped or altered, no destructive
-- ALTER, no data loss. The existing customer-facing SELECT policies
-- (menu_categories_public_read_active / products_public_read_available /
-- product_variants_public_read_available, all `to anon, authenticated`) are
-- untouched — Postgres OR's multiple permissive SELECT policies together,
-- so the new admin-only SELECT policies only ADD visibility for admins.
-- These three tables currently have zero INSERT/UPDATE/DELETE policies, so
-- all writes are denied to everyone today; the new write policies are a new
-- capability, not a relaxation of an existing one.
--
-- Does not touch core.*, public.t_tokens, public.t_results,
-- public.t_snapshot, or any orders/customers policy.
-- ============================================================================

alter table public.products
  add column if not exists is_featured boolean not null default false;

-- ---------------------------------------------------------------------------
-- menu_categories — admin read (all rows) + admin write
-- ---------------------------------------------------------------------------
drop policy if exists "menu_categories_admin_read_all" on public.menu_categories;
create policy "menu_categories_admin_read_all"
  on public.menu_categories for select
  to authenticated
  using (public.is_app_admin());

drop policy if exists "menu_categories_admin_insert" on public.menu_categories;
create policy "menu_categories_admin_insert"
  on public.menu_categories for insert
  to authenticated
  with check (public.is_app_admin());

drop policy if exists "menu_categories_admin_update" on public.menu_categories;
create policy "menu_categories_admin_update"
  on public.menu_categories for update
  to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

drop policy if exists "menu_categories_admin_delete" on public.menu_categories;
create policy "menu_categories_admin_delete"
  on public.menu_categories for delete
  to authenticated
  using (public.is_app_admin());

-- ---------------------------------------------------------------------------
-- products — admin read (all rows) + admin write
-- ---------------------------------------------------------------------------
drop policy if exists "products_admin_read_all" on public.products;
create policy "products_admin_read_all"
  on public.products for select
  to authenticated
  using (public.is_app_admin());

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
  on public.products for insert
  to authenticated
  with check (public.is_app_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update"
  on public.products for update
  to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
  on public.products for delete
  to authenticated
  using (public.is_app_admin());

-- ---------------------------------------------------------------------------
-- product_variants — admin read (all rows) + admin write
-- ---------------------------------------------------------------------------
drop policy if exists "product_variants_admin_read_all" on public.product_variants;
create policy "product_variants_admin_read_all"
  on public.product_variants for select
  to authenticated
  using (public.is_app_admin());

drop policy if exists "product_variants_admin_insert" on public.product_variants;
create policy "product_variants_admin_insert"
  on public.product_variants for insert
  to authenticated
  with check (public.is_app_admin());

drop policy if exists "product_variants_admin_update" on public.product_variants;
create policy "product_variants_admin_update"
  on public.product_variants for update
  to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

drop policy if exists "product_variants_admin_delete" on public.product_variants;
create policy "product_variants_admin_delete"
  on public.product_variants for delete
  to authenticated
  using (public.is_app_admin());
