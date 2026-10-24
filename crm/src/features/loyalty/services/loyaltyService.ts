import type {
  CustomerBalance,
  CustomerBalanceListParams,
  CustomerBalanceListResult,
  LoyaltyActivityListParams,
  LoyaltyActivityListResult,
  LoyaltyEvent,
  LoyaltyOverview,
  Reward,
  RewardInput,
} from '@/features/loyalty/types/loyalty'
import {
  getRewardStore,
  setRewardStore,
  emptyRewards,
  normalActivityRaw,
  emptyActivityRaw,
  ERROR_SCENARIO_FLAG,
  type LoyaltyMockScenario,
  type RawLoyaltyEvent,
} from '@/features/loyalty/mock/loyalty.mock'
import { listCustomers } from '@/features/customers/services/customerService'
import { recordAudit } from '@/features/audit/services/auditService'

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
 * The ledger as it applies to today's customers: events of a customer
 * merged into another move to that customer (the Merge Tool adds the
 * two balances together), and events of archived customers drop out,
 * the same way Customer Balances hides them (unless asked to keep
 * them). Names come along so
 * callers don't fetch customers twice.
 */
async function resolveLedger(rawSource: RawLoyaltyEvent[], includeArchived = false) {
  const { items: customers } = await listCustomers({
    search: '',
    page: 1,
    pageSize: ALL_CUSTOMERS_PAGE_SIZE,
    sortBy: 'name',
    includeArchived: true,
  })
  const byId = new Map(customers.map((c) => [c.id, c] as const))
  const ownerOf = (id: string) => {
    let customer = byId.get(id)
    const seen = new Set<string>()
    while (customer?.mergedIntoId && !seen.has(customer.id)) {
      seen.add(customer.id)
      customer = byId.get(customer.mergedIntoId)
    }
    return customer
  }

  return rawSource.flatMap((e): LoyaltyEvent[] => {
    const owner = ownerOf(e.customerId)
    if (!owner || (owner.archivedAt && !includeArchived)) return []
    return [{ ...e, customerId: owner.id, customerName: owner.name }]
  })
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
  const ledger = await resolveLedger(normalActivityRaw)
  const rewardsRedeemed = ledger.filter((e) => e.type === 'redeemed').length

  return {
    totalPointsOutstanding,
    customersWithPoints: withPoints.length,
    rewardsAvailable: getRewardStore().length,
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

  return scenario === 'empty' ? emptyRewards : getRewardStore()
}

/**
 * Adds a reward (no `id`) or edits one. Names are unique so programs and
 * staff never confuse two rewards. Programs refer to rewards by id, so
 * renaming or repricing shows up in them straight away. No delete —
 * programs may still point at a reward.
 */
export async function saveReward(id: string | undefined, input: RewardInput): Promise<Reward> {
  await delay()

  const name = input.name.trim()
  const store = getRewardStore()
  if (store.some((r) => r.id !== id && r.name.toLowerCase() === name.toLowerCase())) {
    throw new Error(`A reward named "${name}" already exists.`)
  }
  if (!Number.isInteger(input.pointCost) || input.pointCost < 1) {
    throw new Error('Point cost must be a whole number of at least 1.')
  }

  const reward: Reward = { id: id ?? `rwd-${Date.now()}`, name, description: input.description.trim(), pointCost: input.pointCost }
  const existing = id ? store.find((r) => r.id === id) : undefined
  if (id && !existing) throw new Error(`Unknown reward: ${id}`)

  setRewardStore(existing ? store.map((r) => (r.id === id ? reward : r)) : [...store, reward])

  recordAudit({
    category: 'marketing',
    action: existing ? 'Edited reward' : 'Created reward',
    target: { type: 'reward', id: reward.id, label: reward.name, href: '/loyalty/rewards' },
    changes: existing
      ? [
          { field: 'Name', from: existing.name, to: reward.name },
          { field: 'Point cost', from: String(existing.pointCost), to: String(reward.pointCost) },
        ].filter((c) => c.from !== c.to)
      : [{ field: 'Point cost', from: '—', to: String(reward.pointCost) }],
  })

  return reward
}

export async function listLoyaltyActivity(
  params: LoyaltyActivityListParams,
  scenario: LoyaltyMockScenario = 'normal',
): Promise<LoyaltyActivityListResult> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load loyalty activity.')
  }

  const ledger = await resolveLedger(scenario === 'empty' ? emptyActivityRaw : normalActivityRaw, params.includeArchived)

  const search = params.search.trim().toLowerCase()
  let filtered = search ? ledger.filter((e) => e.customerName.toLowerCase().includes(search)) : ledger
  if (params.programId) {
    filtered = filtered.filter((e) => e.programId === params.programId)
  }

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const start = (params.page - 1) * params.pageSize
  const pageItems = sorted.slice(start, start + params.pageSize)

  return { items: pageItems, total: sorted.length }
}
