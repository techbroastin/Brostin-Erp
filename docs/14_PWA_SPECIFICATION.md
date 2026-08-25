# 14 — PWA Specification

## Entry model: QR code, not an app store

The customer app is reached exclusively by scanning a QR code (placed at
the restaurant). There is no Play Store / App Store listing and none is
planned for App 1 — see `02_REQUIREMENTS.md`'s strict mobile-only
requirement. The QR code's target is this PWA's URL; scanning it opens the
phone's default browser (Chrome on Android, Safari on iPhone) straight
into `LandingScreen`.

Consequences of QR entry that shape the build:

- The app must render correctly and fast on the **first paint**, from
  cold cache, in a phone browser tab — there is no pre-installed app icon
  a returning customer taps.
- "Add to Home Screen" (the PWA install prompt) is a bonus for repeat
  customers, not the primary access path. Nothing about first-visit
  ordering may depend on the customer having installed it.
- No desktop entry point is designed for or supported — see
  `02_REQUIREMENTS.md`.

## Manifest (`web/manifest.json`)

Branded to Broastin (fixed during the final UI QA pass — it previously
shipped with the generic Flutter scaffold's name/color):

| Field | Value | Why |
|---|---|---|
| `name` | Broastin Fried Chicken | Shown on the install prompt / home screen long-press |
| `short_name` | Broastin | Shown under the home screen icon |
| `theme_color` | `#D32F2F` (`AppColors.primaryRed`) | Android browser chrome / task-switcher color |
| `background_color` | `#FFFBF5` (`AppColors.background`) | Splash background while the PWA boots from the home screen |
| `display` | `standalone` | Home-screen launches hide the browser chrome |
| `orientation` | `portrait-primary` | Matches the mobile-only requirement — this is a phone app |

`web/index.html` carries matching `<meta name="theme-color">` and Apple
PWA meta tags (`apple-mobile-web-app-title`, `apple-mobile-web-app-capable`)
for Safari's equivalent behavior, plus the page `<title>` — all now say
"Broastin", not the scaffold default.

There is no `<meta name="viewport">` tag in `index.html` — this is
correct, not an oversight. The Flutter web engine manages the viewport
meta tag itself at runtime (it removes any static one and injects its own
`flt-viewport`-tagged tag) so it can control canvas scaling precisely; a
static tag would only be overwritten.

## Mobile-first rendering targets

Every customer screen is built and QA'd against the phone widths listed
in `02_REQUIREMENTS.md` (320–480px). See `04_UI_UX_SPECIFICATION.md` for
the per-screen responsive notes and the final QA report for the exact
pass/fail matrix at these widths.

## Not yet specified / built

- Offline behavior / service-worker caching strategy beyond whatever
  `flutter build web`'s default PWA service worker provides — not
  evaluated this phase.
- Push notifications for order-status updates — not built; `OrderStatus`
  is currently pull-only (customer reopens `My Orders`/`Order Status`).
- App icons (`web/icons/*`) are still Flutter's default scaffold icons,
  not Broastin-branded artwork — flagged here, not fixed this phase (needs
  real brand assets, not something to generate programmatically).
