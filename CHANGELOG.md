# Changelog

All notable changes to Broastin App 1 (Customer Ordering PWA). Dates are
when the work happened in this repository, not a release schedule.

## 2026-08-25 — Final UI QA (mock data, still no backend access)

Live-browser QA of all 13 screens and the documented flows, per the "UI
first" sequencing. No Supabase/Auth/migration access of any kind occurred
in this phase — confirmed again by grepping for Supabase imports outside
`data/repositories/supabase_*` and `services/supabase_service.dart`.

### Fixed
- **Menu wouldn't load on a direct link, bookmark, or refresh** (the
  reported "first-load menu spinner"). Root cause: the app never called
  `usePathUrlStrategy()`, so it used Flutter's default hash-based URL
  strategy — any real path typed into the address bar (or refreshed)
  resolved to `/` (Landing) because the hash portion was empty, not
  because the menu's data fetch hung. The previous phase's
  `WidgetsBinding.instance.endOfFrame` defer in `MenuScreen` was a
  reasonable-looking but ultimately unrelated workaround; left in place
  (harmless) since removing it wasn't necessary to fix the real issue.
  Fixed by calling `usePathUrlStrategy()` in `main()` (new
  `flutter_web_plugins` dependency) — every route now gets a real,
  bookmarkable path.
- **`AddressScreen` wasn't width-constrained on wide viewports** — its
  buttons and address cards stretched full-bleed instead of centering like
  every other content-bearing screen. Wrapped in the same
  `Center` + `ConstrainedBox(maxWidth: 480)` pattern used elsewhere.
- **Focused vs. error input fields looked almost identical** — the error
  colour was a shade of the same red used for the plain focus border.
  `AppColors.error` is now a distinct orange (`0xFFE65100`), and
  `AppTheme.light.inputDecorationTheme` now sets explicit `errorBorder`/
  `focusedErrorBorder` instead of relying on Flutter's default (which
  falls back to `colorScheme.error`, i.e. the same near-red).
- **`My Profile`/`My Orders` had no in-app way to reach them** — both
  screens were built and routed but nothing linked to `My Profile` (it
  only linked to `My Orders`), so they were only reachable by typing the
  URL. Added a profile icon to `MenuScreen`'s app bar, next to the cart
  icon.
- **Invalid/removed product and order links leaked a raw Dart exception**
  to the UI (`Bad state: No element`, `Bad state: Order xyz not found`) —
  `ProductDetailsScreen`, `OrderConfirmationScreen`, and
  `OrderStatusScreen` all rendered `${snapshot.error}` directly. Replaced
  with a friendly, non-technical message on each screen.
- **`MenuScreen` re-fetched every product's variant list on every
  rebuild**, not just once — `_MenuBodyState.build()` called
  `repo.fetchVariants()` inline inside the product list's `itemBuilder`,
  so any rebuild of the menu (e.g. a cart change) restarted every variant
  fetch from scratch, briefly flickering the "from ₹x" price prefix and
  wasting a repository call per product per rebuild. Found via a `flutter
  test` widget test that pumped the menu and saw the mock repository's
  simulated network delay firing far more times than there were products.
  Fixed by caching each product's variants `Future` in
  `_MenuBodyState` instead of creating a fresh one per build.
- Snack bars now use `SnackBarBehavior.floating` with bottom/side margin
  instead of the full-bleed default, so they read as a transient
  notification rather than a bar flush with the screen edge. They can
  still briefly sit over a screen's bottom action row (e.g. Cart's
  Checkout button) for their ~2–3s duration — a low-severity cosmetic
  overlap, not fixed further this phase.
- Two other `Colors.red` usages (an inline error message on Customer
  Identification and on Order Review) switched to `AppColors.error` for
  consistency with the rest of the app.
- A latent sort-comparator bug in `MockBackend.addressesForCustomer`
  (`(a, b) => b.isDefault ? 1 : -1` ignored `a` entirely, an invalid
  `Comparator`) replaced with a correct default-first comparator. Never
  visibly wrong with today's single-address-per-customer test data, but
  would have misbehaved once a customer had 2+ saved addresses.

### Investigated, not a bug
- **Newly added/edited addresses appeared to never show up in the address
  list** without a full page reload. Traced end-to-end with temporary
  logging: the address genuinely saves, and `AddressScreen._retry()`
  genuinely re-queries with the right customer id and gets the right
  result back — but in this sandbox's remote/backgrounded Chrome tab, the
  mock repository's simulated 250ms network delay was observed taking
  anywhere from several seconds to over a minute to fire, consistent with
  Chrome's background-tab timer throttling, not application logic. A
  focused, foregrounded browser tab (i.e. any real user) does not hit this
  throttling. No code change made for this one — see the final QA report
  for the full trace.

### Verified, no change needed
- Mock/Supabase separation: no `presentation/`, `domain/`, or `services/`
  file (other than the dormant, unused `supabase_service.dart`) imports
  anything Supabase-related.
- The ₹30 delivery fee (`CheckoutService.flatDeliveryCharge`) is threaded
  through as a plain parameter from the UI into
  `OrderPlacementUseCase`/`MockOrderRepository` — no repository or domain
  code computes or hardcodes it independently.

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
