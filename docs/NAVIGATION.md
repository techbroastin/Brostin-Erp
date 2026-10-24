# NAVIGATION.md — Broastin CRM / Growth OS

**Document hierarchy**

- `README.md` — high-level project overview
- `CLAUDE.md` — development operating contract
- `ARCHITECTURE.md` — architectural source of truth
- `FRONTEND_ARCHITECTURE.md` — frontend implementation blueprint
- `NAVIGATION.md` — navigation architecture (this document)

This document must not contradict the documents above.

**Status legend**

- **CURRENT** — exists today
- **PLANNED** — decided and intended, not yet built
- **FUTURE** — possible later evolution
- **NOT YET FINALIZED** — intentionally open

**Current status:** NAVIGATION DEFINED / FRONTEND NOT YET IMPLEMENTED. Everything below is PLANNED unless marked otherwise.

---

# 1. Document Purpose

`NAVIGATION.md` defines:

- application navigation
- mobile hamburger menu
- desktop sidebar
- main modules
- submenus
- route hierarchy
- screen hierarchy
- Manager/Admin visibility
- navigation labels
- navigation grouping
- mobile navigation behavior
- desktop navigation behavior
- development sequence

It does **NOT** define:

- database schema
- backend API
- ManageMe API
- detailed business logic
- final UI design
- final brand colors
- final permission matrix

Those belong in other documents.

---

# 2. Navigation Principle

Navigation must be:

- simple
- predictable
- fast
- task-oriented
- mobile-first
- scalable
- consistent

The Manager should not need to understand the underlying software architecture.

- Navigation labels use business language.
- Technical terminology is avoided in user-facing menu labels.
- Menu items are not created merely because a backend table exists.
- Every navigation item represents a meaningful user task or information area.

---

# 3. Two Navigation Experiences

Both experiences share the same React application but differ in navigation and UX density.

## Mobile Manager PWA

- **Primary navigation:** hamburger menu.
- Contextual quick actions and bottom navigation may be used later **if approved**.
- A fixed bottom navigation structure must not be assumed yet.

## Desktop Admin

- **Primary navigation:** sidebar.
- Desktop may expose more modules and deeper navigation than mobile.
- Complex configuration and data-heavy workflows should primarily live in Desktop Admin.

---

# 4. User Types

Current conceptual roles:

### Manager

Primary mobile user. Needs:

- daily overview
- customers
- orders
- loyalty
- feedback
- campaign monitoring
- operational follow-ups
- important alerts
- QR-related operational visibility

### Admin

Primary desktop user. Needs everything the Manager needs, plus:

- advanced customer management
- segmentation
- campaign creation
- automation
- advanced analytics
- configuration
- bulk operations
- administrative controls

**IMPORTANT:** This is a navigation visibility model, **NOT** the final backend authorization model. The exact permission matrix is **NOT YET FINALIZED**. Backend authorization must eventually enforce access independently of frontend visibility.

---

# 5. Top-Level Navigation

The planned top-level application areas:

1. Dashboard
2. Customers
3. Orders
4. Loyalty
5. Campaigns
6. Automation
7. Feedback
8. Referrals
9. Membership
10. QR
11. Analytics
12. Settings

These are the core navigation areas. Do not add unrelated modules. Do not rename them without explicit approval.

---

# 6. Mobile Manager Hamburger Menu

**LOCKED DECISION:** Campaigns and Automation are Desktop Admin modules and MUST NOT appear in the Mobile Manager hamburger menu. Ten of the twelve top-level areas appear in the mobile hamburger menu. Sections that contain submenus expand in place.

