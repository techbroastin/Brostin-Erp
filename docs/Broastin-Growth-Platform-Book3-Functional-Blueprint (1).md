# BROASTIN GROWTH PLATFORM
## Book 3 — Functional Blueprint (Customer Growth OS)

**Purpose:** Define exactly what each engine inside Customer Growth OS does — purpose, features, user workflows, business rules, inputs/outputs, and screen-level scope — before any database or code design happens. This is the last book before things get technical (Books 4-11).

**Scope note:** Per the Book 1 recommendation, this book specs the *full target-state* Customer Growth OS. Phase 1 MVP is a subset, marked inline as **[MVP]**.

---

## 1. CRM Engine **[MVP]**

**Purpose:** The single source of truth for every customer — one record per person, shared across all Organizations (per Book 2 §5 decision).

**Key features:**
- Unique customer identity keyed on phone number (India-standard, matches how Reelo and every POS-adjacent tool in this market operates).
- Auto-created on first transaction, QR scan, or manual entry.
- Stores: name, phone, DOB, anniversary date, first-visit date, last-visit date, lifetime spend, lifetime visit count, preferred outlet(s), dietary/preference tags, WhatsApp opt-in status, current segment tag(s), current active Programs.
- Merge/dedupe tool for when the same customer is accidentally created twice (e.g., typo'd phone number corrected later).

**Business rules:**
- Phone number is the merge key; name/DOB conflicts are flagged for manual review, never auto-overwritten silently.
- A customer record is never deleted, only archived (for audit and re-engagement purposes) — deletion only on an explicit data-privacy request (see Audit Engine, §14).

**Inputs:** POS transaction feed, QR scan, manual staff entry, customer self-service form (future).
**Outputs:** Customer Timeline (§3), Segmentation Engine (§10), every Program Engine evaluation.

**Screens:** Customer List (searchable/filterable), Customer Detail (full profile + timeline), Merge Tool, Bulk Import.

---

## 2. Program Engine **[MVP — Loyalty only; other programs Phase 2+]**

**Purpose:** The no-code system that turns a business idea ("Birthday Club," "Student Discount") into a running program without a developer.

**Key features:**
- **Program Definition** = a named bundle of: eligibility rule, trigger, reward, and messaging.
- Program Builder wizard: Name → Eligibility (who qualifies) → Trigger (what starts it) → Reward (what they get) → Channel (how they're told) → Publish.
- Program states: Draft → Active → Paused → Archived.
- Per-Organization enable/disable (a franchisee can toggle a Marketplace program on/off for their outlet without affecting others).

**Business rules:**
- A customer can be enrolled in multiple programs simultaneously unless explicitly marked mutually exclusive (e.g., a customer shouldn't get both a "new customer" welcome offer and a "VIP" reward on the same visit — this exclusion is a per-program setting, not a global rule).
- Reward cost must always resolve to a named cost-owner (brand-funded vs. franchisee-funded, per Book 2 §4) before a program can move from Draft to Active — this is a hard validation gate, not a warning.

**Inputs:** Admin configuration via Program Builder UI.
**Outputs:** Feeds the Workflow Engine (§3) which does the actual runtime evaluation; feeds Analytics (§11) for per-program ROI.

**Screens:** Program Marketplace (browse/install), Program Builder (create/edit), Program List (active/paused/draft), Program Detail (performance dashboard for that one program).

---

## 3. Workflow Engine **[MVP — simple linear rules only; visual drag-and-drop builder is Phase 2]**

**Purpose:** The runtime engine that actually evaluates triggers and fires actions — the "IF this THEN that" logic underneath every Program.

**Key features:**
- Visual canvas: Trigger node → Condition node(s) → Action node(s) → optional Delay/Wait node → optional branching (if/else).
- Example workflow (from Book 1): *Customer completes 5 visits* → IF *spend > ₹3000* → Enroll in Gold tier → Give 200 points → Send WhatsApp → Notify Manager.
- Reusable condition/action blocks so new workflows are assembled from existing pieces, not written from scratch each time.

**Business rules:**
- Every workflow run is logged (which customer, which path taken, what fired) — required for both debugging and the Audit Engine.
- A workflow cannot have an action with no defined fallback channel (e.g., if WhatsApp fails/opts-out, must define SMS or "log only" fallback) — validation gate before publish.

**MVP scope:** Phase 1 ships with the linear rule structure described in Book 3 §2 (Program Engine) as fixed backend logic per program type; the *visual* drag-and-drop builder itself is Phase 2 — the underlying rule engine is the same either way, only the authoring UI changes.

**Screens:** Workflow Canvas (drag-and-drop), Workflow Run Log, Workflow Test/Simulate mode (run against a sample customer before publishing).

---

## 4. Campaign Engine **[MVP]**

**Purpose:** Manual, one-off, or scheduled broadcast messaging — distinct from the always-on automated Workflow Engine.

**Key features:**
- Channel support: WhatsApp (primary), SMS (fallback), Email (secondary).
- Template library, taggable by occasion (festival, launch, generic) and audience (all/segment-specific).
- Schedule now, schedule later, or trigger on a calendar date (recurring festival campaigns).
- Send preview + test-send-to-self before broadcasting.

**Business rules:**
- Every campaign must target a defined Segment (§10), never "all customers" by default — forces intentional targeting, avoids the "blast everyone" anti-pattern the entire platform is designed to move away from.
- Opt-out respected at the channel level (a WhatsApp opt-out doesn't suppress SMS unless the customer opted out of all channels).

**Inputs:** Admin/marketing operator campaign creation.
**Outputs:** Campaign Sends log → Analytics (delivery/open/click/redeem funnel, per Book on Reelo's confirmed KPI pattern).

**Screens:** Campaign Builder, Template Library, Campaign Calendar, Campaign Performance Dashboard.

---

## 5. Customer Timeline **[MVP]**

**Purpose:** A chronological, human-readable feed of everything that's happened with one customer — every visit, every message sent, every point earned/redeemed, every review left.

**Key features:** Single-customer view, filterable by event type, exportable for support/dispute resolution.

**Business rules:** Timeline is append-only — no event is ever edited or removed, only superseded by a correction event (audit integrity).

**Screens:** Embedded in Customer Detail (§1); no standalone screen needed.

---

## 6. Customer Intelligence & Customer Analytics **[Phase 2]**

**Purpose:** Move from "what happened" (Timeline) to "what does this mean" — health scores, predicted churn, next-best-action.

**Key features:**
- Customer Health Score (composite of recency, frequency, monetary value — a standard RFM model).
- Next Best Action suggestion per customer (e.g., "this customer is 25 days lapsed and historically responds to a 15% discount — send win-back now").
- Cohort comparison (this month's new customers vs. last month's, by 90-day retention).

**Business rules:** Scores are advisory, never auto-executing — a human or an explicit Workflow must act on a suggestion; the Intelligence layer never silently changes a customer's Program enrollment.

**Screens:** Customer Intelligence Dashboard, Cohort Explorer.

---

## 7. Program Marketplace **[Phase 2]**

**Purpose:** The install/uninstall surface for Programs — turns the Program Engine (§2) into something browsable and shareable across Organizations, and eventually resellable (Book 2 §7 Stage 3).

**Key features:** Catalog view (Book 2 §3's program list), one-click install per Organization, version history if a program definition is updated centrally and pushed to franchisees.

**Business rules:** A franchisee can customize an installed program's parameters (e.g., reward value) within brand-set min/max bounds, never outside them (ties to Book 2 §4 pricing-band logic).

**Screens:** Marketplace Browse, Program Install/Configure, Installed Programs List (per Organization).

---

## 8. AI Recommendation Engine **[Phase 3 — Future AI Roadmap, Book 15]**

**Purpose:** Natural-language and generative assistance layered on top of everything above — not a replacement for the engines, a co-pilot for using them.

**Key features (target-state, not near-term):** Natural-language Program Builder ("create a program that gives students 10% off on weekdays"), AI-generated campaign copy, sales/inventory forecasting, menu engineering suggestions.

**Note:** Full detail deferred to Book 15 (Future AI Roadmap) — flagged here only to show where it plugs into the engines defined in this book.

---

## 9. Review Engine **[MVP]**

**Purpose:** Capture feedback at the source, route it to protect the brand's public reputation — the same "review gate" pattern confirmed in the Reelo research.

**Key features:**
- Post-visit rating request (1-5 stars).
- Rating ≥4 → prompt to post publicly (Google/Zomato/etc.).
- Rating ≤3 → captured privately, instant alert to outlet manager, never pushed publicly.

**Business rules:** Negative feedback alert must reach a manager within minutes (near-real-time), not batched — this is a reputation-risk-sensitive path and gets priority in the notification queue.

**Screens:** Feedback Capture (customer-facing, via QR/link), Feedback Inbox (manager-facing), Negative Feedback Alert (push notification).

---

## 10. Segmentation Engine **[MVP]**

**Purpose:** The audience-building layer every Campaign and Program depends on.

**Key features:** Pre-built segments (New, Repeat, Loyal/VIP, Lapsed, at-risk) auto-maintained by rules (e.g., "Lapsed = no visit in 21-30 days," matching the Reelo benchmark from prior research); custom segment builder (e.g., "spent >₹5000 AND visited Trivandrum outlet").

**Business rules:** Segments recalculate on a scheduled basis (e.g., nightly), not instantly on every transaction — this is a deliberate performance/cost tradeoff, consistent with how the Reelo research inferred their automation engine works.

**Screens:** Segment List, Segment Builder, Segment Membership Preview.

---

## 11. Wallet **[Phase 2]**

**Purpose:** Prepaid credit / membership balance — distinct from Loyalty points (a marketing liability) because wallet balance is prepaid revenue with different accounting treatment (per Book 2 §4).

**Key features:** Top-up, balance display, redemption at POS, expiry rules if applicable.

**Screens:** Wallet Detail (customer), Top-Up/Redeem (staff-facing at POS).

---

## 12. Coupons **[MVP — simple version; advanced rules Phase 2]**

**Purpose:** Single-use or limited-use discount codes, distinct from ongoing Programs — for one-off promotions, print materials, or partner collaborations.

**Key features:** Code generation (manual or bulk), usage limits (per-customer, total), expiry date, channel of distribution.

**Screens:** Coupon Builder, Coupon List, Redemption Log.

---

## 13. Notification Engine **[MVP]**

**Purpose:** The shared delivery layer every other engine sends through — WhatsApp, SMS, Email, and in-app/push (for staff alerts).

**Key features:** Channel routing with fallback (per §3's fallback rule), delivery status tracking (sent/delivered/read), rate-limiting to avoid over-messaging a single customer.

**Business rule:** A hard cap on messages-per-customer-per-week (configurable, default suggestion: 2) across *all* programs and campaigns combined — prevents the Program Marketplace's flexibility from accidentally spamming customers when multiple programs are active at once.

---

## 14. Permission Engine & Audit Engine **[MVP — basic roles; full matrix Phase 2]**

**Permission Engine purpose:** Enterprise RBAC down to the feature/button/field level, scoped by Company → Franchise → Branch → Department → Role → User (per Book 1 §4 principle).

**Audit Engine purpose:** Immutable log of who changed what, when — every Program edit, every permission change, every customer data access — required both for internal accountability and for any future franchise dispute resolution (Book 2 §9 risk).

**MVP scope:** Ship with 4 fixed roles (Owner, Manager, Staff, Marketing Operator) and a basic action log; the full granular matrix (button-level, field-level permissions) is Phase 2, once real usage patterns reveal which granularity actually matters.

---

## 15. Cross-Engine Data Flow Summary

```
Transaction/QR scan → CRM Engine (customer record updated)
   → Segmentation Engine (nightly recalculation)
   → Workflow Engine (evaluates all active Program triggers)
      → Program Engine (determines eligibility + reward)
         → Notification Engine (sends via WhatsApp/SMS/Email, respects rate cap)
      → Analytics (every send/redeem logged for ROI)
   → Customer Timeline (every event appended)
Review request → Review Engine → (public post OR private manager alert)
Everything → Audit Engine (immutable log)
Everything → Permission Engine (gates who can see/do what, at every step)
```

---

*End of Book 3. Say "Continue to Book 4" for the Technical Blueprint.*
