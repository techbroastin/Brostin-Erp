# Changelog

All notable changes to Broastin App 1 (Customer Ordering PWA). Dates are
when the work happened in this repository, not a release schedule.

## 2026-08-24 — UI/UX phase (mock data)

Built the complete customer-facing UI on local mock data, per the project
sequencing decision (UI first, backend second). No remote Supabase access
of any kind occurred in this phase.

### Added
- All 13 screens: Landing, Menu, Product Details, Cart, Customer
  Identification, Order Type, Address (select + manage), Address
  add/edit, Order Review, Order Confirmation, Order Status, My Orders, My
  Profile.
- Shared component library: `ProductCard`, `CategoryNav`, `CartBar`,
  `AddressCard`, `OrderStatusTimeline`, `QuantityStepper`, `PriceText`,
  `LoadingView`/`SkeletonBox`, `EmptyStateView`, `ErrorStateView`.
- `go_router`-based navigation (`core/router/app_router.dart`) covering the
  full journey with real, refresh-safe URL paths.
- `MockMenuData` — in-memory mirror of `supabase/seed.sql`'s approved
  menu (8 categories, 25 products, 15 variants).
- `MockBackend` — in-memory shared store for customers/addresses/orders so
  mock repositories behave consistently across screens within a session.
- `CheckoutService`, `AddressDraftHolder` — new app-level state for the
  checkout flow and the current-location → manual-entry hand-off.
- Repository abstraction: every repository (`MenuRepository`,
  `CustomerRepository`, `AddressRepository`, `OrderRepository`) split into
  an interface plus `Mock*` (now active) and `Supabase*` (dormant)
  implementations, so backend integration later is a `main.dart`-only
  change.

### Fixed (found during this phase's browser verification, not present in the reviewed backend design itself)
- **`ProductCard` layout crash**: `Row(crossAxisAlignment: stretch)` with
  an unbounded ancestor height threw `BoxConstraints forces an infinite
  height` on real rendering, leaving the entire menu product list blank.
  Fixed by giving the card a fixed height (140px) instead of relying on
  stretch/intrinsic sizing.
- **`ProductDetailsScreen` unconstrained hero image**: the image
  `AspectRatio` had no max-width on wide viewports, producing a ~980px
  tall image on a 1568px-wide desktop browser and pushing all product
  info below the fold. Fixed by constraining the whole scrollable content
  to the same max width used elsewhere.
- **`MenuScreen` initial product fetch**: the first category's product
  list occasionally never left its loading state, seemingly because the
  Future was created synchronously inside `initState` before the app had
  fully settled after first paint. Deferred the initial fetch to after
  the first frame (`WidgetsBinding.instance.endOfFrame`) as a defensive
  fix. See "Known UI issues" in the final report for the remaining
  uncertainty about root cause vs. automated-browser-testing artifact.
- `RadioListTile` deprecation (Flutter 3.32+ `RadioGroup` migration) in
  `OrderReviewScreen`'s payment method selector.

### Backend requirements discovered during UI implementation
- **Delivery fee is a real gap, now visibly so.** The UI needed *some*
  number to show for delivery orders and uses a flat ₹30 placeholder
  (`CheckoutService.flatDeliveryCharge`). This was already a known gap in
  `07_SECURITY_RLS.md`/`10_ORDER_LIFECYCLE.md`, but building the actual
  checkout screen made concrete that a real delivery-zone/fee system is
  needed before this can go live with real deliveries — not just a
  server-side validation gap, but a missing feature.
- **Order-number mock behavior confirms the real design is right.**
  `MockBackend`'s client-side `BR-YYYYMMDD-####` counter (per app
  session, not concurrency-safe) is a fine stand-in for UI development,
  but it's a visible reminder that this must never ship as real logic —
  reinforces that `generate_order_number()`'s server-side, row-locked
  design (already built, not yet applied) is the only correct
  implementation.
- No new schema requirements were discovered — the reviewed schema
  (`06_DATABASE_SCHEMA.md`) covered every field the UI needed.

## 2026-08-24 — Migration & security review (backend, local only)

- Reviewed and corrected `identify_or_create_customer` around
  `auth_user_id` (not phone) as the sole ownership anchor.
- Added `set_order_item_snapshot()` and `recalculate_order_totals()`
  server-side price-integrity triggers.
- Added `product_variants` table and the approved provisional menu to
  `supabase/seed.sql`.
- Added developer documentation set (`docs/05`–`docs/19`).
- See `docs/07_SECURITY_RLS.md` and `docs/10_ORDER_LIFECYCLE.md` for full
  detail. Nothing in this entry was applied remotely.

## 2026-08-24 — Foundation

- Flutter Web PWA scaffold, clean architecture (core/models/data/services/
  domain/presentation), initial Supabase migrations (schema, RLS, order
  number generation), local git repository initialized.
