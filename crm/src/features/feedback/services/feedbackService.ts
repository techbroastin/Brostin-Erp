import type { FeedbackItem, FeedbackListParams, FeedbackListResult } from '@/features/feedback/types/feedback'
import {
  normalFeedback,
  emptyFeedback,
  ERROR_SCENARIO_FLAG,
  type FeedbackMockScenario,
} from '@/features/feedback/mock/feedback.mock'
import { listCustomers } from '@/features/customers/services/customerService'

const SIMULATED_LATENCY_MS = 500

/**
 * Large enough to return every mock customer (customers.mock.ts
 * currently generates 25) in a single page, so feedback can read the
 * complete, real customer dataset without inventing a second bulk-fetch
 * API on the customers feature — same approach as the loyalty feature.
 */
const ALL_CUSTOMERS_PAGE_SIZE = 1000

function delay() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
}

/**
 * The single point where Feedback reads customer identity — always via
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
 * The swap point for real data later — nothing above this file (hooks,
 * components, screens) knows the data is mocked. `scenario` lets the
 * normal/empty/error states be exercised without changing any component;
 * production code always calls this with the default ('normal').
 */
export async function listFeedback(
  params: FeedbackListParams,
  scenario: FeedbackMockScenario = 'normal',
): Promise<FeedbackListResult> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load feedback.')
  }

  const rawSource = scenario === 'empty' ? emptyFeedback : normalFeedback
  const customers = await fetchAllCustomers()
  const nameById = new Map(customers.map((c) => [c.id, c.name] as const))

  let filtered = rawSource
  if (params.sentiment !== 'all') {
    filtered = filtered.filter((f) => f.sentiment === params.sentiment)
  }
  const search = params.search.trim().toLowerCase()
  if (search) {
    filtered = filtered.filter((f) => (nameById.get(f.customerId) ?? '').toLowerCase().includes(search))
  }

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const start = (params.page - 1) * params.pageSize
  const pageItems = sorted.slice(start, start + params.pageSize)

  const items: FeedbackItem[] = pageItems.map((f) => ({
    ...f,
    customerName: nameById.get(f.customerId) ?? 'Unknown customer',
  }))

  return { items, total: sorted.length }
}

export async function getFeedbackById(
  id: string,
  scenario: FeedbackMockScenario = 'normal',
): Promise<FeedbackItem | null> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load feedback.')
  }

  const rawSource = scenario === 'empty' ? emptyFeedback : normalFeedback
  const raw = rawSource.find((f) => f.id === id)
  if (!raw) return null

  const customers = await fetchAllCustomers()
  const customer = customers.find((c) => c.id === raw.customerId)

  return {
    ...raw,
    customerName: customer?.name ?? 'Unknown customer',
  }
}
