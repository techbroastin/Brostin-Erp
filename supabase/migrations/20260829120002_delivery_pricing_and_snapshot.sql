-- ============================================================================
-- Broastin App 1 — Delivery Pricing + Order Delivery Snapshot
--
-- Adds:
--   - delivery_pricing_rules: per-branch distance-banded delivery pricing,
--     backend-owned, zero client access (same shape as restaurant_tables
--     and order_number_sequences).
--   - calculate_delivery_charge(): a read-only preview function Flutter can
--     call at checkout to show the price before placing the order.
--   - set_delivery_charge(): a BEFORE INSERT trigger on orders that
--     re-derives delivery_charge server-side from delivery_pricing_rules —
--     closes the gap flagged in the compatibility report, where
--     delivery_charge was only checked >= 0 and otherwise fully
--     client-trusted.
--   - orders delivery snapshot columns (address text, lat/lng,
--     instructions, distance) — the same "server-verified snapshot at
--     order time" principle already applied to order_items' product_name/
--     unit_price, now applied to the delivery address.
--
-- ARCHITECTURE: Google Maps / any routing service supplies a distance. The
-- application submits that distance. PostgreSQL — not the client, not
-- Maps — determines the applicable pricing rule and the resulting charge.
-- recalculate_order_totals() (unchanged, from the original orders
-- migration) then folds that server-verified charge into subtotal/
-- grand_total exactly as it already does today.
--
-- SAFETY: fully additive. No existing constraint, function, trigger, or
-- policy is modified. No core.* object is referenced. No
-- t_tokens/t_results/t_snapshot object is referenced. No Auth/Storage
-- change. No data is seeded. No new extension is installed — overlap
-- prevention below is trigger-based rather than requiring btree_gist.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- delivery_pricing_rules
--
-- One row per distance band per branch. max_distance_km = null means "this
-- band has no upper bound" (the open-ended top tier). The absence of any
-- covering band for a given distance IS "delivery not offered that far" —
-- deliberately no separate max-radius column to keep in sync.
-- ---------------------------------------------------------------------------
create table if not exists public.delivery_pricing_rules (
  id                uuid primary key default gen_random_uuid(),
  branch_id         uuid not null references public.branches(id) on delete cascade,
  min_distance_km   numeric(5,2) not null check (min_distance_km >= 0),
  max_distance_km   numeric(5,2),
  charge            numeric(10,2) not null check (charge >= 0),
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint delivery_pricing_rules_branch_id_min_distance_km_key
    unique (branch_id, min_distance_km),
  constraint delivery_pricing_rules_max_gt_min
    check (max_distance_km is null or max_distance_km > min_distance_km)
);

create index if not exists idx_delivery_pricing_rules_branch_id
  on public.delivery_pricing_rules(branch_id);

create or replace trigger trg_delivery_pricing_rules_updated_at
before update on public.delivery_pricing_rules
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — enabled, deliberately zero client policies. Only reachable through
-- calculate_delivery_charge() below. Ops-managed (dashboard/service role),
-- same shape as restaurant_tables and order_number_sequences.
-- ---------------------------------------------------------------------------
alter table public.delivery_pricing_rules enable row level security;

-- ---------------------------------------------------------------------------
-- check_delivery_pricing_overlap(): prevents two active bands for the same
-- branch from covering the same distance. Implemented as a trigger rather
-- than an exclusion constraint so no new extension (btree_gist) is needed —
-- this project currently uses only pgcrypto, uuid-ossp, pg_stat_statements
-- and supabase_vault, none of which provide range-exclusion support.
--
-- Two [min, max] bands (max = null meaning unbounded) overlap unless one
-- definitely ends before the other starts. Only active bands are checked —
-- an inactive/historical row can safely coexist with whatever superseded it.
-- ---------------------------------------------------------------------------
create or replace function public.check_delivery_pricing_overlap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conflict record;
begin
  if new.is_active is not true then
    return new;
  end if;

  select id, min_distance_km, max_distance_km
  into v_conflict
  from public.delivery_pricing_rules
  where branch_id = new.branch_id
    and is_active = true
    and id <> new.id
    and not (max_distance_km is not null and max_distance_km < new.min_distance_km)
    and not (new.max_distance_km is not null and new.max_distance_km < min_distance_km)
  limit 1;

  if found then
    raise exception
      'Delivery pricing band [%, %) overlaps existing band [%, %) for branch %',
      new.min_distance_km, new.max_distance_km,
      v_conflict.min_distance_km, v_conflict.max_distance_km, new.branch_id;
  end if;

  return new;
