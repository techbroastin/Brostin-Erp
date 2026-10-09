/**
 * Loyalty mock data — rewards catalogue and activity events only. Only
 * src/features/loyalty/services/loyaltyService.ts may import this file.
 *
 * Customer identity and point balances are NOT duplicated here — per the
 * approved Phase 6 scope, loyaltyService sources those from the existing
 * customers feature (src/features/customers/services/customerService.ts)
 * so a customer's balance always agrees between Customers and Loyalty
 * (docs/FRONTEND_ARCHITECTURE.md §16: "a customer's orders, loyalty and
 * feedback must agree").
 *
 * Illustrative placeholders only — not real reward offers, not a
 * finalized event taxonomy, not a reconciled points ledger. See
 * DemoDataBadge wherever this data renders.
 */

import type { LoyaltyEventType, Reward } from '@/features/loyalty/types/loyalty'

const REWARD_DEFS: Array<Omit<Reward, 'id'>> = [
  {
    name: 'Free Soft Drink',
    description: 'Any regular soft drink, redeemed at checkout.',
    pointCost: 150,
  },
  {
    name: '10% Off Next Order',
    description: 'A one-time 10% discount on your next order.',
    pointCost: 300,
  },
  {
    name: 'Free Broasted Wings (6pc)',
    description: 'A box of 6 broasted chicken wings.',
    pointCost: 500,
  },
  {
    name: 'Free Combo Upgrade',
    description: 'Upgrade any combo to the next size up.',
    pointCost: 800,
  },
  {
    name: '₹100 Bill Credit',
    description: 'Flat ₹100 credit applied to your next bill.',
    pointCost: 1000,
  },
]

export const normalRewards: Reward[] = REWARD_DEFS.map((reward, index) => ({
  id: `rwd-${String(index + 1).padStart(3, '0')}`,
  ...reward,
}))

export const emptyRewards: Reward[] = []

/**
 * Raw activity events — customerName is intentionally absent; it is
 * attached by loyaltyService from the real customer records so names
 * never drift out of sync with the customers feature. Not a reconciled
 * ledger against each customer's current balance (no earn/redeem
 * calculation rule exists yet per docs/IMPLEMENTATION_PLAN.md §12) —
 * illustrative examples only.
 */
export type RawLoyaltyEvent = {
  id: string
  customerId: string
  type: LoyaltyEventType
  points: number
  description: string
  createdAt: string
}

/** Customers known to have a non-null loyaltyPoints value, per customers.mock.ts's `index % 3 === 0` rule. */
const EVENT_CUSTOMER_IDS = [
  'cust-001',
  'cust-004',
  'cust-007',
  'cust-010',
  'cust-013',
  'cust-016',
  'cust-019',
  'cust-022',
  'cust-025',
]

function buildActivity(): RawLoyaltyEvent[] {
  const events: RawLoyaltyEvent[] = []
  EVENT_CUSTOMER_IDS.forEach((customerId, index) => {
    const daysAgoEarned = index * 2 + 1
    events.push({
      id: `lev-${String(index * 2 + 1).padStart(3, '0')}`,
      customerId,
      type: 'earned',
      points: 40,
      description: 'Earned points on an order',
      createdAt: new Date(Date.now() - daysAgoEarned * 24 * 60 * 60 * 1000).toISOString(),
    })
    if (index % 2 === 0) {
      const daysAgoRedeemed = index * 2
      events.push({
        id: `lev-${String(index * 2 + 2).padStart(3, '0')}`,
        customerId,
        type: 'redeemed',
        points: -150,
        description: 'Redeemed: Free Soft Drink',
        createdAt: new Date(Date.now() - daysAgoRedeemed * 24 * 60 * 60 * 1000).toISOString(),
      })
    }
  })
  return events
}

export const normalActivityRaw: RawLoyaltyEvent[] = buildActivity()

export const emptyActivityRaw: RawLoyaltyEvent[] = []

/**
 * Not a data scenario — a sentinel loyaltyService checks for to throw a
 * simulated failure, exercising LoyaltyErrorState.
 */
export const ERROR_SCENARIO_FLAG = 'error'

export type LoyaltyMockScenario = 'normal' | 'empty' | typeof ERROR_SCENARIO_FLAG
