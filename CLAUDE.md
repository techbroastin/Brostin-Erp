# BROASTIN QR CUSTOMER ORDERING APP — CLAUDE CODE RULES

## 1. PROJECT PURPOSE
This repository is the Broastin customer-facing QR Scan & Order application.

Primary journey:
QR scan → restaurant/branch context → menu → product → cart → Dining / Takeaway / Delivery → customer identification → address when required → checkout → order placement → confirmation → order status → My Orders / Profile.

This is a customer ordering product, NOT a POS, admin dashboard, staff system, or internal CRM.

## 2. NON-NEGOTIABLE PRODUCT PRIORITY

### UI/UX FIRST
For every new feature:
1. Design/define the customer UI/UX first.
2. Implement the UI.
3. Fully test the UI.
4. Only then implement backend/database/integration work required by that feature.
5. Fully test the integrated feature.

Do not begin with database changes when the customer experience has not been defined.

The experience should be a polished modern food-ordering app using Zomato/Swiggy-class interaction patterns as inspiration. Do NOT copy proprietary code, branding, logos, assets, or exact screens. Broastin branding remains the source of truth.

## 3. PLATFORM PRIORITY

### Mobile is PRIMARY
Required mobile QA widths:
320px, 360px, 375px, 390px, 412px, 430px, 480px.

Mobile must have no horizontal overflow, clipped content, unusable touch targets, broken scrolling, or broken keyboard/input behavior.

### Desktop is NON-BLOCKING FOR THE CUSTOMER APP
Desktop is not a customer-facing production requirement. Real customer usage is phone QR scanning; desktop-class UI is the domain of separate Admin/POS applications, not this app.

Desktop widths (1024px, 1280px, 1440px) may still be spot-checked for basic usability (no crashes, no unusable controls), and existing desktop layout should not be regressed. But desktop visual polish — centering, layout redesign, spacing — is NOT a blocker for shipping the customer app and must not be treated as a release-gating defect. Do not spend implementation time centering or redesigning customer screens for desktop.

## 4. UI QUALITY STANDARD
The menu and ordering experience should have:
- strong food imagery
- attractive product cards
- clear names and short descriptions
- prominent prices
- obvious Add actions
- quantity controls
- category navigation
- search
- featured/popular discovery
- sticky cart
- simple checkout
- clear order status

Primary hierarchy:
FOOD IMAGE → PRODUCT NAME → SHORT DESCRIPTION → PRICE → ADD

Avoid static poster layouts, spreadsheet-like lists, excessive borders/text, tiny typography, giant empty spaces, and dashboard patterns.

## 5. ORDER TYPES
Exactly:
- Dining
- Takeaway
- Delivery

Dining is available when valid QR/table context exists and the QR determines restaurant, branch, and table.

Takeaway has no table/address and zero delivery charge.

Delivery requires address, coordinates when required, distance, and server-side delivery pricing.

Never reintroduce the old hardcoded ₹30 delivery charge.

## 6. QR REQUIREMENTS
QR is a core feature:
QR → resolve table → establish restaurant/branch/table context → menu → ordering.

QR tokens are opaque. Do not hardcode production QR tokens, table IDs, or branch IDs.

Authorized development test token:
`TEST-QR-TOKEN-0001`

Do not use this as a production QR token.

## 7. SUPABASE PROJECT SAFETY
Authorized Broastin Supabase project:
`detqohhtihlygwxjasti`

This project is shared with an unrelated POS/staff-PIN prototype.

NEVER TOUCH:
- `core.*`
- `public.t_tokens`
- `public.t_results`
- `public.t_snapshot`

Do not touch another Supabase project. Never create a new Supabase project unless explicitly authorized.

Never reset the database, run destructive migrations, drop unrelated objects, disable/bypass RLS, put service-role credentials into Flutter, modify unrelated Auth settings, create unnecessary Storage buckets, or install unnecessary extensions.

## 8. EXISTING SUPABASE ARCHITECTURE
Reuse existing working architecture:
- SupabaseService
- anonymous authentication/session handling
- MenuRepository / SupabaseMenuRepository
- CustomerRepository / SupabaseCustomerRepository
- OrderRepository / SupabaseOrderRepository
- CartService
- CheckoutService
- SessionService
- AddressDraftHolder
- GeolocationService
- OrderPlacementUseCase

Do not rewrite working architecture merely to implement a visual change.

## 9. DATABASE SECURITY / PRICING
The database is authoritative for:
- product price
- product/variant snapshot
- order subtotal
- delivery charge
- grand total

Client-supplied prices are never trusted. Do not duplicate final delivery-pricing authority inside Flutter.

## 10. AUTHENTICATION
The customer app uses Supabase Anonymous Sign-in.

- Create an anonymous session only when one does not already exist.
- Do not create duplicate anonymous sessions on reload.
- Do not add email/password, OAuth/social login, or phone OTP unless explicitly authorized.
- Never put a service-role key in the client.

## 11. MENU CONTENT
Temporary development menu may use the approved provisional:
- 8 categories
- 25 products
- 15 variants

Categories include:
Broasted Chicken, Burgers, Wraps & Twisters, Strips & Bites, Alfaham, Sharing Feasts, Add-ons, Beverages.

