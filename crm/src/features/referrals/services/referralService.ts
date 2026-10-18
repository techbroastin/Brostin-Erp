import type {
  ReferralListParams,
  ReferralListResult,
  ReferralOverview,
  ReferralRecord,
  ReferralReward,
  ReferredContact,
} from '@/features/referrals/types/referral'
import {
  normalReferrals,
  emptyReferrals,
  normalReferralRewards,
  emptyReferralRewards,
  ERROR_SCENARIO_FLAG,
  type RawReferralRecord,
  type RawReferredContact,
  type ReferralMockScenario,
} from '@/features/referrals/mock/referrals.mock'
import { listCustomers } from '@/features/customers/services/customerService'
import type { Customer } from '@/features/customers/types/customer'

const SIMULATED_LATENCY_MS = 500

/**
 * Large enough to return every mock customer (customers.mock.ts
 * currently generates 25) in a single page, so referral records can read
 * the complete, real customer dataset without inventing a second
 * bulk-fetch API on the customers feature — same approach as Loyalty and
 * Feedback.
 */
const ALL_CUSTOMERS_PAGE_SIZE = 1000

function delay() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
}

/**
 * The single point where Referrals reads customer identity — always via
 * the customers feature's own service, never its mock file directly.
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
 * A registered referred contact's name/phone always comes from the real
 * customer record (never duplicated in the mock). An unregistered
 * contact's name/phone is the mock's own illustrative data — no
 * Customer record is looked up or fabricated for it.
 */
function enrichReferredContact(
  raw: RawReferredContact,
  customerById: Map<string, Customer>,
): ReferredContact {
  if (raw.registered) {
    const customer = customerById.get(raw.customerId)
    return {
      registered: true,
      customerId: raw.customerId,
      name: customer?.name ?? 'Unknown customer',
      phone: customer?.phone ?? '',
    }
  }
  return { registered: false, name: raw.name, phone: raw.phone }
}

function enrichReferral(raw: RawReferralRecord, customerById: Map<string, Customer>): ReferralRecord {
  const referrer = customerById.get(raw.referrerCustomerId)
  return {
    id: raw.id,
    referrerCustomerId: raw.referrerCustomerId,
    referrerCustomerName: referrer?.name ?? 'Unknown customer',
    referred: enrichReferredContact(raw.referred, customerById),
    status: raw.status,
    createdAt: raw.createdAt,
  }
}

function matchesSearch(record: ReferralRecord, search: string): boolean {
  if (!search) return true
  return (
    record.referrerCustomerName.toLowerCase().includes(search) ||
    record.referred.name.toLowerCase().includes(search) ||
    record.referred.phone.toLowerCase().includes(search)
  )
}

async function listEnrichedReferrals(scenario: ReferralMockScenario): Promise<ReferralRecord[]> {
  const rawSource = scenario === 'empty' ? emptyReferrals : normalReferrals
  const customers = await fetchAllCustomers()
  const customerById = new Map(customers.map((c) => [c.id, c] as const))
  return rawSource.map((raw) => enrichReferral(raw, customerById))
}

/**
 * The swap point for real data later — nothing above this file (hooks,
 * components, screens) knows the data is mocked. `scenario` lets the
 * normal/empty/error states be exercised without changing any component;
 * production code always calls this with the default ('normal').
 */
export async function getReferralOverview(
  scenario: ReferralMockScenario = 'normal',
): Promise<ReferralOverview> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load referral overview.')
  }
  if (scenario === 'empty') {
    return { totalReferrals: 0, completedReferrals: 0, pendingReferrals: 0, rewardsAvailable: 0 }
  }

  const completedReferrals = normalReferrals.filter((r) => r.status === 'completed').length

  return {
    totalReferrals: normalReferrals.length,
    completedReferrals,
    pendingReferrals: normalReferrals.length - completedReferrals,
    rewardsAvailable: normalReferralRewards.length,
  }
}

/** Sorted by referrer name — the "Customers participating in referrals" view. */
export async function listReferralCustomers(
  params: ReferralListParams,
  scenario: ReferralMockScenario = 'normal',
): Promise<ReferralListResult> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error("Couldn't load referral customers.")
  }

  const search = params.search.trim().toLowerCase()
  const all = await listEnrichedReferrals(scenario)
  const filtered = search ? all.filter((r) => matchesSearch(r, search)) : all
  const sorted = [...filtered].sort((a, b) => a.referrerCustomerName.localeCompare(b.referrerCustomerName))

  const start = (params.page - 1) * params.pageSize
  const items = sorted.slice(start, start + params.pageSize)

  return { items, total: sorted.length }
}

/** Sorted by date, newest first — the chronological referral activity view. */
export async function listReferralActivity(
  params: ReferralListParams,
  scenario: ReferralMockScenario = 'normal',
): Promise<ReferralListResult> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error("Couldn't load referral activity.")
  }

  const search = params.search.trim().toLowerCase()
  const all = await listEnrichedReferrals(scenario)
  const filtered = search ? all.filter((r) => matchesSearch(r, search)) : all
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const start = (params.page - 1) * params.pageSize
  const items = sorted.slice(start, start + params.pageSize)

  return { items, total: sorted.length }
}

export async function getReferralRewards(
  scenario: ReferralMockScenario = 'normal',
): Promise<ReferralReward[]> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load referral rewards.')
  }

  return scenario === 'empty' ? emptyReferralRewards : normalReferralRewards
}
