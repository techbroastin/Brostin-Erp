# CLAUDE.md — Broastin CRM / Growth OS

This file is the permanent development instruction and operating contract for Claude Code on the Broastin CRM / Growth OS project.

`README.md` is the high-level project source of truth. It is the authoritative basis for project facts and locked architecture. Do not contradict it.

Do not invent features, APIs, database structures, integrations, credentials, business rules or technical decisions that have not been explicitly defined.

Do not change the locked architecture unless the user explicitly approves the change.

---

# 1. Role

You are the primary software engineering agent for the Broastin CRM / Growth OS project.

Your responsibility is to:

- inspect the existing project before modifying it
- follow the locked architecture
- preserve existing working functionality
- build the frontend first
- follow the documented development sequence
- maintain clean, modular and maintainable code
- test changes before considering a task complete
- keep documentation synchronized with implementation
- never silently change architectural decisions

The user is not a software developer. Therefore:

- do not require the user to understand implementation details
- do not unnecessarily expose complex technical choices
- provide concise progress information
- when user action is required, give exact actionable instructions
- never assume the user understands code, Git, Supabase or deployment internals

---

# 2. Project Source of Truth

The project documentation is part of the source of truth.

Primary high-level document: `README.md`

Other `.md` files will progressively define:

- architecture
- frontend architecture
- UI/UX rules
- navigation
- feature map
- development workflow
- Supabase architecture
- ManageMe integration
- QR Ordering integration
- data model
- PWA behavior
- testing
- security
- change history

Before making a significant change:

1. Read `README.md`.
2. Read the relevant documentation.
3. Inspect the existing implementation.
4. Determine whether the requested change conflicts with a locked decision.
5. If it conflicts, stop and ask for explicit approval.

Never silently override documentation.

---

# 3. Locked Product Architecture

- **Product:** Broastin CRM / Growth OS
- **Current POS:** ManageMe Premium
- **Existing product:** Broastin QR Ordering application
- **Existing backend:** Existing QR Ordering Supabase project
- **Central future application/data layer:** Broastin Core

**Current architecture:**

```
ManageMe POS
→ ManageMe Integration / Adapter
→ Broastin Core
→ CRM / Growth OS
```

**Existing QR Ordering:**

```
QR Ordering
→ Broastin Core
```

**Future:**

```
Broastin POS
→ Broastin Core
```

The CRM/Growth OS must never directly depend on ManageMe-specific database structures.

ManageMe-specific logic must remain isolated inside its integration/adapter layer.

The future Broastin POS must be able to replace ManageMe without rebuilding:

- Broastin Core
- CRM
- Loyalty
- Marketing
- Automation
- Analytics

---

# 4. Existing QR Ordering Project

Broastin already has a QR Ordering application and an existing Supabase project. This is an existing working asset.

Before modifying it:

1. Inspect the complete project structure.
2. Inspect package configuration.
3. Inspect frontend architecture.
4. Inspect Supabase configuration.
5. Inspect database tables.
6. Inspect relationships.
7. Inspect RLS policies.
8. Inspect functions.
9. Inspect triggers.
10. Inspect authentication.
11. Inspect storage.
12. Inspect existing application flows.
13. Identify existing reusable components.
14. Identify existing risks.
15. Document findings.

Do NOT immediately rebuild it.

Do NOT immediately create a new Supabase project.

The existing Supabase project must first be evaluated as a possible foundation for Broastin Core.

Do not delete or replace working QR Ordering functionality.

Do not perform destructive database changes without explicit approval.

Do not rename or remove existing tables merely to make the architecture cleaner.

If restructuring is necessary, explain the reason and obtain approval before destructive changes.

---

# 5. Locked Frontend Technology

Use:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- React Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- PWA

Do not introduce another frontend framework.

Do not migrate to Flutter.

Do not migrate to Next.js.

Do not introduce unnecessary UI frameworks.

Do not introduce multiple competing state-management systems.

Do not introduce another CSS framework.

If a new dependency appears necessary, evaluate whether an existing locked technology already solves the requirement.

Avoid dependency bloat.

---

# 6. Application Model

Use one primary React codebase.

The product has two intentionally different experiences:

1. Mobile Manager PWA
2. Desktop Admin

They share:

- core components
- business concepts
- routing architecture where appropriate
- API/data layer
- authentication
- design tokens
- reusable UI primitives

But they must NOT be treated as the same UI simply resized. Mobile and desktop must have intentionally different UX when the task requires it.

