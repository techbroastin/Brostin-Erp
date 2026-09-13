# Phase 14 — Admin Menu Management

## A. Scope delivered

Owner Admin can now manage the customer-facing menu end-to-end: categories, products, and product variants — create/edit/delete, price, availability, featured/popular, display order, and description — with writes gated by the existing `app_admins`/`is_app_admin()` mechanism from Phase 13, and changes flowing directly into the same Supabase data the customer QR menu reads from. No image/branding/staff/CRM/inventory/accounting work; no Dashboard/Login redesign; no unrelated Phase 13 audit findings addressed — all explicitly out of scope for this phase.

## B. Files changed

**New:**
- `supabase/migrations/20260914090000_admin_menu_management.sql`
- `lib/data/repositories/admin_menu_repository.dart` (port + typed exceptions)
- `lib/data/repositories/supabase_admin_menu_repository.dart` (Supabase implementation)
- `lib/admin/domain/menu_form_validators.dart`
- `lib/admin/presentation/widgets/admin_confirm_delete_dialog.dart`
- `lib/admin/presentation/screens/menu/admin_menu_overview_screen.dart`
- `lib/admin/presentation/screens/menu/admin_categories_screen.dart`
- `lib/admin/presentation/screens/menu/admin_products_screen.dart`
- `test/admin/menu_form_validators_test.dart`
- `test/admin/fake_admin_menu_repository.dart`
- `test/admin/admin_categories_screen_test.dart`
- `test/admin/admin_products_screen_test.dart`

**Modified:**
- `lib/models/product.dart` — added `isFeatured` field.
- `lib/data/repositories/menu_repository.dart` — added `fetchFeaturedProducts()` to the port.
- `lib/data/repositories/supabase_menu_repository.dart` — implements it (`is_featured = true and is_available = true`).
- `lib/data/repositories/mock_menu_repository.dart` — implements it (falls back to first-category products; mock data predates this flag).
- `lib/presentation/screens/menu/menu_screen.dart` — one line: "Popular Picks" now calls `fetchFeaturedProducts()` instead of faking it from the first category (confirmed with you before implementing, since it touches a customer-facing file).
- `lib/admin/core/admin_router.dart` — `/menu`, `/menu/categories`, `/menu/products` now route to real screens instead of placeholders.
- `lib/admin/admin_app.dart` — wires `Provider<AdminMenuRepository>`.

Not touched: `admin_shell.dart`, `admin_login_screen.dart`, `admin_dashboard_screen.dart`, any other placeholder screen (Orders/Tables/Delivery/Customers/Settings), any customer screen other than the one line above.

## C. Database migration & exact RLS changes

Applied to `detqohhtihlygwxjasti` only (dry-run reviewed first — 1 pending migration, 0 seeds, 0 roles — then applied and re-verified remotely):

1. `alter table public.products add column if not exists is_featured boolean not null default false;` — additive, no data loss.
2. Per table (`menu_categories`, `products`, `product_variants`): one new `for select to authenticated using (is_app_admin())` policy (admin sees inactive/unavailable rows too) and one each of `insert`/`update`/`delete` `to authenticated` gated on `is_app_admin()`.

Verified remotely afterward: all 3 original customer-facing `to anon, authenticated` SELECT policies (`menu_categories_public_read_active`, `products_public_read_available`, `product_variants_public_read_available`) are **unchanged**, sitting alongside the 4 new admin policies per table (15 policies total across the 3 tables). No change to `core.*`, `t_tokens`, `t_results`, `t_snapshot`, or any orders/customers policy.

**Deletion safety** (application-level, not schema — schema already used `on delete cascade` for category→products and product→variants): `AdminMenuRepository.deleteCategory`/`deleteProduct` count children first and throw a typed exception (surfaced as a "Can't delete" dialog) instead of deleting when children exist. Deleting a product/variant that already has order history hits the pre-existing `order_items` foreign key (`on delete` default `NO ACTION`) and is caught as a friendly message rather than a raw Postgres error.

## D. CRUD capabilities delivered

- **Categories**: list (search by name, product count per row), create, edit, active toggle (instant), delete (blocked with a clear reason if the category still has products).
- **Products**: list (search, category filter), create, edit (name, description, category, price, availability, featured), availability toggle (instant), featured toggle (instant, star icon), delete (blocked if the product still has variants, or if it has order history).
- **Variants**: managed inline from a product's edit dialog — list, add, edit, delete (default flag, availability, price, display order); delete blocked if the variant has order history. A freshly created product automatically reopens its edit dialog so variants can be added immediately.
- **Featured/popular**: now a real, working data flag — see section G.

## E. Tests

