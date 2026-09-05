# 19 — Developer Handover

## STRICT product requirement — read before touching any layout code

This customer app is **mobile-only**, reached exclusively via QR-code
entry: Android primary, iPhone supported, no tablet/desktop customer
requirement. See `02_REQUIREMENTS.md` for the full statement and the
required QA widths (320/360/375/390/412/430/480px). Admin/Operations is a
**separate, desktop-only application** that does not live in this
repository and must never be merged into this UI. Any future work here —
QA, layout changes, new screens — should target phone widths only; do not
reintroduce desktop/tablet as a design or acceptance concern for this app.

## Current state (authoritative — read this first)

```
REMOTE SUPABASE:   APPLICATION STATUS NOT VERIFIED IN THIS PHASE (see below)
REMOTE AUTH:       NOT MODIFIED FROM THIS REPOSITORY
REMOTE DATA:       NOT MODIFIED FROM THIS REPOSITORY
LOCAL MIGRATIONS:  11 total (4 original + 7 added for QR dining/delivery
                   pricing) — see CHANGELOG.md 2026-09-05 entry
LOCAL SEED:        includes 3 QA/dev-only migrations (test dataset, test
                   QR token, temporary menu seed) — see CHANGELOG.md
ANONYMOUS AUTH:    WIRED IN CODE — main.dart calls
                   SupabaseService.ensureAnonymousSession() at startup when
                   Supabase is configured. Enabling the Anonymous
                   Sign-ins provider in the Supabase Auth dashboard is
                   still a required manual step (18_SUPABASE_SETUP.md);
                   this phase did not verify it's been done.
APP SCREENS:       BUILT + LIVE UI-QA'D as of the previous handover, plus
                   the QR/dining screens and flows added since
BACKEND WIRING:    CONNECTED IN CODE, CONDITIONALLY ACTIVE — see below
```

This handover supersedes the previous one. Since the last UI QA pass
(deep-link/menu-load routing, a wide-viewport `AddressScreen` layout gap,
focus-vs-error field styling, two raw-exception error messages, `My
Profile`/`My Orders` in-app entry point, a `MenuScreen` variant-refetch
bug — all still valid, unaffected by this phase), the QR dining + delivery
pricing implementation (`ba51bf6`, see `CHANGELOG.md`) has landed:

- **Backend wiring is now real, but conditional.** `main.dart` picks each
  `Supabase*Repository` over its `Mock*Repository` counterpart only when
  `SupabaseService.isConfigured` (`SUPABASE_URL`/`SUPABASE_ANON_KEY` were
  passed via `--dart-define`) **and** `SupabaseService.initialize()` +
  `ensureAnonymousSession()` both succeed at startup; any failure is
  caught, logged, and falls back to Mock rather than crash. `flutter
  test` and a plain `flutter run`/`flutter build web` never supply those
  dart-defines, so they still run entirely on mock data exactly as
  before — this is not yet a default-on backend connection.
- **The flat ₹30 delivery placeholder is gone**, replaced by a
  database-priced, distance-banded charge — see "Delivery pricing" below.
- **Dining (QR table ordering) is implemented** — see "QR dining" below.
- This phase's own testing (Flutter analyze/test/build + any Playwright
  runs) is reported separately per rule 16 (phase discipline); this
  handover only describes what the code now does, not a fresh QA pass.

Whether the 7 new migrations (and the original 4) have actually been
pushed to `detqohhtihlygwxjasti` is **not verified by this documentation
update** — this phase was explicitly scoped to docs only and forbidden
from touching remote Supabase. Applying migrations remains the separately
gated, explicitly-confirmed step described in rule 19 (Database Change
Gate) and `18_SUPABASE_SETUP.md`. Do not assume the schema exists remotely
without checking.

## QR dining

