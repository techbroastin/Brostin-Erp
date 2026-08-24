# 06 — Database Schema Reference

Authoritative source: `supabase/migrations/*.sql`. This is a human-readable
mirror of those files as of the last security review. All primary keys are
`uuid default gen_random_uuid()`; all tables with an `updated_at` column
have a `BEFORE UPDATE` trigger that touches it automatically.

## restaurants
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| tagline | text | |
| logo_url | text | |
| created_at / updated_at | timestamptz | |

## branches
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| restaurant_id | uuid FK → restaurants(id) ON DELETE CASCADE | NOT NULL |
| name | text NOT NULL | |
| branch_code | text | reserved for future order-number prefixing (e.g. `VEM`) |
| address, phone | text | |
| latitude, longitude | numeric(9,6) | |
| is_active | boolean NOT NULL default true | |
| opening_hours | jsonb | |
| created_at / updated_at | timestamptz | |

Index: `idx_branches_restaurant_id`

## menu_categories
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| branch_id | uuid FK → branches(id) ON DELETE CASCADE | nullable |
| name | text NOT NULL | |
| display_order | integer NOT NULL default 0 | |
| is_active | boolean NOT NULL default true | |
| created_at / updated_at | timestamptz | |

Index: `idx_menu_categories_branch_id`

## products
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| category_id | uuid FK → menu_categories(id) ON DELETE CASCADE | NOT NULL |
| name | text NOT NULL | |
| description | text | |
| price | numeric(10,2) NOT NULL | `check (price >= 0)`; base/"from" price when variants exist |
| image_url | text | |
| is_available | boolean NOT NULL default true | |
| display_order | integer NOT NULL default 0 | |
| is_demo | boolean NOT NULL default false | true for seed/demo menu items |
| created_at / updated_at | timestamptz | |

Index: `idx_products_category_id`

## product_variants
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| product_id | uuid FK → products(id) ON DELETE CASCADE | NOT NULL |
| name | text NOT NULL | e.g. "Solo", "Meal", "Quarter" |
| price | numeric(10,2) NOT NULL | `check (price >= 0)` |
| is_default | boolean NOT NULL default false | |
| display_order | integer NOT NULL default 0 | |
| is_available | boolean NOT NULL default true | |
| created_at / updated_at | timestamptz | |

Index: `idx_product_variants_product_id`
A product with **zero** variant rows is sold at `products.price` directly.

## customers
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| auth_user_id | uuid UNIQUE FK → auth.users(id) ON DELETE SET NULL | nullable; **the sole ownership anchor** — see `07_SECURITY_RLS.md` |
| phone | text NOT NULL | `check (phone ~ '^\+91[6-9][0-9]{9}$')`. **Intentionally NOT unique** — see `07_SECURITY_RLS.md` |
| name | text | nullable |
| created_at / updated_at | timestamptz | |

## customer_addresses
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| customer_id | uuid FK → customers(id) ON DELETE CASCADE | NOT NULL |
| label | text NOT NULL default 'Home' | `check (label in ('Home','Work','Other'))` |
| house_building | text NOT NULL | |
| street, area, landmark | text | |
| pincode | text NOT NULL | `check (pincode ~ '^[0-9]{6}$')` |
| latitude, longitude | numeric(9,6) | optional |
| delivery_notes | text | |
| is_default | boolean NOT NULL default false | |
| created_at / updated_at | timestamptz | |

Index: `idx_customer_addresses_customer_id`

## order_number_sequences
| Column | Type | Notes |
|---|---|---|
| branch_id | uuid FK → branches(id) ON DELETE CASCADE | part of composite PK |
| sequence_date | date | part of composite PK |
| last_number | integer NOT NULL default 0 | |

`PRIMARY KEY (branch_id, sequence_date)`. Internal only — RLS enabled, zero
client policies; only `generate_order_number()` touches it.

## orders
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_number | text UNIQUE | server-generated, format `BR-YYYYMMDD-####` |
| customer_id | uuid FK → customers(id) | NOT NULL |
| branch_id | uuid FK → branches(id) | NOT NULL |
| address_id | uuid FK → customer_addresses(id) | nullable (required when `order_type = 'delivery'`) |
| order_type | text NOT NULL | `check (in ('takeaway','delivery'))` |
| order_source | text NOT NULL default 'qr' | `check (in ('qr','web'))` — extensibility for future table/dine-in QR |
| subtotal | numeric(10,2) NOT NULL | `check (>= 0)`; server-recomputed, see `10_ORDER_LIFECYCLE.md` |
| delivery_charge | numeric(10,2) NOT NULL default 0 | `check (>= 0)` |
| discount | numeric(10,2) NOT NULL default 0 | `check (discount = 0)` — hard-locked until a discount engine exists |
| grand_total | numeric(10,2) NOT NULL | `check (>= 0)`; server-recomputed |
| payment_method | text NOT NULL | `check (in ('cash','upi'))` |
| payment_status | text NOT NULL default 'pending' | `check (in ('pending','paid','failed','cancelled'))` |
| order_status | text NOT NULL default 'placed' | `check (in ('placed','confirmed','preparing','ready','out_for_delivery','delivered','completed','cancelled'))` |
| created_at / updated_at | timestamptz | |

Table constraints: `delivery_requires_address`
(`order_type <> 'delivery' or address_id is not null`),
`takeaway_has_no_delivery_charge`
(`order_type <> 'takeaway' or delivery_charge = 0`).

Indexes: `idx_orders_customer_id`, `idx_orders_branch_id`, `idx_orders_created_at`

## order_items
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK → orders(id) ON DELETE CASCADE | NOT NULL |
| product_id | uuid FK → products(id) | NOT NULL |
| variant_id | uuid FK → product_variants(id) | nullable |
| product_name | text NOT NULL | **server-assigned**, ignores client value |
| variant_name | text | **server-assigned** |
| unit_price | numeric(10,2) NOT NULL | `check (>= 0)`; **server-assigned** |
| quantity | integer NOT NULL | `check (quantity > 0)`; client-supplied |
| line_total | numeric(10,2) NOT NULL | `check (>= 0)`; **server-assigned** (`unit_price * quantity`) |
| created_at | timestamptz | |

Indexes: `idx_order_items_order_id`, `idx_order_items_product_id`, `idx_order_items_variant_id`

## Functions

| Function | Trigger | Purpose |
|---|---|---|
| `set_updated_at()` | BEFORE UPDATE on every timestamped table | touches `updated_at` |
| `generate_order_number()` | BEFORE INSERT on `orders` | assigns `BR-YYYYMMDD-####` atomically |
| `set_order_item_snapshot()` | BEFORE INSERT on `order_items` | server-assigns price/name fields, rejects unavailable/mismatched items |
| `recalculate_order_totals()` | AFTER INSERT/UPDATE/DELETE on `order_items` | recomputes `orders.subtotal`/`grand_total` |
| `identify_or_create_customer(phone, name)` | called via RPC, not a trigger | the only sanctioned phone-based customer lookup — see `07_SECURITY_RLS.md` |

All five are `SECURITY DEFINER` with `search_path = public` and fully
schema-qualified table references.
