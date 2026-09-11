# Phase 11B — Live Supabase E2E Verification Report

**Date:** 2026-09-11
**Authorized project:** `detqohhtihlygwxjasti` (`https://detqohhtihlygwxjasti.supabase.co`) — confirmed correct target before any call.
**Access mechanism:** The `claude.ai Supabase` MCP connector does **not** have permission on this project (same blocker as Phase 10 — `list_projects`/`get_project_url` only surface two unrelated projects, and a direct `get_project_url` call on `detqohhtihlygwxjasti` returned "You do not have permission to perform this action"). This session's Supabase CLI (`npx supabase`, already logged in and linked per `supabase/.temp/project-ref`) **does** have legitimate access to the authorized project — this is the "other safe existing project-access mechanism" the phase brief allowed for. It was used only to fetch the project's public anon key (client-safe by design), then all verification below was performed as a real anonymous customer session over the public REST/Auth API (`https://detqohhtihlygwxjasti.supabase.co`), exactly as the Flutter app itself would call it. No service-role key was used for any read, write, or RPC in this verification, and none is recorded anywhere in this report.

No schema, migration, RLS policy, or function was created, altered, or dropped. No `core.*`, `t_tokens`, `t_results`, or `t_snapshot` object was touched.

---

## A/B. Checks performed and results

| # | Check | Result | Notes |
|---|---|---|---|
| 1 | Anonymous auth: session creation | **PASS** | `POST /auth/v1/signup` with empty body → HTTP 200, `is_anonymous:true`, `auth.uid()` populated. |
| 1 | Anonymous auth: `auth.uid()` exists / role | **PASS** | Confirmed via subsequent RPC/table calls keying correctly off the returned user id. |
| 1 | Anonymous auth: session persistence | **PASS** | `POST /auth/v1/token?grant_type=refresh_token` returned a new access token for the **same** user id, `is_anonymous:true` — matches app reload behavior. |
| 2 | Public menu reads: restaurant | **PASS** | `GET /rest/v1/restaurants` → 200, returned the TEST restaurant row. |
| 2 | Public menu reads: branch | **PASS** | `GET /rest/v1/branches` → 200, returned the TEST branch with real lat/long. |
| 2 | Public menu reads: categories | **PASS** | `GET /rest/v1/menu_categories` → 200. |
| 2 | Public menu reads: products | **PASS** | `GET /rest/v1/products` → 200. |
| 2 | Public menu reads: variants | **PASS** | `GET /rest/v1/product_variants` → 200. |
| — | QR dining resolution (`resolve_dining_table`) | **PASS** | Authorized test token `TEST-QR-TOKEN-0001` → resolved to a real `table_id`/`branch_id`/`table_number`. An invalid token returned `[]` (no error, no info leak). Direct `SELECT` on `restaurant_tables` returned `[]` (zero client policy enforced, as designed). This resolves the Phase 10 blocker item #1 (QR dining was previously code-review-only). |
| 3 | Customer identification via `identify_or_create_customer` | **PASS** | Called from an anonymous session → created a new customer row owned by that session's `auth.uid()`. |
| 3 | Ownership anchored to `auth.uid()`, not phone | **PASS** | A second, independent anonymous session called the same RPC with the **identical phone number** and received its **own separate** customer row — no merge, no cross-session visibility. Each session's direct `SELECT` on `customers` returned only its own row. |
| 4 | Address create/use (customer-owned) | **PASS** | Created an address with real coordinates for session A. |
| 4 | Address ownership protection | **PASS** | Session B's attempt to `SELECT` or `DELETE` session A's address by id both returned `[]` (0 rows matched/affected); session A confirmed the address was untouched. |
| 5 | Delivery pricing: real coordinates | **PASS** | `calculate_delivery_charge(branch_id, address_id)` returned `distance_km: 0.9358…`, `charge: 49.00`, matching the haversine distance between the TEST branch and the test address. |
| 5 | Delivery pricing: server-authoritative distance | **PASS** | Session B (non-owner of the address) got `distance_km: null, charge: null` from the same RPC — the ownership check inside the function itself (not just RLS) held. |
| 5 | Delivery pricing: spoofed client distance/charge rejected on real order | **PASS** | Placed a real `delivery` order sending `delivery_distance_km: 0.01` and `delivery_charge: 1.00`. Server overwrote them to `delivery_distance_km: 0.94`, `delivery_charge: 49.00` — the exact server-computed values, discarding the client's numbers entirely. |
| 5 | Delivery pricing: missing/invalid coordinates rejected | **PASS** | A second address with no lat/long: preview RPC returned `null/null`; a real order-placement attempt against it was **rejected outright** (`HTTP 400`, `P0001`, "Delivery distance could not be determined… missing coordinates or the address does not belong to this customer") — no order was created. |
| 6 | Order placement: TEST takeaway order | **PASS** | Created; server-generated `order_number` `BR-20260911-0001`. |
| 6 | Order placement: TEST delivery order | **PASS** | Created; server-generated `order_number` `BR-20260911-0002`. |
| 6 | Server-side product/variant snapshot | **PASS** | Inserted an order item with a fabricated `unit_price: 1.00`, `product_name: "HACKED NAME"`, `line_total: 2.00`. Server overwrote to the real `unit_price: 199.00`, `product_name`, `variant_name`, `line_total: 398.00`. |
| 6 | Subtotal/grand total | **PASS** | Takeaway: subtotal/grand_total auto-recalculated from a fake `1.00` to the correct `398.00` once the (server-priced) item existed. Delivery: `grand_total` = `199.00 + 49.00` = `248.00` exactly, using the server's subtotal and server's delivery charge — not either client-supplied number. |
| 6 | Delivery charge (order-level) | **PASS** | Covered above — server-derived `49.00`, client's `1.00` discarded. |
| 6 | Client-supplied pricing cannot override server values | **PASS** | Demonstrated on all three axes: item price, delivery distance, delivery charge — all client input was discarded and replaced. |
| 7 | Customer retrieves only own orders | **PASS** | Session A's `GET /orders` listed exactly its 2 test orders; session B's `GET /orders` returned `[]`; session B's direct fetch of session A's order by id returned `[]`. |
| 7 | Order status retrieval | **PASS** | `order_status: "placed"` correctly readable on both test orders. |
| 8 | RLS: cannot spoof another customer's ownership on insert | **PASS** | Session B attempting to insert an order using session A's `customer_id` was rejected: `HTTP 403`, `42501`, "new row violates row-level security policy for table \"orders\"". |
| 8 | RLS: no customer UPDATE path on order status | **PASS** | Session A's own `PATCH .../orders?id=eq...` with `order_status: "completed"` returned `[]` (0 rows updated — no UPDATE policy exists for the customer role on `orders`, by design). Re-fetch confirmed `order_status` was still `"placed"`. |
| 8 | No policy weakened to make any test pass | **PASS** | Zero schema/RLS/function changes made this phase. |

