/**
 * Referrals mock data — only
 * src/features/referrals/services/referralService.ts may import this
 * file. Customer identity is NOT duplicated here: a referrer is always
 * referenced by `referrerCustomerId` only (name/phone enriched in
 * referralService from the existing customers feature), and a
 * *registered* referred contact carries only `customerId` (name/phone
 * likewise enriched from the real customer record). An *unregistered*
 * referred contact carries its own illustrative `name`/`phone` — this is
 * mock-only contact data, never a fabricated Customer record.
 *
 * Illustrative placeholders only — not real referral records, not a
 * finalized qualification/reward model. See DemoDataBadge wherever this
 * data renders.
 */

import type { ReferralReward, ReferralStatus } from '@/features/referrals/types/referral'

export type RawReferredContact =
  | { registered: true; customerId: string }
  | { registered: false; name: string; phone: string }

export type RawReferralRecord = {
  id: string
  referrerCustomerId: string
  referred: RawReferredContact
  status: ReferralStatus
  createdAt: string
}

const DAY_MS = 24 * 60 * 60 * 1000

const RAW_DEFS: Array<Omit<RawReferralRecord, 'id' | 'createdAt'> & { daysAgo: number }> = [
  {
    referrerCustomerId: 'cust-002',
    referred: { registered: false, name: 'Ritika Suresh', phone: '+91 98450 11234' },
    status: 'completed',
    daysAgo: 10,
  },
  {
    referrerCustomerId: 'cust-002',
    referred: { registered: true, customerId: 'cust-006' },
    status: 'completed',
    daysAgo: 25,
  },
  {
    referrerCustomerId: 'cust-003',
    referred: { registered: false, name: 'Naveen Pillai', phone: '+91 98450 22345' },
    status: 'pending',
    daysAgo: 1,
  },
  {
    referrerCustomerId: 'cust-005',
    referred: { registered: false, name: 'Ananya Krishnan', phone: '+91 98450 33456' },
    status: 'completed',
    daysAgo: 15,
  },
  {
    referrerCustomerId: 'cust-005',
    referred: { registered: true, customerId: 'cust-009' },
    status: 'pending',
    daysAgo: 3,
  },
  {
    referrerCustomerId: 'cust-006',
    referred: { registered: false, name: 'Zoya Khan', phone: '+91 98450 44567' },
    status: 'pending',
    daysAgo: 5,
  },
  {
    referrerCustomerId: 'cust-009',
    referred: { registered: false, name: 'Hari Menon', phone: '+91 98450 55678' },
    status: 'completed',
    daysAgo: 40,
  },
  {
    referrerCustomerId: 'cust-011',
    referred: { registered: true, customerId: 'cust-014' },
    status: 'completed',
    daysAgo: 30,
  },
  {
    referrerCustomerId: 'cust-012',
    referred: { registered: false, name: 'Sana Thomas', phone: '+91 98450 66789' },
    status: 'pending',
    daysAgo: 2,
  },
  {
    referrerCustomerId: 'cust-014',
    referred: { registered: false, name: 'Vivek Raj', phone: '+91 98450 77890' },
    status: 'completed',
    daysAgo: 18,
  },
  {
    referrerCustomerId: 'cust-017',
    referred: { registered: false, name: 'Meera Das', phone: '+91 98450 88901' },
    status: 'pending',
    daysAgo: 6,
  },
  {
    referrerCustomerId: 'cust-020',
    referred: { registered: true, customerId: 'cust-023' },
    status: 'completed',
    daysAgo: 50,
  },
]

export const normalReferrals: RawReferralRecord[] = RAW_DEFS.map((def, index) => ({
  id: `ref-${String(index + 1).padStart(3, '0')}`,
  referrerCustomerId: def.referrerCustomerId,
  referred: def.referred,
  status: def.status,
  createdAt: new Date(Date.now() - def.daysAgo * DAY_MS).toISOString(),
}))

export const emptyReferrals: RawReferralRecord[] = []

/**
 * Illustrative examples only — no approved reward value, currency amount,
 * eligibility rule, or payout schedule exists for any entry here.
 */
const REWARD_DEFS: Array<Omit<ReferralReward, 'id'>> = [
  {
    name: 'Referral Thank-You Treat',
    description:
      'Illustrative example — a small thank-you item a referrer might receive once a referral is marked complete. Not an approved reward or value.',
  },
  {
    name: 'Priority Pickup Pass',
    description:
      'Illustrative example — faster pickup handling for active referrers. Not a finalized benefit.',
  },
  {
    name: 'Surprise Combo Upgrade',
    description: 'Illustrative example only — no approved eligibility rule or value exists yet.',
  },
]

export const normalReferralRewards: ReferralReward[] = REWARD_DEFS.map((reward, index) => ({
  id: `rrw-${String(index + 1).padStart(3, '0')}`,
  ...reward,
}))

export const emptyReferralRewards: ReferralReward[] = []

/**
 * Not a data scenario — a sentinel referralService checks for to throw a
 * simulated failure, exercising ReferralErrorState.
 */
export const ERROR_SCENARIO_FLAG = 'error'

export type ReferralMockScenario = 'normal' | 'empty' | typeof ERROR_SCENARIO_FLAG