A table's printed QR encodes `/qr/{opaque-token}` (`AppRoutes.qrEntry`).
`QrEntryScreen` resolves the token via the `resolve_dining_table()` RPC
(zero client-facing RLS on `restaurant_tables` itself — this RPC is the
only sanctioned read path) into `{tableId, branchId, tableNumber}`, stores
it in the new `DiningContextService` (in-memory, session-only — a reload
mid-visit requires rescanning; an accepted limitation, not a bug), and
continues to Landing. An invalid/inactive token doesn't block ordering —
it shows a friendly message and continues to Menu with dining simply
unavailable. `OrderTypeScreen` only ever offers **Dining** when
`DiningContextService.hasDiningContext` is true; there is no UI path into
the dining flow without a valid scanned table QR this session. See
`11_CUSTOMER_FLOW.md` for the full screen-by-screen flow.

## Delivery pricing

`CheckoutService.flatDeliveryCharge` is gone. `AddressScreen` now calls
`DeliveryPricingUseCase` the moment an address is selected: it estimates
distance client-side (`HaversineDistanceProvider` — great-circle, **not**
real road distance; no Maps/Directions API key exists for this project)
and asks the database's `calculate_delivery_charge()` RPC what that
distance would cost against `delivery_pricing_rules`. This is a preview
only — the database's own `set_delivery_charge()` `BEFORE INSERT` trigger
independently re-derives the real charge at order-creation time from the
same table, discarding whatever the client sent, and rejects the order if
no active pricing band covers the distance. See `10_ORDER_LIFECYCLE.md`
for the exact trigger sequence.

**Known MVP limitation:** distance is a straight-line estimate, so it will
read a little short of the real route in most cases. Swapping in a real
routing provider is a single DI registration change in `main.dart`
(`DistanceProvider` is already behind an interface for exactly this
reason) — no pricing-rule or database change is required.

## What exists today

```
Brostin crm & pos/
├── lib/
│   ├── main.dart / app.dart    Wires Mock*/Supabase* repositories (per
│   │                           SupabaseService.isConfigured, see above) +
│   │                           go_router
│   ├── core/                   theme, constants, phone validation, router
│   ├── models/                 Dart mirrors of every DB table
│   ├── mock/                   MockMenuData (approved menu, in-memory),
│   │                           MockBackend (in-memory customers/addresses/
│   │                           orders shared across the mock repositories)
│   ├── data/repositories/      one ABSTRACT interface per repository +
│   │                           a Mock*Repository and a Supabase*Repository
│   │                           implementation of each (Menu, Customer,
│   │                           Address, Order, Dining, DeliveryPricing)
│   ├── services/               supabase_service, dining_context_service,
│   │                           distance_provider, session_service,
│   │                           cart_service, checkout_service,
│   │                           geolocation_service, address_draft_holder
│   ├── domain/                 use-case orchestration, incl.
│   │                           DeliveryPricingUseCase — depends only on
│   │                           the abstract repository interfaces
│   └── presentation/
│       ├── screens/            all screens incl. QrEntryScreen — see
│       │                       04_UI_UX_SPECIFICATION.md /
│       │                       11_CUSTOMER_FLOW.md
│       └── widgets/             shared components — see 04_UI_UX_SPECIFICATION.md
├── supabase/                   11 migrations total — see CHANGELOG.md;
│                                 remote application status not verified
│                                 by this documentation update
└── docs/                       this documentation set
```

`flutter analyze`, `flutter test`, and `flutter build web` passed as of the
previous handover; re-run and confirm again after any further change, per
rule 20.

## How the mock/backend seam works

Every repository has three files:

```
data/repositories/<name>_repository.dart           abstract interface
data/repositories/mock_<name>_repository.dart       Mock implementation
data/repositories/supabase_<name>_repository.dart   Supabase implementation
```

