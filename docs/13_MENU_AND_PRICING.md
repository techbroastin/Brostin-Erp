# 13 — Menu & Pricing

## Everything is database-driven

`menu_categories`, `products`, and `product_variants` hold every category
name, product name, description, image, price, and availability flag the
app renders. **Nothing menu-related is hard-coded in Flutter.**
`MenuRepository` (`lib/data/repositories/menu_repository.dart`) is the only
place that reads this data.

## Products vs. variants

A product is sold one of two ways:

- **Flat pricing** (no `product_variants` rows): the product is added to
  the cart directly at `products.price`. Example: "Single Piece Broast".
- **Variant pricing** (one or more `product_variants` rows): the customer
  must choose a variant (e.g. Solo vs. Meal, or Quarter/Half/Full); the
  cart prices from the chosen variant, never from the parent product.
  `products.price` in this case is only a "starting from" display value for
  the menu-listing card before a variant is picked.

This is enforced **server-side**, not just in the UI —
`set_order_item_snapshot()` looks up the real price from
`product_variants` when a `variant_id` is supplied, and rejects the item
entirely if that variant doesn't belong to the given product or isn't
currently available. See `07_SECURITY_RLS.md`.

## Approved provisional menu (seed data)

**These are provisional prices for development only — not final.** Every
row is flagged `is_demo = true` in `products` so a future Admin/POS system
can identify and replace this data without guesswork. Seeded via
`supabase/seed.sql`, not the numbered migrations — see `18_SUPABASE_SETUP.md`
for why that separation matters.

| Category | Item | Price |
|---|---|---|
| Signature Broasted Chicken | Single Piece Broast | ₹89 |
| | Duo Crunch Box | ₹239 |
| | Broaster 4-Piece Box | ₹439 |
| Crispy Chicken Burgers | The Big Broaster Burger | Solo ₹149 / Meal ₹229 |
| | Cheesy Broast Burger | Solo ₹169 / Meal ₹249 |
| | Monster Crunch Double Burger | Solo ₹219 / Meal ₹299 |
| Crunchy Wraps & Twisters | Classic Crunch Wrap | Solo ₹139 / Meal ₹219 |
| | Cheesy Twister Wrap | Solo ₹169 / Meal ₹259 |
| | Peri-Peri Spicy Wrap | Solo ₹149 / Meal ₹229 |
| Boneless Strips & Bites | Crispy Tenders 3 pcs | ₹119 |
| | Boneless Crunch Box 4 pcs | ₹219 |
| | Dynamite Boneless Strips 6 pcs | ₹299 |
| Smoky Arabian Alfaham | Quarter / Half / Full | ₹199 / ₹360 / ₹690 |
| Sharing Feasts & Buckets | Coal & Crunch Duo | ₹399 |
| | Family Bucket 8 pcs | ₹849 |
| | Mega Party Platter 12 pcs | ₹1,249 |
| Add-ons | French Fries | ₹79 |
| | Peri-Peri French Fries | ₹99 |
| | Cheesy Lava Dip | ₹30 |
| | Signature Garlic Mayo/Toum | ₹20 |
| | Extra Dinner Bun | ₹15 |
| | Extra Kuboo(s) | ₹10 |
| Beverages | Soft Drink 250ml | ₹35 |
| | Fresh Lime Juice | ₹40 |
| | Blue Curacao/Mint Mojito | ₹89 |

8 categories, 25 products, 15 variant rows total.

## Historical price integrity

Once an order is placed, its `order_items` rows are permanent snapshots —
changing a price here later never alters any past order. See
`10_ORDER_LIFECYCLE.md`.

## Availability

`products.is_available` and `product_variants.is_available` gate both:

1. **What customers can see** — RLS only exposes rows where the flag is
   `true` (`products_public_read_available`,
   `product_variants_public_read_available`).
2. **What customers can order** — `set_order_item_snapshot()` re-checks
   availability at insert time regardless of what the client's cached menu
   state showed, closing the race where a customer's cart goes stale
   between loading the menu and placing the order.
