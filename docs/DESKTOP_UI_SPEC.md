# DESKTOP_UI_SPEC.md — Broastin CRM / Growth OS

**Scope:** This document defines ONLY the desktop UI/UX of the Broastin Desktop Admin application. Mobile UI is defined separately in `MOBILE_UI_SPEC.md` and must not be mixed into this file.

**Authoritative documents**

- `README.md`
- `CLAUDE.md`
- `ARCHITECTURE.md`
- `FRONTEND_ARCHITECTURE.md`
- `NAVIGATION.md`
- `MOBILE_UI_SPEC.md`

**Status legend**

- **PLANNED** — decided and intended, not yet built
- **NOT YET FINALIZED** — intentionally open

**Current status:** No desktop UI has been built. Everything below is PLANNED unless marked otherwise.

**Design reference note:** An approved desktop UI reference image establishes the visual direction described in Section 3. This document encodes that direction as rules for Claude Code; it does not reproduce the image itself. Exact color values, typography scale and spacing tokens are locked in `DESIGN_SYSTEM.md` and must match the approved reference, not be reinvented here.

---

# 1. Purpose

This document defines the complete visual and interaction specification for the Broastin Desktop Admin application, so Claude Code knows how the desktop application should look and behave.

It defines:

- desktop layout
- sidebar
- top header
- desktop navigation
- dashboard
- tables
- filters
- forms
- dialogs
- drawers
- analytics
- campaign management
- automation
- administrative workflows
- desktop information density
- desktop responsive behavior
- desktop interaction patterns
- loading states
- empty states
- error states
- desktop accessibility
- desktop performance

It does NOT define the mobile layout.

---

# 2. Fixed Desktop Design Principle

**LOCKED PRINCIPLE**

Desktop Admin is a dedicated desktop management application.

It is NOT:

```
Mobile UI
→ stretched horizontally
```

It IS:

```
Desktop information architecture
→ desktop navigation
→ desktop data density
→ desktop workflow
→ desktop productivity
```

The desktop interface takes advantage of larger screens.

The purpose of Desktop Admin is to handle complicated and data-heavy tasks that should not be forced into the Manager mobile experience.

---

# 3. Approved Desktop Visual Direction

The approved desktop reference establishes the following visual direction:

- Broastin branding prominently displayed in the sidebar
- dark burgundy/red sidebar
- clean light content area
- white cards
- subtle shadows
- rounded card corners
- clear visual hierarchy
- strong but restrained use of brand color
- clean modern typography
- compact but readable data presentation
- professional restaurant/business management appearance
- dashboard-oriented information architecture

Treat the approved desktop reference as the visual baseline.

- Do NOT redesign the overall desktop shell into a different visual style.
- Do NOT introduce a completely different navigation concept.
- Exact color values (the specific burgundy/red, exact grays, semantic colors) and the typography scale are **NOT YET FINALIZED** in this document and must be taken from `DESIGN_SYSTEM.md` once locked there, consistent with the reference.

---

# 4. Desktop Application Shell

The desktop shell consists conceptually of:

```
┌────────────────────────────────────────────────────────────┐
│ SIDEBAR │ TOP HEADER                                       │
│         ├──────────────────────────────────────────────────│
│         │                                                  │
│         │ MAIN CONTENT                                     │
│         │                                                  │
│         │                                                  │
│         │                                                  │
│         └──────────────────────────────────────────────────│
└────────────────────────────────────────────────────────────┘
```

The sidebar is persistent on desktop.

**The top header provides:**

- search
- notifications
- user/profile
- contextual actions where required

**The main content area contains:**

- a page header (title, breadcrumb where applicable, primary action)
- the screen's primary content (dashboard widgets, tables, forms, builders)
- secondary panels or side details where a workflow requires them

Rules:

- The sidebar and top header are rendered once, by the shell layout, not re-implemented per screen.
- The main content area is where all feature screens render; it does not manage navigation state itself.
- The shell must not collapse into a mobile-style single-column layout; desktop width is assumed. Exact minimum supported desktop width is **NOT YET FINALIZED**.

---

# 5. Sidebar

The sidebar is the primary desktop navigation mechanism, corresponding to the hamburger menu's role on mobile.