The Broastin menu reference image is a visual/content reference, not a static poster to embed. Use individual food imagery where available. Keep `imageUrl` support intact.

## 12. PLAYWRIGHT IS REQUIRED FOR UI QA
Flutter widget tests alone are insufficient for customer UI acceptance.

Use Playwright for browser-level testing and actual interaction:
navigate, click/tap, scroll, type, select, add products, change quantities, open product detail, cart, order type, address, checkout, placement where test data permits, confirmation and status.

If normal Playwright clicks fail because of Flutter canvas hit-testing, use the previously validated browser interaction technique.

## 13. UI TESTING
For UI phases, test relevant required viewport sizes.

Verify:
- no overflow/clipping/overlap
- fixed/sticky controls work
- buttons remain usable
- navigation and scrolling work
- product cards and checkout remain usable

If a genuine defect is found:
1. reproduce
2. identify root cause
3. fix
4. rerun affected Playwright test
5. rerun relevant Flutter validation

## 14. REAL VS MOCK
Always distinguish:
- mocked behavior
- local behavior
- real Supabase behavior
- complete end-to-end behavior
- environment-blocked behavior

Never report a critical journey as fully passed when a backend step was not actually executed. If automated GPS is unavailable, explicitly mark that portion environment-blocked.

## 15. TEST DATA
Use only authorized development/test data.

Do not silently insert data. Before any new database write, identify exact rows/tables and why they are required. Do not delete test data automatically unless explicitly authorized.

## 16. PHASE DISCIPLINE — STRICT
Mandatory workflow:

**One phase → implement → full test → report → `/clear` → next phase**

Never combine unrelated phases. Never start the next phase before reporting the current phase.

After a phase:
1. run required tests
2. produce concise phase report
3. STOP
4. user runs `/clear`
5. next phase begins

Do not continue automatically into the next phase.

## 17. TOKEN / CONTEXT EFFICIENCY
Claude Code usage is limited. Minimize token consumption.

DO:
- inspect only files relevant to the current phase
- reuse established information
- read project docs before rediscovering architecture
- make focused changes
- run targeted tests during development
- run full validation once at phase end
- keep reports concise
- use short phase-specific prompts

DO NOT:
- repeatedly audit the entire project
- repeatedly rediscover Supabase architecture
- reread unrelated files
- repeat already-proven tests without a reason
- rebuild working components
- perform speculative refactors
- create unnecessary artifacts
- run expensive commands repeatedly
- start multiple unrelated tasks in one phase

When enough evidence exists, stop investigating and implement.

## 18. CHANGE DISCIPLINE
Before modifying code:
- inspect current implementation
- understand existing patterns
- make the smallest appropriate change

Do not introduce architectural complexity without a concrete requirement. Do not silently change product behavior during UI work.

## 19. DATABASE CHANGE GATE
Any remote Supabase database modification is a controlled operation.

Before applying a migration:
1. show exact intended change
2. verify target project
3. run dry-run
4. confirm exact pending migration(s)
5. confirm no seeds/roles/unrelated changes
6. apply
7. verify remotely

Never run `db reset`, migration repair, or destructive schema changes without explicit authorization.

## 20. FINAL TEST REQUIREMENTS
At the end of a major UI/application phase, normally run:
- `flutter analyze`
- `flutter test`
- `flutter build web`
- Playwright browser testing

For backend-dependent phases, verify real Supabase behavior.

Build success alone is never sufficient.

## 21. FINAL REPORT
Keep reports concise.

Include:
- Phase
- What was implemented
- Files changed
- Tests
- UI viewport coverage
- Bugs found/fixed
- Backend/database changes
- Result: PASS / PARTIAL / BLOCKED / FAIL
- Remaining work

Then STOP.

## 22. BROASTIN BRAND IDENTITY

**Canonical/official Broastin logo (permanent record):**

`assets/branding/broastin/logo/broastin logo.png`

This is the one and only official Broastin brand logo file. It is registered
as a Flutter asset in `pubspec.yaml`.

- The logo must **not** be redesigned, replaced, substituted, recreated, or
  regenerated (including by AI image generation) under any circumstances,
  unless the user explicitly provides a new logo file and explicitly
  instructs that it replace the current one.
- `assets/ui-reference/broastin-menu-reference.png` is a **UI/menu content
  reference only** — it is NOT the logo, must never be treated as the logo,
  and must never be used as a substitute for the logo in the app UI.
- The on-disk folder/file casing exactly matches the path above
  (`assets/branding/broastin/logo/broastin logo.png`) — normalized so the
  asset also resolves correctly on case-sensitive filesystems (Linux CI,
  strict macOS volumes), not just case-insensitive ones.

## 23. PRODUCT ACCEPTANCE
The goal is a polished Broastin customer ordering product that works from QR scan through order completion.

Acceptance requires:
- attractive customer UI
- mobile-first experience (production requirement)
- basic desktop usability, non-blocking (see rule 3 — desktop polish is Admin/POS scope, not a customer-app release gate)
- QR dining
- takeaway
- delivery
- search/menu discovery
- cart
- checkout
- customer session
- server-authoritative pricing
- order placement
- confirmation
- order status
- Playwright interaction testing
- responsive QA
- secure Supabase integration

Always prioritize customer experience first. Protect existing working architecture. Minimize Claude Code context/token usage. Complete one phase before starting another.
