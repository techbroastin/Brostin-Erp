# 04 — UI/UX Specification

## Status

Built against **local mock data only** (see `19_DEVELOPER_HANDOVER.md`). This
document describes what was actually implemented in the UI/UX phase, not a
forward-looking spec.

## Brand

- Primary: Broastin red (`AppColors.primaryRed` `#D32F2F`, dark variant
  `#A02525`)
- Accent: Broastin yellow (`AppColors.accentYellow` `#FFC107`) — used for
  highlights (icon badges, default-address chip), never as a dominant fill
- Background: warm white (`#FFFBF5`), surfaces white
- Text: near-black primary (`#211A16`), warm grey secondary (`#6B615B`)
- Red is not used as the background of every screen — it's reserved for
  primary actions (buttons), the selected-category chip, and price
  emphasis, matching the "premium, not loud" brief.

## Screens implemented

| # | Screen | File |
|---|---|---|
| 1 | Landing / Restaurant | `presentation/screens/landing/landing_screen.dart` |
| 2 | Menu (horizontal category nav + product list) | `presentation/screens/menu/menu_screen.dart` |
| 3 | Product Details (+ variant selection) | `presentation/screens/product_details/product_details_screen.dart` |
| 4 | Cart | `presentation/screens/cart/cart_screen.dart` |
| 5 | Customer Identification | `presentation/screens/customer_identification/customer_identification_screen.dart` |
| 6 | Order Type | `presentation/screens/order_type/order_type_screen.dart` |
| 7 | Address (select/manage) | `presentation/screens/address/address_screen.dart` |
| 7b | Address (add/edit, incl. current-location confirm) | `presentation/screens/address/edit_address_screen.dart` |
| 8 | Order Review | `presentation/screens/order_review/order_review_screen.dart` |
| — | Order Confirmation | `presentation/screens/order_confirmation/order_confirmation_screen.dart` |
| — | Order Status (timeline) | `presentation/screens/order_status/order_status_screen.dart` |
| — | My Orders | `presentation/screens/my_orders/my_orders_screen.dart` |
| — | My Profile | `presentation/screens/my_profile/my_profile_screen.dart` |

## Shared components (`presentation/widgets/`)

- `ProductCard` — fixed-height (140px) food card: image/placeholder,
  name, description, price (with "from" prefix when the product has
  variants), add affordance.
- `CategoryNav` — horizontal scrolling `ChoiceChip` strip.
- `CartBar` — sticky bottom call-to-action shown whenever the cart is
  non-empty while browsing.
- `AddressCard` — saved-address row with label icon, default badge, edit/delete menu.
- `OrderStatusTimeline` — vertical stepper, takeaway vs. delivery step sets.
- `QuantityStepper` — +/− control used on product details and cart.
- `PriceText` / `formatPrice` — ₹ formatting via `intl`.
- `LoadingView`, `EmptyStateView`, `ErrorStateView` — the three state
  widgets used consistently across every data-driven screen.

## Loading / empty / error / permission states

- **Loading**: every `FutureBuilder` renders `LoadingView` (spinner, optional
  message) while `ConnectionState.waiting`.
- **Empty**: `EmptyStateView` (icon + title + optional message/action) used
  for empty cart, no saved addresses, no orders yet, empty category.
- **Error**: `ErrorStateView` (icon + title + message + optional Retry)
  used for every repository call's error branch.
- **Location permission**: `AddressScreen._useCurrentLocation()` shows a
  loading state on the button itself while awaiting the OS/browser
  permission prompt, an `AlertDialog` explaining the situation on
  `LocationPermissionDeniedException` (denied, permanently denied, or
  location services disabled — all three map to this one exception type
  with different messages), and a generic snackbar for any other
  geolocation error. Permission is only requested on that explicit tap —
  never on page load, per the App 1 requirement.

## Responsive behavior

- Mobile-first: all screens work unmodified at narrow (phone) widths —
  this was the primary target and default layout.
- Wide screens (tablet/desktop): content-bearing screens
  (`LandingScreen`, `CustomerIdentificationScreen`,
  `EditAddressScreen`, `OrderReviewScreen`, `OrderConfirmationScreen`,
  `OrderStatusScreen`) center their content in a `ConstrainedBox` (max
  width 480–560) rather than stretching form fields/cards edge-to-edge
  across a full desktop viewport.
- `MenuScreen`'s product list also centers within a constrained reading
  width on wide viewports via a `LayoutBuilder`-computed horizontal
  padding, rather than stretching cards absurdly wide.
- `ProductDetailsScreen`'s hero image is wrapped in the same
  `ConstrainedBox` as its text content — an earlier version left the
  `AspectRatio` image unconstrained, which on a 1568px-wide desktop
  viewport produced a ~980px-tall image pushing all other content below
  the fold. Fixed during this phase (see `CHANGELOG.md`).

## Known UI issues

See `CHANGELOG.md` and the final report's "Known UI issues" section for
the full list, including a browser-timing quirk observed only in
automated testing (not expected to affect real users) and screens that
were code-reviewed but not individually smoke-tested in a live browser
this phase (My Orders, My Profile, saved-address management, manual
address entry, and all loading/empty/error branches other than the ones
exercised on the happy path).
