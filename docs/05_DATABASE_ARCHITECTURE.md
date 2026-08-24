# 05 — Database Architecture

Broastin App 1 (Customer Ordering PWA) is the **system of record** for
customers, addresses, menu, and orders. Every future Broastin application
(Operations OS, POS, KOT, KDS, Delivery Desk, Rider App, Growth OS,
Inventory OS, Admin OS) reads and writes against this same schema — it must
never be duplicated by a later app.

## Entity relationship overview

```
restaurants
    └── branches
            ├── menu_categories
            │       └── products
            │               └── product_variants
            └── order_number_sequences   (internal, not customer-facing)

customers  (identity anchor: auth_user_id, NOT phone — see 07_SECURITY_RLS.md)
    ├── customer_addresses
    └── orders
            ├── (branch_id, address_id — references branches/customer_addresses)
            └── order_items
                    └── (product_id, variant_id — references products/product_variants)
```

This is a strict DAG (no circular foreign keys). Every table that could
grow in the future (branches, menu, orders) is already branch- and
restaurant-scoped so a second Broastin outlet requires **new rows**, never a
schema change.

## Why this shape

- **restaurants → branches**: Broastin operates one outlet today, but every
  table below `branches` (menu, orders, order-number sequences) is already
  keyed by `branch_id`. Adding branch #2 is an INSERT, not a migration.
- **menu is fully database-driven**: `menu_categories`, `products`, and
  `product_variants` hold every piece of copy and pricing the app renders.
  Nothing menu-related is hard-coded in Flutter — see
  `13_MENU_AND_PRICING.md`.
- **customers is decoupled from phone number**: ownership of a customer
  record is anchored to `auth_user_id` (a Supabase Auth identity), not to
  `phone`. See `07_SECURITY_RLS.md` and `08_AUTHENTICATION.md` for the full
  reasoning — this was a deliberate correction made after a security review,
  not the original design.
- **orders/order_items preserve history**: `order_items.unit_price`,
  `product_name`, and `variant_name` are snapshotted at the moment of
  purchase and are never recalculated from current `products`/
  `product_variants` data, even if the menu price changes the next day. See
  `10_ORDER_LIFECYCLE.md`.

## Consumption by future systems

Every future app should read this schema, not re-derive its own copy:

- **Operations OS / POS / KDS**: consume `orders` + `order_items` via
  `order_status` transitions (see `10_ORDER_LIFECYCLE.md`). No table
  redesign should be needed — only new consumers of the existing
  `order_status` enum and new UPDATE policies scoped to staff roles.
- **Growth OS**: consumes `customers` + `orders` for CRM/analytics. Note the
  known limitation in `08_AUTHENTICATION.md` — until real OTP auth exists,
  the same real person may appear as more than one `customers` row across
  devices; reconciling that is explicitly a Growth OS-era concern, not
  something App 1 resolves.
- **Inventory OS**: would consume `products`/`product_variants` and likely
  add its own tables referencing `products.id` — additive, not disruptive.

## Source of truth

The migration files under `supabase/migrations/` are the authoritative
schema definition. This document (and `06_DATABASE_SCHEMA.md`) describe
that schema for humans — if they ever disagree, the SQL wins.