---

# 7. Mobile Manager PWA

The Mobile Manager PWA is the main application.

Design priority: **MOBILE FIRST.**

The manager should be able to use the application comfortably on a real Android phone.

Prioritize:

- fast loading
- simple navigation
- one-hand usability
- large touch targets
- clear hierarchy
- minimal typing
- quick actions
- readable cards
- useful alerts
- customer lookup
- operational actions
- simple workflows

Avoid:

- dense desktop-style tables on mobile
- tiny buttons
- excessive modal usage
- unnecessary fields
- complicated navigation
- large information dumps
- unnecessary animations

The mobile interface should feel like a purpose-built manager application, not a desktop website squeezed into a phone.

---

# 8. Desktop Admin

Desktop Admin is intended for complex and data-heavy work.

Use desktop capabilities for:

- campaign management
- audience segmentation
- automation builders
- configuration
- bulk operations
- advanced analytics
- detailed tables
- complex forms
- administration

Desktop can use:

- sidebar navigation
- tables
- filters
- multi-column layouts
- charts
- advanced controls
- builders

Do not force complex desktop workflows into the mobile Manager interface.

---

# 9. Frontend-First Development

This is a strict rule.

Frontend must be built BEFORE backend integration.

The initial frontend phase uses mock data.

Do not start implementing real database logic simply because a screen exists.

First establish:

- app shell
- navigation
- menus
- screens
- layouts
- UX
- interactions
- loading states
- empty states
- error states
- mock data
- responsive behavior

Only after frontend structure and UX are established should backend integration begin.

---

# 10. Development Order

The required development order is:

1. Existing QR Ordering + Supabase audit
2. Documentation
3. Frontend application shell
4. Complete navigation structure
5. Mobile Manager UI
6. Desktop Admin UI
7. Mock data and interactions
8. Backend integration
9. QR Ordering integration
10. ManageMe API integration
11. Real customer/order data
12. CRM
13. Loyalty
14. Marketing
15. Automation
16. Analytics
17. Future Broastin POS

Do not skip ahead unless explicitly instructed.

---

# 11. Hamburger-Menu Development Method

The frontend must be developed one hamburger-menu section at a time.

The process is:

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

Only then move to the next section.

Do NOT simultaneously start five different modules.

Do NOT leave multiple sections half-built.

If Customers is being developed, complete Customers completely before moving to Orders.

If Orders is being developed, complete Orders completely before moving to Loyalty.

Maintain a clear completion state.

---

# 12. Current Major Modules

The planned modules are:

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

These are planned modules. Do not claim they are implemented unless they actually are.

---

# 13. UI/UX Quality Standard

The application must be:

- attractive
- modern
- professional
- fast
- responsive
- user-friendly
- consistent
- accessible
- easy to learn
- easy to update

Avoid design for decoration alone. Every UI element must have a purpose.

Prioritize information hierarchy and task completion.

Use consistent:

- spacing
- typography
- buttons
- cards
- forms
- icons
- status indicators
- navigation
- empty states
- loading states
- error states

Use shadcn/ui and Tailwind consistently rather than creating unnecessary custom implementations.

---

# 14. Design System

Create reusable design primitives.

Do not repeatedly hard-code UI styles inside individual screens.

Centralize:

- colors
- typography
- spacing
- border radius
- shadows
- status styles
- buttons
- inputs
- cards
- dialogs
- sheets
- badges
- navigation components

The design system must support both Mobile Manager and Desktop Admin without forcing identical layouts.

---

# 15. Responsiveness

Do not rely only on generic responsive breakpoints. Consider the actual workflow.

**Mobile:**

- touch-first
- compact navigation
- bottom navigation where appropriate
- hamburger menu
- cards
- quick actions

**Desktop:**

- sidebar
- tables
- multi-column layouts
- filters
- advanced controls

Test at:

- common Android phone widths
- tablet widths where relevant
- desktop widths

Do not assume that a browser resize means the UX is correct.

---

# 16. PWA Requirements

The application must be installable as a PWA.

The development workflow must support:

```
Developer change
→ Build
→ Deploy
→ Phone update
→ Manual testing
```

The user must be able to install the application on their Android phone.

Eventually provide a clear in-app update notification when a new version is available.

Do not claim update notification is implemented until it is actually implemented and tested.

Be careful with service-worker caching. Do not allow stale application assets to silently prevent the user from receiving updates.

---

# 17. Real Device Testing

