import type {
  Member,
  MemberListParams,
  MemberListResult,
  MembershipActivityListParams,
  MembershipActivityListResult,
  MembershipActivityRecord,
  MembershipOverview,
  MembershipPlan,
} from '@/features/membership/types/membership'
import {
  normalMembers,
  emptyMembers,
  normalMembershipPlans,
  emptyMembershipPlans,
  normalMembershipActivity,
  emptyMembershipActivity,
  ERROR_SCENARIO_FLAG,
  type RawMember,
  type RawMembershipActivityRecord,
  type MembershipMockScenario,
} from '@/features/membership/mock/membership.mock'
import { listCustomers } from '@/features/customers/services/customerService'

const SIMULATED_LATENCY_MS = 500

/**
 * Large enough to return every mock customer (customers.mock.ts
 * currently generates 25) in a single page — same approach as Loyalty,
 * Feedback, and Referrals.
 */
const ALL_CUSTOMERS_PAGE_SIZE = 1000

function delay() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
}

/**
 * The single point where Membership reads customer identity — always
 * via the customers feature's own service, never its mock file
 * directly.
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

/** Plan name is sourced from the plan catalogue, never duplicated onto a Member. */
function planNameById(planId: string): string {
  return normalMembershipPlans.find((plan) => plan.id === planId)?.name ?? 'Unknown plan'
}

function enrichMember(raw: RawMember, nameById: Map<string, string>): Member {
  return {
    id: raw.id,
    customerId: raw.customerId,
    customerName: nameById.get(raw.customerId) ?? 'Unknown customer',
    planId: raw.planId,
    planName: planNameById(raw.planId),
    status: raw.status,
    since: raw.since,
    expiresAt: raw.expiresAt,
  }
}

function enrichActivity(
  raw: RawMembershipActivityRecord,
  nameById: Map<string, string>,
): MembershipActivityRecord {
  return {
    id: raw.id,
    customerId: raw.customerId,
    customerName: nameById.get(raw.customerId) ?? 'Unknown customer',
    type: raw.type,
    description: raw.description,
    createdAt: raw.createdAt,
  }
}

/**
 * The swap point for real data later — nothing above this file (hooks,
 * components, screens) knows the data is mocked. `scenario` lets the
 * normal/empty/error states be exercised without changing any
 * component; production code always calls this with the default
 * ('normal').
 */
export async function getMembershipOverview(
  scenario: MembershipMockScenario = 'normal',
): Promise<MembershipOverview> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load membership overview.')
  }
  if (scenario === 'empty') {
    return { totalMembers: 0, activeMembers: 0, expiredMembers: 0, plansAvailable: 0 }
  }

  const activeMembers = normalMembers.filter((m) => m.status === 'active').length

  return {
    totalMembers: normalMembers.length,
    activeMembers,
    expiredMembers: normalMembers.length - activeMembers,
    plansAvailable: normalMembershipPlans.length,
  }
}

export async function listMembers(
  params: MemberListParams,
  scenario: MembershipMockScenario = 'normal',
): Promise<MemberListResult> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error("Couldn't load members.")
  }

  const rawSource = scenario === 'empty' ? emptyMembers : normalMembers
  const customers = await fetchAllCustomers()
  const nameById = new Map(customers.map((c) => [c.id, c.name] as const))
  const enriched = rawSource.map((raw) => enrichMember(raw, nameById))

  const search = params.search.trim().toLowerCase()
  const filtered = search
    ? enriched.filter(
        (m) => m.customerName.toLowerCase().includes(search) || m.planName.toLowerCase().includes(search),
      )
    : enriched

  const sorted = [...filtered].sort((a, b) => a.customerName.localeCompare(b.customerName))
  const start = (params.page - 1) * params.pageSize
  const items = sorted.slice(start, start + params.pageSize)

  return { items, total: sorted.length }
}

export async function getMembershipPlans(
  scenario: MembershipMockScenario = 'normal',
): Promise<MembershipPlan[]> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load membership plans.')
  }

  return scenario === 'empty' ? emptyMembershipPlans : normalMembershipPlans
}

export async function listMembershipActivity(
  params: MembershipActivityListParams,
  scenario: MembershipMockScenario = 'normal',
): Promise<MembershipActivityListResult> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error("Couldn't load membership activity.")
  }

  const rawSource = scenario === 'empty' ? emptyMembershipActivity : normalMembershipActivity
  const customers = await fetchAllCustomers()
  const nameById = new Map(customers.map((c) => [c.id, c.name] as const))
  const enriched = rawSource.map((raw) => enrichActivity(raw, nameById))

  const search = params.search.trim().toLowerCase()
  const filtered = search ? enriched.filter((e) => e.customerName.toLowerCase().includes(search)) : enriched

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  const start = (params.page - 1) * params.pageSize
  const items = sorted.slice(start, start + params.pageSize)

  return { items, total: sorted.length }
}
