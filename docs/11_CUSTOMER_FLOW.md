# 11 — Customer Flow

## Journey (as implemented, mock data)

```
Landing (/)
  → "Order Now" or a category chip
Menu (/menu)
  → tap a product card
Product Details (/product/:productId)
  → choose variant (if any) + quantity → "Add to Cart"
  → pops back to Menu; CartBar appears at the bottom
Cart (/cart)
  → "Checkout"
      if not yet identified this session →
Customer Identification (/checkout/phone)
  → phone (+ optional name) → "Continue"
Order Type (/checkout/order-type)
  → Takeaway → straight to Review
  → Delivery → Address
Address (/checkout/address)                [delivery only]
  → "Use Current Location" (permission prompt, then confirm/edit details)
  → "Add Address Manually" (/checkout/address/new)
  → or tap a saved address
  → selecting an address → Review
Order Review (/checkout/review)
  → choose payment method (Cash / UPI) → "Place Order"
Order Confirmation (/order/:orderId/confirmation)
  → "View Order" → Order Status
  → "Back to Menu" → Menu
Order Status (/order/:orderId/status)
  → timeline: Placed → Confirmed → Preparing → Ready → (Out for Delivery →
    Delivered | Completed)
```

Secondary entry points:

```
My Orders (/orders)        — order history, tap an order → Order Status
My Profile (/profile)      — name/phone, links to Saved Addresses and My Orders
Saved Addresses (/profile/addresses) — same AddressScreen, "manage" mode:
  no select-to-continue, only view/add/edit/delete
```

Reached via a profile icon in `MenuScreen`'s app bar (added during the final
UI QA pass — `My Profile`/`My Orders` had no in-app entry point before this
and were only reachable by typing their URL directly; see final QA report).

## Known navigation-URL limitation (final QA pass)

`go_router`'s `context.push()` (used for every screen after Menu — Product
Details, Cart, Customer Identification, Order Type, Address, Order Review)
does not rewrite the browser address bar to that screen's path; only
`context.go()` calls (Landing, Menu, Order Confirmation, Order Status, My
Orders, My Profile) do. In practice this means only those `go()`-reached
screens are bookmarkable/refresh-safe by URL — a mid-checkout refresh drops
back to Menu rather than restoring the exact push()'d screen. This is
`go_router`'s own push/go distinction, not a defect introduced by the UI
phase; back-button behavior through the checkout stack is unaffected. Left
as-is for this QA pass since converting the checkout flow to `go()` would be
an architecture-level change, not a bug fix — flagged here for the next
phase to decide on.

## Returning-customer shortcut

`CartScreen`'s "Checkout" button checks `SessionService.isIdentified`: a
customer who already provided their phone earlier in this browser session
skips straight to Order Type instead of being asked again — this is the
mock-layer analogue of "if mobile number already exists, load existing
customer" from the original spec. See `08_AUTHENTICATION.md` (in the
backend docs) for how this becomes real, RLS-backed identity later; in
this UI phase it's `SessionService`'s in-memory/`SharedPreferences` cache
only.

## What is intentionally NOT in this flow

- No dine-in / table QR flow (`order_source` stays extensible for later,
  nothing built for it now).
- No coupon/discount entry (Cart's Discount row is a static placeholder).
- No reorder button on My Orders (explicitly deferred, per the original
  scope note — "unless clean," and it wasn't in scope for this phase).
- No exact delivery-time promise anywhere — Order Confirmation shows a
  static "20–30 minutes" range, not a computed ETA.

## Mock-data specifics that affect the flow

- All orders belong to whichever phone number is currently in
  `MockBackend` for this browser session — see `05_DATABASE_ARCHITECTURE.md`
  (backend docs) for how phone-based mock lookup differs from the real
  `auth_user_id`-anchored design; this mock simplification exists only to
  make "returning customer" visible in the UI, not as a security model.
- `MockBackend.createOrder` computes `order_number` client-side in the same
  `BR-YYYYMMDD-####` format the real database trigger will produce, but
  the mock's counter is per-app-session only (resets on page reload) — the
  real backend's per-day, per-branch, concurrency-safe sequence is
  documented in `10_ORDER_LIFECYCLE.md` (backend docs) and is not
  reproduced here.