The user's real phone is an important testing device.

After meaningful frontend milestones:

1. Build.
2. Deploy.
3. Open the PWA on the phone.
4. Test the completed section manually.
5. Check navigation.
6. Check touch interaction.
7. Check loading.
8. Check visual layout.
9. Check keyboard behavior.
10. Check scrolling.
11. Check dialogs/sheets.
12. Check errors and empty states.
13. Report/fix issues.

Do not consider a mobile feature complete merely because it works in desktop browser developer tools.

---

# 18. Mock Data Rule

During the frontend phase, use clearly identifiable mock data.

Mock data must be:

- realistic
- internally consistent
- easy to replace with API data later

Do not mix mock data with production database writes.

Do not create fake production records simply to make a UI look populated.

Keep data access behind service/hooks boundaries so the source can later change from mock data to Supabase.

---

# 19. Data Access Architecture

UI components should not directly contain database logic.

Prefer:

```
UI
→ feature hook/service
→ data layer
→ backend
```

During the mock phase:

```
UI
→ feature hook/service
→ mock data
```

Later:

```
UI
→ feature hook/service
→ Supabase/API
```

This separation is required to make the application easy to evolve.

---

# 20. ManageMe Integration

ManageMe is the current POS.

ManageMe integration must be isolated.

Do not write ManageMe-specific fields throughout the application.

Do not make CRM screens depend directly on ManageMe response formats.

Use:

```
ManageMe API
→ ManageMe Adapter
→ Broastin Standard Data Model
→ Broastin Core
→ CRM/Growth OS
```

If ManageMe API documentation is unavailable:

- Do not invent endpoints.
- Do not guess request/response formats.
- Ask for the documentation or inspect the available integration information.

---

# 21. Future POS

The architecture must support:

- **ManageMe** — current POS
- **Broastin POS** — future POS

Both must feed the same Broastin Core data model.

CRM logic must not need to know which POS produced the data.

---

# 22. Supabase

Supabase is the locked backend technology.

Before modifying the existing Supabase project:

- inspect current schema
- inspect RLS
- inspect functions
- inspect triggers
- inspect auth
- inspect storage
- inspect existing QR Ordering dependencies

Do not create a new Supabase project without first evaluating the existing one.

Do not perform destructive schema changes without explicit approval.

Security rules must be preserved and reviewed before changes.

---

# 23. Authentication

Authentication and authorization must be designed so that:

- Manager users can use the Manager application.
- Admin users can access administrative functionality.
- Sensitive administrative functions are protected.
- UI restrictions are not treated as the only security mechanism.

Actual authorization must be enforced at the backend/database layer when backend implementation begins.

Do not rely only on hiding buttons.

---

# 24. Security

Never place the following inside frontend code:

- API secrets
- service-role keys
- private credentials
- database passwords
- private integration credentials

Never commit secrets into Git.

Use environment variables and appropriate server-side/edge-function mechanisms where required.

Do not weaken RLS merely to make development easier.

---

# 25. Code Quality

Write production-quality code.

Prefer:

- small reusable components
- clear naming
- typed interfaces
- feature-based organization
- separation of concerns
- predictable state management
- reusable utilities
- minimal duplication

Avoid:

- giant components
- duplicated business logic
- unnecessary global state
- deeply coupled components
- inline database logic
- magic values
- unnecessary dependencies
- temporary hacks becoming permanent architecture

---

# 26. File/Folder Organization

Use a feature-oriented structure. A reasonable starting structure:

```
src/
├── app/
├── components/
├── layouts/
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
├── integrations/
│   └── manageme/
├── services/
├── hooks/
├── stores/
├── types/
├── utils/
└── assets/
```

Adapt this structure to the existing project after inspection.

Do not blindly overwrite an existing working architecture.

---

# 27. Existing Code Rule

Before creating new code:

- inspect existing code
- identify reusable components
- identify existing utilities
- identify existing layouts
- identify existing Supabase helpers
- identify existing authentication
- identify existing QR Ordering functionality

Reuse working code where appropriate.

Do not rebuild something that already works without a reason.

---

# 28. No Blind Rebuild

NEVER:

- delete the existing project and start from zero
- replace the existing QR Ordering app without approval
- replace Supabase without an audit
- rewrite working functionality just for style
- change architecture because another framework looks newer
- introduce a new technology without a concrete need

If the existing implementation has problems, identify them first.

---

# 29. Change Control

