-- ============================================================================
-- Broastin App 1 — Minimal QA test dataset
--
-- Exactly 7 rows, 1 per table, INSERT-only. No schema, RLS, constraint,
-- trigger, or function is created/altered/dropped anywhere in this file,
-- and no existing row is read, referenced, or modified — every insert here
-- creates a brand-new row with no foreign key pointing at anything
-- pre-existing.
--
-- Purpose: restaurants/branches/menu_categories/products/product_variants/
-- restaurant_tables/delivery_pricing_rules were completely empty in this
-- project, which made real end-to-end order-placement testing impossible
-- (nothing to browse, nothing to add to a cart). This unblocks that,
-- nothing else. products.is_demo is set true on the one product row —
-- the exact flag this schema already reserves for seed/demo items (see
-- 20260824120001_core_schema.sql's own comment on that column). Every
-- name/label is prefixed "TEST" so these rows can never be mistaken for
-- real business data.
--
-- Not intended to be deleted automatically — left in place per explicit
-- instruction, pending manual review.
-- ============================================================================

with r as (
  insert into public.restaurants (name, tagline)
  values ('TEST Broastin Restaurant', 'TEST DATA — QA verification only, not a real restaurant')
  returning id
),
b as (
  insert into public.branches (restaurant_id, name, branch_code, address, latitude, longitude, is_active)
  select id, 'TEST Branch - QA Only', 'TEST', 'TEST ADDRESS - 123 Test Street, Chennai', 13.0827, 80.2707, true
  from r
  returning id, restaurant_id
),
c as (
  insert into public.menu_categories (branch_id, name, display_order, is_active)
  select id, 'TEST Category', 0, true from b
  returning id, branch_id
),
p as (
  insert into public.products (category_id, name, description, price, is_available, display_order, is_demo)
  select id, 'TEST Product - Sample Item', 'TEST DATA — QA verification only', 199.00, true, 0, true from c
  returning id
),
v as (
  insert into public.product_variants (product_id, name, price, is_default, display_order, is_available)
  select id, 'TEST Variant - Regular', 199.00, true, 0, true from p
  returning id, product_id
),
t as (
  insert into public.restaurant_tables (branch_id, table_number, is_active)
  select id, 'TEST-1', true from b
  returning id, branch_id, qr_token, table_number
),
dp as (
  insert into public.delivery_pricing_rules (branch_id, min_distance_km, max_distance_km, charge, is_active)
  select id, 0, null, 49.00, true from b
  returning id
)
select
  (select id from r)           as restaurant_id,
  (select id from b)           as branch_id,
  (select id from c)           as category_id,
  (select id from p)           as product_id,
  (select id from v)           as variant_id,
  (select id from t)           as table_id,
  (select qr_token from t)     as qr_token,
  (select table_number from t) as table_number,
  (select id from dp)          as pricing_rule_id;