**Contents, top to bottom:**

- Broastin identity/logo
- primary navigation: the top-level modules from `NAVIGATION.md` (Dashboard, Customers, Orders, Loyalty, Campaigns, Automation, Feedback, Referrals, Membership, QR, Analytics, Settings)
- expandable groups for modules with submenus
- active module and active route clearly highlighted
- user/account area near the bottom (name, role, logout)

Rules:

- The sidebar shows the full Admin navigation set (see Section 20 of `NAVIGATION.md`); it is not trimmed the way the mobile menu is.
- Only one top-level module is expanded with its submenu visible at a time by default; the exact expand/collapse behavior for multiple groups is **NOT YET FINALIZED**.
- Collapse to an icon-only rail is a possible enhancement; whether it is implemented, and its behavior, is **NOT YET FINALIZED** (see also `NAVIGATION.md` Section 23).
- The sidebar uses the approved dark burgundy/red treatment from Section 3; it is not a plain neutral panel.
- Navigation labels use the same business language as `NAVIGATION.md`; the sidebar does not invent alternate labels for the same routes.

---

# 6. Top Header

The top header sits beside the sidebar and spans the remaining width.

**Contents:**

- global search (customers, orders, and other searchable entities; exact scope **NOT YET FINALIZED**)
- notifications indicator
- user/profile menu (account, settings shortcut, logout)
- contextual actions relevant to the current screen, where appropriate

Rules:

- The header remains light/clean, contrasting with the sidebar per the approved visual direction.
- The header does not duplicate the sidebar's navigation.
- Breadcrumbs, where used for deep administrative pages, appear either in the header or at the top of the main content area; exact placement is **NOT YET FINALIZED** (see `NAVIGATION.md` Section 26).

---

# 7. Desktop Navigation Behavior

- The sidebar reflects the complete module and submenu structure defined in `NAVIGATION.md`.
- Active module and active route are both highlighted.
- Navigating between modules does not reload the shell; only the main content area updates.
- Deep links work directly to nested screens (for example `/customers/segments`, `/campaigns/:campaignId`).
- Navigation context (selected filters, current tab) is preserved per `NAVIGATION.md` Section 29.

---

# 8. Desktop Dashboard

The Dashboard is the Admin's starting screen and takes advantage of the larger viewport.

Unlike the mobile dashboard's single vertical stack, the desktop dashboard uses a **multi-column, widget-based layout**:

```
┌───────────────┬───────────────┬───────────────┐
│ KPI tile       │ KPI tile       │ KPI tile       │
├───────────────┴───────────────┼───────────────┤
│ Trend / chart widget           │ Alerts /       │
│                                  │ priority list  │
├─────────────────────────────────┼───────────────┤
│ Activity feed / recent orders  │ Secondary      │
│                                  │ widget         │
└─────────────────────────────────┴───────────────┘
```

Priorities:

1. Key business KPIs at a glance
2. Trends and comparisons
3. Alerts and items needing attention
4. Recent activity across customers/orders
5. Secondary widgets (loyalty, campaigns, feedback summaries)

Rules:

- Widgets are cards with clear titles and, where relevant, a link to the full module.
- The dashboard does not simply enlarge the mobile dashboard's stacked cards; it is laid out for scanning across columns.
- Exact dashboard widgets and metrics: **NOT YET FINALIZED.**

---

# 9. Desktop Tables

Tables are a primary desktop pattern, used where mobile uses cards/lists.

**A standard data table includes:**

- column headers, sortable where meaningful
- row data with consistent alignment (text left, numbers right)
- status shown as a badge (text + color, never color alone)
- row-level actions (menu or inline icons)
- selection checkboxes where bulk actions apply
- pagination or virtualized scrolling for large datasets

Rules:

- Tables are used for collections (Customers, Orders, Campaigns, Automation workflows, and similar), not for single-record detail views.
- Column sets per table are **NOT YET FINALIZED** and are defined feature-by-feature.
- Empty, loading and error states apply to tables exactly as to any other data view (see Sections 16–18).
- Tables must remain legible at typical desktop widths without horizontal scrolling for their primary columns; secondary columns may be hidden at narrower desktop widths (exact responsive column rules **NOT YET FINALIZED**).

