# Phase 10 — Pre-Production Audit Report

**Date:** 2026-09-08
**Commit audited:** `7f0009b` (master, synced with origin/master)
**Scope:** Audit only. No application code changed, no commits, no push, no schema/data changes.

---

## A. Tests completed and results

| Check | Result | Notes |
|---|---|---|
| `flutter analyze` | **PASS** | 1 pre-existing info lint (`use_null_aware_elements` in `supabase_customer_repository.dart:19`). Re-run this session against current commit — confirmed still the only issue. |
| `flutter test` | **PASS** (26/26) | Re-run this session — confirmed. |
| `flutter build web --release` | **PASS** | Rebuilt this session against current commit (prior build predated the last commit, a logo-asset-only change). |
| Security code review (RLS, pricing, secrets, auth) | **DONE** | See section D. |
| Data-integrity code review | **DONE** | See section E. |
| Playwright functional testing | **DONE** | See sections B/C. |
| Real Supabase round-trip | **UNVERIFIED / environment-blocked** | No Supabase MCP permission and no `--dart-define` credentials available in this environment (see below). |

**Environment note:** The Supabase MCP connector (`claude.ai Supabase`) returned `permission denied` for `get_project_url`/`get_publishable_keys`/`get_advisors` on project `detqohhtihlygwxjasti` in this session. All Playwright testing therefore ran the app in **Mock mode** (no `SUPABASE_URL`/`SUPABASE_ANON_KEY` supplied), which is the app's documented, safe fallback (`main.dart`). Backend correctness for Supabase-backed paths is assessed by **code/migration review**, not live execution, and is marked UNVERIFIED where a live round-trip would be the only real proof.

---

## B. Playwright viewport coverage

