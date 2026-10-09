import type {
  CustomerBalance,
  CustomerBalanceListParams,
  CustomerBalanceListResult,
  LoyaltyActivityListParams,
  LoyaltyActivityListResult,
  LoyaltyEvent,
  LoyaltyOverview,
  Reward,
} from '@/features/loyalty/types/loyalty'
import {
  normalRewards,
  emptyRewards,
  normalActivityRaw,
  emptyActivityRaw,
  ERROR_SCENARIO_FLAG,
  type LoyaltyMockScenario,
} from '@/features/loyalty/mock/loyalty.mock'
import { listCustomers } from '@/features/customers/services/customerService'

const SIMULATED_LATENCY_MS = 500

/**
 * Large enough to return every mock customer (customers.mock.ts
 * currently generates 25) in a single page, so overview/balances/activity
 * can read the complete, real customer dataset without inventing a
 * second bulk-fetch API on the customers feature.
 */
const ALL_CUSTOMERS_PAGE_SIZE = 1000

function delay() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
}

/**
 * The single point where Loyalty reads customer identity/points — always
 * via the customers feature's own service, never its mock file directly
 * (customers.mock.ts reserves direct import to customerService.ts). This
 * is what keeps a customer's balance identical on /customers and
 * /loyalty/customers.
 */
async function fetchAllCustomers() {
  const { items } = await listCustomers({
    search: '',
    page: 1,
    pageSize: ALL_CUSTOMERS_PAGE_SIZE,
    sortBy: 'name',
  })
  return items
}

/**
 * The swap point for real data later — nothing above this file (hooks,
 * components, screens) knows the data is mocked. `scenario` lets the
 * normal/empty/error states be exercised without changing any component;
 * production code always calls this with the default ('normal').
 */
export async function getLoyaltyOverview(
  scenario: LoyaltyMockScenario = 'normal',
): Promise<LoyaltyOverview> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load loyalty overview.')
  }

  if (scenario === 'empty') {
    return { totalPointsOutstanding: 0, customersWithPoints: 0, rewardsAvailable: 0, rewardsRedeemed: 0 }
  }

  const customers = await fetchAllCustomers()
  const withPoints = customers.filter((c) => (c.loyaltyPoints ?? 0) > 0)
  const totalPointsOutstanding = withPoints.reduce((sum, c) => sum + (c.loyaltyPoints ?? 0), 0)
  const rewardsRedeemed = normalActivityRaw.filter((e) => e.type === 'redeemed').length

  return {
    totalPointsOutstanding,
    customersWithPoints: withPoints.length,
    rewardsAvailable: normalRewards.length,
    rewardsRedeemed,
  }
}

export async function listCustomerBalances(
  params: CustomerBalanceListParams,
  scenario: LoyaltyMockScenario = 'normal',
): Promise<CustomerBalanceListResult> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load customer balances.')
  }
  if (scenario === 'empty') {
    return { items: [], total: 0 }
  }

  const customers = await fetchAllCustomers()

  const search = params.search.trim().toLowerCase()
  const filtered = search
    ? customers.filter(
        (c) => c.name.toLowerCase().includes(search) || c.phone.toLowerCase().includes(search),
      )
    : customers

  const sorted = [...filtered].sort((a, b) => {
    if (params.sortBy === 'points') return (b.loyaltyPoints ?? 0) - (a.loyaltyPoints ?? 0)
    return a.name.localeCompare(b.name)
  })

  const start = (params.page - 1) * params.pageSize
  const pageItems = sorted.slice(start, start + params.pageSize)

  const items: CustomerBalance[] = pageItems.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    points: c.loyaltyPoints,
  }))

  return { items, total: sorted.length }
}

export async function getRewards(scenario: LoyaltyMockScenario = 'normal'): Promise<Reward[]> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load rewards.')
  }

  return scenario === 'empty' ? emptyRewards : normalRewards
}

export async function listLoyaltyActivity(
  params: LoyaltyActivityListParams,
  scenario: LoyaltyMockScenario = 'normal',
): Promise<LoyaltyActivityListResult> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load loyalty activity.')
  }

  const rawSource = scenario === 'empty' ? emptyActivityRaw : normalActivityRaw
  const customers = await fetchAllCustomers()
  const nameById = new Map(customers.map((c) => [c.id, c.name] as const))

  const search = params.search.trim().toLowerCase()
  const filtered = search
    ? rawSource.filter((e) => (nameById.get(e.customerId) ?? '').toLowerCase().includes(search))
    : rawSource

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const start = (params.page - 1) * params.pageSize
  const pageItems = sorted.slice(start, start + params.pageSize)

  const items: LoyaltyEvent[] = pageItems.map((e) => ({
    ...e,
    customerName: nameById.get(e.customerId) ?? 'Unknown customer',
  }))

  return { items, total: sorted.length }
}
