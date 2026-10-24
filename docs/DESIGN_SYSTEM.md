# DESIGN_SYSTEM.md — Broastin CRM / Growth OS

**Scope:** This is the SHARED design system. It applies to both the Mobile Manager PWA and the Desktop Admin application.

**Authoritative documents**

- `README.md`
- `CLAUDE.md`
- `ARCHITECTURE.md`
- `FRONTEND_ARCHITECTURE.md`
- `NAVIGATION.md`
- `MOBILE_UI_SPEC.md`
- `DESKTOP_UI_SPEC.md`

The approved desktop reference image and the approved mobile reference direction must be respected. The approved visual direction is not redesigned here.

**This document does NOT define:** navigation, complete page layouts, business logic, or backend architecture. Those live in the documents listed above.

**Status legend**

- **PLANNED** — decided and intended, not yet built
- **NOT YET FINALIZED** — intentionally open; a value marked this way must be centralized as a token so it can be set later in one place, never silently invented or hard-coded per component.

---

# 1. Purpose

This document defines the reusable visual language and UI component system for Broastin CRM / Growth OS, covering:

- brand colors
- semantic colors
- typography
- spacing
- sizing
- border radius
- shadows
- icons
- buttons
- inputs
- selects
- badges
- cards
- tables
- tabs
- dialogs
- drawers
- bottom sheets
- alerts
- toast notifications
- loading states
- empty states
- error states
- status indicators
- responsive component behavior
- accessibility rules
- component naming
- design-token principles

**The objective is ONE shared design language.** Different layouts are allowed between mobile and desktop. Different design systems are NOT allowed.

---

# 2. Core Principle

**LOCKED**

Mobile and Desktop use the SAME design language.

They may have different:

- layouts
- navigation
- information density
- interaction patterns
- component arrangements

But they must share:

- colors
- typography
- spacing tokens
- radii
- shadows
- status semantics
- component visual language
- icon language
- brand identity

---

# 3. Brand Direction

The product is **Broastin**.

The interface should feel:

- modern
- premium
- operational
- clean
- trustworthy
- fast
- restaurant-focused
- professional

Avoid making the CRM look like:

- generic enterprise software
- accounting software
- overly playful consumer software
- a generic SaaS template

The UI should feel like a serious restaurant growth/CRM operating system.

---

# 4. Primary Brand Color

The approved desktop visual direction uses **dark burgundy / deep red** as the primary brand/navigation color.

This is especially important for:

- desktop sidebar
- primary brand identity
- selected navigation states
- important primary actions where appropriate

Do NOT introduce an unrelated primary color.

**Exact HEX value: NOT YET FINALIZED.**

Create a centralized token so the value can be changed in one place later. Conceptual token:

```
--color-brand-primary
```

Do not hard-code brand colors throughout components.

---

# 5. Secondary Colors

The system may use supporting colors for:

- success
- warning
- error
- information
- neutral
- loyalty
- marketing
- operational states

These must be semantic: `success`, `warning`, `error`, `info`, `neutral`.

Do not assign colors randomly to individual components.

---

# 6. Color System

Create semantic tokens. Conceptual structure:

```
Brand
├── Primary
├── Primary Hover
├── Primary Active
└── Primary Soft

Neutral
├── Background
├── Surface
├── Surface Secondary
├── Border
├── Divider
├── Text Primary
├── Text Secondary
├── Text Muted
└── Text Disabled

Semantic
├── Success
├── Warning
├── Error
└── Info
```

Exact color values should be centralized. **NOT YET FINALIZED.**

---

# 7. Background System

**Desktop:**

- Primary workspace remains light and clean.
- Cards: white/light surface.
- Sidebar: dark burgundy/red.

**Mobile:**

- Light background by default unless an approved dark mode is implemented later.

Dark mode is not introduced as a requirement now. **Dark mode: NOT YET FINALIZED** (see also Section 55).

---

# 8. Contrast

All text and interactive elements must maintain readable contrast.

Do not use:

- light gray text on white for important information
- extremely pale status colors
- low-contrast placeholder text
- color combinations that make status unreadable

Accessibility takes priority over decorative styling.

---

# 9. Typography

Typography must be centralized. Define tokens for:

```
Display
H1
H2
H3
Page Title
Section Title
Card Title
Body Large
Body
Body Small
Caption
Label
Table Header
Button Text
```

Do NOT allow individual screens to invent arbitrary font sizes.

**Exact font family: NOT YET FINALIZED.** Select a modern, highly readable UI font through the central token/configuration layer. Changing the font later must require changing one centralized definition.

---

# 10. Typography Weight

Use a controlled weight scale, conceptually: Regular, Medium, Semibold, Bold.

Avoid excessive use of:

- extra bold
- all caps
- decorative fonts

Use weight to establish hierarchy.

