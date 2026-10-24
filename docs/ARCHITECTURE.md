# ARCHITECTURE.md — Broastin CRM / Growth OS

**Document hierarchy**

- `README.md` — high-level project overview
- `CLAUDE.md` — development operating contract
- `ARCHITECTURE.md` — architectural source of truth (this document)

This document must not contradict `README.md` or `CLAUDE.md`.

**Status legend**

- **CURRENT** — exists today
- **PLANNED** — decided and intended, not yet built
- **FUTURE** — possible later evolution
- **NOT YET DECIDED / NOT YET FINALIZED** — intentionally open

---

# 1. Document Purpose

This document defines the architecture of **Broastin CRM / Growth OS**. It is the architectural reference for future development.

It explains:

- system boundaries
- applications
- data flow
- integration boundaries
- frontend architecture
- backend architecture
- POS independence
- QR Ordering integration
- ManageMe integration
- future Broastin POS compatibility
- mobile/desktop application separation
- extensibility principles

It does not contain implementation code, real credentials, keys or secrets, and it does not define undocumented APIs, schemas, endpoints or infrastructure.

---

# 2. Architectural Principle

**BROASTIN CORE MUST REMAIN INDEPENDENT OF THE CURRENT POS.**

- The current POS is **ManageMe Premium**.
- ManageMe is replaceable.
- The future Broastin POS is also a replaceable client of Broastin Core.
- The CRM, customer data, loyalty, marketing, automation and analytics layers must not be structurally dependent on ManageMe's internal database model.

---

# 3. High-Level System Architecture

This is a **logical** architecture diagram. It is not a claim that every connection has already been implemented.

```
                    BROASTIN ECOSYSTEM

                         BROASTIN CORE
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ↓                     ↓                     ↓
      CRM                Customer/Growth        Analytics
        │                     │
        ├── Customers         ├── Loyalty
        ├── Orders            ├── Campaigns
        ├── Feedback          ├── Automation
        ├── Segments          ├── Referrals
        └── Customer 360      └── Membership
```

**External / operational systems**

Current POS:

```
ManageMe POS
     ↓
ManageMe Integration / Adapter
     ↓
Broastin Core
```

Existing QR Ordering:

```
QR Ordering
     ↓
Broastin Core
```

Future:

```
Broastin POS
     ↓
Broastin Core
```

---

# 4. System Components

## 4.1 Broastin Core — PLANNED

**Purpose:** Central business/data layer for the Broastin ecosystem.

Responsibilities eventually include:

- customer identity
- customer profiles
- customer activity
- orders
- loyalty
- marketing data
- campaign data
- automation state
- feedback
- referrals
- membership
- analytics data
- integration-normalized data

The detailed data model is **NOT YET FINALIZED**.

## 4.2 Mobile Manager PWA — PLANNED

**Purpose:** Main daily operational application for managers.

Responsibilities:

- dashboard
- customer lookup
- customer 360
- operational actions
- follow-ups
- alerts
- loyalty visibility
- feedback visibility
- campaign monitoring
- simple management tasks

The interface must be optimized for Android/mobile usage.

## 4.3 Desktop Admin — PLANNED

**Purpose:** Complex administration and data-heavy workflows.

Responsibilities:

- customer management
- segmentation
- campaign management
- automation builder
- bulk operations
- configuration
- advanced analytics
- administration

It shares the same core application/data architecture but has intentionally different UX.

## 4.4 QR Ordering — CURRENT (existing product)

- It currently has its own application and its own existing Supabase project.
- It must be audited before integration.
- It must not be blindly rebuilt.
- Eventually it becomes part of the Broastin ecosystem.

## 4.5 ManageMe Integration — PLANNED

ManageMe is the CURRENT POS. Its integration with Broastin Core is PLANNED.

ManageMe-specific logic must remain isolated:

```
ManageMe
→ Adapter
→ Broastin Standard Data Model
→ Broastin Core
```

The CRM must not directly consume ManageMe-specific structures throughout the frontend.

## 4.6 Future Broastin POS — FUTURE

```
Broastin POS
→ Broastin Core
```

It must be possible to replace ManageMe without rebuilding the CRM/Growth OS.

---

# 5. Frontend Architecture

Locked frontend stack and the high-level role of each technology:

| Technology | Role |
|---|---|
| React | UI component framework |
| Vite | Build tooling and development server |
| TypeScript | Type safety across the codebase |
| Tailwind CSS | Utility-based styling |
| shadcn/ui | Consistent, reusable UI component primitives |
| Lucide Icons | Icon set |
| React Router | Application routing and navigation |
| TanStack Query | Data fetching, caching and server-state handling |
| Zustand | Lightweight client-side state |
| React Hook Form | Form handling |
| Zod | Schema validation |
| PWA | Installable, app-like Manager experience |

No version numbers are locked by this document.

---

# 6. One Codebase / Two Experiences

The system uses **one primary React codebase** that provides:

1. Mobile Manager PWA
2. Desktop Admin

**Shared:**

- design system
- reusable components
- types
- business concepts
- data layer
- authentication
- API/service boundaries

**Different where appropriate:**

- navigation
- layout
- information density
- workflows
- controls
- interaction patterns

Desktop must NOT simply be the mobile UI stretched to a larger screen.

Mobile must NOT simply be the desktop UI compressed.

---

# 7. Frontend Layers

Logical structure:

```
Presentation
↓
Feature/UI components
↓
Feature hooks/services
↓
Data access layer
↓
Integration/API layer
↓
Broastin Core
```

**During the frontend-only phase:**

```
Presentation
↓
Feature hooks/services
↓
Mock data
```

**Later:**

```
Presentation
↓
Feature hooks/services
↓
Supabase / integration APIs
```

UI components must not directly contain database implementation.

---

# 8. Feature-Based Organization

Intended feature structure:

```
features/
├── dashboard/
├── customers/
├── orders/
├── loyalty/
├── campaigns/
├── automation/
├── feedback/
├── referrals/
├── membership/
├── qr/
└── analytics/
```

Conceptual shared areas:

```
components/
layouts/
services/
integrations/
hooks/
stores/
types/
utils/
```

This exact folder structure must not be forced onto the existing QR Ordering application before it is audited. The architecture adapts to existing working code where appropriate.

---

# 9. Data Flow

Logical data flow (PLANNED unless stated otherwise).

### POS data

```
ManageMe
→ ManageMe Adapter
→ normalized Broastin data
→ Broastin Core
→ CRM / Analytics / Loyalty / Growth features
```

### QR order data

```
QR Ordering
→ Broastin Core
→ Customer / Order / Growth features
```

### Future POS

```
Broastin POS
→ Broastin Core
→ same downstream systems
```

After normalization, the CRM should not care which POS generated an order.

---

# 10. Normalization Layer

The integration/normalization layer exists because different systems may use different:

- field names
- identifiers
- order structures
- customer structures
- status values
- timestamps
- payment representations

The integration layer must translate external system data into the Broastin standard model.

**STANDARD DATA MODEL: NOT YET FINALIZED.**

---

# 11. POS Independence

This is a critical architectural rule.

The following must NOT directly depend on ManageMe:

- customer profile
- CRM
- loyalty
- campaigns
- automation
- segmentation
- feedback
- referrals
- membership
- analytics

They must depend on Broastin Core's normalized concepts.

This enables:

- ManageMe → current POS
- Broastin POS → future POS
- a potential future external POS → possible integration

without redesigning the CRM.

---

# 12. QR Ordering Architecture

Existing QR Ordering must be treated as an existing application.

Before integration, the following must be audited:

- code
- dependencies
- Supabase
- schema
- authentication
- RLS
- order flow
- customer flow
- deployment
- reusable components
- risks

Only after the audit is the exact integration strategy finalized.

A possible outcome is that the existing QR Ordering application and existing Supabase project become part of Broastin Core. This is subject to the audit.

No migration or adoption has happened.

---

# 13. Supabase Architecture

Supabase is the locked backend platform.

Conceptually:

```
Frontend
→ Supabase/API layer
→ PostgreSQL / Supabase services
```

Potential Supabase capabilities:

- PostgreSQL
- Authentication
- Row Level Security
- Storage
- Edge Functions
- database functions/triggers where required

These must not be implemented automatically. Only what the product actually requires is used.

The existing QR Ordering Supabase project must be audited before creating a new project.

The exact Supabase schema is **NOT YET FINALIZED**.

