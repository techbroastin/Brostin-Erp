# 19 — Developer Handover

## Current state (authoritative — read this first)

```
REMOTE SUPABASE:   NOT MIGRATED
REMOTE AUTH:       NOT MODIFIED
REMOTE DATA:       NOT MODIFIED
LOCAL MIGRATIONS:  READY FOR REVIEW
LOCAL SEED:        READY BUT NOT APPLIED
ANONYMOUS AUTH:    NOT ENABLED YET
APP SCREENS:       BUILT (UI/UX phase) — running on LOCAL MOCK DATA ONLY
BACKEND WIRING:    NOT CONNECTED — UI does not talk to Supabase yet
```

Nothing in `supabase/` has ever been pushed, executed, or seeded against
`detqohhtihlygwxjasti` (or any other project). Every SQL file in this repo
exists only on disk / in local git history. No `supabase db push`, no
direct SQL execution, no Auth/RLS/Storage dashboard changes have been made
by this codebase at any point. This phase also did not enable Anonymous
Auth, apply migrations, seed Supabase, or connect the app to any Supabase
repository implementation — per explicit instruction, UI/UX came first and
is fully decoupled from the backend.

## What exists today

```
Brostin crm & pos/
├── lib/
│   ├── main.dart / app.dart    Wires MOCK repositories + go_router; does
│   │                           NOT call Supabase.initialize() in this phase
│   ├── core/                   theme, constants, phone validation, router
│   ├── models/                 Dart mirrors of every DB table
│   ├── mock/                   MockMenuData (approved menu, in-memory),
│   │                           MockBackend (in-memory customers/addresses/
│   │                           orders shared across the mock repositories)
│   ├── data/repositories/      one ABSTRACT interface per repository +
│   │                           a Mock*Repository (active now) and a
│   │                           Supabase*Repository (dormant, unused this
│   │                           phase) implementation of each
│   ├── services/               supabase_service (unused this phase),
│   │                           session_service, cart_service,
│   │                           checkout_service, geolocation_service,
│   │                           address_draft_holder
│   ├── domain/                 use-case orchestration — unchanged from the
│   │                           backend phase; depends only on the
│   │                           abstract repository interfaces
│   └── presentation/
│       ├── screens/            all 13 screens — see 04_UI_UX_SPECIFICATION.md
│       └── widgets/             shared components — see 04_UI_UX_SPECIFICATION.md
├── supabase/                   unchanged from the backend-review phase;
│                                 nothing here has been touched or applied
└── docs/                       this documentation set
```

`flutter analyze`, `flutter test`, and `flutter build web` all pass as of
this handover — see the final report for exact output.

## How the mock/backend seam works (read this before connecting Supabase)

Every repository has three files:

```
data/repositories/<name>_repository.dart           abstract interface
data/repositories/mock_<name>_repository.dart       active now
data/repositories/supabase_<name>_repository.dart   dormant, unused
```

`main.dart` is the ONLY file that decides which implementation backs each
interface — it currently instantiates the four `Mock*Repository` classes
and provides them via Provider, typed as the abstract interface. Screens,
domain use-cases, and `CartService`/`CheckoutService` never import or
reference a `Mock*` or `Supabase*` class directly — only the interfaces.

**To connect the backend later:** enable Anonymous Sign-ins (see
`18_SUPABASE_SETUP.md`), wire `signInAnonymously()` into `main.dart`'s
startup, then in `main.dart` swap each `Mock*Repository(...)` construction
for the matching `Supabase*Repository()` and call
`await SupabaseService.initialize()` before building the provider tree.
No screen, widget, or domain file should need to change.

## What is NOT built / connected yet

- The app does not talk to Supabase at all in this phase — see above.
- Anonymous auth is not wired in — same reasoning as the backend-review
  phase (`08_AUTHENTICATION.md`), now additionally true because there's no
  Supabase connection at all yet in this build.
- No delivery-fee calculation logic (no zone/fee table) — unchanged from
  before; the UI shows a flat placeholder delivery charge
  (`CheckoutService.flatDeliveryCharge`, ₹30) for delivery orders, clearly
  a placeholder, not real business logic.
- No payment gateway integration (Cash/UPI selection only).
- Not every screen/state was individually smoke-tested in a live browser
  this phase — see the final report's "Known UI issues" for exactly what
  was and wasn't exercised.

## Exact next phase

1. **You review the built UI** (this handover's purpose) and give feedback.
2. Once UI is approved: enable Anonymous Sign-ins, apply the reviewed
   migrations remotely (`18_SUPABASE_SETUP.md`), wire
   `signInAnonymously()`, and swap the four `Mock*Repository` instances in
   `main.dart` for their `Supabase*Repository` counterparts.
3. Re-test the full customer journey against the real backend.
4. Only after that: consider payment gateway integration, delivery-fee
   logic, and the future systems listed in `05_DATABASE_ARCHITECTURE.md`
   ("Consumption by future systems") — all explicitly out of scope for
   App 1.

## Where to look for what

| Question | Document |
|---|---|
| What screens/components exist, brand, responsive rules? | `04_UI_UX_SPECIFICATION.md` |
| What's the exact customer journey and navigation graph? | `11_CUSTOMER_FLOW.md` |
| How do the tables relate? | `05_DATABASE_ARCHITECTURE.md` |
| What's the exact column/constraint list? | `06_DATABASE_SCHEMA.md` |
| How does RLS prevent cross-customer access? | `07_SECURITY_RLS.md` |
| How does customer identity/auth work? | `08_AUTHENTICATION.md` |
| How does an order get created and priced? | `10_ORDER_LIFECYCLE.md` |
| What's the approved menu and how are variants modeled? | `13_MENU_AND_PRICING.md` |
| How do I actually apply this to Supabase? | `18_SUPABASE_SETUP.md` |
| What changed and when? | `CHANGELOG.md` |