---

# 11. Numbers

Business numbers should be visually easy to scan. Important numeric values may use:

- stronger weight
- slightly larger typography
- tabular numeric formatting where appropriate

Examples: Revenue, Orders, Customers, Points, Conversion rate.

Do not make every number visually dominant.

---

# 12. Spacing System

Use a centralized spacing scale. Recommended token structure:

```
space-1
space-2
space-3
space-4
space-5
space-6
space-8
space-10
space-12
space-16
```

Exact values should be centralized. **NOT YET FINALIZED.** Do not use random pixel values throughout the project.

---

# 13. Responsive Spacing

**Mobile:** tighter spacing while preserving touch comfort.

**Desktop:** greater whitespace where appropriate.

The underlying spacing system remains shared. Do not create unrelated spacing systems for mobile and desktop.

---

# 14. Border Radius

Use a consistent radius scale, conceptually:

```
radius-sm
radius-md
radius-lg
radius-xl
radius-full
```

Cards should generally use moderate rounded corners. Do not make every element excessively rounded. Avoid "bubble UI."

---

# 15. Shadow System

Use subtle shadows, conceptually:

```
shadow-none
shadow-sm
shadow-md
shadow-lg
```

Most cards should use none or a subtle shadow. Avoid heavy floating shadows. The approved desktop reference uses clean cards with restrained elevation.

---

# 16. Borders

Borders should be subtle. Use borders primarily for:

- inputs
- table boundaries
- separators
- cards where necessary
- selected states

Avoid outlining every UI element.

---

# 17. Icon System

Use one consistent icon library/style throughout the application (Lucide Icons, per `FRONTEND_ARCHITECTURE.md`).

Icons should be simple, modern, readable, and consistent in stroke/fill behavior.

Do NOT mix random icon styles. Do NOT use emojis as UI icons. Icon size must use centralized tokens.

---

# 18. Icon + Text Rule

When an icon accompanies text:

```
Icon + Text
```

must have consistent alignment and spacing. Do not use icons merely for decoration when they do not improve comprehension.

---

# 19. Button System

Buttons must have defined variants. Minimum: **Primary, Secondary, Outline, Ghost, Destructive, Success.** Potential: **Icon Button.**

Each variant must have default, hover, active, disabled and loading states.

---

# 20. Primary Button

Uses the Broastin primary brand color. Use for: main page action, save, create, confirm, apply.

Do not place multiple competing primary buttons in the same small area.

---

# 21. Secondary Button

Secondary actions have lower visual priority. Examples: Cancel, View, secondary operation.

---

# 22. Destructive Button

Destructive actions must be visually distinct. Examples: Delete, Remove, Permanently disable.

Destructive actions must not look identical to normal actions.

---

# 23. Button Sizing

Define: **Small, Medium, Large.**

Mobile prioritizes touch comfort. Desktop may use more compact controls. Do not create tiny mobile buttons merely to save space.

---

# 24. Button Loading

When an action is processing:

- prevent accidental duplicate submission
- show a loading state
- preserve button dimensions where practical

Example: `[Saving...]`

Do not silently disable a button with no visual feedback.

---

# 25. Input System

All inputs must share a consistent visual language. Components:

```
Text Input
Search Input
Number Input
Phone Input
Date Input
Textarea
Select
Multi-select
Checkbox
Radio
Switch
```

Each must have a label, input, helper text where required, error state, and disabled state.

---

# 26. Input Labels

Labels must be clear. Do not rely only on placeholder text to describe an input.

- **Placeholder:** example / hint.
- **Label:** actual field name.

---

# 27. Input Error States

Errors appear close to the affected field, using error color, a clear message, and an optional error icon.

Do not use vague messages such as "Invalid input." Prefer actionable explanations.

---

# 28. Select / Dropdown

Select controls must be consistent across the application.

- **Desktop** may use dropdown menus.
- **Mobile** may use a bottom sheet, native-style selection, or full-screen selection, depending on complexity.

Visual language remains shared.

---

# 29. Search Component

Search should have a standardized appearance: search icon, input, clear action.

Use the same visual system across customers, orders, campaigns, feedback and analytics.

---

# 30. Cards

The card component should support: title, subtitle, content, footer, action.

Variants may include: Standard, Metric, Alert, Summary, Interactive.

Do not create dozens of unrelated card components. Prefer one flexible card system.

---

# 31. KPI Card

KPI cards may contain: label, value, trend, comparison, optional icon.

Keep the hierarchy:

```
Metric name
↓
Main value
↓
Supporting information
```

Do not let decorative elements dominate the metric.

---

# 32. Status Badges

Create a reusable status badge component. Examples: Active, Inactive, Pending, Completed, Failed, Preparing, Cancelled.

Status appearance must combine text, an appropriate semantic color, and an optional icon. Do not rely only on color.