`main.dart` is the ONLY file that decides which implementation backs each
interface — it picks `Supabase*Repository` over `Mock*Repository` per
repository only when `SupabaseService.isConfigured` and startup
initialization succeeds (see "Backend wiring is now real, but
conditional" above); otherwise every repository falls back to Mock.
Screens, domain use-cases, and `CartService`/`CheckoutService` never
import or reference a `Mock*` or `Supabase*` class directly — only the
interfaces.

**To make the backend connection unconditional/default for a real
deployment:** pass `SUPABASE_URL`/`SUPABASE_ANON_KEY` via `--dart-define`
at build time, confirm Anonymous Sign-ins is enabled in the Supabase Auth
dashboard (`18_SUPABASE_SETUP.md`), and confirm the migrations this phase
added have actually been applied remotely (rule 19 gate) — the code side
of the seam already requires no further change.

## What is NOT built / connected yet

- Whether the migrations in `supabase/` have been applied to
  `detqohhtihlygwxjasti` is not verified by this documentation update —
  see "Current state" above.
- Delivery distance is a straight-line (haversine) estimate, not a real
  road-routing distance — see "Delivery pricing" above.
- No payment gateway integration (Cash/UPI selection only;
  `orders.payment_reference` exists only as a future landing spot).
- Every screen and the documented flows were live-browser tested in this
  QA pass (see the final report for the exact matrix and remaining gaps —
  mainly the 7 required responsive widths, which this sandbox's browser
  could not be resized to test manually; covered instead by widget tests
  pumping `LandingScreen` at all 7 widths, plus manual review of the other
  screens' `ConstrainedBox`/`LayoutBuilder` responsive patterns).
- `go_router`'s `context.push()` (Product Details, Cart, Customer
  Identification, Order Type, Address, Order Review) does not update the
  browser URL the way `context.go()` (Landing, Menu, Order Confirmation,
  Order Status, My Orders, My Profile) does — see `11_CUSTOMER_FLOW.md`
  "Known navigation-URL limitation." Not fixed this phase since it's a
  `go_router` push/go semantics question, not a bug, and fixing it would
  mean redesigning the checkout back-stack.

## Exact next phase

1. Confirm Anonymous Sign-ins is enabled in the Supabase Auth dashboard
   and that all 11 migrations in `supabase/` have actually been applied to
   `detqohhtihlygwxjasti`, per the rule 19 gate (`18_SUPABASE_SETUP.md`) —
   the code-side wiring (`main.dart`, all six `Supabase*Repository`
   implementations) is already in place and needs no further change to
   turn on.
2. Build/run with `SUPABASE_URL`/`SUPABASE_ANON_KEY` `--dart-define`s set
   and re-test the full customer journey — dining, takeaway, and
   delivery — against the real backend.
3. Only after that: consider payment gateway integration, a real
   road-routing distance provider (replacing `HaversineDistanceProvider`),
   and the future systems listed in `05_DATABASE_ARCHITECTURE.md`
   ("Consumption by future systems") — all explicitly out of scope for
   App 1.

## Where to look for what

| Question | Document |
|---|---|
| What is this product, and how does the customer/admin split work? | `01_PRODUCT_OVERVIEW.md` |
| What's the strict mobile-only requirement and QA widths? | `02_REQUIREMENTS.md` |
| What screens/components exist, brand, responsive rules? | `04_UI_UX_SPECIFICATION.md` |
| What's the exact customer journey and navigation graph? | `11_CUSTOMER_FLOW.md` |
| QR entry, manifest/PWA install, mobile rendering targets? | `14_PWA_SPECIFICATION.md` |
| How do the tables relate? | `05_DATABASE_ARCHITECTURE.md` |
| What's the exact column/constraint list? | `06_DATABASE_SCHEMA.md` |
| How does RLS prevent cross-customer access? | `07_SECURITY_RLS.md` |
| How does customer identity/auth work? | `08_AUTHENTICATION.md` |
| How does an order get created and priced? | `10_ORDER_LIFECYCLE.md` |
| What's the approved menu and how are variants modeled? | `13_MENU_AND_PRICING.md` |
| How do I actually apply this to Supabase? | `18_SUPABASE_SETUP.md` |
| What changed and when? | `CHANGELOG.md` |
