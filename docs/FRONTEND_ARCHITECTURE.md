# FRONTEND_ARCHITECTURE.md — Broastin CRM / Growth OS

**Document hierarchy**

- `README.md` — high-level project overview
- `CLAUDE.md` — development operating contract
- `ARCHITECTURE.md` — architectural source of truth
- `FRONTEND_ARCHITECTURE.md` — frontend implementation blueprint (this document)

This document must not contradict the documents above. No locked architectural decision is changed here.

**Status legend**

- **CURRENT** — exists today
- **PLANNED** — decided and intended, not yet built
- **FUTURE** — possible later evolution
- **NOT YET FINALIZED** — intentionally open

**Current implementation status:** No frontend code for Broastin CRM / Growth OS has been built. Everything in this document describes PLANNED work unless explicitly marked otherwise.

---

# 1. Document Purpose

This document defines the frontend architecture for **Broastin CRM / Growth OS**.

It defines:

- frontend technology
- application structure
- React architecture
- routing
- layouts
- mobile application shell
- desktop application shell
- navigation
- feature architecture
- component architecture
- state management
- data access
- mock data
- forms
- validation
- responsive behavior
- PWA architecture
- loading/empty/error states
- performance
- accessibility
- frontend testing
- frontend development sequence

It is implementation-oriented but contains no application code. It is intended to let Claude Code build the frontend without repeatedly asking how the frontend should be structured.

**Out of scope for this document:** backend APIs, database schemas, authentication implementation details and external integration specifications. These are defined elsewhere, or are NOT YET FINALIZED.

**Core rules that govern everything below:**

- The frontend is built FIRST.
- The frontend initially uses MOCK DATA.
- Backend integration comes later, only after frontend structure and UX are established.

---

# 2. Locked Frontend Stack

The frontend uses exactly this stack:

| Technology | Role |
|---|---|
| React | UI component framework |
| Vite | Build tooling and dev server |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Base UI component primitives |
| Lucide Icons | Iconography |
| React Router | Routing and navigation |
| TanStack Query | Data access and server-state caching |
| Zustand | Client-side UI/application state |
| React Hook Form | Form state and submission |
| Zod | Validation schemas |
| PWA | Installable Manager application |

**Do not introduce:**

- Flutter
- Next.js
- another frontend framework
- another CSS framework
- another global state library
- another form library
- unnecessary UI libraries

If a requirement appears to need a new dependency, first evaluate whether an existing locked tool already solves it. A new major frontend dependency requires explicit approval.

Version numbers are NOT YET FINALIZED and must be chosen at project setup. Specific tooling for PWA generation, charts, date handling and testing is NOT YET FINALIZED and must be decided with approval (see Section 27).

---

# 3. Frontend Architecture Principle

One primary React codebase provides two intentionally different experiences:

1. Mobile Manager PWA
2. Desktop Admin

```
                    React Application
                           │
              ┌────────────┴────────────┐
              ↓                         ↓
       Mobile Manager              Desktop Admin
              │                         │
              └────────────┬────────────┘
                           ↓
                    Shared Frontend
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
     Features          Components          Services
                           │
                           ↓
                    Data Access Layer
                           │
                    Mock / Backend
```

**Shared between both experiences:**

- design system and design tokens
- reusable UI primitives
- types
- feature logic (hooks, services)
- data access layer
- validation schemas
- authentication boundary (implementation NOT YET FINALIZED)
- utilities

**Intentionally different:**

- application shell
- navigation
- layout and information density
- workflows
- controls and interaction patterns

Desktop must NOT be the mobile UI stretched. Mobile must NOT be the desktop UI compressed.

---

# 4. Relationship to the Existing QR Ordering Application

The existing QR Ordering application is an existing working asset. It must be audited and preserved before any frontend structure is applied to it.

- This document's folder structure applies to the Broastin CRM / Growth OS frontend.
- It must not be forced onto the existing QR Ordering application.
- Whether the Growth OS frontend lives in the same repository as QR Ordering, or in a separate repository, is **NOT YET FINALIZED** and depends on the audit.
- The `qr` feature module in the Growth OS is an operational view of QR Ordering inside the CRM. It is not a rebuild of QR Ordering.
- Existing reusable components, utilities and helpers discovered during the audit should be reused where appropriate.