---

# 33. Alerts

Alert variants: Info, Success, Warning, Error.

Alerts should have an icon, a title where necessary, a message, and an optional action. Avoid overly large alert boxes for minor messages.

---

# 34. Toast Notifications

Toasts are for short-lived feedback. Good examples: "Customer created.", "Campaign saved.", "Changes updated."

Do not use toasts for long explanations, critical information that must remain visible, or complex forms.

---

# 35. Table System

Tables are primarily desktop-oriented (see `DESKTOP_UI_SPEC.md`).

A standard table should support: header, rows, sorting, selection, pagination, row actions, empty state, loading state.

Mobile should generally transform table information into cards/list views (see `MOBILE_UI_SPEC.md`). Do NOT simply squeeze desktop tables into mobile.

---

# 36. Pagination

Pagination should be reusable.

- **Desktop:** traditional pagination may be used.
- **Mobile:** prefer pagination controls optimized for touch, "load more," or progressive loading, depending on data requirements.

---

# 37. Tabs

Tabs separate related content.

Rules: clear active state, readable labels, horizontal scrolling only when necessary, do not create too many tabs. Mobile tabs must remain touch-friendly.

---

# 38. Bottom Sheet

Bottom sheets are primarily mobile interaction components. Use for filters, selections, quick actions. Do not use for complicated workflows.

---

# 39. Drawer

Drawers are primarily desktop interaction components. Use for quick details, secondary information, short forms, contextual actions. Do not put complex multi-step processes inside narrow drawers.

---

# 40. Modal / Dialog

Dialogs are for confirmation, warning, short forms, focused actions.

They must have a clear title, content, actions, and a close mechanism. Destructive confirmation must clearly identify what will happen.

---

# 41. Loading System

Standardize: spinner, skeleton, button loading, page loading.

Use skeletons for major data sections. Use spinners for short operations.

---

# 42. Empty State

The reusable empty state must support an icon/illustration, title, explanation, and optional action.

Example:

```
No customers found.
[Add Customer]
```

Keep illustrations simple and consistent with the product.

---

# 43. Error State

The reusable error state must have a clear title, explanation, and retry/action where appropriate.

Never expose technical internals.

---

# 44. Avatar System

Avatars may display customer initials, a profile image, or a staff image. Provide fallback initials. Use consistent sizes.

---

# 45. Data Visualization

Charts must use the shared semantic color system. Do not create rainbow charts. Use color to communicate meaning.

Charts must remain readable on both desktop and mobile. Mobile should simplify charts when necessary rather than merely shrinking them.

---

# 46. Chart Rule

A chart must answer a business question. Do not create charts simply because the dashboard has empty space.

Examples: revenue trend, order trend, customer growth, campaign performance. Exact metrics are defined elsewhere.

---

# 47. Dividers

Dividers should be subtle. Use primarily for section separation, table boundaries, menu grouping.

Do not overuse dividers. Whitespace should usually provide hierarchy.

---

# 48. Tooltip

Tooltips may be used for unfamiliar icons, truncated desktop labels, and additional context.

Do not use tooltips to hide essential information. Mobile should generally avoid hover-dependent tooltips.

---

# 49. Responsive Component Rule

Components must support both environments where appropriate.

**Example — CustomerCard:**

- Desktop: may appear as a table row or wider card.
- Mobile: may appear as a compact customer card.

The underlying component/data semantics remain consistent. Do not force identical markup/layout everywhere.

---

# 50. Touch Interaction

Mobile interactive controls must be touch-friendly. Do not optimize mobile controls for mouse precision. Interactive spacing must prevent accidental taps.

---

# 51. Keyboard Interaction

Desktop interactive components should support keyboard navigation: Tab, Enter, Escape, and arrow keys where appropriate.

Dialogs and menus must manage focus correctly.

---

# 52. Focus States

Interactive elements must have visible focus states. Do not remove browser accessibility focus indicators without replacement.

---

# 53. Disabled States

Disabled elements must visually communicate "unavailable" and "non-interactive," but must remain readable. Do not use opacity so low that users cannot understand the control.

---

# 54. Hover States

Hover states are primarily relevant to desktop. Do not depend on hover for essential mobile functionality.

---

# 55. Dark Mode

Dark mode is NOT part of the initial implementation requirement. Do not build a separate dark theme unless explicitly approved.

However, design tokens should be structured so dark mode can be added later without rewriting components.

---

# 56. Component Naming

Use consistent component names, for example:

```
Button
Input
SearchInput
Select
Card
MetricCard
StatusBadge
Avatar
Modal
Drawer
BottomSheet
Tabs
Table
EmptyState
ErrorState
Skeleton
Toast
```

Do not create duplicate components with different names for identical purposes.

---

# 57. Component Architecture

