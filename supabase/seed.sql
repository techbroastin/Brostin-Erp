-- ============================================================================
-- Broastin App 1 — PROVISIONAL DEMO MENU DATA
--
-- This is NOT the final Broastin menu. It exists only so the ordering flow
-- has something real to render end-to-end during development. Every row
-- below is flagged is_demo = true (products) so it can be identified and
-- removed later by a future Admin/POS system without guesswork.
--
-- This file is intentionally separate from supabase/migrations/. Supabase's
-- `db push` only applies migrations — it never runs seed.sql automatically.
-- Seeding is applied deliberately (`supabase db reset` locally, or executed
-- by hand against the linked project), so real menu data entered later is
-- never silently overwritten by this file.
--
-- SAFETY: uses fixed UUIDs with `on conflict (id) do nothing`, so re-running
-- this file never duplicates rows or overwrites edits made after seeding.
-- ============================================================================

insert into public.restaurants (id, name, tagline, logo_url)
values (
  '11111111-1111-4111-8111-111111111111',
  'Broastin Fried Chicken',
  'Fresh • Crunchy • Juicy',
  null
)
on conflict (id) do nothing;

insert into public.branches (id, restaurant_id, name, address, phone, is_active)
values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'Broastin — Main Branch',
  'Demo address — to be replaced with the real outlet address',
  null,
  true
)
on conflict (id) do nothing;

insert into public.menu_categories (id, branch_id, name, display_order, is_active)
values
  ('33333333-3333-4333-8333-333333333331', '22222222-2222-4222-8222-222222222222', 'Broasted Chicken', 1, true),
  ('33333333-3333-4333-8333-333333333332', '22222222-2222-4222-8222-222222222222', 'Burgers',          2, true),
  ('33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'Wraps',            3, true),
  ('33333333-3333-4333-8333-333333333334', '22222222-2222-4222-8222-222222222222', 'Fries',            4, true),
  ('33333333-3333-4333-8333-333333333335', '22222222-2222-4222-8222-222222222222', 'Drinks',           5, true),
  ('33333333-3333-4333-8333-333333333336', '22222222-2222-4222-8222-222222222222', 'Combos',           6, true)
on conflict (id) do nothing;

insert into public.products
  (id, category_id, name, description, price, is_available, display_order, is_demo)
values
  -- Broasted Chicken
  ('44444444-0001-4444-8444-444444444444', '33333333-3333-4333-8333-333333333331',
   '2 Pc Broasted Chicken', 'Demo item — crispy broasted chicken, 2 pieces.', 149.00, true, 1, true),
  ('44444444-0002-4444-8444-444444444444', '33333333-3333-4333-8333-333333333331',
   '4 Pc Broasted Chicken', 'Demo item — crispy broasted chicken, 4 pieces.', 279.00, true, 2, true),

  -- Burgers
  ('44444444-0003-4444-8444-444444444444', '33333333-3333-4333-8333-333333333332',
   'Classic Chicken Burger', 'Demo item — crispy chicken fillet burger.', 129.00, true, 1, true),
  ('44444444-0004-4444-8444-444444444444', '33333333-3333-4333-8333-333333333332',
   'Spicy Zinger Burger', 'Demo item — spicy chicken fillet burger.', 149.00, true, 2, true),

  -- Wraps
  ('44444444-0005-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333',
   'Chicken Wrap', 'Demo item — grilled chicken wrap with veggies.', 119.00, true, 1, true),

  -- Fries
  ('44444444-0006-4444-8444-444444444444', '33333333-3333-4333-8333-333333333334',
   'Regular Fries', 'Demo item — salted crispy fries.', 79.00, true, 1, true),
  ('44444444-0007-4444-8444-444444444444', '33333333-3333-4333-8333-333333333334',
   'Peri Peri Fries', 'Demo item — fries tossed in peri peri seasoning.', 99.00, true, 2, true),

  -- Drinks
  ('44444444-0008-4444-8444-444444444444', '33333333-3333-4333-8333-333333333335',
   'Soft Drink (300ml)', 'Demo item — chilled soft drink.', 49.00, true, 1, true),

  -- Combos
  ('44444444-0009-4444-8444-444444444444', '33333333-3333-4333-8333-333333333336',
   '2 Pc Combo', 'Demo item — 2 pc broasted chicken + fries + drink.', 249.00, true, 1, true)
on conflict (id) do nothing;