---

# 10. Desktop Filters

Filters on desktop are **persistent and visible**, not hidden behind a sheet as on mobile.

Common patterns:

- a filter bar above the table (search box, dropdowns, date range)
- a filter side panel for a larger number of filter dimensions
- applied filters shown as removable chips/tags

Rules:

- Filters do not require an extra tap to open on desktop where screen space allows.
- Clearing all filters is always one visible action.
- Filter state is reflected in the URL where practical, per `NAVIGATION.md` Section 29.

---

# 11. Desktop Forms

Desktop forms can be denser than mobile forms, using available width.

Rules:

- Multi-column form layouts are acceptable where fields are logically grouped (for example, a two-column address or contact section).
- Long or complex forms (campaign creation, automation workflow configuration, system settings) are organized into clear sections or steps rather than one long flat form.
- Primary action is visually obvious; destructive actions are visually distinct and confirmed.
- Validation uses React Hook Form + Zod as defined in `FRONTEND_ARCHITECTURE.md` Section 19; messages are specific and shown next to the relevant field.
- Forms built mainly for Desktop Admin (campaign creation, automation workflows, advanced configuration) do not need a mobile-equivalent layout; mobile shows monitoring/visibility only, per `MOBILE_UI_SPEC.md`.

---

# 12. Dialogs

Dialogs on desktop are used for:

- confirmation (including destructive actions)
- short, focused input (rename, quick edit)
- simple selection

Rules:

- Dialogs are centered, with a clear title, body and action buttons.
- Long or multi-step workflows do not belong in a dialog; they use a drawer or a dedicated screen (Section 13, Section 11).
- Only one dialog is open at a time.

---

# 13. Drawers / Side Panels

Drawers (slide-in side panels) are a desktop-specific pattern for:

- viewing or editing a record without leaving the current list/table context (for example, a quick customer detail panel from the Customers table)
- secondary configuration alongside a builder (for example, campaign audience settings next to a campaign editor)
- filter panels with many dimensions (Section 10)

Rules:

- Drawers open from the right side by default; exact behavior and width are **NOT YET FINALIZED**.
- A drawer does not replace the dedicated detail screen for a record; it is a convenience for quick inspection or edits without losing table context.
- Drawers remain usable alongside the table/list behind them (the underlying list stays visible, typically dimmed).

---

# 14. Analytics UI

Desktop Analytics is where full reporting detail lives, unlike the simplified mobile analytics view.

Includes:

- multiple charts per screen (trend lines, comparisons, breakdowns)
- filterable date ranges and segments
- drill-down from summary to detail
- exportable or shareable views (exact mechanism **NOT YET FINALIZED**)

Rules:

- Analytics screens are organized by area, matching `NAVIGATION.md` Section 17 (Overview, Sales, Customers, Loyalty, Marketing).
- Charts use a consistent charting approach across the application; exact charting library choice is **NOT YET FINALIZED** per `FRONTEND_ARCHITECTURE.md` Section 2.
- Numbers are never the only way status/performance is conveyed; trends also use clear labels (up/down, good/bad) in addition to color.

---

# 15. Campaign Management and Automation UI

Campaign creation (`/campaigns/new`) and automation workflow building (`/automation/new`, `/automation/:workflowId`) are primarily Desktop Admin workflows, per `NAVIGATION.md` Sections 11–12.

**Campaign creation** is a structured, multi-step flow (for example: details → audience → content → review), using the desktop forms pattern (Section 11).

**Automation workflow building** is a visual builder concept (steps/triggers/actions). Exact builder interaction model (canvas, list-based steps, or another pattern): **NOT YET FINALIZED.**

Rules:

- Both areas may use drawers (Section 13) for secondary configuration alongside the main builder.
- Both must support draft/incomplete states (saving partial work) given their complexity; exact save behavior is **NOT YET FINALIZED.**
- Mobile shows monitoring and read-only views only for these areas, per `MOBILE_UI_SPEC.md`; the full builder experience is desktop-only.

---

# 16. Loading States

Every asynchronous desktop screen has a loading state appropriate to its layout:

- skeleton rows for tables
- skeleton cards/widgets for the dashboard
- skeleton blocks for charts
- inline spinners for small, scoped actions (e.g., a drawer save)