Reusable components should be separated from page-specific components. Conceptually:

```
components/
├── ui/
├── forms/
├── feedback/
├── data-display/
├── navigation/
└── charts/
```

Page-specific components remain inside the relevant feature/module (see `FRONTEND_ARCHITECTURE.md` Section 5–6). Do not create a massive universal component folder containing unrelated business logic.

---

# 58. Design Tokens

All reusable values should be centralized. Minimum token groups:

```
Colors
Typography
Spacing
Radius
Shadows
Borders
Icon sizes
Control heights
Breakpoints
Z-index
```

The exact technical implementation may depend on the selected frontend stack (Tailwind configuration and shadcn/ui theming, per `FRONTEND_ARCHITECTURE.md`). Do not duplicate token values across CSS files.

---

# 59. Z-Index

Create a controlled layering system, conceptually:

```
Base
Sticky
Header
Dropdown
Drawer
Modal
Toast
```

Do not use arbitrary values such as `99999`, `999999`, `9999999` throughout the application.

---

# 60. Responsive Breakpoints

Breakpoints must be centralized. Do not create different breakpoint values in every component.

**Exact breakpoint values: NOT YET FINALIZED.** They should be selected based on actual testing (see `FRONTEND_ARCHITECTURE.md` Section 15 and `DESKTOP_UI_SPEC.md` Section 20).

---

# 61. Animation System

Use a small number of standardized durations, conceptually: Fast, Normal, Slow.

Animation should be subtle, consistent and purposeful. Avoid excessive animation. Respect reduced-motion accessibility preferences.

---

# 62. Mobile-Specific Rule

The design system must NOT force desktop components onto mobile. Examples:

```
Desktop table         → mobile list/card
Desktop sidebar       → mobile hamburger
Desktop drawer        → mobile bottom sheet where appropriate
Desktop multi-column form → mobile stacked form
```

This is intentional adaptation, not duplication.

---

# 63. Desktop-Specific Rule

Desktop may use tables, a persistent sidebar, multi-column layouts, drawers, bulk actions, richer analytics, and advanced filters, without requiring mobile equivalents of identical form.

---

# 64. Broastin Visual Consistency

The following must always feel like one product: Mobile Manager, Desktop Admin, QR-related administrative interfaces, future CRM extensions.

A user should immediately recognize: "This is Broastin."

---

# 65. Do Not Copy Generic SaaS UI

Avoid blindly copying generic Tailwind dashboard templates, generic CRM templates, random layouts from design-inspiration sites, or unrelated restaurant POS interfaces.

The system must follow the approved Broastin visual direction.

---

# 66. Do Not Over-Design

Avoid: excessive gradients, glassmorphism everywhere, excessive rounded containers, oversized illustrations, excessive animation, decorative dashboards, unnecessary icons, excessive colors.

This is an operational business application. Clarity comes first.

---

# 67. Implementation Rule

Before creating a new visual component, check whether an existing design-system component can handle the requirement.

Prefer:

```
reuse → extend → compose
```

instead of:

```
duplicate → slightly modify → create another component
```

---

# 68. Design System Definition of Done

The design system is considered ready when:

- colors are centralized
- typography is centralized
- spacing is centralized
- radius is centralized
- shadows are centralized
- buttons are standardized
- inputs are standardized
- badges are standardized
- cards are standardized
- loading states are standardized
- empty states are standardized
- error states are standardized
- responsive behavior is defined
- accessibility principles are defined
- mobile/desktop adaptation rules are defined

Exact visual values that require visual approval must remain clearly marked as **NOT YET FINALIZED** rather than being silently invented.

---

# 69. What Is NOT YET FINALIZED

- exact brand primary color HEX value
- full semantic color palette values
- exact font family
- exact spacing scale values
- exact breakpoint values
- dark mode (not required now; token structure must allow it later)

---

# 70. Locked Rules

1. One shared design system.
2. Separate mobile and desktop layouts.
3. No mobile UI stretched into desktop.
4. No desktop UI squeezed into mobile.
5. Broastin burgundy/red remains the primary brand direction.
6. Desktop sidebar follows the approved reference.
7. Light workspace remains the primary desktop visual direction.
8. White cards remain the primary content-surface direction.
9. Semantic colors are centralized.
10. Typography is centralized.
11. Spacing is centralized.
12. Radius is centralized.
13. Shadows are centralized.
14. Icons use one consistent visual language.
15. Components must be reusable.
16. Business logic must not live inside generic UI components.
17. Backend implementation must not leak into design components.
18. No random hard-coded visual values.
19. No unnecessary UI libraries.
20. No dark mode in initial implementation unless explicitly approved.
21. Accessibility is mandatory.
22. Performance is mandatory.
23. Major design-system changes require explicit approval.

---

*End of DESIGN_SYSTEM.md.*