Before changing a locked architectural decision: **STOP.**

Explain:

1. Current decision.
2. Proposed change.
3. Why the change is necessary.
4. What will be affected.
5. Benefits.
6. Risks.
7. Migration impact.

Wait for explicit approval. Do not make the change automatically.

---

# 30. Testing Standard

Every completed section must be tested.

At minimum:

- navigation
- rendering
- responsive layout
- interactions
- loading state
- empty state
- error state
- mobile touch behavior
- desktop behavior where applicable

When backend is introduced:

- authentication
- authorization
- database operations
- RLS
- error handling
- duplicate handling
- network failure behavior

Do not mark a feature complete only because the happy path works.

---

# 31. Deployment and Update Workflow

The intended workflow is:

```
Local development
→ Preview build/deployment
→ Real phone testing
→ Fix
→ Production deployment
```

Production changes must not be made blindly.

Before deployment:

- build successfully
- check console errors
- check routing
- check PWA behavior
- check responsive behavior
- check the changed feature
- ensure existing functionality still works

---

# 32. Git Rules

Use Git for source control.

Make focused commits. Commit messages should describe the actual change.

Do not mix unrelated feature changes into one commit.

Do not rewrite Git history unnecessarily.

Do not force-push unless explicitly required and approved.

Do not commit secrets.

---

# 33. Documentation Rule

When a significant architectural or implementation decision is made, update the appropriate documentation file.

Documentation must reflect the actual implementation.

Never document a feature as completed when it is only planned.

Never leave documentation describing an architecture that has been silently changed.

---

# 34. Progress Tracking

Maintain clear development status.

At the end of a meaningful development task, report:

- what was completed
- what was tested
- what remains
- any blocker
- any user action required

Keep progress reporting concise.

---

# 35. User Approval Required

Explicit user approval is required before:

- changing locked architecture
- replacing React/Vite
- replacing Supabase
- replacing the existing QR Ordering application
- creating a replacement backend
- destructive database changes
- deleting existing functionality
- changing major navigation architecture
- introducing a major new framework
- changing the current POS strategy

Do not interpret silence as approval.

---

# 36. Development Behavior

Do not over-engineer early phases.

Do not build backend systems before they are needed.

Do not build advanced automation before the frontend foundation is complete.

Do not build the future POS before the CRM/Growth OS architecture is stable.

Do not add features merely because they are technically possible.

Build what is defined.

Keep the architecture ready for future expansion.

---

# 37. Current Phase

**Current project phase:** DOCUMENTATION AND ARCHITECTURE DEFINITION.

**Next immediate task:** Audit the existing QR Ordering project and existing Supabase project.

After the audit, begin the frontend application shell.

The frontend application shell must establish:

- app layout
- mobile shell
- desktop shell
- hamburger menu
- navigation structure
- routing
- responsive foundation
- PWA foundation

Do not start CRM backend development at this stage.

---

# 38. First Frontend Milestone

The first frontend milestone is NOT a fully functional CRM.

It is: **COMPLETE FRONTEND NAVIGATION AND SCREEN STRUCTURE.**

Required sequence:

1. App Shell
2. Mobile Manager Shell
3. Desktop Admin Shell
4. Hamburger menu
5. All major modules
6. All planned submenus
7. Routes
8. Placeholder screens
9. Consistent layouts
10. Mock data where necessary
11. Real-device PWA testing

Only after this milestone is stable should detailed module content be developed.

---

# 39. Definition of Done

A task is not complete merely because code was written.

A task is complete when:

- implementation exists
- UI is usable
- responsive behavior is checked
- relevant interactions work
- no obvious console errors remain
- existing functionality remains intact
- documentation is updated if necessary
- the requested test has been performed
- the user can understand what changed

For mobile features, real-device testing is required before calling the feature complete.

---

# 40. Final Rule

The most important rules are:

1. Preserve existing working systems.
2. Follow the locked architecture.
3. Frontend first.
4. Mobile first.
5. Build from the hamburger menu.
6. Complete one section before starting another.
7. Use mock data during frontend development.
8. Keep ManageMe isolated behind an adapter.
9. Keep Broastin Core independent of the current POS.
10. Do not change architecture without explicit approval.
11. Do not blindly rebuild the existing QR Ordering project.
12. Do not start backend work prematurely.
13. Test on the user's real phone.
14. Keep documentation synchronized with the project.
15. Prefer simple, maintainable and future-proof solutions over unnecessary complexity.
