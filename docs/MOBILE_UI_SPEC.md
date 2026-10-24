# MOBILE_UI_SPEC.md — Broastin CRM / Growth OS

**Scope:** This document defines ONLY the mobile UI/UX of the Broastin Mobile Manager PWA. Desktop UI is defined separately in `DESKTOP_UI_SPEC.md` and must not be mixed into this file.

**Authoritative documents**

- `README.md`
- `CLAUDE.md`
- `ARCHITECTURE.md`
- `FRONTEND_ARCHITECTURE.md`
- `NAVIGATION.md`

**Status legend**

- **PLANNED** — decided and intended, not yet built
- **NOT YET FINALIZED** — intentionally open

**Current status:** No mobile UI has been built. Everything below is PLANNED unless marked otherwise.

**Design reference note:** This document defines rules and patterns. It does not contain visual reference images, exact colors, exact typography values or a brand system. Those are locked in `DESIGN_SYSTEM.md`. Where an approved visual reference exists, it is applied on top of these rules and must not contradict them.

---

# 1. Purpose

This document defines the complete visual and interaction rules for the Broastin Mobile Manager PWA, so Claude Code knows how the mobile application should look and behave.

It defines:

- mobile layout
- mobile navigation and hamburger menu
- mobile header
- cards and lists
- forms and filters
- sheets and dialogs
- actions and touch interaction
- typography and spacing
- responsive behavior
- loading, empty and error states
- mobile dashboard and detail pages
- mobile workflow patterns
- PWA behavior
- phone usability

It does NOT define desktop layout.

---

# 2. Core Mobile Principle

**LOCKED PRINCIPLE**

The mobile application is a purpose-built Manager application.

It is NOT:

```
Desktop UI
→ scaled down
```

It IS:

```
Mobile workflow
→ mobile information hierarchy
→ mobile interaction
→ mobile navigation
→ mobile components
```

The mobile UI is designed for real Android phones.

**Primary goal: FAST DAILY MANAGEMENT.** The Manager should be able to open the application and complete common tasks with minimal navigation and minimal typing.

---

# 3. Mobile Target

- **Primary device:** Android smartphone.
- The UI must work properly on small, standard and large Android phones.
- Do not design only for large screens.
- The UI must remain usable at approximately **360px width** and scale naturally to larger phone widths.

---

# 4. Mobile Application Type

The mobile application is a PWA and should behave as closely as practical to a native mobile application.

Priorities, in order:

1. Fast launch
2. Fast navigation
3. Touch-friendly controls
4. Clear information
5. Minimal cognitive load
6. Reliable scrolling
7. Minimal unnecessary animation
8. Good performance on ordinary Android devices

---

# 5. Mobile Navigation

The primary navigation mechanism is the **HAMBURGER MENU**.

- The hamburger menu is NOT the desktop sidebar compressed into mobile. It is a mobile-specific navigation experience.
- It opens from the appropriate side (side is NOT YET FINALIZED) and displays the mobile navigation hierarchy defined for the Manager.
- Only Manager-relevant mobile modules appear in the primary mobile menu.
- Desktop-heavy administrative tools must NOT appear as normal Manager navigation simply because they exist in Desktop Admin. In particular:
  - advanced Automation management
  - complex campaign builders
  - advanced configuration
  - complex analytics administration
- Mobile shows only the functionality the Manager actually requires.

## 5.1 Reconciliation with NAVIGATION.md

**RESOLVED / LOCKED DECISION:** Campaigns and Automation are Desktop Admin modules and are excluded from the primary mobile hamburger menu (see Section 6). `NAVIGATION.md` Sections 6 and 19 have been updated to match this decision: both modules are marked DESKTOP ADMIN ONLY for mobile Manager visibility. Routes and full functionality for both modules remain unchanged and fully available in Desktop Admin.

---

# 6. Mobile Navigation Structure

Conceptual structure:

```
BROASTIN

├── Dashboard
├── Customers
├── Orders
├── Loyalty
├── Feedback
├── Referrals
├── Membership
├── QR
├── Analytics
└── Settings
```

**Campaigns and Automation are desktop-heavy administrative functions.** They are not placed in the primary Manager hamburger menu unless explicitly approved later.

If mobile monitoring of a desktop-heavy feature is required later, it is introduced as a contextual screen or action (for example, a card on the Dashboard), rather than by exposing the complete desktop module.

Submenu content per section follows `NAVIGATION.md`, limited to what is relevant to the Manager.

---

# 7. Mobile Header

Every authenticated mobile screen has a consistent top header.