Avoid a blank white screen or a single centered spinner for a whole complex screen where a skeleton better previews the eventual layout.

---

# 17. Empty States

Every table, list or widget has a clear empty state explaining why it is empty, with a relevant next action where one exists (e.g., "No campaigns yet — Create Campaign").

Empty states on desktop may include more explanatory text and a visible call-to-action button, consistent with the larger available space.

---

# 18. Error States

Errors are understandable, actionable where possible, and non-technical for end users. Desktop may additionally surface a developer-facing diagnostic detail (for example, a collapsible "technical details" section) without exposing secrets, stack traces, or internal implementation details to non-technical users by default. Exact treatment: **NOT YET FINALIZED.**

Do not expose stack traces, database errors, API secrets or internal implementation details in the default user-facing error message.

---

# 19. Desktop Information Density

Desktop intentionally shows more information per screen than mobile:

- more columns per table
- more widgets per dashboard view
- side-by-side panels (list + detail, or form + preview)
- denser KPI groupings

Rules:

- Density serves comprehension and speed for Admin users doing complex work; it is not density for its own sake.
- Every element still has a purpose, per the shared design system principles in `FRONTEND_ARCHITECTURE.md` Section 14.
- Avoid cramming unrelated data into a single view merely because space is available.

---

# 20. Desktop Responsive Behavior

Desktop Admin assumes a desktop/laptop viewport as its baseline, but should still respond sensibly to different desktop and large-tablet widths:

- wide screens: full multi-column layouts, all sidebar labels visible
- narrower desktop/laptop widths: secondary columns or panels may collapse first, before the sidebar changes
- the sidebar is the last element to change; it does not disappear into a hamburger menu on desktop widths

Exact breakpoints for these transitions: **NOT YET FINALIZED**, per `FRONTEND_ARCHITECTURE.md` Section 15.

Desktop Admin is not required to be usable on phone-sized viewports; that experience is covered entirely by `MOBILE_UI_SPEC.md`.

---

# 21. Desktop Interaction Patterns

- Hover states are used for affordance (row highlight, button hover, tooltips) since desktop assumes a mouse/trackpad.
- Keyboard navigation and shortcuts are supported for efficiency where practical; exact shortcut set is **NOT YET FINALIZED.**
- Multi-select and bulk actions (Section 9) are a desktop-specific capability not present on mobile.
- Drag-and-drop may be used for specific builders (for example, automation steps); whether and where it is used is **NOT YET FINALIZED.**
- Right-click context menus are not assumed unless explicitly decided later.

---

# 22. Desktop Accessibility

Support:

- full keyboard navigability (tab order, focus visible)
- sufficient color contrast
- semantic structure and labeled controls
- accessible tables (headers associated with data cells)
- accessible dialogs and drawers (focus trapping, escape to close)
- no information conveyed by color alone
- shadcn/ui's accessible primitives are used rather than replaced

Exact accessibility target level: **NOT YET FINALIZED**, per `FRONTEND_ARCHITECTURE.md` Section 23.

---

# 23. Desktop Performance

Desktop screens can be heavier than mobile screens but still must stay responsive:

- paginate or virtualize large tables rather than rendering everything at once
- lazy-load charts and heavy widgets not visible on initial scroll
- avoid blocking the UI thread with large synchronous computations
- avoid unnecessary re-renders when filters or table state change

Numeric performance budgets: **NOT YET FINALIZED**, per `FRONTEND_ARCHITECTURE.md` Section 22.

---

# 24. Desktop Branding

The desktop interface uses the approved Broastin identity and the visual direction in Section 3: dark burgundy/red sidebar, clean light content area, white cards, subtle shadows, rounded corners.

Exact colors, typography and design tokens are locked in `DESIGN_SYSTEM.md` and must match the approved reference; they are not redefined here.

---

# 25. Desktop vs Mobile Rule

NEVER solve a desktop design decision by assuming the mobile layout, and never derive the mobile layout from the desktop one.

- Desktop is not the mobile UI stretched horizontally.
- Mobile is not the desktop UI compressed.
- Both share brand, data concepts, business terminology and feature architecture (per `FRONTEND_ARCHITECTURE.md` Section 3), but use independently designed layouts, navigation, density and interaction patterns.

