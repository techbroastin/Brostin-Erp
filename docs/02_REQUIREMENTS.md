# 02 — Requirements

## STRICT — Customer app is mobile-only (this repository)

This is a hard product requirement, not a design preference. It has been
stated explicitly and must not be relaxed without an explicit product
decision to change it.

- **Access is QR-code entry.** A customer scans a QR code and lands in
  this PWA. There is no other intended entry path for a customer.
- **Device: mobile phone only.** Android is the primary target; iPhone
  (Safari) is supported. There is no tablet or desktop customer
  requirement.
- **Design mobile-first / mobile-only.** Every screen is built and judged
  against phone viewport widths — see the required QA width list below.
  Do **not** design, lay out, or size any customer screen around a
  desktop viewport.
- **Desktop customer experience is explicitly NOT a requirement.** Any
  wide-viewport centering/constraint behavior already present in this
  codebase (`ConstrainedBox` wrappers on `LandingScreen`,
  `CustomerIdentificationScreen`, `EditAddressScreen`, `AddressScreen`,
  `OrderReviewScreen`, `OrderConfirmationScreen`, `OrderStatusScreen`,
  `MenuScreen`'s reading-width padding) is a defensive nicety from an
  earlier phase, not something to design further for, extend, or treat as
  an acceptance criterion. Never block a release on desktop/tablet
  customer layout, and never spend QA time chasing desktop-only issues in
  this app.

### Required customer-QA viewport widths

Test and judge every customer screen primarily at:

```
320px, 360px, 375px, 390px, 412px, 430px, 480px
```

These correspond to real Android/iPhone device widths in common use
(360/412 are common Android breakpoints; 375/390/430 are iPhone
breakpoints; 320 is the historical minimum-phone floor). Tablet (768+) and
desktop (1024+) widths are **not** acceptance criteria for this app.

## Admin/Operations app — explicitly separate (not built here)

- **Desktop only.** Desktop-first, keyboard-and-mouse-oriented.
- **A separate application/interface.** It must never be merged into this
  customer PWA's codebase or UI, and this app must never grow a
  "responsive enough for both" layout that tries to serve both audiences
  from one set of screens.
- Not started as of this document. When it is, it belongs in its own
  project/repo (or a clearly separate module), not as new routes bolted
  onto `core/router/app_router.dart`.

## Why this split matters for how work gets done here

- A finding like "this screen looks cramped/stretched on a 1366px desktop
  browser" is **not a customer-app defect** — do not fix it, and do not
  let it block sign-off. Only report it if asked to explicitly.
- Any future request to "add an admin screen" or "make this work well on
  desktop for staff" belongs in the separate Admin/Operations app, not
  here.
- QA effort (manual and automated) should concentrate on the mobile width
  list above, not on tablet/desktop breakpoints.

## Functional requirements

See `11_CUSTOMER_FLOW.md` for the customer journey and
`04_UI_UX_SPECIFICATION.md` for the screen-by-screen implementation. See
`05_DATABASE_ARCHITECTURE.md` / `06_DATABASE_SCHEMA.md` /
`07_SECURITY_RLS.md` / `08_AUTHENTICATION.md` / `10_ORDER_LIFECYCLE.md` /
`13_MENU_AND_PRICING.md` for the backend design (not yet connected — see
`19_DEVELOPER_HANDOVER.md`).
