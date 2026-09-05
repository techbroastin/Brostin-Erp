-- ============================================================================
-- Broastin App 1 — Server-Authoritative Delivery Distance (Phase 6B)
--
-- Closes the trust gap flagged in the Phase 6 design: delivery_distance_km
-- was client-supplied and only sanity-checked (>= 0), so a manipulated
-- client could send an artificially small distance and buy a cheaper
-- delivery band. From this migration on, PostgreSQL computes the distance
-- itself from branches/customer_addresses coordinates — the client-supplied
-- delivery_distance_km value is never trusted for pricing.
--
-- Adds:
--   - haversine_km(): the same great-circle formula (R = 6371.0 km) as the
--     Flutter HaversineDistanceProvider (lib/services/distance_provider.dart),
--     reimplemented server-side so distance is authoritative regardless of
--     what the client sends.
--   - get_delivery_distance_km(): looks up branch + address coordinates,
--     verifies the address belongs to the given customer (when a customer
--     id is supplied), and returns the haversine distance — or null if any
--     required coordinate is missing or the address doesn't belong to that
--     customer.
--   - delivery_charge_for_distance(): the pricing-rule lookup extracted from
--     the old calculate_delivery_charge(), unchanged in behavior, now shared
--     by both the preview RPC and the insert trigger so they can never
--     disagree.
--   - calculate_delivery_charge(branch_id, address_id): REPLACES the old
--     (branch_id, distance_km) preview RPC. The old signature is dropped —
--     a distance number is no longer an accepted input from the client at
--     all, closing the loophole rather than just adding a parallel safe
--     path.
--   - set_delivery_charge(): now recomputes delivery_distance_km itself for
--     delivery orders (branches + customer_addresses via new.branch_id /
--     new.address_id) and overwrites new.delivery_distance_km before
--     deriving delivery_charge from it. Rejects the insert if required
--     coordinates are missing, exactly as before it rejected on "no pricing
--     rule covers this distance".
--
-- Preserved unchanged: delivery_pricing_rules, its overlap trigger, all
-- existing pricing bands, dining/takeaway constraints and behavior, RLS on
-- every table, every other trigger, the security model (security definer +
-- search_path pinning + revoke-from-public pattern already used throughout
-- this schema).
--
-- SAFETY: fully additive/replacing within this project's own objects only.
-- No core.* object referenced. No t_tokens/t_results/t_snapshot object
-- referenced. No RLS policy changed. No new extension. No data seeded.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- haversine_km(): pure math, no table access. Mirrors
-- HaversineDistanceProvider.distanceKm() in lib/services/distance_provider.dart
-- term for term (same R = 6371.0, same a/c formulation) so client-side
-- estimates and the server-authoritative value are computed identically.
-- Internal helper only — not meant to be called directly by Flutter.
-- ---------------------------------------------------------------------------
create or replace function public.haversine_km(
  p_lat1 numeric,
  p_lng1 numeric,
  p_lat2 numeric,
  p_lng2 numeric
)
returns numeric
language sql
immutable
as $$
  select (6371.0 * 2 * atan2(sqrt(a), sqrt(1 - a)))::numeric
  from (
    select
      sin(radians((p_lat2 - p_lat1)::double precision) / 2) ^ 2
      + cos(radians(p_lat1::double precision))
        * cos(radians(p_lat2::double precision))
        * sin(radians((p_lng2 - p_lng1)::double precision) / 2) ^ 2
      as a
  ) t;
$$;

revoke all on function public.haversine_km(numeric, numeric, numeric, numeric) from public;
revoke execute on function public.haversine_km(numeric, numeric, numeric, numeric) from anon, authenticated;

-- ---------------------------------------------------------------------------
-- get_delivery_distance_km(): the single place branch/address coordinates
-- are resolved into a distance. Returns null (never raises) so both callers
-- below can each decide how to react — the preview RPC treats null as "not
-- deliverable yet", the insert trigger treats null as a hard rejection.
--
-- p_customer_id, when supplied, must match the address's own customer_id —
-- this is the same ownership boundary customer_addresses' RLS policy
-- already enforces for direct table access; this function is
-- security definer (it must read branches, which has no anon/authenticated
-- select policy, and customer_addresses across the RLS boundary for the
-- preview call), so that boundary is re-asserted explicitly here rather
-- than relying on RLS it bypasses.
-- ---------------------------------------------------------------------------
create or replace function public.get_delivery_distance_km(
  p_branch_id uuid,
  p_address_id uuid,
  p_customer_id uuid default null
)
returns numeric
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_branch_lat numeric;
  v_branch_lng numeric;
  v_addr_lat numeric;
  v_addr_lng numeric;
  v_addr_customer_id uuid;