end;
$$;

revoke all on function public.check_delivery_pricing_overlap() from public;
revoke execute on function public.check_delivery_pricing_overlap() from anon, authenticated;

create or replace trigger trg_check_delivery_pricing_overlap
before insert or update on public.delivery_pricing_rules
for each row execute function public.check_delivery_pricing_overlap();

-- ---------------------------------------------------------------------------
-- calculate_delivery_charge(): read-only lookup, safe to expose broadly.
-- Flutter calls this at checkout purely to preview a price — it is NOT
-- what sets orders.delivery_charge; see set_delivery_charge() below for
-- the server-enforced value.
-- ---------------------------------------------------------------------------
create or replace function public.calculate_delivery_charge(
  p_branch_id uuid,
  p_distance_km numeric
)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select charge
  from public.delivery_pricing_rules
  where branch_id = p_branch_id
    and is_active = true
    and p_distance_km >= min_distance_km
    and (max_distance_km is null or p_distance_km <= max_distance_km)
  order by min_distance_km
  limit 1;
$$;

revoke all on function public.calculate_delivery_charge(uuid, numeric) from public;
revoke execute on function public.calculate_delivery_charge(uuid, numeric) from anon, authenticated;
grant execute on function public.calculate_delivery_charge(uuid, numeric) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- orders — delivery snapshot columns. All nullable; populated only for
-- order_type = 'delivery'. Mirrors order_items' existing snapshot pattern:
-- customer_addresses can be edited or deleted after the order is placed,
-- so the order keeps its own copy of what mattered at the time, exactly
-- like product_name/unit_price already do for order_items.
-- ---------------------------------------------------------------------------
alter table public.orders
  add column delivery_address_snapshot jsonb,
  add column delivery_latitude numeric(9,6),
  add column delivery_longitude numeric(9,6),
  add column delivery_instructions text,
  add column delivery_distance_km numeric(6,2)
    check (delivery_distance_km is null or delivery_distance_km >= 0);

-- ---------------------------------------------------------------------------
-- Closes a gap the existing takeaway_has_no_delivery_charge constraint
-- doesn't cover: it only ever guarded 'takeaway'. Purely additive — that
-- existing constraint is untouched — this adds the same guarantee for the
-- new 'dining' order_type introduced in the previous migration.
-- ---------------------------------------------------------------------------
alter table public.orders
  add constraint dining_has_no_delivery_charge
    check (order_type <> 'dining' or delivery_charge = 0);

-- ---------------------------------------------------------------------------
-- set_delivery_charge(): BEFORE INSERT trigger on orders. For delivery
-- orders, overwrites whatever delivery_charge the client sent with the
-- value calculate_delivery_charge() derives from delivery_pricing_rules —
-- the same "never trust the client for a priced field" guarantee
-- set_order_item_snapshot() already provides for order_items. Non-delivery
-- orders are untouched (their delivery_charge is already governed by
-- takeaway_has_no_delivery_charge / dining_has_no_delivery_charge).
--
-- If no pricing rule covers the submitted distance, the insert is REJECTED
-- rather than silently falling back to the client-supplied value — a
-- silent fallback would reopen exactly the trust gap this trigger exists
-- to close.
--
-- recalculate_order_totals() (unchanged, defined in the original orders
-- migration) runs AFTER order_items are inserted and reads whatever is in
-- orders.delivery_charge at that point — which this trigger has already
-- guaranteed is correct before any order_items exist. No change to that
-- function is required.
-- ---------------------------------------------------------------------------
create or replace function public.set_delivery_charge()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_charge numeric(10,2);
begin
  if new.order_type = 'delivery' then
    v_charge := public.calculate_delivery_charge(new.branch_id, new.delivery_distance_km);

    if v_charge is null then
      raise exception
        'No active delivery pricing rule covers % km for branch %',
        new.delivery_distance_km, new.branch_id;
    end if;

    new.delivery_charge := v_charge;
  end if;

  return new;
end;
$$;

revoke all on function public.set_delivery_charge() from public;
revoke execute on function public.set_delivery_charge() from anon, authenticated;

create or replace trigger trg_set_delivery_charge
before insert on public.orders
for each row execute function public.set_delivery_charge();
