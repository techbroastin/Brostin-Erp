# IMPLEMENTATION_PLAN.md — Broastin CRM / Growth OS

**This is the official implementation roadmap for the Broastin CRM / Growth OS project.**

This is an IMPLEMENTATION PLAN. It does NOT replace:

- `README.md`
- `CLAUDE.md`
- `ARCHITECTURE.md`
- `FRONTEND_ARCHITECTURE.md`
- `NAVIGATION.md`
- `MOBILE_UI_SPEC.md`
- `DESKTOP_UI_SPEC.md`
- `DESIGN_SYSTEM.md`

Those documents remain authoritative for their respective areas.

**Do NOT:**

- change the locked architecture
- redesign the approved UI
- introduce a different frontend framework
- introduce a different backend architecture
- add AWS
- replace Supabase
- replace the existing QR Ordering application
- implement ManageMe integration directly inside UI components

The purpose of this file is to define the **BUILD ORDER** and **DEVELOPMENT RULES**.

---

# 1. Project Objective

Build the Broastin CRM / Growth OS as a Progressive Web App first.

- **Primary application:** Mobile Manager PWA
- **Secondary application:** Desktop Admin
- **Existing application:** QR Ordering
- **Backend:** Existing Supabase project
- **External POS:** ManageMe initially
- **Future:** Broastin-owned POS/Billing can be integrated later

The frontend must therefore be developed independently enough that the POS provider can be replaced later without rebuilding the CRM UI.

---

# 2. Development Strategy

The project must be built in controlled phases. Do NOT attempt to build the entire application simultaneously.

**Development order:**

- **PHASE 0** — Project validation
- **PHASE 1** — Frontend foundation
- **PHASE 2** — Design system
- **PHASE 3** — Application shell
- **PHASE 4** — Mobile navigation
- **PHASE 5** — Desktop navigation
- **PHASE 6** — Dashboard
- **PHASE 7** — Customers
- **PHASE 8** — Orders
- **PHASE 9** — Loyalty
- **PHASE 10** — Feedback
- **PHASE 11** — Referrals
- **PHASE 12** — Membership
- **PHASE 13** — QR administration
- **PHASE 14** — Analytics
- **PHASE 15** — Campaigns
- **PHASE 16** — Automation
- **PHASE 17** — Settings
- **PHASE 18** — ManageMe integration boundary
- **PHASE 19** — Supabase data integration
- **PHASE 20** — Authentication and authorization hardening
- **PHASE 21** — PWA installation/offline behavior
- **PHASE 22** — Testing
- **PHASE 23** — Production deployment

Do not skip foundational phases simply to reach feature screens faster.

---

# 3. Phase 0 — Project Validation

Before writing application code, inspect the existing repository. Identify:

- current frontend framework
- package manager
- existing source structure
- existing QR Ordering application
- Supabase configuration
- environment files
- existing components
- existing routing
- existing PWA configuration

**DO NOT** rebuild the project.

**DO NOT** initialize a second application if a suitable existing application already exists.

**DO NOT** delete existing QR Ordering code.

Create a written assessment before making structural changes.

**Required result:** The developer must know exactly what already exists.

---

# 4. Phase 1 — Frontend Foundation

Establish:

- application entry
- routing foundation
- shared layout system
- environment configuration
- component architecture
- feature/module structure
- error boundary
- loading infrastructure

The frontend must follow `FRONTEND_ARCHITECTURE.md`.

Do not put business logic directly into page components.

---

# 5. Phase 2 — Design System

Implement `DESIGN_SYSTEM.md`.

First implement reusable foundations:

- colors
- typography
- spacing
- radius
- shadows
- buttons
- inputs
- cards
- badges
- tabs
- dialogs
- drawers
- tables
- loading states
- empty states
- error states

Do NOT begin building complex business pages before the reusable visual foundation exists.

---

# 6. Phase 3 — Application Shell

Build the main application shell.

**Shared:**

- branding
- theme
- routing
- authentication boundary
- error handling
- loading handling

**Desktop:**

- persistent sidebar
- top header
- content area

**Mobile:**

- mobile header
- hamburger menu
- content area
- mobile navigation behavior

**CRITICAL:** Mobile shell and Desktop shell are separate layouts. Do NOT implement:

```
Desktop shell
→ CSS shrink
→ mobile
```

---

# 7. Phase 4 — Mobile Navigation

Build the Mobile Manager hamburger menu exactly according to `NAVIGATION.md`.

**LOCKED MOBILE MODULES:**