begin
  select latitude, longitude
  into v_branch_lat, v_branch_lng
  from public.branches
  where id = p_branch_id;

  select latitude, longitude, customer_id
  into v_addr_lat, v_addr_lng, v_addr_customer_id
  from public.customer_addresses
  where id = p_address_id;

  if v_addr_customer_id is null then
    return null; -- address not found
  end if;

  if p_customer_id is not null and v_addr_customer_id <> p_customer_id then
    return null; -- address does not belong to this customer
  end if;

  if v_branch_lat is null or v_branch_lng is null
     or v_addr_lat is null or v_addr_lng is null then
    return null; -- required coordinates missing
  end if;

  return public.haversine_km(v_branch_lat, v_branch_lng, v_addr_lat, v_addr_lng);
end;
$$;

revoke all on function public.get_delivery_distance_km(uuid, uuid, uuid) from public;
revoke execute on function public.get_delivery_distance_km(uuid, uuid, uuid) from anon, authenticated;

-- ---------------------------------------------------------------------------
-- delivery_charge_for_distance(): the pricing-rule lookup from the original
-- calculate_delivery_charge(branch_id, distance_km), extracted unchanged so
-- the preview RPC and the insert trigger share one implementation and can
-- never disagree on how a given distance prices out.
-- ---------------------------------------------------------------------------
create or replace function public.delivery_charge_for_distance(
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

revoke all on function public.delivery_charge_for_distance(uuid, numeric) from public;
revoke execute on function public.delivery_charge_for_distance(uuid, numeric) from anon, authenticated;

-- ---------------------------------------------------------------------------
-- calculate_delivery_charge(): REPLACES the (branch_id, distance_km)
-- preview RPC. Distance is no longer an input the client can supply at
-- all — the only inputs are branch_id and address_id, exactly the same
-- authoritative inputs set_delivery_charge() uses below, so preview and
-- final charge are guaranteed to agree.
--
-- Resolves the caller's own customer id from auth.uid() (same pattern as
-- identify_or_create_customer()) so the ownership check inside
-- get_delivery_distance_km() applies here too — an authenticated session
-- can only preview pricing for its own saved addresses.
--
-- Returns one row; distance_km/charge are both null when delivery isn't
-- computable (missing coordinates, address not found/not owned), and
-- charge alone is null when the distance is computable but no active
-- pricing band covers it.
-- ---------------------------------------------------------------------------
drop function if exists public.calculate_delivery_charge(uuid, numeric);

create or replace function public.calculate_delivery_charge(
  p_branch_id uuid,
  p_address_id uuid
)
returns table (distance_km numeric, charge numeric)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_distance numeric;
  v_charge numeric;
begin
  select id into v_customer_id
  from public.customers
  where auth_user_id = auth.uid();

  v_distance := public.get_delivery_distance_km(p_branch_id, p_address_id, v_customer_id);

  if v_distance is null then
    return query select null::numeric, null::numeric;
    return;
  end if;

  v_charge := public.delivery_charge_for_distance(p_branch_id, v_distance);

  return query select v_distance, v_charge;
end;
$$;

revoke all on function public.calculate_delivery_charge(uuid, uuid) from public;
revoke execute on function public.calculate_delivery_charge(uuid, uuid) from anon, authenticated;
grant execute on function public.calculate_delivery_charge(uuid, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- set_delivery_charge(): now recomputes the distance itself instead of
-- trusting new.delivery_distance_km. new.customer_id is the order's own
-- (already-established) customer, so the ownership check inside
-- get_delivery_distance_km() confirms the address on the order actually
-- belongs to the customer placing it. Whatever distance the client sent in
-- new.delivery_distance_km is fully discarded and overwritten.
-- ---------------------------------------------------------------------------
create or replace function public.set_delivery_charge()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_distance numeric;
  v_charge numeric(10,2);
begin
  if new.order_type = 'delivery' then
    v_distance := public.get_delivery_distance_km(new.branch_id, new.address_id, new.customer_id);

    if v_distance is null then
      raise exception
        'Delivery distance could not be determined for branch % / address % — missing coordinates or the address does not belong to this customer',
        new.branch_id, new.address_id;
    end if;

    new.delivery_distance_km := v_distance;

    v_charge := public.delivery_charge_for_distance(new.branch_id, v_distance);

    if v_charge is null then
      raise exception
        'No active delivery pricing rule covers % km for branch %',
        v_distance, new.branch_id;
    end if;

    new.delivery_charge := v_charge;
  end if;

  return new;
end;
$$;

revoke all on function public.set_delivery_charge() from public;
revoke execute on function public.set_delivery_charge() from anon, authenticated;

-- trigger definition (trg_set_delivery_charge) is unchanged — still
-- BEFORE INSERT on public.orders, still executes public.set_delivery_charge().