---

# 26. Development Rule

Desktop Admin screens are built following the same one-section-at-a-time method defined in `CLAUDE.md` and `FRONTEND_ARCHITECTURE.md`:

1. Sidebar entry
2. Route
3. Screen shell
4. Desktop layout (table/dashboard/form/builder as appropriate)
5. Components
6. Mock data
7. Interactions
8. Loading state
9. Empty state
10. Error state
11. Desktop browser testing
12. Fix issues
13. Mark complete

A section's desktop implementation and its mobile implementation (where the section has a mobile presence) are tracked as part of the same overall section completion, per `NAVIGATION.md` Section 34.

---

# 27. Desktop Definition of Done

A desktop screen is complete only when:

- the correct route exists
- the correct sidebar navigation and active-state highlighting work
- the UI follows the approved desktop visual direction (Section 3)
- no mobile layout is being stretched into it
- table/filter/form/builder interactions work with mock data
- loading state works
- empty state works
- error state works
- keyboard navigation works at a basic level
- no obvious console/runtime errors exist
- existing functionality elsewhere in the application remains intact

---

# 28. Forbidden Desktop Patterns

Do NOT:

- stretch the mobile layout to fill desktop space
- use mobile-style bottom sheets in place of desktop dialogs/drawers
- collapse the sidebar into a hamburger menu
- hide complex functionality that desktop is meant to expose (campaign builders, automation builders, bulk operations, advanced configuration)
- redesign the approved sidebar/header visual direction without approval
- introduce a different navigation concept than the one defined in `NAVIGATION.md`
- hard-code production data
- expose technical/internal navigation items forbidden in `NAVIGATION.md` Section 39

---

# 29. Fixed Desktop Design Principle (Restated)

The final desktop experience should feel like a dedicated Broastin Admin console — a professional, business-management application for complex and data-heavy work.

Not a mobile app stretched to fill a monitor. Not a generic admin template unrelated to the approved visual direction.

The Admin should be able to manage campaigns, automation, segmentation, bulk operations and advanced analytics efficiently from a desktop.

---

# 30. Relationship to MOBILE_UI_SPEC.md

Mobile UI is defined separately in `MOBILE_UI_SPEC.md`. That document must NOT be merged into this file.

The two specifications share:

- brand
- data concepts
- business terminology
- feature architecture

But they use independently designed:

- layouts
- navigation
- information density
- interaction patterns
- component arrangements

---

# 31. What Is NOT YET FINALIZED

- exact brand color values, typography scale and spacing tokens (owned by `DESIGN_SYSTEM.md`)
- sidebar collapse behavior and icon-only rail
- global search scope
- breadcrumb placement
- table column sets per feature
- responsive column-hiding rules for narrower desktop widths
- drawer side/width behavior
- charting library choice
- automation builder interaction model
- draft/save behavior for campaigns and automation workflows
- developer-facing error detail treatment
- minimum supported desktop width and exact breakpoints
- keyboard shortcut set
- drag-and-drop usage
- accessibility target level
- performance budgets

---

# 32. Final Locked Rules

1. Desktop Admin is a first-class, purpose-built application experience.
2. Desktop is NOT a stretched mobile UI.
3. The sidebar is the primary desktop navigation; it does not collapse into a hamburger menu.
4. The approved desktop visual direction (dark burgundy/red sidebar, light content, white cards, rounded corners, subtle shadows) is fixed and not redesigned.
5. Desktop handles complex, data-heavy work: tables, bulk actions, campaign creation, automation building, advanced analytics, configuration.
6. Tables, filter bars, drawers and dialogs are the primary desktop patterns, in place of mobile's cards, sheets and bottom navigation.
7. Desktop information density is intentional and still purposeful, not clutter for its own sake.
8. Existing QR Ordering must be preserved.
9. ManageMe remains behind the integration boundary.
10. Backend implementation must not leak into UI.
11. One section is completed before moving to the next.
12. Mobile UI is documented separately and never merged into this file.
13. Any major change to these rules, or to the approved visual direction, requires explicit approval.

---

*End of DESKTOP_UI_SPEC.md.*