App served via `flutter run -d web-server` (chosen over a plain static file server because a plain static server 404s on any deep link — see finding in section F about `/menu`/`/cart` direct navigation; Flutter's own dev server applies the SPA index fallback, letting `/qr/:token` etc. be reached directly).

| Width | Type | Coverage |
|---|---|---|
| 320px | Mobile | Full flow spot-check: landing, menu, cart — no horizontal overflow (`scrollWidth == innerWidth` verified programmatically + screenshots) |
| 360px | Mobile | Overflow check on menu — clean |
| 375px | Mobile | Overflow check on menu — clean |
| 390px | Mobile | **Full flow**: landing → search → menu → product details → variant select → quantity → add to cart → cart → checkout (customer ID) → order type → Takeaway review → place order → confirmation → order status → My Orders → Profile → Delivery (address add, manual + GPS) → delivery review → place order → confirmation |
| 412px | Mobile | Overflow check on menu — clean |
| 430px | Mobile | Overflow check on menu — clean |
| 480px | Mobile | Overflow check on menu — clean |
| 1024px | Desktop | Screenshot review: menu, cart |
| 1280px | Desktop | Screenshot review: landing |
| 1440px | Desktop | Screenshot review: menu |

No JS console errors or warnings were logged at any point during the session (`browser_console_messages` — 0 errors, 0 warnings for the full session).

---

## C. Flow-by-flow PASS/FAIL

| # | Flow | Result | Evidence |
|---|---|---|---|
| 1 | QR entry / dining | **PARTIAL / UNVERIFIED** | Invalid/unresolvable-token fallback UX verified and correct ("This table QR code is invalid... you can still browse for takeaway or delivery"). The real resolve-to-table-context path (`resolve_dining_table` RPC → `SupabaseDiningRepository`) is code-reviewed and sound (SECURITY DEFINER, no raw token exposure) but **not live-tested** — mock mode has no table concept by design (`MockDiningRepository` always returns null), and Supabase access was unavailable this session. `TEST-QR-TOKEN-0001` is confirmed present and correctly scoped in `supabase/migrations/20260830091500_qa_test_qr_token.sql`. |
| 2 | Takeaway | **PASS** | End-to-end: order type → review (delivery charge ₹0, no address step) → place → confirmation → status. |
| 3 | Delivery | **PASS** (mock pricing) | End-to-end including address selection, distance (1.4 km) and charge (₹30) computed by `MockDeliveryPricingRepository`, review, placement, confirmation. Server-authoritative real pricing (`calculate_delivery_charge`/`set_delivery_charge` triggers) verified by **code review only** — see D. |
| 4 | Customer identification | **PASS** | Phone capture on first checkout; correctly skipped on second checkout in the same session once identity is known. |
| 5 | Address management | **PASS**, with one real gap | Manual entry, GPS ("Use Current Location") capture, save, list all work. **Gap:** an address saved via manual entry has no coordinates and is correctly *blocked* from being used for delivery ("This address has no location saved…") — safe failure, but there is no path to actually fix that address (no re-geocode, no edit-to-add-location flow observed) other than deleting and re-adding via GPS. |
| 6 | Menu | **PASS** | Categories, popular picks, product cards, images all render correctly across all tested widths. |
| 7 | Search | **PASS** | Live-filters product list correctly (tested "wrap"). |
| 8 | Categories | **PASS** | Category chip selection filters product list. |
| 9 | Product details | **PASS** | Opens correctly, shows rating/price/description. |
| 10 | Variants | **PASS** | Variant selection updates price live (₹139 → ₹219 confirmed); quantity stepper multiplies correctly (2 × ₹219 = ₹438). |
| 11 | Cart | **PASS** | Correct line items, subtotal, "Calculated at checkout" for delivery charge (never a fabricated number). |
| 12 | Checkout / review | **PASS** | Correct order summary, payment method selector, accurate totals for both Takeaway and Delivery. |
| 13 | Order placement | **PASS** (mock) | Mock order created with server-style order number (`BR-20260908-0001`). Real Supabase insert path is server-authoritative by design (see D) — **UNVERIFIED live**. |
| 14 | Confirmation | **PASS** | Correct order number, type, payment method, status, total. |
| 15 | Order status | **PASS** | Timeline renders (Placed/Confirmed/Preparing/Ready/Completed). |
| 16 | My Orders | **PASS** | Correct empty state; not tested with a populated order history because the mock backend resets per app load — not a defect, just a mock-mode limitation. |
| 17 | Profile | **PASS** | Shows persisted customer name/phone (session survived a full page reload via `SessionService`/SharedPreferences) and navigation to Saved Addresses / Order History. |

---

## D. Security findings (P0/P1/P2/P3)

**P0 / P1: None found**, consistent with the prior audit. This session's code/migration review specifically re-checked:
- `orders`/`order_items`/`customer_addresses`/`customers` RLS: all keyed strictly to `auth_user_id = auth.uid()`, ownership re-checked on both SELECT and INSERT, no client UPDATE path on `orders` (status transitions reserved for staff tooling).
- Pricing: `set_delivery_charge()` (BEFORE INSERT trigger) **recomputes distance itself** server-side from `branches`/`customer_addresses` coordinates via `haversine_km()`/`get_delivery_distance_km()` and **discards** any client-supplied `delivery_distance_km`. `delivery_charge` is likewise always server-derived; a manipulated client cannot buy a cheaper delivery band. `unit_price`/`line_total`/`product_name`/`variant_name` on order items are documented and enforced as server-overwritten (`set_order_item_snapshot()`).
- No hardcoded ₹30 (or any other) delivery charge remains in any live (Supabase-backed) code path — the only remaining `30.0` is in `MockDeliveryPricingRepository`, explicitly commented as the mock-only stand-in, isolated from `CheckoutService`/`OrderPlacementUseCase`.
- No service-role key, no secrets, in `lib/`. `SupabaseConfig` reads only `SUPABASE_URL`/`SUPABASE_ANON_KEY` via `--dart-define`; anonymous session is created only if none exists (no duplicate sign-ins on reload).
- `resolve_dining_table` RPC is SECURITY DEFINER and never exposes the raw `qr_token`; `restaurant_tables` has zero client SELECT policy.
- QA test data (`20260830090000_qa_test_dataset.sql`, `20260830091500_qa_test_qr_token.sql`) is clearly labeled ("TEST" prefix), additive-only, does not touch `core.*`/`t_tokens`/`t_results`/`t_snapshot`, and matches the authorized `TEST-QR-TOKEN-0001` token from CLAUDE.md.

**P2:**
- Live enforcement of the above RLS/pricing logic was **not exercised against the real database** this session (no Supabase access) — the design is sound on review, but "designed correctly" and "verified correctly in production" are not the same claim. Recommend a real end-to-end order placement against `detqohhtihlygwxjasti` before go-live, by someone/something with project access.
- `get_advisors` (Supabase's own security/performance advisory scan) could not be run this session — recommend running it once before go-live to catch anything outside this manual review's scope (e.g., missing indexes, function search_path drift).

**P3:**
- Landing screen shows literal placeholder text "Demo address — to be replaced with the real outlet address" — cosmetic/content-only, not a security issue, already tracked as a known content gap.

---

## E. Data-integrity findings

- Cart/pricing math verified correct client-side (subtotal, variant price swap, quantity multiplication, grand total = subtotal + delivery charge) — matches server-side recomputation logic reviewed in D, so client and server should never disagree in normal operation.
- Order number format (`BR-YYYYMMDD-####`) matches the server-side `generate_order_number()` design described in CHANGELOG.md; mock mode's client-side counter is explicitly documented as non-concurrency-safe and never used when Supabase is active.
- **Cart state does not survive a full browser reload** (in-memory `CartService`, no persistence). Not a correctness bug (no data is corrupted or double-charged), but worth flagging as a product gap: a customer who accidentally refreshes mid-order loses their cart.
- **Product detail and cart are presented as in-place overlays, not distinct `go_router` routes** — `window.location` stayed at `/menu` while viewing product details and the cart. This contradicts the CHANGELOG's claim of "real, refresh-safe URL paths... covering the full journey." In practice: refreshing while on product-details or cart returns the user to `/menu` (or 404s on a naively-configured static host, see F). Order confirmation/status *do* get real routes (`/order/:id/confirmation`, `/order/:id/status`).
- Manual-entry addresses without coordinates are correctly rejected at selection time rather than silently producing a wrong/zero delivery charge (fail-safe, not fail-open) — a data-integrity positive.

---

## F. UI/UX findings

1. **Desktop layout is not centered (violates CLAUDE.md rule 3).** Landing screen (1280px) is correctly centered with symmetric margins. However, Menu and Cart screens at 1024px/1440px are **left-aligned** with all empty space pushed to the right — not stretched (a max-width cap does exist), but not centered either. Screenshots: `audit-1024-menu.png`, `audit-1440-menu.png` (left-aligned) vs. `audit-1280-landing.png` (correctly centered).
2. Product cards on desktop menu render as full-width horizontal rows (mobile-style list), which reads closer to the "spreadsheet-like list" pattern CLAUDE.md rule 4 asks to avoid, rather than an intentional desktop grid — worth a design pass, not a functional defect.
3. Category chip row on desktop truncates the last visible label (e.g., "Boneless Strips & Bite…") at the container edge; not verified whether it's horizontally scrollable or simply clipped — needs a follow-up check with an actual pointer-drag/scroll interaction.
4. The `/menu` (and any other deep link) 404s on a plain static file server (e.g., `python -m http.server`) because there is **no deployment configuration in the repository at all** — no `firebase.json`, `netlify.toml`, `vercel.json`, or `_redirects`. This is not a code defect (a `flutter run -d web-server` dev server, and any correctly configured SPA host, serves these paths fine — verified this session), but it means **no one has yet defined what the production host's rewrite rule will be**. Flagged per the instruction not to call this an app defect — it isn't one — but it is an open deployment-readiness item.
5. No layout overflow, clipping, or broken touch targets found at any of the 7 mobile widths tested (320–480px) on landing, menu, or cart.
6. No console errors/warnings observed in any flow tested.

---

## G. Exact blockers that must be fixed before production

1. **Desktop centering (CLAUDE.md rule 3, non-negotiable).** Menu/cart/checkout-family screens must be centered on desktop widths, not left-aligned. Landing already does this correctly — the same technique should be applied to the shared desktop scaffold used by the other screens.
2. **Production deployment configuration is missing.** No SPA-fallback/rewrite config exists in the repo for any hosting target. Must be added and verified before the app is deployed anywhere real users would deep-link into it (QR codes point at specific paths, e.g. `/qr/:token` — a host without a rewrite rule will 404 every QR scan).
3. **Real Supabase round-trip is unverified.** Everything server-authoritative (pricing, order totals, item snapshots, QR/dining resolution) is sound on code/migration review but has not been exercised against the live `detqohhtihlygwxjasti` project in this audit. This must be verified with real credentials/access before go-live sign-off.

## H. Non-blocking improvements

- Give product-details and cart real `go_router` routes so refresh/deep-link doesn't drop the user back to `/menu`.
- Persist cart (e.g., SharedPreferences) so an accidental reload doesn't lose it.
- Provide a way to add coordinates to (or re-geocode) a manually-entered address without deleting and re-adding it.
- Confirm/fix desktop category-chip row scrolling so no label is unreachable.
- Replace the "Demo address" placeholder copy on the landing screen before go-live.
- Run Supabase's own `get_advisors` (security + performance) once real access is available.

---

## I. Final verdict: **NOT READY**

Rationale: no P0/P1 security defect exists, and the core customer journey (menu → cart → checkout → placement → confirmation → status, for both Takeaway and Delivery) works correctly end-to-end in this audit's testable environment. However, three concrete, reproducible items in section G — a written project-rule violation (desktop centering), a genuinely missing piece of production configuration (deployment SPA fallback), and an unverified live-backend round trip — stand between this build and a safe production release. None of the three require large engineering effort, but all three are currently unresolved and unverified.