```
[☰]   Page Title                     [Action]
```

The header may contain:

- hamburger button
- page title
- one contextual action
- notification indicator where required

Rules:

- Do not overload the header.
- Keep it visually clean.
- Detail screens may replace the hamburger with a back control; the exact pattern is NOT YET FINALIZED.

---

# 8. Hamburger Menu UI

The hamburger menu contains:

- Broastin identity
- current user information where appropriate
- main navigation
- expandable sections where required
- active-state indication
- settings
- logout

Rules:

- The menu must not become a giant administration panel.
- Keep hierarchy shallow. Prefer `Section → Screen` over multiple nested submenus.
- Menu items are large, clearly labeled and easy to hit.
- The menu closes after navigation where appropriate.

---

# 9. Mobile Dashboard

The Dashboard is the first operational screen. It is designed for quick scanning and must NOT copy the desktop dashboard.

Priorities:

1. Today's important information
2. Immediate actions
3. Customer/order activity
4. Alerts requiring attention
5. Important business signals

Use vertically stacked cards. Avoid desktop-style multi-column dashboard grids.

Preferred pattern:

```
Header
↓
Today's Summary
↓
Priority Actions
↓
Important Activity
↓
Alerts
↓
Additional information
```

Exact dashboard metrics: **NOT YET FINALIZED.**

---

# 10. Mobile Cards

Cards are a primary mobile information pattern. Cards should:

- have clear hierarchy
- avoid excessive information
- support one primary action
- use readable typography
- have adequate spacing
- remain touch friendly

Do not put too many unrelated metrics inside one card. Avoid visual clutter.

---

# 11. Mobile Lists

Lists generally use this row pattern:

```
Avatar / icon
+ Primary information
+ Secondary information
+ Status
+ Optional action
```

Example (customer row): name, last order, status.

Do not use dense desktop-style tables on mobile.

---

# 12. Mobile Data Tables

Avoid tables whenever possible. If data is naturally tabular, convert it into:

- cards
- list rows
- expandable items
- horizontal scrolling only when absolutely necessary

Do not simply shrink a desktop table until the text becomes unreadable.

---

# 13. Customer UI

**Customer list**

```
Search
↓
Filters
↓
Customer cards / list
```

A customer card may show: customer name, phone, customer status, last order, order count, loyalty information, relevant alert.

**Customer detail**

```
Profile
↓
Summary
↓
Orders
↓
Loyalty
↓
Feedback
↓
Activity
```

Use tabs only where they genuinely improve navigation. Do not create excessive nested tabs.

---

# 14. Customer 360

Customer 360 must be mobile-readable. Prioritize:

- identity
- contact
- current status
- recent activity
- recent orders
- loyalty
- important feedback
- important actions

Long activity histories use a vertical timeline/list. Do not reproduce a desktop CRM table.

Exact Customer 360 layout: **NOT YET FINALIZED.**

---

# 15. Order UI

**Order list** shows: order number, customer, amount, time, source, status. Use cards/list rows.

**Order detail** shows: customer, items, amount, order status, payment information where applicable, order source, timestamps, related customer information.

Actions are obvious and touch-friendly.

Exact order fields and status values: **NOT YET FINALIZED.**

---

# 16. Loyalty UI

Mobile loyalty focuses on:

- current loyalty status
- customer balance
- rewards
- recent loyalty activity

Use simple cards and lists. Avoid complicated analytics on mobile.

---

# 17. Feedback UI

The feedback list makes sentiment/status immediately visible. Each item prioritizes:

- customer
- rating/sentiment
- short feedback
- time
- status
- action

Negative feedback must be easy to identify without relying only on color.

---

# 18. Referral UI

Use:

- summary cards
- referral list
- customer details
- activity

Avoid complex administrative configuration.

---

# 19. Membership UI

Mobile membership focuses on:

- member list
- membership status
- plan
- expiry
- customer details
- activity

Complex plan configuration is desktop-oriented.

---

# 20. QR UI

The QR mobile interface focuses on operational visibility. Potential screens:

- QR overview
- QR orders
- QR activity

Do not expose technical QR configuration unnecessarily.

The existing QR Ordering application must not be damaged or replaced during UI development.

---

# 21. Analytics UI

Mobile analytics is simplified. Prioritize:

- key metrics
- trends
- important changes
- simple charts
- actionable insights

Avoid desktop-level dashboards with many charts.

A mobile analytics screen answers "What do I need to know?", not "Show me every available metric."

---

# 22. Settings UI

Settings are intentionally limited on mobile. Use simple grouped settings, for example:

