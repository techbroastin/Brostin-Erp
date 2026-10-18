/**
 * Membership mock data — only
 * src/features/membership/services/membershipService.ts may import
 * this file. Customer identity is NOT duplicated here: a member is
 * always referenced by `customerId` only (name enriched in
 * membershipService from the existing customers feature). Every member
 * references an existing registered mock customer — there is no
 * unregistered-member concept.
 *
 * Illustrative placeholders only — not real members, plans, or
 * activity; not a finalized billing/renewal model. See DemoDataBadge
 * wherever this data renders.
 */

import type {
  MembershipActivityType,
  MembershipPlan,
  MembershipStatus,
} from '@/features/membership/types/membership'

export type RawMember = {
  id: string
  customerId: string
  planId: string
  status: MembershipStatus
  since: string
  expiresAt: string
}

export type RawMembershipActivityRecord = {
  id: string
  customerId: string
  type: MembershipActivityType
  description: string
  createdAt: string
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Illustrative examples only — no approved price, duration, or benefit
 * exists for any entry here.
 */
const PLAN_DEFS: Array<Omit<MembershipPlan, 'id'>> = [
  {
    name: 'Silver Membership',
    description: 'Illustrative example — a basic illustrative tier. Not an approved plan, price, or duration.',
  },
  {
    name: 'Gold Membership',
    description: 'Illustrative example — a mid-tier illustrative plan. Not an approved plan, price, or duration.',
  },
  {
    name: 'Platinum Membership',
    description: 'Illustrative example — a top-tier illustrative plan. Not an approved plan, price, or duration.',
  },
]

export const normalMembershipPlans: MembershipPlan[] = PLAN_DEFS.map((plan, index) => ({
  id: `plan-${String(index + 1).padStart(3, '0')}`,
  ...plan,
}))

export const emptyMembershipPlans: MembershipPlan[] = []

const PLAN_IDS = {
  silver: normalMembershipPlans[0].id,
  gold: normalMembershipPlans[1].id,
  platinum: normalMembershipPlans[2].id,
}

const MEMBER_DEFS: Array<{
  customerId: string
  planId: string
  status: MembershipStatus
  sinceDaysAgo: number
  /** Positive = expires in the future (active); negative = already expired. */
  expiresOffsetDays: number
}> = [
  { customerId: 'cust-001', planId: PLAN_IDS.silver, status: 'active', sinceDaysAgo: 120, expiresOffsetDays: 245 },
  { customerId: 'cust-004', planId: PLAN_IDS.gold, status: 'active', sinceDaysAgo: 200, expiresOffsetDays: 165 },
  { customerId: 'cust-007', planId: PLAN_IDS.silver, status: 'expired', sinceDaysAgo: 400, expiresOffsetDays: -35 },
  { customerId: 'cust-008', planId: PLAN_IDS.platinum, status: 'active', sinceDaysAgo: 30, expiresOffsetDays: 335 },
  { customerId: 'cust-010', planId: PLAN_IDS.gold, status: 'expired', sinceDaysAgo: 380, expiresOffsetDays: -15 },
  { customerId: 'cust-013', planId: PLAN_IDS.silver, status: 'active', sinceDaysAgo: 60, expiresOffsetDays: 305 },
  { customerId: 'cust-016', planId: PLAN_IDS.platinum, status: 'active', sinceDaysAgo: 10, expiresOffsetDays: 355 },
  { customerId: 'cust-019', planId: PLAN_IDS.gold, status: 'expired', sinceDaysAgo: 500, expiresOffsetDays: -135 },
  { customerId: 'cust-022', planId: PLAN_IDS.silver, status: 'active', sinceDaysAgo: 90, expiresOffsetDays: 275 },
  { customerId: 'cust-025', planId: PLAN_IDS.platinum, status: 'expired', sinceDaysAgo: 420, expiresOffsetDays: -55 },
]

export const normalMembers: RawMember[] = MEMBER_DEFS.map((def, index) => ({
  id: `mem-${String(index + 1).padStart(3, '0')}`,
  customerId: def.customerId,
  planId: def.planId,
  status: def.status,
  since: new Date(Date.now() - def.sinceDaysAgo * DAY_MS).toISOString(),
  expiresAt: new Date(Date.now() + def.expiresOffsetDays * DAY_MS).toISOString(),
}))

export const emptyMembers: RawMember[] = []

/**
 * Illustrative historical mock events only — joined/renewed/expired are
 * descriptive labels, not a renewal or expiry business-logic engine.
 */
const ACTIVITY_DEFS: Array<{
  customerId: string
  type: MembershipActivityType
  description: string
  daysAgo: number
}> = [
  { customerId: 'cust-001', type: 'joined', description: 'Joined Silver Membership', daysAgo: 120 },
  { customerId: 'cust-004', type: 'joined', description: 'Joined Gold Membership', daysAgo: 200 },
  { customerId: 'cust-004', type: 'renewed', description: 'Renewed Gold Membership', daysAgo: 15 },
  { customerId: 'cust-007', type: 'joined', description: 'Joined Silver Membership', daysAgo: 400 },
  { customerId: 'cust-007', type: 'expired', description: 'Silver Membership expired', daysAgo: 35 },
  { customerId: 'cust-008', type: 'joined', description: 'Joined Platinum Membership', daysAgo: 30 },
  { customerId: 'cust-010', type: 'joined', description: 'Joined Gold Membership', daysAgo: 380 },
  { customerId: 'cust-010', type: 'expired', description: 'Gold Membership expired', daysAgo: 15 },
  { customerId: 'cust-013', type: 'joined', description: 'Joined Silver Membership', daysAgo: 60 },
  { customerId: 'cust-016', type: 'joined', description: 'Joined Platinum Membership', daysAgo: 10 },
  { customerId: 'cust-019', type: 'joined', description: 'Joined Gold Membership', daysAgo: 500 },
  { customerId: 'cust-019', type: 'renewed', description: 'Renewed Gold Membership', daysAgo: 250 },
  { customerId: 'cust-019', type: 'expired', description: 'Gold Membership expired', daysAgo: 135 },
  { customerId: 'cust-022', type: 'joined', description: 'Joined Silver Membership', daysAgo: 90 },
  { customerId: 'cust-025', type: 'joined', description: 'Joined Platinum Membership', daysAgo: 420 },
  { customerId: 'cust-025', type: 'expired', description: 'Platinum Membership expired', daysAgo: 55 },
]

export const normalMembershipActivity: RawMembershipActivityRecord[] = ACTIVITY_DEFS.map((def, index) => ({
  id: `mact-${String(index + 1).padStart(3, '0')}`,
  customerId: def.customerId,
  type: def.type,
  description: def.description,
  createdAt: new Date(Date.now() - def.daysAgo * DAY_MS).toISOString(),
}))

export const emptyMembershipActivity: RawMembershipActivityRecord[] = []

/**
 * Not a data scenario — a sentinel membershipService checks for to
 * throw a simulated failure, exercising MembershipErrorState.
 */
export const ERROR_SCENARIO_FLAG = 'error'

export type MembershipMockScenario = 'normal' | 'empty' | typeof ERROR_SCENARIO_FLAG
