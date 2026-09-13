-- ============================================================================
-- Broastin App 1 — Owner Admin Foundation
--
-- STATUS: DRAFTED, NOT YET APPLIED to the remote project. This file exists
-- so the exact change can be reviewed before `supabase db push` runs — see
-- PHASE_12_ADMIN_FOUNDATION_REPORT.md, section C/G, for the required
-- confirmation step (rule 19, Database Change Gate).
--
-- Purpose: give future admin RLS policies a safe way to distinguish the
-- restaurant owner from anonymous customer sessions. The existing schema
-- (20260824120003_rls_policies.sql) has zero admin-facing policies —
-- orders/customers are readable only by their own owning session, and
-- restaurant_tables/delivery_pricing_rules have RLS enabled with no
-- policies at all (SECURITY DEFINER functions only). This migration adds
-- ONLY the identity primitive; it grants no new read/write access to any
-- business table. Admin CRUD policies (menu writes, order status updates,
-- table/delivery-rule writes, customer/order admin reads) are scoped
-- per-table in the phase that implements each mutation, once this is
-- reviewed and applied.
--
-- Does not touch core.*, public.t_tokens, public.t_results, or
-- public.t_snapshot. Does not modify or weaken any existing policy.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- app_admins — one row per owner account. Rows are provisioned manually
-- (Supabase Studio Auth > Users to create the account, then a one-off SQL
-- insert here with that user's id) — never by client insert. There is
-- deliberately no INSERT/UPDATE/DELETE policy for anon/authenticated.
-- ---------------------------------------------------------------------------
create table if not exists public.app_admins (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

drop policy if exists "app_admins_select_own" on public.app_admins;
create policy "app_admins_select_own"
  on public.app_admins for select
  to authenticated
  using (auth_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- is_app_admin() — SECURITY DEFINER helper so every future admin policy can
-- gate on `public.is_app_admin()` instead of repeating this EXISTS
-- subquery. False for anonymous sessions and any auth.uid() with no active
-- app_admins row.
-- ---------------------------------------------------------------------------
create or replace function public.is_app_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.app_admins
    where auth_user_id = auth.uid()
      and is_active = true
  );
$$;

revoke all on function public.is_app_admin() from public;
grant execute on function public.is_app_admin() to authenticated;