```
Dashboard
Customers
Orders
Loyalty
Feedback
Referrals
Membership
QR
Analytics
Settings
```

**Campaigns:** NOT MOBILE

**Automation:** NOT MOBILE

Do not expose them in the mobile hamburger menu. Their routes may still exist for Desktop Admin.

---

# 8. Phase 5 — Desktop Navigation

Build the Desktop Admin navigation.

**Desktop modules:**

```
Dashboard
Customers
Orders
Loyalty
Campaigns
Automation
Feedback
Referrals
Membership
QR
Analytics
Settings
```

Desktop navigation must remain independent from the mobile hamburger menu.

---

# 9. Phase 6 — Dashboard

Build dashboard UI using the approved desktop UI, the approved mobile UI, and `DESIGN_SYSTEM.md`.

First use controlled mock data. Do NOT immediately connect every dashboard metric to backend data.

Build:

- KPI cards
- summaries
- charts
- recent activity
- quick actions

Use placeholders only where final business metrics are not yet defined. Do not invent permanent KPI definitions.

---

# 10. Phase 7 — Customers

Build Customers.

**Mobile:**

- customer list
- search
- filters
- customer card
- customer detail

**Desktop:**

- customer table
- filters
- sorting
- pagination
- customer detail
- Customer 360

Start with mock data. Then connect to Supabase after UI behavior is validated.

---

# 11. Phase 8 — Orders

Build Orders.

**Mobile:**

- order list
- order summary
- order detail

**Desktop:**

- order table
- filters
- sorting
- pagination
- order detail
- customer relationship

Do not make ManageMe API calls directly from visual components.

---

# 12. Phase 9 — Loyalty

Build:

- loyalty overview
- customer points/balance
- rewards
- activity

Complex administration remains primarily desktop.

Do not invent final loyalty rules. Use configurable structures where rules are not finalized.

---

# 13. Phase 10 — Feedback

**Mobile:**

- feedback summary
- feedback detail

**Desktop:**

- feedback table
- filters
- ratings
- status
- customer relationship
- detail view

Support useful empty/loading/error states.

---

# 14. Phase 11 — Referrals

Build:

- referral overview
- referral records
- customer relationship
- reward/status information

Do not invent financial/referral rules that are not approved.

---

# 15. Phase 12 — Membership

Build:

- membership overview
- members
- plans
- activity

Complex plan configuration should remain desktop-oriented.

---

# 16. Phase 13 — QR Administration

Integrate the existing QR Ordering application into the Broastin ecosystem.

**CRITICAL:**

- Do NOT rebuild the QR Ordering application.
- Do NOT break the existing ordering flow.

The CRM should connect to the existing QR system through a defined integration boundary. The customer-facing QR Ordering UI remains independent.

Admin functionality can expose:

- QR order overview
- QR configuration
- QR-related analytics where supported

---

# 17. Phase 14 — Analytics

Build analytics after the core operational modules exist.

**Mobile:** Provide useful high-level analytics only.

**Desktop:** Provide richer analytics.

Possible areas: sales, customers, orders, loyalty, marketing.

Do not create fake analytics. Use mock data until real data sources are connected.

---

# 18. Phase 15 — Campaigns

**Campaigns are DESKTOP ADMIN ONLY.**

Do NOT add Campaigns to Mobile Manager navigation.

Build:

- campaign list
- campaign creation
- campaign detail
- audience selection
- scheduling
- performance

Actual external marketing integrations must be implemented behind service boundaries. Do not hard-code a specific provider into the UI layer.

---

# 19. Phase 16 — Automation

**Automation is DESKTOP ADMIN ONLY.**

Do NOT add Automation to Mobile Manager navigation.

Build the visual workflow management interface first. Potential structure:

```
Trigger
↓
Conditions
↓
Actions
↓
Timing
↓
Status
```

The first implementation can be UI/mock-data driven. Do NOT implement a production automation engine merely to complete the UI.

---

# 20. Phase 17 — Settings

Build settings after the main modules.

Potential areas: profile, business settings, users, roles, permissions, integrations, notifications, system settings.

Do not expose technical configuration unnecessarily.

---

# 21. Phase 18 — ManageMe Integration Boundary

ManageMe is the planned initial POS/Billing provider.

The architecture must treat ManageMe as an external data source.

**Use:**

```
UI
↓
Application/service layer
↓
Integration adapter
↓
ManageMe API
```

**NOT:**

```
UI
↓
ManageMe API
```

The UI must not know:

- API credentials
- endpoint details
- authentication details
- provider-specific payload structures

Create an adapter/service boundary.

