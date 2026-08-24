-- ============================================================================
-- Broastin App 1 — PROVISIONAL APPROVED MENU (demo/seed data)
--
-- These are PROVISIONAL prices and seed data only — not final. Every
-- product below is flagged is_demo = true so a future Admin/POS system can
-- identify and replace it without guesswork.
--
-- Items with size/meal options (burgers, wraps, Alfaham) are modeled as one
-- product + multiple product_variants rows, not as separate flat products —
-- the app must never hard-code these prices; they are read from the
-- database via MenuRepository.
--
-- This file is intentionally separate from supabase/migrations/. Supabase's
-- `db push` only applies migrations — it never runs seed.sql automatically.
-- Seeding is applied deliberately, so real menu data entered later is never
-- silently overwritten by this file.
--
-- SAFETY: fixed UUIDs with `on conflict (id) do nothing` — re-running this
-- file never duplicates rows or overwrites edits made after seeding.
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

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
insert into public.menu_categories (id, branch_id, name, display_order, is_active)
values
  ('33333333-3333-4333-8333-333333333301', '22222222-2222-4222-8222-222222222222', 'Signature Broasted Chicken', 1, true),
  ('33333333-3333-4333-8333-333333333302', '22222222-2222-4222-8222-222222222222', 'Crispy Chicken Burgers',     2, true),
  ('33333333-3333-4333-8333-333333333303', '22222222-2222-4222-8222-222222222222', 'Crunchy Wraps & Twisters',   3, true),
  ('33333333-3333-4333-8333-333333333304', '22222222-2222-4222-8222-222222222222', 'Boneless Strips & Bites',    4, true),
  ('33333333-3333-4333-8333-333333333305', '22222222-2222-4222-8222-222222222222', 'Smoky Arabian Alfaham',      5, true),
  ('33333333-3333-4333-8333-333333333306', '22222222-2222-4222-8222-222222222222', 'Sharing Feasts & Buckets',   6, true),
  ('33333333-3333-4333-8333-333333333307', '22222222-2222-4222-8222-222222222222', 'Add-ons',                    7, true),
  ('33333333-3333-4333-8333-333333333308', '22222222-2222-4222-8222-222222222222', 'Beverages',                  8, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Products
-- For products with variants, price holds the base/"from" price shown on
-- the menu card before a variant is chosen; the variant's own price is what
-- is actually charged once selected (enforced server-side, see
-- set_order_item_snapshot() in the orders migration).
-- ---------------------------------------------------------------------------
insert into public.products (id, category_id, name, description, price, is_available, display_order, is_demo)
values
  -- Signature Broasted Chicken (flat pricing, no variants)
  ('44444444-4444-4444-8444-444444444401', '33333333-3333-4333-8333-333333333301', 'Single Piece Broast',     'Demo item.', 89.00,  true, 1, true),
  ('44444444-4444-4444-8444-444444444402', '33333333-3333-4333-8333-333333333301', 'Duo Crunch Box',          'Demo item.', 239.00, true, 2, true),
  ('44444444-4444-4444-8444-444444444403', '33333333-3333-4333-8333-333333333301', 'Broaster 4-Piece Box',    'Demo item.', 439.00, true, 3, true),

  -- Crispy Chicken Burgers (Solo/Meal variants)
  ('44444444-4444-4444-8444-444444444404', '33333333-3333-4333-8333-333333333302', 'The Big Broaster Burger',       'Demo item.', 149.00, true, 1, true),
  ('44444444-4444-4444-8444-444444444405', '33333333-3333-4333-8333-333333333302', 'Cheesy Broast Burger',          'Demo item.', 169.00, true, 2, true),
  ('44444444-4444-4444-8444-444444444406', '33333333-3333-4333-8333-333333333302', 'Monster Crunch Double Burger',  'Demo item.', 219.00, true, 3, true),

  -- Crunchy Wraps & Twisters (Solo/Meal variants)
  ('44444444-4444-4444-8444-444444444407', '33333333-3333-4333-8333-333333333303', 'Classic Crunch Wrap',    'Demo item.', 139.00, true, 1, true),
  ('44444444-4444-4444-8444-444444444408', '33333333-3333-4333-8333-333333333303', 'Cheesy Twister Wrap',    'Demo item.', 169.00, true, 2, true),
  ('44444444-4444-4444-8444-444444444409', '33333333-3333-4333-8333-333333333303', 'Peri-Peri Spicy Wrap',   'Demo item.', 149.00, true, 3, true),

  -- Boneless Strips & Bites (flat pricing, no variants)
  ('44444444-4444-4444-8444-444444444410', '33333333-3333-4333-8333-333333333304', 'Crispy Tenders 3 pcs',           'Demo item.', 119.00, true, 1, true),
  ('44444444-4444-4444-8444-444444444411', '33333333-3333-4333-8333-333333333304', 'Boneless Crunch Box 4 pcs',      'Demo item.', 219.00, true, 2, true),
  ('44444444-4444-4444-8444-444444444412', '33333333-3333-4333-8333-333333333304', 'Dynamite Boneless Strips 6 pcs', 'Demo item.', 299.00, true, 3, true),

  -- Smoky Arabian Alfaham (Quarter/Half/Full variants)
  ('44444444-4444-4444-8444-444444444413', '33333333-3333-4333-8333-333333333305', 'Smoky Arabian Alfaham', 'Demo item.', 199.00, true, 1, true),

  -- Sharing Feasts & Buckets (flat pricing, no variants)
  ('44444444-4444-4444-8444-444444444414', '33333333-3333-4333-8333-333333333306', 'Coal & Crunch Duo',        'Demo item.', 399.00,  true, 1, true),
  ('44444444-4444-4444-8444-444444444415', '33333333-3333-4333-8333-333333333306', 'Family Bucket 8 pcs',      'Demo item.', 849.00,  true, 2, true),
  ('44444444-4444-4444-8444-444444444416', '33333333-3333-4333-8333-333333333306', 'Mega Party Platter 12 pcs','Demo item.', 1249.00, true, 3, true),

  -- Add-ons (flat pricing, no variants)
  ('44444444-4444-4444-8444-444444444417', '33333333-3333-4333-8333-333333333307', 'French Fries',                  'Demo item.', 79.00, true, 1, true),
  ('44444444-4444-4444-8444-444444444418', '33333333-3333-4333-8333-333333333307', 'Peri-Peri French Fries',        'Demo item.', 99.00, true, 2, true),
  ('44444444-4444-4444-8444-444444444419', '33333333-3333-4333-8333-333333333307', 'Cheesy Lava Dip',               'Demo item.', 30.00, true, 3, true),
  ('44444444-4444-4444-8444-444444444420', '33333333-3333-4333-8333-333333333307', 'Signature Garlic Mayo/Toum',    'Demo item.', 20.00, true, 4, true),
  ('44444444-4444-4444-8444-444444444421', '33333333-3333-4333-8333-333333333307', 'Extra Dinner Bun',              'Demo item.', 15.00, true, 5, true),
  ('44444444-4444-4444-8444-444444444422', '33333333-3333-4333-8333-333333333307', 'Extra Kuboo(s)',                'Demo item.', 10.00, true, 6, true),

  -- Beverages (flat pricing, no variants)
  ('44444444-4444-4444-8444-444444444423', '33333333-3333-4333-8333-333333333308', 'Soft Drink 250ml',           'Demo item.', 35.00, true, 1, true),
  ('44444444-4444-4444-8444-444444444424', '33333333-3333-4333-8333-333333333308', 'Fresh Lime Juice',           'Demo item.', 40.00, true, 2, true),
  ('44444444-4444-4444-8444-444444444425', '33333333-3333-4333-8333-333333333308', 'Blue Curacao/Mint Mojito',   'Demo item.', 89.00, true, 3, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Variants: Crispy Chicken Burgers — Solo / Meal
-- ---------------------------------------------------------------------------
insert into public.product_variants (id, product_id, name, price, is_default, display_order, is_available)
values
  ('55555555-5555-4555-8555-555555555501', '44444444-4444-4444-8444-444444444404', 'Solo', 149.00, true,  1, true),
  ('55555555-5555-4555-8555-555555555502', '44444444-4444-4444-8444-444444444404', 'Meal', 229.00, false, 2, true),

  ('55555555-5555-4555-8555-555555555503', '44444444-4444-4444-8444-444444444405', 'Solo', 169.00, true,  1, true),
  ('55555555-5555-4555-8555-555555555504', '44444444-4444-4444-8444-444444444405', 'Meal', 249.00, false, 2, true),

  ('55555555-5555-4555-8555-555555555505', '44444444-4444-4444-8444-444444444406', 'Solo', 219.00, true,  1, true),
  ('55555555-5555-4555-8555-555555555506', '44444444-4444-4444-8444-444444444406', 'Meal', 299.00, false, 2, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Variants: Crunchy Wraps & Twisters — Solo / Meal
-- ---------------------------------------------------------------------------
insert into public.product_variants (id, product_id, name, price, is_default, display_order, is_available)
values
  ('55555555-5555-4555-8555-555555555507', '44444444-4444-4444-8444-444444444407', 'Solo', 139.00, true,  1, true),
  ('55555555-5555-4555-8555-555555555508', '44444444-4444-4444-8444-444444444407', 'Meal', 219.00, false, 2, true),

  ('55555555-5555-4555-8555-555555555509', '44444444-4444-4444-8444-444444444408', 'Solo', 169.00, true,  1, true),
  ('55555555-5555-4555-8555-555555555510', '44444444-4444-4444-8444-444444444408', 'Meal', 259.00, false, 2, true),

  ('55555555-5555-4555-8555-555555555511', '44444444-4444-4444-8444-444444444409', 'Solo', 149.00, true,  1, true),
  ('55555555-5555-4555-8555-555555555512', '44444444-4444-4444-8444-444444444409', 'Meal', 229.00, false, 2, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Variants: Smoky Arabian Alfaham — Quarter / Half / Full
-- ---------------------------------------------------------------------------
insert into public.product_variants (id, product_id, name, price, is_default, display_order, is_available)
values
  ('55555555-5555-4555-8555-555555555513', '44444444-4444-4444-8444-444444444413', 'Quarter', 199.00, true,  1, true),
  ('55555555-5555-4555-8555-555555555514', '44444444-4444-4444-8444-444444444413', 'Half',    360.00, false, 2, true),
  ('55555555-5555-4555-8555-555555555515', '44444444-4444-4444-8444-444444444413', 'Full',    690.00, false, 3, true)
on conflict (id) do nothing;