---

# 5. Application Structure

Intended source structure (adapt after the audit; do not blindly overwrite any existing working architecture):

```
src/
├── app/                  Application bootstrap, providers, router, global config
├── layouts/              Shell layouts (mobile shell, desktop shell)
├── components/
│   ├── ui/               shadcn/ui primitives
│   ├── shared/           Reusable Broastin components (both experiences)
│   ├── mobile/           Mobile-specific reusable components
│   └── desktop/          Desktop-specific reusable components
├── features/
│   ├── dashboard/
│   ├── customers/
│   ├── orders/
│   ├── loyalty/
│   ├── campaigns/
│   ├── automation/
│   ├── feedback/
│   ├── referrals/
│   ├── membership/
│   ├── qr/
│   └── analytics/
├── settings/             Settings module (see Section 11)
├── integrations/
│   └── manageme/         Isolated; not used during the mock phase
├── services/             Data access layer entry points
├── mocks/                Mock data providers (replaceable)
├── hooks/                Shared hooks
├── stores/               Zustand stores
├── types/                Shared types
├── schemas/              Shared Zod schemas
├── utils/                Shared utilities
├── styles/               Global styles and design tokens
└── assets/               Static assets
```

**Placement rules**

- A component used by exactly one feature lives inside that feature.
- A component used by two or more features moves to `components/shared`.
- Mobile-only and desktop-only reusable components live in `components/mobile` and `components/desktop`.
- `integrations/` contains only external-system adapters. Nothing else may import ManageMe-specific code.
- Business concepts live in features, not in `components/`.

Whether `settings` is a top-level folder or `features/settings` is NOT YET FINALIZED; either is acceptable if consistent.

---

# 6. Feature Module Architecture

Each feature module is self-contained and follows the same internal shape:

```
features/<feature>/
├── screens/        Route-level screens
├── components/     Feature-specific components
├── hooks/          Feature hooks (data + interaction)
├── services/       Feature service functions (data access boundary)
├── schemas/        Feature Zod schemas
├── types/          Feature types
├── mock/           Feature mock data (see Section 16)
└── index.ts        Public exports of the feature
```

**Rules**

- A feature exposes a small public surface. Other features import only from its public exports.
- Features do not import from each other's internals.
- Features never contain database or backend implementation details in UI code.
- Shared behavior discovered across features is extracted to `components/shared`, `hooks/` or `utils/`.
- Only the folders a feature actually needs are created.

**Planned feature modules (none implemented):**

Dashboard, Customers, Orders, Loyalty, Campaigns, Automation, Feedback, Referrals, Membership, QR, Analytics, Settings.

---

# 7. Layered Frontend Architecture

Logical layers:

```
Presentation
↓
Feature / UI components
↓
Feature hooks / services
↓
Data access layer
↓
Integration / API layer
↓
Broastin Core
```

**Frontend-only phase (CURRENT PLAN):**

```
Presentation
↓
Feature hooks / services
↓
Mock data
```

**Later (after frontend is established):**

```
Presentation
↓
Feature hooks / services
↓
Supabase / integration APIs
```

**Layer responsibilities**

| Layer | Responsibility | Must NOT |
|---|---|---|
| Presentation (screens, components) | Render UI, handle user interaction | Contain data-source logic |
| Feature hooks | Expose data and actions to the UI via TanStack Query | Know whether data is mock or real |
| Feature services | Define the data operations the feature needs | Contain UI logic |
| Data access layer | Provide the data source (mock now, real later) | Leak source-specific formats into the UI |
| Integration layer | Translate external systems into Broastin concepts | Be referenced by UI |

The UI must require minimal rewriting when the data source changes from mock to real.

---

# 8. Application Bootstrap and Providers

The application root composes global providers in a single place (`app/`):

- router provider (React Router)
- query provider (TanStack Query)
- theme / design-token provider
- toast / notification provider
- authentication boundary provider (implementation NOT YET FINALIZED; a placeholder session context may be used during the mock phase and must be clearly marked as a mock)
- PWA update notifier (PLANNED, see Section 20)

Rules:

