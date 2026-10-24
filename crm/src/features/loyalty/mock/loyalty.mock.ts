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

const seedRewards: Reward[] = REWARD_DEFS.map((reward, index) => ({
  id: `rwd-${String(index + 1).padStart(3, '0')}`,
  ...reward,
}))

/** Mutable session-only catalogue — owners can add and edit rewards on desktop. */
let rewardStore: Reward[] = [...seedRewards]

export function getRewardStore(): Reward[] {
  return rewardStore
}

export function setRewardStore(next: Reward[]) {
  rewardStore = next
}

export const emptyRewards: Reward[] = []

/**
 * Raw activity events — customerName is intentionally absent; it is
 * attached by loyaltyService from the real customer records so names
 * never drift out of sync with the customers feature.
 *
 * This is the points ledger: each customer's events add up exactly to
 * their seed balance (customers.mock.ts: `index % 3 === 0 ?
 * (index % 12) * 40 : null`), so Customer Balances and Activity always
 * agree — loyaltyActivity.test.ts guards this. Earned events name the
 * program that awarded them, which feeds each program's results.
 * Illustrative amounts only; no earn/redeem rule is finalized.
 */
export type RawLoyaltyEvent = {
  id: string
  customerId: string
  type: LoyaltyEventType
  points: number
  description: string
  /** The program that awarded the points; null for redemptions. */
  programId: string | null
  createdAt: string
}

/** [customerId, seed balance] for every customer with a non-null balance in customers.mock.ts. */
const SEED_BALANCES: Array<[string, number]> = [
  ['cust-001', 0],
  ['cust-004', 120],
  ['cust-007', 240],
  ['cust-010', 360],
  ['cust-013', 0],
  ['cust-016', 120],
  ['cust-019', 240],
  ['cust-022', 360],
  ['cust-025', 0],
]

const ORDER_POINTS = 120
const SOFT_DRINK_COST = 150
const EARN_PROGRAM_ID = 'prog-001'
const DAY_MS = 24 * 60 * 60 * 1000

function buildActivity(): RawLoyaltyEvent[] {
  const events: RawLoyaltyEvent[] = []
  const add = (event: Omit<RawLoyaltyEvent, 'id' | 'createdAt'>, daysAgo: number) =>
    events.push({
      ...event,
      id: `lev-${String(events.length + 1).padStart(3, '0')}`,
      createdAt: new Date(Date.now() - daysAgo * DAY_MS).toISOString(),
    })

  SEED_BALANCES.forEach(([customerId, balance], index) => {
    const base = index * 3
    // Every other customer earned a soft drink's worth and spent it.
    if (index % 2 === 0) {
      add(
        { customerId, type: 'earned', points: SOFT_DRINK_COST, description: 'Earned points on an order', programId: EARN_PROGRAM_ID },
        base + 3,
      )
      add(
        { customerId, type: 'redeemed', points: -SOFT_DRINK_COST, description: 'Redeemed: Free Soft Drink', programId: null },
        base + 2,
      )
    }
    for (let k = 0; k < balance / ORDER_POINTS; k++) {
      add(
        { customerId, type: 'earned', points: ORDER_POINTS, description: 'Earned points on an order', programId: EARN_PROGRAM_ID },
        base + 1 - k * 0.25,
      )
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
