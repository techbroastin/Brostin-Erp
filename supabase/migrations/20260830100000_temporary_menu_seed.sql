-- ============================================================================
-- Broastin App 1 — Temporary/provisional menu seed (8 categories, 25
-- products, 15 variants), adapted from supabase/seed.sql.
--
-- Adaptation vs. supabase/seed.sql: that file creates its own restaurant +
-- branch with fixed UUIDs. This app has no branch-picker (single-branch by
-- design — see AppConstants.singleBranchId's comment), and LandingScreen
-- simply takes fetchActiveBranches().first, ordered by name. Inserting a
-- second branch would silently change which branch Takeaway/Delivery
-- checkout targets while Dining still resolves against the original branch
-- via the QR token — a split-brain bug. So this migration does NOT insert a
-- restaurant or branch; it attaches categories/products/variants to the
-- existing live branch ("TEST Branch - QA Only", created by
-- 20260830090000_qa_test_dataset.sql) via a name lookup.
--
-- Every product keeps is_demo = true, the column this schema already
-- reserves for exactly this purpose. Descriptions are short and appetizing
-- rather than the placeholder "Demo item." text in supabase/seed.sql.
-- Category/product/variant ids match supabase/seed.sql and
-- lib/mock/mock_menu_data.dart exactly, for consistency with that
-- already-reviewed content. INSERT-only, `on conflict (id) do nothing` —
-- safe to re-run, never duplicates or overwrites.
-- ============================================================================

with b as (
  select id from public.branches where name = 'TEST Branch - QA Only' limit 1
)
insert into public.menu_categories (id, branch_id, name, display_order, is_active)
select v.id, b.id, v.name, v.display_order, true
from b, (values
  ('33333333-3333-4333-8333-333333333301'::uuid, 'Signature Broasted Chicken', 1),
  ('33333333-3333-4333-8333-333333333302'::uuid, 'Crispy Chicken Burgers',     2),
  ('33333333-3333-4333-8333-333333333303'::uuid, 'Crunchy Wraps & Twisters',   3),
  ('33333333-3333-4333-8333-333333333304'::uuid, 'Boneless Strips & Bites',    4),
  ('33333333-3333-4333-8333-333333333305'::uuid, 'Smoky Arabian Alfaham',      5),
  ('33333333-3333-4333-8333-333333333306'::uuid, 'Sharing Feasts & Buckets',   6),
  ('33333333-3333-4333-8333-333333333307'::uuid, 'Add-ons',                    7),
  ('33333333-3333-4333-8333-333333333308'::uuid, 'Beverages',                  8)
) as v(id, name, display_order)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Products. For products with variants, price holds the base/"from" price
-- shown on the card before a variant is chosen — the variant's own price is
-- what is actually charged once selected (server-enforced, see
-- set_order_item_snapshot()).
-- ---------------------------------------------------------------------------
insert into public.products (id, category_id, name, description, price, is_available, display_order, is_demo)
values
  -- Signature Broasted Chicken
  ('44444444-4444-4444-8444-444444444401', '33333333-3333-4333-8333-333333333301', 'Single Piece Broast',     'Marinated 12 hours, hand-breaded, fried to a golden crunch', 89.00,  true, 1, true),
  ('44444444-4444-4444-8444-444444444402', '33333333-3333-4333-8333-333333333301', 'Duo Crunch Box',          '2 pcs crunchy broast, fries, dinner bun, garlic dip',        239.00, true, 2, true),
  ('44444444-4444-4444-8444-444444444403', '33333333-3333-4333-8333-333333333301', 'Broaster 4-Piece Box',    '4 pcs broast, 2 buns, fries, 2 signature dips',              439.00, true, 3, true),

  -- Crispy Chicken Burgers (Solo/Meal variants)
  ('44444444-4444-4444-8444-444444444404', '33333333-3333-4333-8333-333333333302', 'The Big Broaster Burger',       'Crispy chicken fillet, fresh lettuce, signature sauce', 149.00, true, 1, true),
  ('44444444-4444-4444-8444-444444444405', '33333333-3333-4333-8333-333333333302', 'Cheesy Broast Burger',          'Crispy fillet, melted cheddar, creamy cheesy dip',      169.00, true, 2, true),
  ('44444444-4444-4444-8444-444444444406', '33333333-3333-4333-8333-333333333302', 'Monster Crunch Double Burger',  'Double crispy fillet, double cheese, spicy mayo',       219.00, true, 3, true),

  -- Crunchy Wraps & Twisters (Solo/Meal variants)
  ('44444444-4444-4444-8444-444444444407', '33333333-3333-4333-8333-333333333303', 'Classic Crunch Wrap',    'Crispy strips, lettuce and sauce in a soft tortilla',   139.00, true, 1, true),
  ('44444444-4444-4444-8444-444444444408', '33333333-3333-4333-8333-333333333303', 'Cheesy Twister Wrap',    'Crispy chicken and melted cheese, twisted and grilled', 169.00, true, 2, true),
  ('44444444-4444-4444-8444-444444444409', '33333333-3333-4333-8333-333333333303', 'Peri-Peri Spicy Wrap',   'Fiery peri-peri chicken, crunchy veg, spicy mayo',      149.00, true, 3, true),

  -- Boneless Strips & Bites
  ('44444444-4444-4444-8444-444444444410', '33333333-3333-4333-8333-333333333304', 'Crispy Tenders 3 pcs',           'Hand-breaded tenders, golden and crunchy',    119.00, true, 1, true),
  ('44444444-4444-4444-8444-444444444411', '33333333-3333-4333-8333-333333333304', 'Boneless Crunch Box 4 pcs',      '4 pcs boneless bites, fries, bun, garlic dip', 219.00, true, 2, true),
  ('44444444-4444-4444-8444-444444444412', '33333333-3333-4333-8333-333333333304', 'Dynamite Boneless Strips 6 pcs', '6 pcs spicy boneless strips, extra crunchy',   299.00, true, 3, true),

  -- Smoky Arabian Alfaham (Quarter/Half/Full variants)
  ('44444444-4444-4444-8444-444444444413', '33333333-3333-4333-8333-333333333305', 'Smoky Arabian Alfaham', 'Charcoal-grilled, Arabian spice marinade, smoky finish', 199.00, true, 1, true),

  -- Sharing Feasts & Buckets
  ('44444444-4444-4444-8444-444444444414', '33333333-3333-4333-8333-333333333306', 'Coal & Crunch Duo',         'Half Alfaham + broast combo — feeds 2', 399.00,  true, 1, true),
  ('44444444-4444-4444-8444-444444444415', '33333333-3333-4333-8333-333333333306', 'Family Bucket 8 pcs',       '8 pcs crunchy broast, perfect for sharing', 849.00,  true, 2, true),
  ('44444444-4444-4444-8444-444444444416', '33333333-3333-4333-8333-333333333306', 'Mega Party Platter 12 pcs', '12 pcs broast, fries and buns — built for the table', 1249.00, true, 3, true),

  -- Add-ons
  ('44444444-4444-4444-8444-444444444417', '33333333-3333-4333-8333-333333333307', 'French Fries',               'Golden, crispy, salted just right',      79.00, true, 1, true),
  ('44444444-4444-4444-8444-444444444418', '33333333-3333-4333-8333-333333333307', 'Peri-Peri French Fries',     'Fries tossed in fiery peri-peri spice',  99.00, true, 2, true),
  ('44444444-4444-4444-8444-444444444419', '33333333-3333-4333-8333-333333333307', 'Cheesy Lava Dip',            'Warm, gooey, melted cheese dip',         30.00, true, 3, true),
  ('44444444-4444-4444-8444-444444444420', '33333333-3333-4333-8333-333333333307', 'Signature Garlic Mayo/Toum', 'Creamy garlic dip, our signature recipe',20.00, true, 4, true),
  ('44444444-4444-4444-8444-444444444421', '33333333-3333-4333-8333-333333333307', 'Extra Dinner Bun',           'Soft, fresh dinner bun',                 15.00, true, 5, true),
  ('44444444-4444-4444-8444-444444444422', '33333333-3333-4333-8333-333333333307', 'Extra Kuboo(s)',             'Traditional Arabic flatbread',           10.00, true, 6, true),

  -- Beverages
  ('44444444-4444-4444-8444-444444444423', '33333333-3333-4333-8333-333333333308', 'Soft Drink 250ml',         'Chilled and fizzy, pick your flavour', 35.00, true, 1, true),
  ('44444444-4444-4444-8444-444444444424', '33333333-3333-4333-8333-333333333308', 'Fresh Lime Juice',         'Freshly squeezed, sweet and tangy',    40.00, true, 2, true),
  ('44444444-4444-4444-8444-444444444425', '33333333-3333-4333-8333-333333333308', 'Blue Curacao/Mint Mojito', 'Refreshing mocktail, served ice cold', 89.00, true, 3, true)
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
