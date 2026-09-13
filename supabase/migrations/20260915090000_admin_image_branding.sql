-- ============================================================================
-- Broastin App 1 — Admin Image & Branding Management (Phase 15)
--
-- Adds the project's first Storage bucket ("menu-media") for product photos
-- and the restaurant logo, plus admin-only write access to it and to
-- restaurants.logo_url. Purely additive: no existing bucket (none exist),
-- table, column, or policy is dropped or altered.
--
-- products.image_url and restaurants.logo_url already exist
-- (20260824120001_core_schema.sql) — no schema change needed for either.
-- restaurants already has a public SELECT policy; this migration adds its
-- first (and only) write policy, admin-gated.
--
-- Does not touch core.*, public.t_tokens, public.t_results,
-- public.t_snapshot, or any orders/customers/menu-table policy from prior
-- phases.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- menu-media bucket — public read (image bytes served via the public object
-- URL, which bypasses storage.objects RLS entirely for a public bucket,
-- exactly like the arbitrary external image URLs products.image_url already
-- accepts today). Admin-gated for all writes and for admin-side listing.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('menu-media', 'menu-media', true)
on conflict (id) do nothing;

drop policy if exists "menu_media_admin_select" on storage.objects;
create policy "menu_media_admin_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'menu-media' and public.is_app_admin());

drop policy if exists "menu_media_admin_insert" on storage.objects;
create policy "menu_media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'menu-media' and public.is_app_admin());

drop policy if exists "menu_media_admin_update" on storage.objects;
create policy "menu_media_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'menu-media' and public.is_app_admin())
  with check (bucket_id = 'menu-media' and public.is_app_admin());

drop policy if exists "menu_media_admin_delete" on storage.objects;
create policy "menu_media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'menu-media' and public.is_app_admin());

-- ---------------------------------------------------------------------------
-- restaurants — first write policy (admin-only). SELECT is already public
-- (restaurants_public_read, 20260824120003_rls_policies.sql) and unchanged.
-- No insert/delete policy — restaurant rows are never created/removed by
-- the app.
-- ---------------------------------------------------------------------------
drop policy if exists "restaurants_admin_update" on public.restaurants;
create policy "restaurants_admin_update"
  on public.restaurants for update
  to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());