```
BROASTIN
│
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

Campaigns and Automation are not listed as mobile Manager navigation items (see Section 19). Their routes, desktop navigation, and full functionality remain unchanged and fully available in Desktop Admin (see Section 20). If mobile monitoring for either module is required later, it is introduced as a contextual screen or action rather than by adding the module to the primary hamburger menu, and any such change requires explicit approval.

Each section may contain submenus. The implementation uses the detailed structure defined in Sections 7–18.

---

# 7. Dashboard

| Item | Value |
|---|---|
| Route | `/dashboard` |
| Menu label | Dashboard |
| Submenus | None |

**Purpose:** Provide the Manager with a quick operational overview.

Dashboard should eventually contain areas such as:

- today's business overview
- order overview
- customer overview
- loyalty activity
- campaign activity
- feedback alerts
- important follow-ups
- operational alerts

Exact dashboard metrics: **NOT YET FINALIZED.**

Dashboard should be the first screen after successful login where appropriate.

---

# 8. Customers

**Route group:** `/customers` — **Menu:** Customers

**Purpose:** Customer management and Customer 360.

```
Customers
├── All Customers
├── Segments
├── VIP Customers
├── At Risk
└── Customer Activity
```

| Menu item | Route | Notes |
|---|---|---|
| All Customers | `/customers` | Customer list |
| Segments | `/customers/segments` | Customer groups |
| VIP Customers | `/customers/vip` | High-value customers |
| At Risk | `/customers/at-risk` | Inactive / reduced engagement |
| Customer Activity | `/customers/activity` | Activity timeline/list |
| *(detail screen)* Customer Detail | `/customers/:customerId` | Not a menu item |
| *(screen)* Duplicates (Merge Tool) | `/customers/duplicates`, `/customers/merge` | Book 3 §1; opened from a button on All Customers (owner-approved, no menu item). Desktop Admin only |
| *(screen)* Bulk Import | `/customers/import` | Book 3 §1; opened from a button on All Customers. Desktop Admin only |

## 8.1 All Customers — `/customers`

Customer list. Eventually supports search, filters, customer status, customer details and recent activity.

- **Mobile:** card/list-oriented.
- **Desktop:** table-oriented where appropriate.

## 8.2 Customer Detail — `/customers/:customerId`

Opened from All Customers (and other customer lists). Eventually provides Customer 360.

Potential areas: profile, orders, loyalty, feedback, campaigns, referrals, membership, activity timeline.

Exact Customer 360 layout: **NOT YET FINALIZED.**

## 8.3 Segments — `/customers/segments`

View/manage customer groups. Conceptual examples: new customers, repeat customers, VIP, inactive, at-risk. These must not be hard-coded as final database segments yet.

## 8.4 VIP Customers — `/customers/vip`

Quick access to high-value customers. Exact VIP qualification logic: **NOT YET FINALIZED.**

## 8.5 At Risk — `/customers/at-risk`

Customers showing signs of inactivity or reduced engagement. Exact scoring logic: **NOT YET FINALIZED.**

## 8.6 Customer Activity — `/customers/activity`

Customer activity timeline/list. Potential activity: orders, loyalty activity, campaign interaction, feedback, referral, membership events. Exact event taxonomy: **NOT YET FINALIZED.**

---

# 9. Orders

**Route group:** `/orders` — **Menu:** Orders

**Purpose:** View operational order activity.

```
Orders
├── All Orders
└── Today
```

| Menu item | Route | Notes |
|---|---|---|
| All Orders | `/orders` | Order list |
| Today | `/orders/today` | Today's orders |
| *(detail screen)* Order Detail | `/orders/:orderId` | Not a menu item |

## 9.1 All Orders — `/orders`

Order list. **Mobile:** cards/list. **Desktop:** data table.

Potential filters: date, status, order source, customer. Exact status values: **NOT YET FINALIZED.**

## 9.2 Today — `/orders/today`

Fast operational view of today's orders, optimized for the Manager.

## 9.3 Order Detail — `/orders/:orderId`

Detailed order information. Potential information: customer, items, amount, status, source, payment, timestamps, related loyalty activity. Exact fields: **NOT YET FINALIZED.**

---

# 10. Loyalty

**Route group:** `/loyalty` — **Menu:** Loyalty

**Purpose:** Customer loyalty management and visibility.

```
Loyalty
├── Overview
├── Programs
├── Customer Balances
├── Rewards
└── Activity
```

| Menu item | Route | Notes |
|---|---|---|
| Overview | `/loyalty` | High-level loyalty performance; exact metrics NOT YET FINALIZED |
| Programs | `/loyalty/programs` | Book 3 §2 Program Engine (loyalty programs); added with owner approval. Phone: view only. Builder `/loyalty/programs/new`, detail `/loyalty/programs/:programId`, edit `…/:programId/edit` are non-menu, builder/publishing Desktop Admin only |
| Customer Balances | `/loyalty/customers` | View customer loyalty balances |
| Rewards | `/loyalty/rewards` | View/manage rewards; exact reward model NOT YET FINALIZED |
| Activity | `/loyalty/activity` | View loyalty events |

---

# 11. Campaigns

**Route group:** `/campaigns` — **Menu:** Campaigns

**Purpose:** Marketing campaign management and monitoring.

```
Campaigns
├── Overview
├── All Campaigns
├── Create Campaign
├── Calendar
├── Templates
├── Coupons
└── Message Log
```

| Menu item | Route | Notes |
|---|---|---|
| Overview | `/campaigns` | Status counts and delivery results per sent campaign (reached/delivered/read; simulated). Clicks/redemptions need a provider and POS |
| All Campaigns | `/campaigns/all` | List campaigns |
| Create Campaign | `/campaigns/new` | Primarily a Desktop Admin workflow |
| *(detail screen)* Campaign Detail | `/campaigns/:campaignId` | Details and performance; not a menu item |
| Calendar | `/campaigns/calendar` | Book 3 §4 Campaign Calendar (sent, scheduled, yearly-repeating); added with owner approval |
| Templates | `/campaigns/templates` | Book 3 §4 Template Library (occasion + audience tags); added with owner approval. `/campaigns/templates/new` and `/campaigns/templates/:templateId` are non-menu editor routes |
| Coupons | `/campaigns/coupons` | Book 3 §12 Coupon List; added with owner approval |
| *(screen)* Coupon Builder | `/campaigns/coupons/new` | Not a menu item; reached from Coupons |
| *(screen)* Redemption Log | `/campaigns/coupons/redemptions` | Not a menu item; tab on the Coupons page |
| *(detail screen)* Coupon Detail | `/campaigns/coupons/:couponId` | Settings, codes and redemptions; not a menu item |
| Message Log | `/campaigns/messages` | Book 3 §13 Notification Engine delivery log; added with owner approval. Rules are edited in Settings → Notifications |

**Create Campaign:** This module is DESKTOP ADMIN ONLY on mobile (see Section 19); it is not part of the Mobile Manager hamburger menu. The routes above are implemented for Desktop Admin. Exact role visibility beyond this: **NOT YET FINALIZED.**

---

# 12. Automation

**Route group:** `/automation` — **Menu:** Automation

**Purpose:** Customer engagement automation.

```
Automation
├── Overview
├── Workflows
└── Create Workflow
```

| Menu item | Route | Notes |
|---|---|---|
| Overview | `/automation` | Automation overview |
| Workflows | `/automation/workflows` | View automation workflows |
| Create Workflow | `/automation/new` | Primarily Desktop Admin |
| *(detail screen)* Workflow Detail | `/automation/:workflowId` | Rule, go-live checklist (Book 3 §3 publish gate), Test on a customer, and Run log; not a menu item |
| *(screen)* Edit Workflow | `/automation/:workflowId/edit` | Draft or paused workflows only; not a menu item |

Exact workflow builder design: **NOT YET FINALIZED.**

---

# 13. Feedback

**Route group:** `/feedback` — **Menu:** Feedback

**Purpose:** Customer feedback and issue visibility.

```
Feedback
├── Overview
├── All Feedback
└── Negative Feedback
```

| Menu item | Route | Notes |
|---|---|---|
| Overview | `/feedback` | Feedback overview |
| All Feedback | `/feedback/all` | View customer feedback |
| Negative Feedback | `/feedback/negative` | Complaints requiring attention; exact classification logic NOT YET FINALIZED |
| *(detail screen)* Feedback Detail | `/feedback/:feedbackId` | Detailed feedback view; not a menu item |

---

# 14. Referrals

**Route group:** `/referrals` — **Menu:** Referrals

**Purpose:** Referral program management.

```
Referrals
├── Overview
├── Customers
├── Activity
└── Rewards
```

| Menu item | Route | Notes |
|---|---|---|
| Overview | `/referrals` | Referral overview |
| Customers | `/referrals/customers` | Customers participating in referrals |
| Activity | `/referrals/activity` | Referral activity |
| Rewards | `/referrals/rewards` | Referral rewards |

Exact referral rules: **NOT YET FINALIZED.**

---

# 15. Membership

**Route group:** `/membership` — **Menu:** Membership

**Purpose:** Membership program management.

```
Membership
├── Overview
├── Members
├── Plans
└── Activity
```

| Menu item | Route |
|---|---|
| Overview | `/membership` |
| Members | `/membership/members` |
| Plans | `/membership/plans` |
| Activity | `/membership/activity` |

Exact membership business rules: **NOT YET FINALIZED.**

---

# 16. QR

**Route group:** `/qr` — **Menu:** QR

**Purpose:** Broastin QR Ordering related management.

This section must NOT assume the final integration architecture before the existing QR Ordering application and Supabase project are audited.

```
QR
├── Overview
├── QR Orders
└── QR Settings
```

| Menu item | Route | Notes |
|---|---|---|
| Overview | `/qr` | QR ordering overview |
| QR Orders | `/qr/orders` | View QR-originated orders |
| QR Settings | `/qr/settings` | QR-related configuration; exact settings NOT YET FINALIZED |

**IMPORTANT:** The existing QR Ordering application must be preserved. Do not build destructive replacement functionality through this menu.

---

# 17. Analytics

**Route group:** `/analytics` — **Menu:** Analytics

**Purpose:** Business and customer intelligence.

```
Analytics
├── Overview
├── Sales
├── Customers
├── Loyalty
└── Marketing
```

| Menu item | Route |
|---|---|
| Overview | `/analytics` |
| Sales | `/analytics/sales` |
| Customers | `/analytics/customers` |
| Loyalty | `/analytics/loyalty` |
| Marketing | `/analytics/marketing` |

Exact metrics, charts and reporting model: **NOT YET FINALIZED.** Complex analytics should primarily be Desktop Admin.

---

# 18. Settings

**Route group:** `/settings` — **Menu:** Settings

**Purpose:** Application and business configuration.

```
Settings
├── General
├── Users
├── Roles & Access
├── Notifications
├── Integrations
├── System
└── Audit Log
```

| Menu item | Route | Notes |
|---|---|---|
| General | `/settings/general` | General settings |
| Users | `/settings/users` | User management |
| Roles & Access | `/settings/roles` | Book 3 §14 four roles (Owner, Manager, Staff, Marketing Operator) and owner-approved starting matrix; module-level only, not yet enforced (needs sign-in) |
| Notifications | `/settings/notifications` | Staff alert preferences and customer messaging rules (Book 3 §13 weekly limit and channel order) |
| Integrations | `/settings/integrations` | Integration configuration |
| System | `/settings/system` | Administrative system configuration; exact settings NOT YET FINALIZED |
| Audit Log | `/settings/audit` | Book 3 §14 append-only action log; added with owner approval; Desktop Admin only |

**Integrations:** Potential future integrations include ManageMe, QR Ordering and future services. Do not invent integration settings before the integration is defined.

---

# 19. Mobile Manager Visibility

Initial planned mobile visibility:

| Module | Manager |
|---|---|
| Dashboard | YES |
| Customers | YES |
| Orders | YES |
| Loyalty | YES |
| Campaigns | DESKTOP ADMIN ONLY |
| Automation | DESKTOP ADMIN ONLY |
| Feedback | YES |
| Referrals | YES |
| Membership | YES |
| QR | YES |
| Analytics | YES |
| Settings | LIMITED |

**LOCKED DECISION:** Campaigns and Automation are DESKTOP ADMIN ONLY and must not be listed as mobile Manager navigation items. They are intentionally absent from the mobile hamburger menu in Section 6. Their routes and full functionality remain unchanged and fully available in Desktop Admin (Section 20).

This table defines navigation intent, **NOT** backend authorization. Exact permissions: **NOT YET FINALIZED.**

---

# 20. Desktop Admin Visibility

Desktop Admin is intended to expose the full administrative navigation.

| Module | Admin |
|---|---|
| Dashboard | YES |
| Customers | YES |
| Orders | YES |
| Loyalty | YES |
| Campaigns | YES |
| Automation | YES |
| Feedback | YES |
| Referrals | YES |
| Membership | YES |
| QR | YES |
| Analytics | YES |
| Settings | YES |

Frontend visibility is not security. Backend authorization will be defined separately.

---

# 21. Mobile vs Desktop Navigation

The same business areas can appear differently.

**Mobile example:**

```
Customers
→ All Customers
→ VIP
→ At Risk
```

**Desktop example:**

```
Customers
→ Customer Database
→ Segments
→ VIP
→ At Risk
→ Activity
→ Advanced Management
```

Desktop labels and extra items such as "Customer Database" and "Advanced Management" are illustrative of intent; their exact form is **NOT YET FINALIZED**.

Do not duplicate business concepts merely because the layouts differ.

---

# 22. Mobile Menu Behavior

The hamburger menu should:

- open quickly
- show clear module names
- support expandable submenu groups
- show current section
- show current page
- allow fast navigation
- close after navigation where appropriate

Keep it simple and avoid unnecessary nesting.

**Target:**

```
Top level
→ submenu
→ screen
```

**Avoid** (unless a real workflow requires it):

```
Top level
→ submenu
→ submenu
→ submenu
→ screen
```

---

# 23. Desktop Sidebar Behavior

The desktop sidebar should:

- show main modules
- support expandable groups
- highlight active module
- highlight active route
- allow collapse if useful
- preserve navigation context

Sidebar collapse behavior: **NOT YET FINALIZED.**

---

# 24. Quick Actions

Quick actions may eventually be used on the Dashboard. Potential examples:

- Add Customer
- Find Customer
- View Today's Orders
- Send Campaign
- View Feedback

Exact quick actions: **NOT YET FINALIZED.** Do not build a large quick-action system before workflows are established.

---

# 25. Bottom Navigation

A bottom navigation may be introduced for the most frequently used Manager functions. Possible candidates:

- Dashboard
- Customers
- Orders
- Loyalty
- More

**FINAL BOTTOM NAVIGATION IS NOT YET FINALIZED.** It must not be locked into the architecture until user workflow testing supports it. The hamburger menu remains the primary navigation model.

---

# 26. Breadcrumbs

Desktop may use breadcrumbs for deep administrative pages. Mobile should generally avoid unnecessary breadcrumbs. Exact breadcrumb behavior: **NOT YET FINALIZED.**

---

# 27. Page Titles

Every screen has a clear page title using business-friendly terminology.

- List/section screens: Customers, Orders, Loyalty, Campaigns
- Detail screens: Customer Details, Order Details, Campaign Details

---

# 28. Deep Links

Routes support direct navigation to meaningful screens, for example `/customers/123`, `/orders/456`, `/campaigns/789`.

The identifier format is backend-dependent and **NOT YET FINALIZED**. The frontend must not assume UUID versus numeric IDs unless the actual data model defines it.

---

# 29. Navigation State

The application preserves useful navigation context where appropriate:

- selected customer
- active filter
- current section
- current tab

Temporary state is not persisted unnecessarily. Navigation state architecture remains simple.

---

# 30. Not Found

The application must provide a proper 404 / Not Found screen. Unknown routes must not silently redirect to an unrelated page. A clear way back to the main application is provided.

---

# 31. Access Denied

The application should eventually provide an Access Denied screen when an authenticated user attempts to access a restricted route. Navigation items must not be hidden as the only protection. Backend authorization remains authoritative.

---

# 32. Authentication Routes

Authentication routes are conceptually separate from the main application shell.

- Potential route: `/login`
- Future: `/forgot-password`, `/reset-password`

Exact authentication flow: **NOT YET FINALIZED.** Additional authentication routes must not be implemented without the authentication specification.

---

# 33. Navigation Development Order

The navigation foundation is built before detailed module content.

**Required order:**

1. App Shell
2. Mobile Manager Shell
3. Desktop Admin Shell
4. Hamburger Menu
5. Desktop Sidebar
6. Top-level modules
7. Submenus
8. Routes
9. Placeholder screens
10. Active-state handling
11. Mobile testing
12. Desktop testing

**Only after navigation is stable, module content follows, one section at a time:**

13. Dashboard content
14. Customers content
15. Orders content
16. Loyalty content
17. Campaigns content
18. Automation content
19. Feedback content
20. Referrals content
21. Membership content
22. QR content
23. Analytics content
24. Settings content

---

# 34. Section Completion Rule

A navigation section is structurally complete when:

- menu item exists
- submenu exists where required
- route exists
- placeholder screen exists
- active navigation state works
- back navigation works
- mobile layout works
- desktop layout works where applicable
- no broken route exists

Detailed business functionality is NOT required for navigation completion.

---

# 35. Route Naming Rules

Routes should:

- be lowercase
- use nouns where possible
- be predictable
- use plural resource names for collections
- use IDs for details

Examples: `/customers`, `/customers/:customerId`, `/orders`, `/orders/:orderId`, `/campaigns`, `/campaigns/:campaignId`.

Avoid unnecessary verbs. (`/new` is the accepted exception for creation screens in this document.)

---

# 36. Route Consistency

| Pattern | Form |
|---|---|
| Collection | `/resource` |
| Nested collection | `/resource/subresource` |
| Detail | `/resource/:id` |

Example: `/customers`, `/customers/segments`, `/customers/:customerId`.

Do not create inconsistent route structures.

**Route matching note:** Fixed sub-paths such as `/customers/segments`, `/customers/duplicates`, `/customers/merge`, `/customers/import`, `/orders/today`, `/campaigns/new`, `/campaigns/calendar`, `/campaigns/templates`, `/campaigns/coupons`, `/campaigns/messages`, `/automation/workflows` and `/feedback/all` share a level with detail routes like `/customers/:customerId`. Fixed sub-paths must take precedence over the ID parameter, and their names are reserved: no record identifier may equal a reserved sub-path name. The router should be defined so this precedence is explicit.

---

# 37. Future Navigation

Future modules may include:

- advanced CRM
- delivery
- inventory
- POS
- KDS
- multi-location
- advanced integrations

These are FUTURE and NOT part of the current locked navigation. They must be added through architectural review.

---

# 38. Current Navigation Status

**Status:** NAVIGATION DEFINED / FRONTEND NOT YET IMPLEMENTED.

The navigation structure is the blueprint for the first frontend milestone:

**COMPLETE FRONTEND NAVIGATION AND SCREEN STRUCTURE.**

---

# 39. Navigation Items Not To Add

Do not add the following to normal Manager navigation:

- Developer Tools
- Database
- Supabase
- API
- ManageMe
- Backend
- Technical Logs

These are technical implementation concepts, not user-facing business navigation. Integration settings may expose user-relevant integration configuration under Settings.

---

# 40. Final Navigation Principles

1. Mobile Manager is the primary daily-use interface.
2. Hamburger menu is the primary mobile navigation.
3. Desktop Admin uses a sidebar.
4. One React application supports both.
5. Navigation uses business language.
6. Do not expose technical architecture as normal navigation.
7. Keep navigation shallow.
8. Complete one section at a time.
9. Routes must be predictable.
10. Mobile and desktop can use different interaction patterns.
11. Frontend visibility is not backend authorization.
12. Exact permission rules remain separate.
13. Do not add future modules prematurely.
14. Existing QR Ordering must be preserved.
15. ManageMe must remain an integration concern.
16. Navigation must remain easy to expand later.
17. Do not silently change locked navigation.
18. Any major navigation restructuring requires explicit approval.

---

*End of NAVIGATION.md.*
