# 19 — Developer Handover

## Current state (authoritative — read this first)

```
REMOTE SUPABASE:   NOT MIGRATED
REMOTE AUTH:       NOT MODIFIED
REMOTE DATA:       NOT MODIFIED
LOCAL MIGRATIONS:  READY FOR REVIEW
LOCAL SEED:        READY BUT NOT APPLIED
ANONYMOUS AUTH:    NOT ENABLED YET
APP SCREENS:       NOT BUILT YET
```

Nothing in `supabase/` has ever been pushed, executed, or seeded against
`detqohhtihlygwxjasti` (or any other project). Every SQL file in this repo
exists only on disk / in local git history. No `supabase db push`, no
direct SQL execution, no Auth/RLS/Storage dashboard changes have been made
by this codebase at any point.

## What exists today

```
Brostin crm & pos/
├── lib/                    Flutter Web PWA — architecture only, no screens yet
│   ├── main.dart / app.dart   Supabase init + Provider wiring; app.dart
│   │                          currently renders a placeholder home screen
│   ├── core/                  theme, constants, phone validation
│   ├── models/                Dart mirrors of every DB table
│   ├── data/repositories/     the ONLY files that call Supabase
│   ├── services/               supabase_service, session_service (local
│   │                            cache, not auth — see 08_AUTHENTICATION.md),
│   │                            cart_service, geolocation_service
│   └── domain/                 use-case orchestration (identify customer,
│                                manage addresses, place order)
├── supabase/
│   ├── config.toml            local CLI project-ref reference only
│   ├── migrations/            4 files, reviewed and corrected — see below
│   └── seed.sql               full approved provisional menu, NOT applied
└── docs/                      this documentation set
```

`flutter analyze` and `flutter test` both pass as of this handover.

## Migration files (all local, none applied)

1. `20260824120001_core_schema.sql` — restaurants, branches,
   menu_categories, products, product_variants, customers,
   customer_addresses.
2. `20260824120002_orders_schema.sql` — order_number_sequences, orders,
   order_items, and the three integrity trigger functions
   (`generate_order_number`, `set_order_item_snapshot`,
   `recalculate_order_totals`).
3. `20260824120003_rls_policies.sql` — RLS enablement + policies for every
   table.
4. `20260824120004_customer_identification_function.sql` —
   `identify_or_create_customer`, security-reviewed and corrected.

Full schema reference: `06_DATABASE_SCHEMA.md`. Full security rationale:
`07_SECURITY_RLS.md`. All four passed a local read-through validation
covering execution order, foreign-key acyclicity, RLS coverage, price
tamper-resistance, and idempotency — see the validation record in this
conversation's history for the itemized checklist.

## What is NOT built yet

- No screens (landing, menu, product details, cart, checkout, confirmation,
  order status, my orders, my profile) — this is the **next phase**.
- Anonymous auth is not wired into `main.dart` — intentionally deferred
  until Anonymous Sign-ins is enabled remotely (see `18_SUPABASE_SETUP.md`),
  since shipping that call now would just fail against current config.
- No delivery-fee calculation logic (no zone/fee table) — see the known
  gap noted in `07_SECURITY_RLS.md` and `10_ORDER_LIFECYCLE.md`.
- No payment gateway integration (Cash/UPI only, `payment_status` tracked
  manually — architecture allows Razorpay/other gateway to be added later
  without schema changes).

## Exact next phase

Per the original development plan, the next steps are, in order:

1. **You enable Anonymous Sign-ins** in the Supabase dashboard for
   `detqohhtihlygwxjasti` (manual dashboard action, not automatable by this
   codebase).
2. **Apply the migrations remotely** using the exact commands in
   `18_SUPABASE_SETUP.md`, only after your explicit approval to do so.
3. **Wire `signInAnonymously()`** into `main.dart`'s startup sequence.
4. **Build the screens** (Step 6 in the original plan): landing → menu →
   product details → cart → customer identification → order type →
   address → order review → confirmation → order status → my orders → my
   profile.
5. Connect the built screens to the existing repository/domain layer — the
   data layer was built ahead of the UI specifically so screens are "wire
   up," not "design from scratch."

## Where to look for what

| Question | Document |
|---|---|
| How do the tables relate? | `05_DATABASE_ARCHITECTURE.md` |
| What's the exact column/constraint list? | `06_DATABASE_SCHEMA.md` |
| How does RLS prevent cross-customer access? | `07_SECURITY_RLS.md` |
| How does customer identity/auth work? | `08_AUTHENTICATION.md` |
| How does an order get created and priced? | `10_ORDER_LIFECYCLE.md` |
| What's the approved menu and how are variants modeled? | `13_MENU_AND_PRICING.md` |
| How do I actually apply this to Supabase? | `18_SUPABASE_SETUP.md` |