```
Account
Notifications
Preferences
App
Logout
```

Advanced administration belongs to Desktop Admin. Do not expose complex configuration unnecessarily.

---

# 23. Mobile Forms

Forms are optimized for touch. Rules:

- large inputs
- clear labels
- adequate spacing
- obvious primary action
- inline validation
- keyboard-friendly layout
- appropriate input types
- avoid tiny controls
- avoid excessive fields on one screen

For long forms, use sections or steps. Do not create extremely long scrolling forms when the task can be broken up logically.

---

# 24. Mobile Filters

Filters open as a **bottom sheet** or a **full-screen filter view**, depending on complexity. Do not use desktop filter sidebars on mobile.

Example:

```
[Filter]

Status
Date
Customer Type
Source

[Apply Filters]
[Clear]
```

---

# 25. Mobile Search

Search is fast and accessible. For customer and order searches, use a prominent search field supporting:

- typing
- clear button
- loading state
- no-results state

Do not force the user through multiple screens to perform a simple search.

---

# 26. Bottom Sheets

Bottom sheets are preferred for:

- filters
- quick actions
- short selections
- contextual actions

They should not contain extremely complex workflows. Complex workflows use a dedicated screen.

---

# 27. Mobile Dialogs

Use dialogs sparingly. Good use cases:

- confirmation
- delete confirmation
- short warning
- simple selection

Avoid putting long forms inside dialogs.

---

# 28. Mobile Actions

The primary action must be visually obvious. Avoid multiple competing primary buttons.

Hierarchy: **Primary → Secondary → Tertiary.**

Destructive actions are visually distinct and require appropriate confirmation.

---

# 29. Touch Targets

Interactive elements must be comfortably touchable. Avoid:

- tiny icons
- tightly packed buttons
- tiny text links
- controls placed too close together

Design for fingers, not mouse pointers. Minimum target sizes follow common Android guidance; the exact value is **NOT YET FINALIZED** and is set in `DESIGN_SYSTEM.md`.

---

# 30. Mobile Typography

Typography prioritizes readability. Use the project's approved design tokens. Do not invent arbitrary font sizes on individual screens.

The hierarchy clearly distinguishes:

- page title
- section title
- card title
- body
- metadata
- status
- helper text

Exact typography values: **NOT YET FINALIZED.**

---

# 31. Mobile Spacing

Use a consistent spacing system. Avoid random margins and padding. Screens feel spacious without wasting screen area. Prioritize:

- content separation
- touch comfort
- visual hierarchy

---

# 32. Status Indicators

Status must not depend only on color. Combine:

- text
- icon
- badge
- color

Examples: Completed, Preparing, Pending, Failed, Active, Inactive.

Exact business status values: **NOT YET FINALIZED.**

---

# 33. Loading States

Every asynchronous screen has a mobile-friendly loading state. Preferred:

- skeleton cards
- skeleton list rows
- progressive loading

Avoid a blank white screen.

---

# 34. Empty States

Every list has a useful empty state. Example: "No customers found." Then provide an appropriate action if one exists.

Do not display empty screens without explanation.

---

# 35. Error States

Errors must be understandable, actionable where possible, and non-technical.

Do not expose stack traces, database errors, API secrets or internal implementation details.

---

# 36. Offline / Network States

The PWA may eventually support selected offline functionality. Do NOT claim the entire application works offline.

When network connectivity is unavailable, provide clear feedback.

Exact offline capabilities: **NOT YET FINALIZED.**

---

# 37. PWA Update UI

When a new application version is available, show a clear update prompt.

Example:

```
New version available
[Update]
```

Do not force confusing silent refresh behavior.

The update mechanism is PLANNED and not implemented. Exact implementation: **NOT YET FINALIZED.**

---

# 38. Mobile Animation

Animations are subtle and purposeful. Use animation for:

- menu opening
- sheet opening
- transitions
- loading feedback

Avoid excessive motion, long transitions and decorative animation that slows navigation. Performance takes priority. Respect reduced-motion preferences.

---

# 39. Safe Area

The UI must account for modern phone safe areas:

- status bar
- bottom gesture area
- keyboard
- fixed navigation
- bottom sheets

Important controls must never become hidden behind system UI.

---

# 40. Keyboard Behavior

The application must remain usable when the Android keyboard is open. Inputs must:

- remain visible
- scroll into view
- not be covered by fixed elements

Forms must not break when the viewport height changes.

---

# 41. Mobile Performance

Prioritize performance on ordinary Android hardware. Avoid:

- huge images
- unnecessary animations
- unnecessary JavaScript
- massive lists rendered simultaneously
- excessive dependencies

Use lazy loading and efficient rendering where appropriate.

---

# 42. Mobile Accessibility

Support:

- readable text
- clear focus where applicable
- accessible labels
- semantic controls
- sufficient contrast
- non-color-only status indicators
- accessible dialogs and sheets

---

# 43. Mobile Branding

The mobile interface should clearly feel like Broastin. Use the approved Broastin identity and visual direction.

Do NOT invent a final brand system in this document. Exact colors, typography, logo treatment and design tokens are locked in `DESIGN_SYSTEM.md`.

---

# 44. Mobile Screen Design Rule

Every mobile screen must answer:

1. What is this screen for?
2. What does the user need to see first?
3. What is the primary action?
4. What can be hidden?
5. What can be moved to another screen?
6. Can the user complete the task comfortably with one hand?

If a screen becomes too complicated: do NOT shrink the UI. Simplify the workflow.

---

# 45. Mobile vs Desktop Rule

NEVER solve a mobile layout problem by:

- shrinking desktop tables
- shrinking desktop cards
- shrinking the desktop sidebar
- reducing font size excessively
- squeezing multiple columns
- hiding random elements

Instead, redesign the information hierarchy for mobile.

---

# 46. Development Rule

Build mobile UI one hamburger section at a time. For each section:

1. Menu entry
2. Route
3. Screen shell
4. Mobile layout
5. Components
6. Mock data
7. Interactions
8. Loading state
9. Empty state
10. Error state
11. Real Android test
12. Fix issues
13. Mark complete

Then move to the next section. Mock data is used throughout the frontend phase, as defined in `FRONTEND_ARCHITECTURE.md`.

---

# 47. Mobile Definition of Done

A mobile screen is complete only when:

- the correct route exists
- the correct hamburger navigation exists
- the UI is mobile-native
- no desktop layout is being squeezed into it
- touch interaction works
- loading state works
- empty state works
- error state works
- keyboard behavior works where applicable
- scrolling works
- a real Android phone test passes
- no obvious console/runtime errors exist

---

# 48. Forbidden Mobile Patterns

Do NOT:

- create desktop UI and shrink it
- use a desktop sidebar on mobile
- expose all desktop utilities in the hamburger menu
- use dense desktop tables
- create tiny buttons
- create tiny text
- overload screens with metrics
- put complex admin configuration into Manager navigation
- put long workflows into small dialogs
- add unnecessary bottom navigation
- invent features just to fill the screen
- hard-code production data
- bypass the approved navigation architecture

Bottom navigation remains **NOT YET FINALIZED** per `NAVIGATION.md`; it must not be added without approval.

---

# 49. Fixed Mobile Design Principle

The final mobile experience should feel like a dedicated Broastin Manager app.

Not a website opened on a phone. Not a desktop dashboard compressed into a phone.

The Manager should be able to operate the business quickly from the phone.

---

# 50. Relationship to DESKTOP_UI_SPEC.md

Desktop UI is defined separately in `DESKTOP_UI_SPEC.md`. That document must NOT be merged into this file.

The two specifications share:

- brand
- data concepts
- business terminology
- feature architecture

But they may use completely different:

- layouts
- navigation
- information density
- interaction patterns
- component arrangements

---

# 51. What Is NOT YET FINALIZED

- hamburger side and back-control pattern on detail screens
- exact dashboard metrics
- exact Customer 360 layout
- order fields and status values
- exact typography values and touch target size
- offline capabilities
- PWA update implementation
- bottom navigation (not to be added without approval)
- brand colors, logo treatment and design tokens (in `DESIGN_SYSTEM.md`)

---

# 52. Final Locked Rules

1. Mobile is a first-class application experience.
2. Mobile is NOT a shrunken desktop.
3. Mobile Manager is the primary daily-use interface.
4. Hamburger menu is the primary mobile navigation.
5. Desktop-heavy administrative utilities must not automatically appear in mobile navigation.
6. Mobile uses cards/lists instead of dense desktop tables.
7. Mobile uses bottom sheets where appropriate.
8. Complex workflows use dedicated screens.
9. Real Android testing is mandatory.
10. Mobile performance is a priority.
11. Touch usability is mandatory.
12. Existing QR Ordering must be preserved.
13. ManageMe remains behind the integration boundary.
14. Backend implementation must not leak into UI.
15. One hamburger section is completed before moving to the next.
16. Desktop UI is documented separately.
17. Any major change to these rules requires explicit approval.

---

*End of MOBILE_UI_SPEC.md.*
