# 07 — Security & Row Level Security

## Core principle

**Customer identification (phone number) is separate from authorization
(who can read/write a customer's data).** Phone number is an input value
used to populate a contact field. It is never consulted to decide who owns
a row. Ownership is decided exclusively by:

```
auth_user_id = auth.uid()
```

This was the outcome of an explicit security review (see the corrected
`identify_or_create_customer` function) after the original design — global
`UNIQUE(phone)` plus phone-based lookup — was found to create a scenario
where a different anonymous session typing an existing phone number would
receive a `customer_id` it could never actually write to, and where the
function's `is_new_customer` return value leaked whether a given phone
number had ever been used before (a minor enumeration risk). Both are
closed by the current design.

## RLS policy inventory

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|---|
| restaurants | enabled | `anon, authenticated`: `true` | — | — | — |
| branches | enabled | `anon, authenticated`: `is_active = true` | — | — | — |
| menu_categories | enabled | `anon, authenticated`: `is_active = true` | — | — | — |
| products | enabled | `anon, authenticated`: `is_available = true` | — | — | — |
| product_variants | enabled | `anon, authenticated`: `is_available = true` | — | — | — |
| customers | enabled | `authenticated`: `auth_user_id = auth.uid()` | none (only via RPC) | `authenticated`, own row only | — |
| customer_addresses | enabled | `authenticated`, own customer only (all 4 ops via one `FOR ALL` policy) | same | same | same |
| orders | enabled | `authenticated`, own customer only | `authenticated`, own customer + `order_status='placed'` + `payment_status='pending'` | none | — |
| order_items | enabled | `authenticated`, via owned order | `authenticated`, via owned order **and** `order.order_status = 'placed'` | none | none |
| order_number_sequences | enabled | none | none | none | none |

Menu tables are readable by `anon` (no session at all) **and**
`authenticated` — this is required: a customer must be able to browse the
menu before providing a phone number or completing anonymous sign-in (see
`08_AUTHENTICATION.md`).

Customer/address/order tables are scoped `to authenticated` only — this is
correct, not an oversight: Supabase anonymous sign-in authenticates the
session as Postgres role `authenticated` (with an `is_anonymous: true` JWT
claim), not `anon`. `anon` only applies to a request with no session/JWT at
all.

`orders` and `order_items` deliberately have **no UPDATE policy** for
customers — order/payment status transitions belong to future Operations OS
/ staff tooling, never to the customer-facing app.

## Threat model: can session A access customer B's data?

**No.** Walking through it explicitly:

- A cannot `SELECT` B's `customers` row — RLS requires `auth_user_id = auth.uid()`, and A's `auth.uid()` will never equal B's.
- A cannot call `identify_or_create_customer(B's phone)` and receive write access to B's row — the function inserts/updates keyed on **A's own** `auth_user_id` via `INSERT ... ON CONFLICT (auth_user_id) DO UPDATE`. There is no code path in the function that looks up or mutates a row by `phone` alone. If B's phone is typed by A, a **second, separate** `customers` row is created for A — not a reference to B's row.
- A cannot read or write B's `customer_addresses` or `orders` — both are gated through a join back to `customers` requiring `c.auth_user_id = auth.uid()`.
- A cannot read B's `order_items` — gated through `orders` → `customers` the same way.

**Documented consequence, not a bug:** because phone is no longer globally
unique, the same real person ordering from two different browsers/devices
before completing real OTP verification will appear as two separate
`customers` rows sharing a phone number. Reconciling those into one CRM
identity is deferred to a future OTP-based identity merge (Supabase
supports linking an anonymous session to a verified phone identity in
place, preserving `auth.uid()` — no data migration needed when that
ships) or a backend/Growth OS merge process. This is the deliberate
trade-off of shipping without real authentication in App 1 MVP.

## SECURITY DEFINER functions — abuse review

| Function | Why SECURITY DEFINER is needed | Abuse check |
|---|---|---|
| `identify_or_create_customer` | Must create/update a `customers` row on the caller's behalf, which the caller has no direct INSERT grant to do | Reviewed above — cannot touch another `auth_user_id`'s row. `search_path = public`, fully schema-qualified. `REVOKE ALL FROM PUBLIC`, `GRANT EXECUTE TO anon, authenticated` only. Raises an exception if `auth.uid()` is null rather than degrading into an insecure state. |
| `generate_order_number` | Must write to `order_number_sequences`, which has zero client policies | Runs only as a trigger on `orders` insert, cannot be invoked to burn sequence numbers directly — `REVOKE ALL FROM PUBLIC` closes that off defensively |
| `set_order_item_snapshot` | Must read authoritative pricing and overwrite client-supplied fields on `order_items`, which the client has no UPDATE grant to do post-insert | Runs only as a BEFORE INSERT trigger; `REVOKE ALL FROM PUBLIC` |
| `recalculate_order_totals` | Must UPDATE `orders.subtotal`/`grand_total`, which customers have no UPDATE policy for at all | Runs only as an AFTER INSERT/UPDATE/DELETE trigger on `order_items`; `REVOKE ALL FROM PUBLIC` |

None of these functions accept caller-supplied identifiers that bypass
ownership checks — the only externally-callable one
(`identify_or_create_customer`) is keyed exclusively off `auth.uid()`, which
the caller cannot forge (it's derived from their JWT by Postgres itself,
not passed as a parameter).

## Client price-tampering — closed

A client (including someone calling the REST API directly with the public
anon key, bypassing the Flutter UI entirely) **cannot** manipulate:

- `order_items.unit_price`, `product_name`, `variant_name`, `line_total` —
  all four are overwritten by `set_order_item_snapshot()` from the real
  `products`/`product_variants` row, regardless of what was submitted.
- `orders.subtotal`, `grand_total` — both are overwritten by
  `recalculate_order_totals()` from the actual server-priced `order_items`
  once they exist.
- `orders.discount` — hard-locked to `0` by a CHECK constraint; no discount
  system exists yet.
- Ordering an unavailable product or variant — `set_order_item_snapshot()`
  raises an exception if `products.is_available = false` or the referenced
  `product_variants.is_available = false`, or if `variant_id` doesn't
  actually belong to `product_id`.
- Attaching a `delivery_charge` to a `takeaway` order — blocked by the
  `takeaway_has_no_delivery_charge` CHECK constraint. A `delivery` order
  can and should carry one.

**Known, deliberately deferred gap:** the *amount* of `delivery_charge` for
a `delivery` order is not yet validated against any real fee rule, because
no delivery-zone/fee table exists in App 1 MVP. This is documented in the
migration comments and left for Step 11 rather than inventing delivery-fee
business logic prematurely.

## Historical price immutability

`order_items` has no UPDATE policy for the `authenticated` role at all —
once written by `set_order_item_snapshot()`, a row cannot be altered by the
client. If `products.price` changes later, existing `order_items` rows are
untouched — there is no trigger or process that re-syncs historical order
data to current menu prices.