- Providers are registered once, at the root.
- No feature registers its own global provider.
- Mock-mode configuration is controlled centrally, not scattered across features.

---

# 9. Routing Architecture

React Router is the routing system.

**Principles**

- Every navigable screen has a stable route.
- Routes are defined centrally and composed from feature route definitions.
- Route-level screens are code-split (lazy-loaded) per feature.
- Deep links to a screen (e.g., a customer detail) must work on refresh.
- Unknown routes show a clear not-found screen.
- Route parameters are validated before use.
- Route paths are named consistently and kebab-case.

**Shell selection**

Two application shells exist: mobile and desktop. The shell is selected by viewport class (see Section 15). Routes should be shared where the same screen exists in both experiences, with the shell providing the surrounding navigation. Where a screen exists in only one experience (for example, automation builders on desktop), the route is declared for that experience only and the other experience shows a clear "available on desktop" message rather than a broken or cramped screen.

The exact route table is derived from `NAVIGATION.md` and is NOT YET FINALIZED in this document.

**Protected routes**

Route protection based on the roles Manager and Admin is PLANNED. Frontend route guarding is a convenience only. Real authorization is enforced at the backend/database level when backend integration begins. The final role hierarchy beyond Manager and Admin is NOT YET FINALIZED.

---

# 10. Layout Architecture

Layouts live in `layouts/` and are responsible only for structure, not business logic.

**Planned layouts**

| Layout | Purpose |
|---|---|
| Mobile Shell Layout | App bar, hamburger menu, content area, optional bottom navigation |
| Desktop Shell Layout | Sidebar, top bar, content area, optional secondary panels |
| Auth Layout | Sign-in and related screens (implementation NOT YET FINALIZED) |
| Minimal / Full-screen Layout | Focused flows, error and not-found screens |

**Rules**

- Layouts contain no data fetching.
- Layouts provide consistent page structure: page header, content region, action region.
- Page headers, section headers and action bars are shared components.
- Safe-area insets are respected on mobile devices.

---

# 11. Application Shell and Navigation Model

## 11.1 Shell-first development

The shell is built before any module content. The shell includes:

- layout
- hamburger menu
- navigation structure
- routing
- responsive foundation
- PWA foundation

## 11.2 Mobile Manager shell

Components:

- top app bar (title, hamburger trigger, contextual actions)
- hamburger menu (drawer) listing all major modules
- content area
- optional bottom navigation for the most frequent destinations (which destinations, if any, is NOT YET FINALIZED)
- quick-action entry point (NOT YET FINALIZED as to design)
- global search / customer lookup entry point

**Hamburger menu**

- lists the Mobile Manager modules: Dashboard, Customers, Orders, Loyalty, Feedback, Referrals, Membership, QR, Analytics, Settings (per `NAVIGATION.md`)
- Campaigns and Automation are Desktop Admin modules and are not listed in the Mobile Manager hamburger menu; their routes and functionality remain fully available in Desktop Admin
- expands to submenus per section
- highlights the active section
- closes after navigation
- is reachable one-handed
- is the master structure from which development proceeds

## 11.3 Desktop Admin shell

Components:

- persistent sidebar with nested navigation
- top bar (search, notifications, user menu)
- content area supporting multi-column layouts, tables and side panels
- breadcrumb region for deep screens

## 11.4 Navigation source of truth

- The complete navigation tree (menus and submenus) is defined in `NAVIGATION.md`.
- The frontend implements navigation from a single central navigation definition so mobile and desktop stay consistent.
- The navigation definition is data, not scattered JSX.
- Adding or reordering a menu item must require a change in one place.

Exact submenu content is NOT YET FINALIZED in this document.

---

# 12. Hamburger-Menu Development Method

Development proceeds one hamburger-menu section at a time:

```
Menu
→ Submenus
→ Screens
→ Screen content
→ Interactions
→ Mock data
→ Mobile testing
→ Desktop validation where relevant
→ Section complete
```

**Rules**

- Complete one section before starting the next.
- Do not leave multiple sections half-built.
- Maintain a visible completion state for every section.
- Completion state is recorded in project documentation (location NOT YET FINALIZED, for example a `PROGRESS.md`).
- A section is "complete" only when it satisfies the Definition of Done in Section 26.

