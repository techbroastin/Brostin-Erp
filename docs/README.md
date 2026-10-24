# Broastin CRM / Growth OS

## 1. Project Overview

Broastin CRM / Growth OS is a first-party restaurant CRM and customer growth platform for Broastin Foods.

The system is intended to centralize customer data, orders, loyalty, marketing, automation, feedback and analytics in one platform owned and controlled by Broastin.

## 2. Current Ecosystem

### Current POS

ManageMe Premium is the current POS and billing system.

### Existing QR Ordering

Broastin already has an existing QR Ordering application and an existing Supabase project.

The existing QR Ordering system must be audited and preserved before extending it. It must NOT be rebuilt, replaced or broken without explicit approval.

### Broastin Core

Broastin Core will become the central application/data layer.

The existing QR Ordering Supabase project will be evaluated as the foundation for Broastin Core before creating a new Supabase project. No migration or adoption has happened yet; the project must be audited first.

### Future POS

Broastin may develop its own POS later.

The future Broastin POS must be able to replace ManageMe without rebuilding the Broastin Core, CRM, loyalty, marketing, automation or analytics systems.

## 3. Locked Architecture

**Current:**

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

**Important architectural principle:**

The CRM/Growth OS must never depend directly on ManageMe-specific database structures.

ManageMe-specific logic must remain isolated inside the ManageMe integration/adapter layer.

## 4. Frontend

Development is frontend-first.

Locked frontend stack:

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

No alternative frontend frameworks are to be added.

## 5. User Interfaces

### Mobile Manager PWA

The main application. Designed primarily for mobile phones and daily manager use.

Focus:

- Daily operations
- Quick decisions
- Customer lookup
- Actions
- Alerts
- Follow-ups
- Simple management tasks

The PWA must be installable on the user's phone and practical for repeated real-world manual testing.

### Desktop Admin

Designed for complicated and data-heavy work.

Focus:

- Campaign management
- Segmentation
- Automation builders
- Configuration
- Bulk operations
- Detailed analytics
- Complex administration

The desktop application must not simply be a stretched version of the mobile interface. Mobile and desktop share the same application/codebase while having intentionally different UX where appropriate.

## 6. Major Modules

Currently planned major modules (none are implemented yet):

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

## 7. Frontend Development Method

This is a critical project rule. Development happens in this order:

1. App Shell
2. Complete tabs
3. Complete hamburger menu
4. Complete all menus and submenus
5. Build screen contents
6. Build interactions
7. Add mock data
8. Test manually
9. Backend integration
10. ManageMe integration
11. Real data

The frontend is built using mock data initially. Backend development does not start before the frontend structure and UX are established.

## 8. Hamburger-Menu Development Rule

The application is developed one hamburger-menu section at a time.

For each section:

```
Menu
→ Submenus
→ Screens
→ Screen content
→ Interactions
→ Mock data
→ Mobile testing
→ Section complete
```

Only after one section is complete does development move to the next. Multiple sections must not be left half-finished.

## 9. Phone Testing and PWA Workflow

Development loop:

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

The user must be able to manually inspect new frontend updates through the installed PWA on their phone.

The project should eventually provide a clear mechanism for informing the user when a new PWA version is available. This mechanism is PLANNED and not yet implemented.

## 10. Existing QR Ordering Integration

The existing QR Ordering application is an important existing asset.

Rules:

- Audit it first.
- Preserve working functionality.
- Reuse existing components/data where appropriate.
- Do not blindly modify its database.
- Do not create a second unnecessary Supabase backend if the existing project can safely become the Broastin Core.
- Any structural change requires review.
- QR Ordering will eventually become part of the Broastin ecosystem.

## 11. Development Principles

- Frontend first
- Mobile first
- User-friendly UX
- Fast and responsive UI
- Attractive but practical design
- Modular architecture
- Easy future updates
- Clear separation between integrations and core business logic
- Reusable components
- Avoid unnecessary complexity
- Avoid premature backend work
- Avoid unnecessary rebuilds
- Preserve existing working systems
- Do not change locked architecture without explicit approval

## 12. Documentation

Project documentation is part of the project's source of truth.

Important architecture and development decisions must be documented in the appropriate `.md` files, and documentation must remain synchronized with the actual project.

A locked architectural decision must never be changed silently.

## 13. Development Status

**Current status:** Documentation and architecture definition.

**Next milestone:** Audit the existing QR Ordering project and existing Supabase project, then begin the frontend application shell.

No development work is claimed as completed.

## 14. Future Direction

Planned ecosystem:

```
Broastin Core
├── Manager PWA
├── Admin Desktop
├── QR Ordering
├── CRM
├── Loyalty
├── Marketing
├── Automation
├── Analytics
└── Future Broastin POS
```

ManageMe is the current POS and should remain replaceable.