**Future:** ManageMe → replaceable. Broastin POS → future provider.

The CRM UI should not require a rewrite when the provider changes.

---

# 22. Phase 19 — Supabase Data Integration

After the UI is validated with mock data, connect the application to the existing Supabase project.

Use Supabase for:

- authentication
- application data
- appropriate storage
- database access
- Row Level Security

**Do NOT** create a second Supabase project unless explicitly approved.

**Do NOT** expose service-role credentials in the frontend.

Use environment variables correctly.

---

# 23. Phase 20 — Authentication / Authorization

**Authentication:** Email + Password.

**Primary roles:** Manager, Admin. Potential future roles may be added.

**Mobile Manager:** Manager-oriented experience.

**Desktop:** Admin-oriented experience.

Role permissions must be enforced at the application/backend level. Do NOT rely only on hiding UI buttons.

---

# 24. Phase 21 — PWA

The primary application must be installable as a PWA.

Requirements:

- installable
- responsive
- mobile-first manager experience
- desktop admin experience
- app icon
- manifest
- service worker where appropriate
- appropriate caching

Offline support should be introduced carefully. Do not cache sensitive information insecurely.

**Initial objective:** User can install the Broastin Manager PWA on a phone and manually test updates.

---

# 25. Phase 22 — Testing

Testing must occur continuously. Minimum:

- route testing
- component testing where useful
- form validation
- mobile UI testing
- desktop UI testing
- authentication testing
- role testing
- API error testing
- loading state testing
- empty state testing
- PWA installation testing

Test on actual phone. Test desktop browser. Do not rely only on browser resizing.

---

# 26. Manual Mobile Testing

The user's phone is a primary testing device. Every major mobile update should be testable through the installed PWA.

**Workflow:**

```
Development
↓
Build
↓
Deploy preview/test environment
↓
Install/update PWA
↓
Manual phone testing
↓
Fix
↓
Repeat
```

Do not make the user wait until the entire application is finished before mobile testing.

---

# 27. Desktop Testing

Desktop must be tested at realistic laptop/desktop resolutions.

Verify: sidebar, header, tables, filters, dialogs, drawers, analytics, complex forms.

Do not assume desktop works simply because the browser has a larger width.

---

# 28. Feature Completion Rule

A feature is **NOT** complete when "the page renders."

A feature is complete when:

- route works
- UI is complete
- responsive behavior works
- loading state works
- empty state works
- error state works
- interactions work
- mock data works
- validation works
- no obvious console errors exist
- mobile/desktop behavior matches its specification

Backend integration may be a separate milestone.

---

# 29. Mock Data Strategy

Use realistic mock data during frontend development. Mock data must resemble actual business records.

Do not hard-code fake values directly into visual components. Use a mock service/data layer so it can later be replaced by Supabase/API services.

Conceptually:

```
UI
↓
Service interface
↓
Mock implementation
```

Later:

```
UI
↓
Service interface
↓
Supabase / API implementation
```

---

# 30. API Abstraction

All external integrations must have a service boundary. Examples:

```
CustomerService
OrderService
CampaignService
AutomationService
LoyaltyService
AnalyticsService
ManageMeService
```

Exact implementation names can be adjusted to the codebase.

**The principle is mandatory:** UI must not be tightly coupled to external providers.

---

# 31. Database Rule

Do not design database tables simply because a UI screen exists.

Database structure must follow `ARCHITECTURE.md` and actual business requirements.

Avoid creating unnecessary tables during the UI phase.

---

# 32. Security Rules

Never expose:

- Supabase service role key
- ManageMe credentials
- API secrets
- webhook secrets
- private integration tokens

in frontend source.

Never commit secrets. Use environment variables and secure backend/server-side handling where required.

---

# 33. No Premature Optimization

Do not add complex infrastructure before it is needed.

**Initial priority:** Working PWA + Clean UI + Supabase + ManageMe integration boundary.

Do not add AWS, Kubernetes, unnecessary microservices, unnecessary queues, or unnecessary infrastructure, unless future scale genuinely requires them.

---

# 34. Deployment Strategy

The application should initially use a simple deployment architecture compatible with the selected frontend stack.

Cloudflare Pages or another approved frontend deployment platform may be used according to the existing project setup.

Do not introduce a new hosting platform without approval.

---

# 35. Version Control

Every major phase should produce a stable checkpoint.

Before major structural changes:

- verify current build
- verify routes
- verify existing features
- commit/checkpoint changes

Never perform a destructive rebuild without explicit approval.

---

# 36. Change Control

The following require explicit approval:

- changing frontend framework
- changing backend
- changing Supabase architecture
- deleting QR Ordering
- changing mobile/desktop separation
- changing navigation architecture
- changing approved visual direction
- replacing ManageMe integration strategy
- introducing major infrastructure
- changing authentication architecture

Minor bug fixes do not require architectural approval.

---

# 37. Documentation Rule

When implementation decisions change: update the relevant documentation. Do not allow code and documentation to silently diverge.

However: do not modify locked documentation merely to justify an implementation shortcut. Fix the implementation instead.

---

# 38. Current Locked Navigation

**Mobile Manager:**

```
Dashboard
Customers
Orders
Loyalty
Feedback
Referrals
Membership
QR
Analytics
Settings
```

Campaigns ❌
Automation ❌

**Desktop Admin:**

```
Dashboard
Customers
Orders
Loyalty
Campaigns
Automation
Feedback
Referrals
Membership
QR
Analytics
Settings
```

Campaigns ✅
Automation ✅

**This is LOCKED.**

---

# 39. Current Locked Frontend Strategy

**Frontend:** PWA-first.

**Mobile:** Dedicated Manager UI.

**Desktop:** Dedicated Admin UI.

Do NOT implement:

```
single desktop layout
+
responsive shrinking
=
mobile
```

Instead: Mobile UI + Desktop UI share the design system and application architecture but have separate presentation strategies.

---

# 40. Current Locked Backend Strategy

**Backend:** Supabase.

**Existing Supabase project:** REUSE.

Do not create unnecessary replacement infrastructure.

---

# 41. Current Locked POS Strategy

**Initial POS:** ManageMe.

**CRM integration:** API/service boundary.

**Future:** Broastin-owned POS/Billing.

The CRM must remain provider-agnostic at the UI/application level.

---

# 42. Current Locked QR Strategy

**Existing QR Ordering:** KEEP.

Do not rebuild. Integrate into the broader Broastin ecosystem.

---

# 43. Building Rule

Build in this order:

```
Foundation
↓
Design System
↓
Shell
↓
Navigation
↓
Dashboard
↓
Core CRM modules
↓
Advanced modules
↓
Integrations
↓
Backend
↓
Authentication hardening
↓
PWA
↓
Testing
↓
Production
```

Do not reverse this order without a concrete reason.

---

# 44. Do Not Build Placeholder Everything

Do not create 20 empty pages just to claim all routes exist.

A route can exist during scaffolding. But development must proceed module-by-module.

When a module is marked COMPLETE: it must actually work at the frontend level.

---

# 45. Definition of Phase Complete

A phase is complete only when:

- implementation exists
- relevant documentation is respected
- route works
- UI works
- no major console errors
- mobile/desktop behavior is correct
- existing functionality is not broken
- checkpoint is stable

---

# 46. First Implementation Task

When development begins, do NOT immediately build Customers, Orders, Campaigns, or Automation.

First inspect the repository. Then verify:

1. frontend framework
2. existing QR Ordering app
3. Supabase project connection
4. current routing
5. current PWA configuration
6. existing design/components
7. package dependencies
8. environment configuration

Only after this inspection should implementation begin.

---

# 47. First UI Build Order

After repository inspection:

1. Design tokens
2. Shared UI primitives
3. Mobile shell
4. Desktop shell
5. Mobile hamburger
6. Desktop sidebar
7. Top headers
8. Routing
9. Dashboard

Then proceed module-by-module.

---

# 48. Final Locked Rules

1. Do not rebuild the project.
2. Continue from the existing project.
3. Preserve existing QR Ordering.
4. Use Supabase.
5. PWA first.
6. Mobile Manager is a dedicated mobile experience.
7. Desktop Admin is a dedicated desktop experience.
8. Mobile and Desktop are not the same layout.
9. Campaigns are Desktop Admin only.
10. Automation is Desktop Admin only.
11. ManageMe is the initial POS provider.
12. ManageMe must be isolated behind an integration/service boundary.
13. Future Broastin POS must be replaceable without rewriting the CRM.
14. Use mock data before real backend integration where practical.
15. Build reusable components before complex pages.
16. Build one module at a time.
17. Test on the actual phone.
18. Test desktop separately.
19. Never expose secrets in frontend code.
20. Never change locked architecture without explicit approval.
21. Never silently resolve architectural contradictions.
22. Documentation and implementation must remain synchronized.
23. Do not add unnecessary infrastructure.
24. Do not over-engineer the initial release.
25. Working product takes priority over unnecessary complexity.

---

*End of IMPLEMENTATION_PLAN.md*
