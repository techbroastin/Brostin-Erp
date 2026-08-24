# 10 — Order Lifecycle

## Status model

```
order_status:
  placed → confirmed → preparing → ready → out_for_delivery → delivered → completed
                                                              (or cancelled at any point)

payment_status:
  pending → paid | failed | cancelled
```

App 1 only ever writes `order_status = 'placed'` and
`payment_status = 'pending'` at creation (enforced by the
`orders_insert_own` RLS `WITH CHECK`). No further transitions are
implemented in App 1 — advancing an order through `confirmed` →
`completed` (or handling `payment_status` becoming `paid`/`failed`) is
explicitly future Operations OS / staff tooling. `orders` has **no UPDATE
policy** for customers at all, so this is enforced at the database level,
not just by omission in the Flutter app.

## Order creation sequence

```
1. Client validates cart/order-type/address locally (fast-fail UX only)
        ↓
2. INSERT into orders
   - client supplies: customer_id, branch_id, address_id, order_type,
     payment_method, and best-effort subtotal/delivery_charge/grand_total
   - BEFORE INSERT trigger generate_order_number() assigns order_number
     atomically (see below)
   - RLS orders_insert_own checks: customer_id belongs to the caller's
     auth_user_id, order_status = 'placed', payment_status = 'pending'
        ↓
3. INSERT into order_items (one batch, referencing the new order.id)
   - client supplies: order_id, product_id, variant_id (if any), quantity
        ↓
4. Per row, BEFORE INSERT trigger set_order_item_snapshot() fires:
   - looks up the live products/product_variants row
   - rejects the row if the product or variant is_available = false
   - rejects the row if variant_id doesn't belong to product_id
   - overwrites product_name, variant_name, unit_price, line_total with
     the real, current values — client-supplied values for these four
     columns are discarded
        ↓
5. Per row (after the write), AFTER INSERT trigger
   recalculate_order_totals() fires:
   - recomputes orders.subtotal = SUM(order_items.line_total) for that order
   - recomputes orders.grand_total = subtotal + delivery_charge - discount
   - UPDATEs the orders row directly (bypasses RLS as a SECURITY DEFINER
     function owned by the table owner — customers have no UPDATE policy
     on orders, and don't need one for this)
        ↓
6. Client re-fetches (or receives via .select()) the now-authoritative
   order — order_number, subtotal, and grand_total reflect server-computed
   truth, not whatever was optimistically sent in step 2.
```

This exact sequence — **order creation → order item insertion → server
price snapshot → totals recalculation** — is what closes the client-side
price-tampering gap described in `07_SECURITY_RLS.md`.

## Order number generation

Format: `BR-YYYYMMDD-####` (e.g. `BR-20260824-0001`), assigned entirely by
`generate_order_number()` — never by the Flutter client.

```sql
insert into order_number_sequences (branch_id, sequence_date, last_number)
values (new.branch_id, current_date, 1)
on conflict (branch_id, sequence_date)
do update set last_number = order_number_sequences.last_number + 1
returning last_number into v_seq;
```

This single atomic upsert is safe under concurrent orders: Postgres takes a
row lock on the conflicting `(branch_id, sequence_date)` key, so two
simultaneous inserts for the same branch/day are serialized by the
database itself — never both reading the same `last_number`. Uniqueness is
additionally guaranteed at the column level (`orders.order_number` is
`UNIQUE`), so even a hypothetical bug in the sequence logic would fail loud
(constraint violation) rather than silently duplicate a number.

`id` (uuid) remains the internal key used by every foreign key and every
future service (Operations OS, POS, KDS). `order_number` is purely the
customer/reception/kitchen-facing label.

**Future multi-branch numbering** (e.g. `BR-VEM-YYYYMMDD-####`) only
requires changing this function's format string for new orders — existing
`order_number` values are static text and are never touched retroactively.

## Historical price integrity

`order_items.unit_price`/`product_name`/`variant_name`/`line_total` are
fixed at insert time by `set_order_item_snapshot()` and never
recalculated. If a product's price changes in `products` tomorrow, every
`order_items` row created today keeps today's price — there is no
UPDATE policy that would let a client (or an accidental process) rewrite
historical order data, and no trigger re-syncs old orders to new prices.

## What App 1 explicitly does not do

- Does not transition `order_status` past `placed` (no kitchen/ops logic).
- Does not validate `delivery_charge` against a real fee rule (no delivery
  zone/fee table exists yet — see `07_SECURITY_RLS.md` known gap).
- Does not implement discounts/coupons (`discount` is hard-locked to `0`).
- Does not implement live rider tracking — only a status timeline.
