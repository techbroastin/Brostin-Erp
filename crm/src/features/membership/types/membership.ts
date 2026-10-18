/**
 * Membership feature types — provisional frontend view models, not the
 * Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16).
 *
 * Per docs/IMPLEMENTATION_PLAN.md (canonical "Phase 12 — Membership")
 * and docs/NAVIGATION.md §15, no membership business rules are
 * finalized: pricing, plan duration, benefits, billing cycles, renewal
 * rules, cancellation rules, eligibility, and automated status
 * transitions are all UNDEFINED and are not invented here.
 * `MembershipStatus` ('active' | 'expired') and
 * `MembershipActivityType` ('joined' | 'renewed' | 'expired') are
 * intentionally limited to minimal, purely descriptive illustrative
 * values — not a finalized lifecycle or billing model. There is no
 * create/edit/delete/approve/cancel/renew/payment/configuration action
 * anywhere in this feature (view-only, same discipline as Feedback and
 * Referrals).
 *
 * `Member.customerName` is always sourced from the customers feature
 * (never duplicated) — per approval, every Member references an
 * existing registered customer via `customerId`; there is no
 * unregistered-member concept (unlike Referrals' referred contact).
 * `Member.planName` is always sourced from the `MembershipPlan`
 * catalogue (never duplicated).
 *
 * `since`/`expiresAt` live on `Member`, not on `MembershipPlan` — a
 * plan is just a named catalogue offering; the actual subscription
 * window belongs to each member's own instance.
 */

export type MembershipStatus = 'active' | 'expired'

export type MembershipActivityType = 'joined' | 'renewed' | 'expired'

export type MembershipPlan = {
  id: string
  name: string
  description: string
}

export type Member = {
  id: string
  customerId: string
  customerName: string
  planId: string
  planName: string
  status: MembershipStatus
  since: string
  expiresAt: string
}

export type MemberListParams = {
  search: string
  page: number
  pageSize: number
}

export type MemberListResult = {
  items: Member[]
  total: number
}

export type MembershipOverview = {
  totalMembers: number
  activeMembers: number
  expiredMembers: number
  plansAvailable: number
}

export type MembershipActivityRecord = {
  id: string
  customerId: string
  customerName: string
  type: MembershipActivityType
  description: string
  createdAt: string
}

export type MembershipActivityListParams = {
  search: string
  page: number
  pageSize: number
}

export type MembershipActivityListResult = {
  items: MembershipActivityRecord[]
  total: number
}