**Flutter validation:**

| Command | Result |
|---|---|
| `flutter analyze` | **PASS** — 1 pre-existing info lint (`use_null_aware_elements`, unchanged from Phase 10). |
| `flutter test` | **PASS** — 26/26. |
| `flutter build web --release` | **PASS**. |

---

## C. Evidence summary

- Anonymous auth user (session A): `c4e27567-…-8593a76979c0` (test-only, anonymous, no PII).
- Anonymous auth user (session B): `ff60af31-…-c434acca97b4` (test-only, anonymous, no PII).
- Test customer A: `3a788e50-0e4c-4b5f-9826-289dcb78b32d`, phone `+919999900001` (fictitious test number), name "QA E2E Test A".
- Test customer B: `05641632-45bd-4104-856d-91fb996eec04`, same fictitious phone, name "QA E2E Test B" — proves phone is not an ownership key.
- Test address (with coordinates, still referenced by the delivery order below): `d5cff66c-4f8b-4fb1-9ffa-0d61e6102191`.
- Test orders: `BR-20260911-0001` (takeaway, `grand_total 398.00`), `BR-20260911-0002` (delivery, `grand_total 248.00`, server `delivery_charge 49.00`, server `delivery_distance_km 0.94`).
- All against the existing `TEST Broastin Restaurant` / `TEST Branch - QA Only` seed data from `20260830090000_qa_test_dataset.sql` — no new restaurant/branch/product created.

No secrets (anon key, JWTs, or any key material) are reproduced in this report.

---

## D. Security/data-integrity issues found

**None.** Every boundary the phase brief asked to exercise held under a real, adversarial attempt against the live database — not just code review:
- Cross-session customer identity isolation (same phone, two separate rows).
- Address read/delete ownership.
- Delivery distance/charge computed server-side and provably discards client input.
- Missing-coordinate delivery correctly fails closed (order rejected, not silently mispriced).
- Order item price/name snapshot cannot be tampered with via direct REST calls.
- Order insert cannot be attributed to another customer.
- No client path exists to mutate order status.

## E. Phase 10 live-Supabase blocker: **RESOLVED**

All three "UNVERIFIED / environment-blocked" items from `PHASE_10_AUDIT_REPORT.md` section G/I are now live-verified:
1. QR → `resolve_dining_table` round trip — verified live with the authorized `TEST-QR-TOKEN-0001`.
2. Real Supabase order placement (server-authoritative pricing, snapshots, totals) — verified live for both takeaway and delivery.
3. RLS/ownership boundaries — verified live under actual adversarial attempts (spoofed customer_id, spoofed distance/charge, cross-session address/order access), not just migration review.

The other two Phase 10 blockers (desktop centering, missing deployment/SPA-fallback config) are **out of scope for this phase** and remain open — this phase touched neither.

## F. Blockers discovered this phase

None. No application code was changed (none was needed — no defect found).

**Residual test data (not a blocker, disclosed for transparency):** The customer/anon role has no client-facing DELETE path for `orders`, `order_items`, or `customers` (by design — see RLS policies), so the 2 test orders, their order items, and the 2 test customers created during this verification could not be cleaned up through the same authorized customer-role channel used for all other calls in this phase, and were not removed via service-role (which would bypass the very RLS being verified and is outside this phase's authorization). One unreferenced test address (no coordinates) was cleaned up successfully via the normal customer-owned DELETE path. All residual rows are clearly test-shaped (fictitious phone number, `TEST`-branded restaurant/branch/product, `QA E2E Test` names) and touch no protected object. Recommend a follow-up controlled cleanup migration (per rule 19) if/when desired — not performed here since it wasn't safely reachable through the sanctioned client path and this phase does not authorize a schema/data migration.

## G. Final verdict: **PASS**

Live round-trip verification against the authorized `detqohhtihlygwxjasti` project succeeded across auth, menu reads, QR dining resolution, customer identification, address ownership, server-authoritative delivery pricing (including adversarial spoofing attempts), order placement with tamper-resistant snapshots/totals, order retrieval, and RLS ownership boundaries. No security or data-integrity defect was found. The Phase 10 "real Supabase round-trip unverified" blocker is resolved.