**Section completion states**

| State | Meaning |
|---|---|
| Not started | No screens exist |
| Structure only | Route and placeholder exist |
| In progress | Being actively built (only one section at a time) |
| Complete | Definition of Done satisfied and tested on a real phone |

---

# 13. Component Architecture

## 13.1 Component tiers

1. **Primitives** — shadcn/ui components in `components/ui`.
2. **Shared components** — Broastin-specific reusable components (cards, list rows, status badges, stat tiles, empty states, page headers, filter bars, confirm dialogs).
3. **Experience components** — mobile-only or desktop-only reusable components.
4. **Feature components** — specific to one feature.
5. **Screens** — route-level composition.

## 13.2 Rules

- Prefer composition over configuration flags.
- Components are small, single-purpose and typed.
- Screens compose components; they do not contain large amounts of markup or logic.
- Avoid giant components; split when a component handles more than one concern.
- No inline data-source logic in components.
- No hard-coded colors, spacing or typography in screens; use design tokens and shared components.
- Use shadcn/ui and Tailwind consistently rather than custom one-off implementations.
- Icons come only from Lucide.
- Do not modify shadcn/ui primitives casually; extend through wrappers or variants.

## 13.3 Planned shared components (illustrative, not exhaustive)

- page header and section header
- stat / KPI tile
- customer card and customer list row
- order card and order list row
- status badge
- action bar and quick-action button
- filter bar and search field
- empty state, loading skeleton, error state
- confirmation dialog and bottom sheet
- data table (desktop) and card list (mobile)
- timeline / activity feed

---

# 14. Design System

A centralized design system supports both experiences without forcing identical layouts.

**Centralized design tokens**

- colors (including semantic status colors)
- typography scale
- spacing scale
- border radius
- shadows
- z-index layers
- motion durations

**Centralized components**

- buttons, inputs, cards, badges
- dialogs, sheets, drawers
- navigation components
- status indicators
- form field wrappers

**Rules**

- Tokens are defined once (in the Tailwind configuration and global styles) and reused everywhere.
- Semantic tokens (for example success, warning, danger, info) are used for status, never raw color values.
- Every UI element has a purpose; avoid decoration for its own sake.
- Consistency is required in spacing, typography, buttons, cards, forms, icons, status indicators, navigation, empty states, loading states and error states.
- The final visual identity (brand colors, typography choice) is NOT YET FINALIZED and must be decided before or during the shell phase, with the user's approval.
- Dark mode support is NOT YET FINALIZED.

---

# 15. Responsive Architecture

Responsive behavior is workflow-driven, not merely breakpoint-driven.

**Viewport classes**

| Class | Intent |
|---|---|
| Phone | Primary Manager experience (Mobile Shell) |
| Tablet | Relevant where applicable; exact behavior NOT YET FINALIZED |
| Desktop | Admin experience (Desktop Shell) |

Exact breakpoint values are NOT YET FINALIZED and are set once, centrally.

**Mobile characteristics**

- touch-first, large touch targets
- compact navigation, hamburger menu
- card-based lists rather than dense tables
- bottom sheets preferred over heavy modals
- minimal typing, sensible input types and keyboards
- sticky primary actions where helpful
- one-hand reachability considered

**Desktop characteristics**

- sidebar navigation
- tables with sorting, filtering and bulk selection
- multi-column layouts and side panels
- advanced controls and builders

**Rules**

- Do not assume that a resized browser window proves the UX is correct.
- Test at common Android phone widths, tablet widths where relevant, and desktop widths.
- Avoid loading desktop-only resources on mobile.
- Where a complex workflow belongs to desktop, the mobile experience shows a clear, friendly explanation instead of a cramped version.

---

# 16. Mock Data Architecture

Mock data is a first-class, replaceable data source.

**Requirements**