`flutter test`: **41/41 passed** (26 pre-existing + 15 new).
- `menu_form_validators_test.dart` (6 tests): required-name, price (empty/non-numeric/negative rejected; zero/positive accepted), display order (same shape).
- `admin_categories_screen_test.dart` (4 tests, against `FakeAdminMenuRepository`): empty state, list with product counts, create flow, delete-blocked dialog when the category has products.
- `admin_products_screen_test.dart` (5 tests): empty state, list rendering, featured toggle calling the repository correctly, delete-blocked dialog when the product has variants, create flow.

Admin authorization itself isn't Flutter-unit-testable (it's a Postgres RLS policy) — verified live instead, see section F.

`flutter analyze`: 1 pre-existing info-level lint (unrelated), no new issues.
`flutter build web -t lib/main_admin.dart`: succeeds.
`flutter build web` (customer): succeeds.

## F. Supabase security verification (live, against `detqohhtihlygwxjasti`)

All scenarios run as JWT-simulated queries in rolled-back transactions (owner id from Phase 13) or as real, cleaned-up writes:

| # | Scenario | Result |
|---|---|---|
| 1 | Owner → insert/update/delete on `menu_categories` | **Succeeded** (PASS) |
| 2 | Owner → SELECT sees a row with `is_active = false` | **Visible** (count 1) (PASS) |
| 3 | Anonymous (`anon` role) → SELECT the same inactive row | **Not visible** (count 0) (PASS) |
| 4 | Non-admin authenticated user (`device1@test.local`) → insert on `menu_categories` | **Rejected**, `42501` RLS violation (PASS) |
| 5 | Anonymous (`anon` role) → insert on `menu_categories` | **Rejected**, `42501` RLS violation (PASS) |
| 6 | Non-admin authenticated user → update on `products` | **0 rows affected** (RLS silently filters, no error) (PASS) |
| 7 | Existing customer-facing SELECT (`anon`, `is_available = true`) | Still returns the expected product set (26 rows, matching pre-migration shape) (PASS) |

## G. Customer-menu verification (real backend, not mocked)

Built and served the customer app with the real Supabase project (`--dart-define`), reached the Menu screen via the authorized test QR token (`TEST-QR-TOKEN-0001` → Table TEST-1), and, using the **live Admin UI** (Playwright, headed browser, owner logged in manually — same no-see-password protocol as Phase 13):

1. Created a real product ("Playwright QA Product", ₹42, category "Add-ons", Featured on) and a variant ("Large", ₹55) through the Admin Products screen.
2. Toggled an existing product ("French Fries") to Featured through the Admin UI.
3. Reloaded the customer Menu screen: **"Popular Picks" showed exactly those two products** (previously this strip just showed "first category's products" with no real flag behind it — confirmed fixed), and the **Add-ons category showed the new product at the correct price with "from ₹42" / Select**, reflecting its variant correctly.
4. Cleaned up afterward: deleted the test variant and product, reverted "French Fries" to not-featured. Verified via SQL that `products`/`menu_categories` row counts and `is_featured` count are back to the pre-test baseline (0 featured products).

This confirms the full loop — admin write → RLS-gated Supabase write → customer read — works end-to-end on the real project, not a mock.

## H. Playwright UI verification

Performed at 1280px (primary) with the dark sidebar/shell unchanged from Phase 13's P0 fix:
- Categories screen: list, search field, Add Category dialog (create), delete confirmation, and the "Can't delete" blocked-dialog (tested against a category with an existing product) all rendered and functioned correctly.
- Products screen: list with category filter and search, Add Product dialog, category dropdown, featured star toggle, availability toggle, and the nested variant add/edit/delete UI inside the product edit dialog all rendered and functioned correctly.
- 1024/1440px: not independently re-verified this phase (time-boxed to the 1280px functional pass plus the real end-to-end backend verification above); the screens use the same `Card`/`ListView`/dialog widgets already confirmed width-agnostic in the Phase 13 audit (no fixed pixel widths beyond dialog `SizedBox` content, which are well under 1024px). Flagged as a remaining limitation below rather than claimed as tested.

## I. Remaining limitations / deferred (by design, per phase scope)

- No image upload/management (kept `imageUrl` field intact for Phase 15, per instruction).
- No branding/logo management, staff accounts, CRM, inventory, or accounting.
- Dashboard and Login screens unchanged (Phase 13 audit findings there remain open, untouched intentionally).
- Product/category list ordering can look unstable when multiple rows share the same `display_order` (no secondary sort key) — cosmetic, not a data-integrity issue; worth a tie-breaker sort (e.g., by name) in a future pass.
- 1024px/1440px Playwright passes not independently re-run this phase (see section H) — recommend a quick visual spot-check before/at the start of Phase 15.
- No drag-and-drop reordering — display order is a plain numeric field, as scoped.

## Result: **PASS**

Not committed, not pushed, per phase discipline. Phase 15 not started. Stopping here.