---

# 14. Authentication and Authorization

- **Authentication:** Supabase Auth is the backend authentication foundation.
- **Roles:** Roles will eventually distinguish at least Manager and Admin.
- The final role hierarchy beyond these documented roles is **NOT YET FINALIZED**.
- Authorization must be enforced at the backend/database level where required.
- Frontend hiding is not sufficient security.

---

# 15. Mobile Navigation Architecture

Mobile Manager uses:

- application shell
- hamburger menu
- section navigation
- contextual screens
- quick actions
- mobile-friendly detail screens

Major planned modules:

- Dashboard
- Customers
- Orders
- Loyalty
- Campaigns
- Automation
- Feedback
- Referrals
- Membership
- QR
- Analytics
- Settings

The exact submenu structure will be documented separately in `NAVIGATION.md`. The complete navigation tree is not duplicated here.

---

# 16. Desktop Navigation Architecture

Desktop Admin uses a desktop-oriented navigation structure.

It can support:

- sidebar
- nested navigation
- tables
- filters
- bulk actions
- advanced configuration
- builders
- analytics

Exact navigation will be documented separately.

---

# 17. Development Architecture

Development is intentionally staged:

1. Audit existing QR Ordering and Supabase.
2. Documentation.
3. Frontend shell.
4. Complete navigation.
5. Complete frontend screens using mock data.
6. Real-device testing.
7. Backend integration.
8. QR Ordering integration.
9. ManageMe integration.
10. Real data.
11. Growth features.

Development must not skip directly to backend implementation during the frontend foundation stage.

---

# 18. Hamburger-Menu Development Model

Development is vertical by feature section.

Example:

```
Customers
→ All Customers
→ Segments
→ VIP
→ At Risk
→ Customer Events
→ complete testing
→ section complete
```

Then:

```
Orders
→ screens
→ interactions
→ testing
→ section complete
```

This avoids creating many disconnected half-built screens. The exact implementation order is controlled by the project development plan.

---

# 19. Mock Data Architecture

During frontend development:

```
UI
→ feature service/hook
→ mock data
```

The mock layer must be replaceable. Hard-coded customer/order objects must not be scattered across UI components.

When backend integration begins:

```
UI
→ same feature service/hook
→ real data provider
```

The UI should require minimal rewriting.

---

# 20. Integration Architecture

External integrations must be isolated.

Conceptually:

```
integrations/
├── manageme/
└── future integrations/
```

ManageMe-specific logic must not be placed inside generic customer/order components.

Integration adapters are responsible for translating external data into Broastin concepts.

The exact ManageMe API endpoints and synchronization mechanism are **NOT YET FINALIZED**.

---

# 21. Security Boundaries

**Frontend:** public/client-safe configuration only.

**Backend:** privileged operations, secrets, service credentials, protected integrations.

Never expose the following in browser/client code:

- Supabase service-role keys
- API secrets
- private credentials
- ManageMe private credentials

---

# 22. Performance Architecture

The application must be fast on real Android devices.

Principles:

- lazy-load heavy modules
- avoid unnecessary global state
- minimize network requests
- cache appropriate data
- avoid excessive re-rendering
- optimize large lists
- avoid loading unnecessary desktop-only resources on mobile
- keep the initial application shell lightweight

Do not prematurely optimize without evidence. Performance decisions should be measured when the application becomes sufficiently complete.

---

# 23. PWA Architecture

The Manager application is a PWA.

Architectural goals:

- installable
- responsive
- app-like navigation
- appropriate caching
- controlled updates
- offline-aware behavior where appropriate

Full offline functionality must not be promised unless separately specified (advanced offline functionality is **NOT YET FINALIZED**).

PWA update behavior must prevent stale deployments from causing confusing user experiences.

---

# 24. Deployment Architecture

The exact production hosting provider is **NOT YET FINALIZED**.

No hosting provider is permanently locked. The architecture must remain deployment-platform agnostic.

Required deployment stages:

```
Local
→ Preview
→ Production
```

Real-device testing should occur against a deployed preview/staging version before production where practical.

---

# 25. Scalability

The architecture must support future expansion without a complete rebuild.

Potential future expansion (FUTURE):