- Clearly identifiable as mock (for example a visible "Demo data" indicator in development builds; exact treatment NOT YET FINALIZED).
- Realistic and internally consistent across features (a customer's orders, loyalty and feedback must agree).
- Located in dedicated mock folders, never scattered inside UI components.
- Accessed only through feature services and hooks.
- Easy to replace with a real data provider later.

**Rules**

- Mock data must never be written to a production database.
- No fake production records may be created to populate a UI.
- Mock services simulate realistic behavior: latency, empty results, failures and pagination, so loading, empty and error states can be genuinely exercised.
- Mock data can be switched between scenarios (normal, empty, error) for testing; the mechanism is NOT YET FINALIZED.
- In-memory changes made during a session (for example marking a follow-up done) are acceptable to make interactions feel real; persistence of mock changes across sessions is NOT YET FINALIZED.

**Mock entity shapes**

Mock and view types used by the frontend are **provisional frontend view models**. They are NOT the Broastin standard data model, which is **NOT YET FINALIZED**. Frontend types must be kept easy to remap once the standard data model is defined.

**Replacement path**

```
UI
→ feature hook (unchanged)
→ feature service (unchanged interface)
→ data provider: mock  →  real
```

The service interface stays stable; only the provider behind it changes.

---

# 17. Data Access Architecture

**Pattern**

```
Screen / Component
→ Feature hook (TanStack Query)
→ Feature service
→ Data provider (mock now, real later)
```

**TanStack Query responsibilities**

- fetching and caching of data
- loading and error status
- background refetching where appropriate
- invalidation after changes
- optimistic updates where they improve perceived speed (used carefully)

**Rules**

- Query keys are defined centrally per feature and follow a consistent convention.
- Components never call data providers directly.
- Server-derived data is not duplicated into Zustand.
- Data-fetching hooks return consistent shapes for loading, empty, success and error.
- Cache times and refetch behavior are set deliberately per data type; exact values are NOT YET FINALIZED.
- Pagination and infinite lists follow one shared pattern.

The real backend provider (Supabase / integration APIs) is introduced only after the frontend is established. Its details are outside this document.

---

# 18. State Management

State is separated by nature:

| State type | Tool |
|---|---|
| Server / remote data | TanStack Query |
| Global client UI state | Zustand |
| Form state | React Hook Form |
| Local component state | React state |
| URL state (filters, tabs, selected items) | React Router (search params / path) |

**Zustand usage**

Appropriate for: menu open/closed, active filters that should survive navigation, UI preferences, transient global UI state, mock-session context.

**Rules**

- Do not introduce another global state system.
- Avoid unnecessary global state; prefer local state first.
- Do not store fetched server data in Zustand.
- Stores are small, feature-scoped where possible, and typed.
- State that should be shareable or restorable via link belongs in the URL.
- No sensitive data is persisted to browser storage without an explicit decision; persistence rules are NOT YET FINALIZED.

---

# 19. Forms and Validation

**Tools**

- React Hook Form manages form state.
- Zod defines validation schemas.

**Rules**

- Every form has a Zod schema, kept next to the feature (or in shared `schemas/` when reused).
- Types are derived from schemas where possible to avoid duplication.
- Validation messages are human-readable and specific.
- Errors appear next to the relevant field and are accessible to assistive technology.
- Forms preserve user input on validation failure.
- Submit buttons show a pending state and prevent double submission.
- Mobile forms are short, use appropriate input types and keyboards, and avoid unnecessary fields.
- Long or complex configuration forms belong to Desktop Admin.
- Unsaved-changes protection for meaningful forms is PLANNED; exact behavior NOT YET FINALIZED.

Business-specific validation rules (for example phone number handling) are NOT YET FINALIZED and must not be invented; they are defined when the relevant feature is specified.

---

# 20. PWA Architecture

The Manager application is an installable PWA.

**Goals**

- installable on the user's Android phone
- app-like navigation and standalone display
- appropriate caching
- controlled, reliable updates
- offline-aware behavior where appropriate

**Requirements**

- Web app manifest with app name, icons and theme configuration.
- Service worker for asset caching.
- Caching strategy is chosen deliberately; the exact strategy is NOT YET FINALIZED.
- The application shell loads quickly.
- Stale application assets must never silently prevent the user from receiving updates.

**Update system (PLANNED, NOT IMPLEMENTED)**

- The app detects when a new version is available.
- The user is informed with a clear in-app notification and can apply the update.
- The mechanism must be tested on a real device before it is described as working.
- Exact interaction design is NOT YET FINALIZED.

**Offline**

- Full offline functionality is NOT promised.
- Advanced offline functionality is NOT YET FINALIZED.
- When the network is unavailable, the app shows a clear offline state rather than failing silently.

**Real-device workflow**

```
Developer changes code
→ Build
→ Deploy
→ Install/update PWA on phone
→ Manual real-device testing
→ Identify issues
→ Fix
→ Deploy again
```

The production hosting provider is NOT YET FINALIZED. The frontend must remain deployment-platform agnostic.

---

# 21. Loading, Empty and Error States

Every data-driven screen must define all of these states:

| State | Requirement |
|---|---|
| Loading | Skeletons or progress indicators matching the layout; no layout jumps |
| Success | The normal populated view |
| Empty | Explains why it is empty and offers a next action where appropriate |
| Validation error | Field-level, human-readable messages |
| Network error | Clear message with a retry action |
| Permission error | Explains that access is not permitted, without exposing sensitive details |
| Unexpected error | Friendly message; useful diagnostics for developers without sensitive data |

**Rules**

- Silent failures are not allowed.
- Shared components provide consistent loading, empty and error presentations.
- An error boundary protects the application from full-screen crashes at appropriate levels.
- User-facing text avoids technical jargon; the user is not a developer.
- Mock services must be able to trigger each of these states for testing.

---

# 22. Performance

The application must be fast on real Android phones.

**Principles**

- keep the initial application shell lightweight
- lazy-load route-level screens and heavy modules
- do not load desktop-only resources on mobile
- avoid unnecessary global state and excessive re-rendering
- virtualize or paginate large lists
- minimize network requests and cache appropriately
- optimize images and assets
- avoid heavy libraries for simple needs
- avoid dependency bloat

**Rules**

- Do not optimize prematurely without evidence.
- Measure on a real mid-range Android device once enough of the application exists.
- Numeric performance budgets are NOT YET FINALIZED.
- Animations are used sparingly and must not harm responsiveness.

---

# 23. Accessibility and Usability

**Requirements**

- sufficient color contrast
- touch targets large enough for comfortable use
- keyboard navigability on desktop
- visible focus states
- semantic structure and labeled controls
- form errors announced accessibly
- no information conveyed by color alone
- readable text sizes
- respect for reduced-motion preferences
- shadcn/ui's accessible primitives are used rather than replaced

**Usability principles**

- clear information hierarchy
- consistent patterns across sections
- easy to learn
- minimal steps for frequent tasks
- destructive actions require confirmation
- feedback for every user action (success, failure, progress)

The accessibility standard level to target is NOT YET FINALIZED.

---

# 24. Language and Localization

The interface language is English unless otherwise specified.

Localization, multi-language support, currency formatting and date/time formatting conventions are **NOT YET FINALIZED**. Formatting logic must nevertheless be centralized in shared utilities rather than repeated in components, so it can be adapted later.

---

# 25. Frontend Testing

Testing is required for every completed section.

**Minimum checks per section**

- navigation works
- rendering is correct
- responsive layout is correct
- interactions work
- loading state
- empty state
- error state
- mobile touch behavior
- desktop behavior where applicable
- no obvious console errors
- existing functionality is intact

**Real-device testing**

- The user's real Android phone is a required test device.
- A mobile feature is not complete merely because it works in desktop browser developer tools.
- After meaningful milestones: build, deploy, open the PWA on the phone, and check navigation, touch interaction, loading, layout, keyboard behavior, scrolling, dialogs/sheets, and error and empty states.

**Automated testing**

Automated testing tooling and coverage targets are **NOT YET FINALIZED**. No testing dependency may be added without following the dependency rule in Section 2.

---

# 26. Definition of Done (Frontend Section)

A frontend section is complete only when:

- all its menus, submenus and screens exist and are routable
- screen content is implemented with consistent components
- interactions work with mock data
- loading, empty and error states exist
- mobile layout is verified, including on a real phone
- desktop layout is validated where relevant
- no obvious console errors remain
- existing functionality still works
- documentation and completion state are updated
- the user can understand what changed

Only then may development move to the next section.

---

# 27. Frontend Development Sequence

Required order:

1. Audit existing QR Ordering and Supabase (prerequisite, outside the frontend scope).
2. Documentation.
3. App shell.
4. Mobile Manager shell.
5. Desktop Admin shell.
6. Hamburger menu.
7. All major modules and planned submenus (structure).
8. Routes.
9. Placeholder screens with consistent layouts.
10. Real-device PWA testing of the structure.
11. Section-by-section build, one at a time: screen content → interactions → mock data → mobile testing → desktop validation → section complete.
12. Backend integration (only after frontend structure and UX are established).
13. ManageMe integration.
14. Real data.

## 27.1 First frontend milestone

The first milestone is NOT a functional CRM. It is:

**COMPLETE FRONTEND NAVIGATION AND SCREEN STRUCTURE.**

It includes the shell, hamburger menu, all major modules, all planned submenus, routes, placeholder screens, consistent layouts and real-device PWA testing. Detailed module content begins only after this milestone is stable.

## 27.2 Section order

The order in which sections are completed is controlled by the project development plan. The order is NOT YET FINALIZED in this document, and only one section is in progress at a time.

---

# 28. Integration Boundary in the Frontend

- Nothing in the frontend depends on ManageMe-specific structures.
- ManageMe-specific code, if ever needed on the frontend side, lives only under `integrations/manageme/`.
- Frontend screens consume Broastin concepts only.
- During the mock phase, `integrations/` remains unused.
- No frontend code may invent ManageMe endpoints or response formats.
- The exact ManageMe integration mechanism is NOT YET FINALIZED.

---

# 29. Security in the Frontend

- Only public / client-safe configuration exists in frontend code.
- Never place Supabase service-role keys, API secrets, private credentials, database passwords or ManageMe credentials in frontend code.
- Never commit secrets to Git.
- Environment configuration follows the environment-variable approach; exact setup is NOT YET FINALIZED.
- UI role restrictions are a convenience only; real authorization is enforced at the backend/database level.
- Sensitive customer data displayed in the UI must be handled with care; nothing sensitive is logged to the console.
- Authentication implementation is NOT YET FINALIZED.

---

# 30. What Is Locked

- React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, React Router, TanStack Query, Zustand, React Hook Form, Zod, PWA
- one primary React codebase with two intentionally different experiences
- Mobile Manager PWA as the main application
- separate Desktop Admin experience
- mobile-first UX
- frontend-first development
- mock-data-first frontend phase
- data access behind feature hooks and services
- hamburger-menu-driven, one-section-at-a-time development
- ManageMe isolated behind an adapter boundary
- real-device testing on the user's phone
- no new major dependency or architecture change without explicit approval

---

# 31. What Is NOT YET FINALIZED

- repository arrangement relative to the existing QR Ordering application (after audit)
- exact route table (derived from `NAVIGATION.md`)
- exact navigation tree and submenus
- bottom navigation destinations, if any
- quick-action design
- section completion order
- visual identity (brand colors, typography)
- dark mode support
- exact breakpoint values and tablet behavior
- PWA tooling and caching strategy
- PWA update notification design
- advanced offline behavior
- chart, date-handling and testing tooling
- automated testing approach and coverage targets
- mock scenario switching mechanism and mock persistence
- query cache and refetch settings
- local persistence rules
- performance budgets
- accessibility target level
- localization, currency and date/time formatting conventions
- business-specific validation rules
- authentication implementation and final role hierarchy beyond Manager and Admin
- environment and deployment configuration
- production hosting provider
- location of the progress-tracking document

---

# 32. Change Control

Changes to locked frontend decisions follow the process defined in `CLAUDE.md` and `ARCHITECTURE.md`:

```
Requirement
→ evaluation against existing tools
→ documentation
→ explicit approval if a locked decision is affected
→ implementation
→ testing
→ documentation update
```

This document must be kept synchronized with the actual frontend. It must never describe a feature as implemented when it is only planned.

---

# 33. Current Frontend Status

**Status:** FRONTEND ARCHITECTURE DEFINED / FRONTEND NOT YET BUILT

**Immediate next activity:** Audit the existing QR Ordering project and existing Supabase project.

**After the audit:** Begin the frontend application shell, then complete the navigation and screen structure milestone (Section 27.1).

---

*End of FRONTEND_ARCHITECTURE.md.*
