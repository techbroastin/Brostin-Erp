-- ============================================================================
-- Broastin App 1 — Dining / QR Ordering: restaurant_tables + order_type
--
-- Adds table-based (dine-in) ordering support:
--   - restaurant_tables: one row per physical table, keyed to a branch, with
--     an opaque QR token separate from its identity (rotatable without
--     touching table_id or any order that references it).
--   - resolve_dining_table(): the only sanctioned way to turn a scanned QR
--     token into a branch/table — RLS on restaurant_tables allows zero
--     direct client access, exactly like order_number_sequences today.
--   - orders.table_id + a widened order_type check constraint to add
--     'dining' alongside the existing 'takeaway'/'delivery' values.
--
-- SAFETY: additive only. The one exception is orders_order_type_check,
-- which must be dropped and recreated to add a new allowed value — this is
-- metadata-only (no table rewrite), and every existing row (all
-- takeaway/delivery) remains valid under the new constraint unchanged.
-- No core.* object is referenced. No t_tokens/t_results/t_snapshot object
-- is referenced. No Auth/Storage change. No data is seeded.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- restaurant_tables
--
-- qr_token is intentionally NOT the primary key and NOT derived from it —
-- a QR code is a physical artifact anyone can photograph, so the token must
-- be rotatable (a single UPDATE) without ever touching table_id, which
-- every dining order's foreign key depends on.
--
-- gen_random_uuid() is reused for qr_token (not just id) to avoid pulling in
-- a function from a non-public schema — it's the same generator already
-- used for every id column in this schema, with the same 122 bits of
-- randomness, more than sufficient for a token that can be rotated on
-- suspected compromise.
-- ---------------------------------------------------------------------------
create table if not exists public.restaurant_tables (
  id             uuid primary key default gen_random_uuid(),
  branch_id      uuid not null references public.branches(id) on delete cascade,
  table_number   text not null,
  qr_token       text not null default gen_random_uuid()::text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint restaurant_tables_qr_token_key unique (qr_token),
  constraint restaurant_tables_branch_id_table_number_key unique (branch_id, table_number)
);

create index if not exists idx_restaurant_tables_branch_id on public.restaurant_tables(branch_id);

create or replace trigger trg_restaurant_tables_updated_at
before update on public.restaurant_tables
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — enabled, deliberately zero client policies.
--
-- Same shape as public.order_number_sequences: no anon/authenticated grant
-- of any kind. The only read path is resolve_dining_table() below, which
-- cannot be used to enumerate tokens (it requires the exact token as input
-- and returns at most one row). Writes (creating/deactivating tables,
-- rotating tokens) are an Ops/dashboard operation, not a client capability,
-- by the same design as order_number_sequences' trigger-only access.
-- ---------------------------------------------------------------------------
alter table public.restaurant_tables enable row level security;

-- ---------------------------------------------------------------------------
-- resolve_dining_table(): the sole sanctioned QR-token lookup.
--
-- Returns at most one row for an exact, active token match. Does not
-- return qr_token itself, and cannot be used to list or enumerate tables —
-- there is no code path that returns more than one row or accepts a partial
-- token.
-- ---------------------------------------------------------------------------
create or replace function public.resolve_dining_table(p_qr_token text)
returns table (table_id uuid, branch_id uuid, table_number text)
language sql
stable
security definer
set search_path = public
as $$
  select rt.id, rt.branch_id, rt.table_number
  from public.restaurant_tables rt
  where rt.qr_token = p_qr_token
    and rt.is_active = true;
$$;

revoke all on function public.resolve_dining_table(text) from public;
revoke execute on function public.resolve_dining_table(text) from anon, authenticated;
grant execute on function public.resolve_dining_table(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- orders.table_id — links a dining order to its table. Nullable: only set
-- for order_type = 'dining'. No ON DELETE cascade from restaurant_tables,
-- matching how address_id already relates to customer_addresses — a table
-- referenced by historical orders cannot be deleted outright; retire it via
-- is_active = false instead.
-- ---------------------------------------------------------------------------
alter table public.orders
  add column table_id uuid references public.restaurant_tables(id);

create index if not exists idx_orders_table_id on public.orders(table_id);

-- ---------------------------------------------------------------------------
-- Widen order_type to add 'dining'. The only touch to previously-shipped
-- SQL in this migration set — unavoidable, since a CHECK constraint's
-- allowed-value list can't be extended in place.
-- ---------------------------------------------------------------------------
alter table public.orders
  drop constraint orders_order_type_check;

alter table public.orders
  add constraint orders_order_type_check
    check (order_type in ('takeaway', 'delivery', 'dining'));

-- ---------------------------------------------------------------------------
-- Keep table_id and order_type in lockstep, mirroring the existing
-- delivery_requires_address pattern exactly (two directional constraints,
-- not one bidirectional one, so a violation names precisely which rule
-- broke).
-- ---------------------------------------------------------------------------
alter table public.orders
  add constraint dining_requires_table
    check (order_type <> 'dining' or table_id is not null);

alter table public.orders
  add constraint non_dining_has_no_table
    check (order_type = 'dining' or table_id is null);