- Broastin POS
- additional stores
- advanced CRM
- advanced loyalty
- marketing automation
- customer segmentation
- reporting
- additional integrations
- delivery-related features
- multi-location capability if required later

Multi-location complexity must not be implemented now unless explicitly required. The architecture should remain capable of supporting it later.

---

# 26. Single-Shop Initialization

Initial product scope is Broastin Foods / the current Broastin operation.

- Do not introduce unnecessary enterprise multi-tenant architecture.
- Do not over-engineer for thousands of stores at the initial stage.
- Avoid hard-coding assumptions that would make future expansion impossible.

---

# 27. Architectural Boundaries

These boundaries must be maintained:

```
UI                     ≠  Business logic
Business logic         ≠  ManageMe integration
ManageMe integration   ≠  Broastin Core
Broastin Core          ≠  specific frontend
QR Ordering            ≠  CRM UI
Future POS             ≠  CRM implementation
```

The system communicates through defined service/data boundaries.

---

# 28. Error Handling

Every integration and data-driven screen must eventually account for:

- loading
- success
- empty state
- validation errors
- network errors
- permission errors
- unexpected server errors

Silent failures are not allowed.

User-facing error messages should be understandable. Developer-facing diagnostics should remain useful without exposing sensitive information.

---

# 29. Observability

The detailed observability strategy is **NOT YET FINALIZED**.

Eventually the system should support identifying:

- frontend errors
- API errors
- integration failures
- synchronization failures
- authentication problems
- important backend failures

No monitoring platform may be introduced without an explicit decision.

---

# 30. Architectural Decision Rule

When a new technical requirement appears:

1. Check existing architecture.
2. Check existing documentation.
3. Check whether current tools already solve the problem.
4. Prefer the simplest compatible solution.
5. Avoid introducing a new dependency unnecessarily.
6. Protect existing working functionality.
7. If the change affects a locked architectural decision, stop and request approval.

---

# 31. What Is Locked

- React-based frontend
- Vite
- TypeScript
- Supabase backend
- PWA Manager application
- Desktop Admin application
- one primary frontend codebase
- mobile-first Manager UX
- separate desktop UX
- frontend-first development
- mock-data-first frontend phase
- hamburger-menu-driven development
- one section completed before moving to the next
- ManageMe integration through an adapter boundary
- POS-independent Broastin Core
- existing QR Ordering must be audited and preserved
- future Broastin POS must be able to replace ManageMe
- architecture changes require explicit approval

---

# 32. What Is NOT YET FINALIZED

- exact Supabase schema
- final standard data model
- exact ManageMe API endpoints
- exact ManageMe synchronization mechanism
- final QR Ordering integration mechanism
- production hosting provider
- advanced offline functionality
- monitoring/observability platform
- final role hierarchy beyond documented roles
- multi-location architecture
- final automation engine implementation
- final analytics architecture
- future Broastin POS implementation

---

# 33. Architecture Evolution

This architecture is designed to evolve. Evolution must happen through:

```
Requirement
→ architectural evaluation
→ documentation
→ approval if locked architecture is affected
→ implementation
→ testing
→ documentation update
```

The architecture must never evolve silently.

---

# 34. Current Architectural Status

**Status:** ARCHITECTURE DEFINED / FRONTEND NOT YET BUILT

**Immediate next architectural activity:** Audit the existing QR Ordering project and existing Supabase project.

The audit must happen before deciding whether the existing Supabase project becomes the Broastin Core foundation.

After the audit, begin the frontend application shell.

---

# 35. Final Architectural Principles

1. Broastin Core is the center of the ecosystem.
2. ManageMe is a replaceable POS integration.
3. QR Ordering is an existing asset and must be preserved.
4. Future Broastin POS must be another client of Broastin Core.
5. CRM logic must not depend on a specific POS.
6. Mobile Manager is the primary daily-use interface.
7. Desktop Admin handles complex workflows.
8. One React codebase supports both experiences.
9. Frontend comes before backend integration.
10. Mock data comes before real data.
11. Development proceeds one hamburger-menu section at a time.
12. Existing working functionality must be preserved.
13. Architecture changes require explicit approval.
14. Documentation and implementation must remain synchronized.
15. Prefer simple, modular, maintainable architecture over unnecessary complexity.

---

*End of ARCHITECTURE.md.*
