import type {
  FeedbackItem,
  FeedbackListParams,
  FeedbackListResult,
  FeedbackSentiment,
  FeedbackSummary,
  SubmitFeedbackRatingInput,
} from '@/features/feedback/types/feedback'
import {
  getFeedbackStore,
  addFeedbackToStore,
  findFeedbackByOrderIdInStore,
  emptyFeedback,
  ERROR_SCENARIO_FLAG,
  type FeedbackMockScenario,
  type RawFeedbackItem,
} from '@/features/feedback/mock/feedback.mock'
import { listCustomers, getCustomerById } from '@/features/customers/services/customerService'
import { getOrderById } from '@/features/orders/services/orderService'
import { classifyFeedbackRating } from '@/features/feedback/utils/reviewClassification'

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
 * "Needs attention" priority, per Book 3 §9: a private-alert item
 * (rating ≤3, or — for legacy pre-rating entries — the existing
 * `negative` sentiment tag) that is still `open`. This is what makes
 * the Feedback Inbox prioritized; there is no separate queue/alert
 * delivery — see services/feedbackService.ts's submitFeedbackRating
 * doc comment and the Phase B completion report for what is and isn't
 * actually connected to a real notification channel.
 */
function needsAttention(item: RawFeedbackItem): boolean {
  if (item.status !== 'open') return false
  if (item.rating !== null) return classifyFeedbackRating(item.rating) === 'private_alert'
  return item.sentiment === 'negative'
}

function getSourceDataset(scenario: FeedbackMockScenario): RawFeedbackItem[] {
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load feedback.')
  }
  return scenario === 'empty' ? emptyFeedback : getFeedbackStore()
}

/**
 * The swap point for real data later — nothing above this file (hooks,
 * components, screens) knows the data is mocked. `scenario` lets the
 * normal/empty/error states be exercised without changing any component;
 * production code always calls this with the default ('normal').
 *
 * Sorted with items needing attention first (open + private-alert),
 * then by recency within each group — this is the Feedback Inbox's
 * prioritization, per Book 3 §9's "Feedback Inbox: Managers can view
 * and prioritize feedback requiring attention."
 */
export async function listFeedback(
  params: FeedbackListParams,
  scenario: FeedbackMockScenario = 'normal',
): Promise<FeedbackListResult> {
  await delay()

  const rawSource = getSourceDataset(scenario)
  const customers = await fetchAllCustomers()
  const nameById = new Map(customers.map((c) => [c.id, c.name] as const))

  let filtered = rawSource
  if (params.sentiment !== 'all') {
    filtered = filtered.filter((f) => f.sentiment === params.sentiment)
  }
  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((f) => f.status === params.status)
  }
  if (params.rating && params.rating !== 'all') {
    const rating = params.rating === 'unrated' ? null : Number(params.rating)
    filtered = filtered.filter((f) => f.rating === rating)
  }
  const search = params.search.trim().toLowerCase()
  if (search) {
    filtered = filtered.filter((f) => (nameById.get(f.customerId) ?? '').toLowerCase().includes(search))
  }

  const sorted = [...filtered].sort((a, b) => {
    const aPriority = needsAttention(a) ? 1 : 0
    const bPriority = needsAttention(b) ? 1 : 0
    if (aPriority !== bPriority) return bPriority - aPriority
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const start = (params.page - 1) * params.pageSize
  const pageItems = sorted.slice(start, start + params.pageSize)

  const items: FeedbackItem[] = pageItems.map((f) => ({
    ...f,
    customerName: nameById.get(f.customerId) ?? 'Unknown customer',
  }))

  return { items, total: sorted.length }
}

/** Counts across all feedback for the Feedback overview's summary strip. */
export async function getFeedbackSummary(scenario: FeedbackMockScenario = 'normal'): Promise<FeedbackSummary> {
  await delay()

  const source = getSourceDataset(scenario)
  const ratings = source.flatMap((f) => (f.rating !== null ? [f.rating] : []))

  return {
    total: source.length,
    open: source.filter((f) => f.status === 'open').length,
    needsAttention: source.filter(needsAttention).length,
    negative: source.filter((f) => f.sentiment === 'negative').length,
    averageRating: ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : null,
    ratedCount: ratings.length,
  }
}

export async function getFeedbackById(
  id: string,
  scenario: FeedbackMockScenario = 'normal',
): Promise<FeedbackItem | null> {
  await delay()

  const rawSource = getSourceDataset(scenario)
  const raw = rawSource.find((f) => f.id === id)
  if (!raw) return null

  const customers = await fetchAllCustomers()
  const customer = customers.find((c) => c.id === raw.customerId)

  return {
    ...raw,
    customerName: customer?.name ?? 'Unknown customer',
  }
}

export function isFeedbackNeedsAttention(feedback: Pick<FeedbackItem, 'rating' | 'status' | 'sentiment'>): boolean {
  return needsAttention(feedback as RawFeedbackItem)
}

/**
 * Used by the public capture screen (features/feedback/screens/
 * PublicFeedbackCaptureScreen.tsx) to show an "already submitted"
 * state up front, rather than only discovering the duplicate when
 * submitFeedbackRating rejects it.
 */
export async function getFeedbackByOrderId(orderId: string): Promise<FeedbackItem | null> {
  await delay()

  const raw = findFeedbackByOrderIdInStore(orderId)
  if (!raw) return null

  const customers = await fetchAllCustomers()
  const customer = customers.find((c) => c.id === raw.customerId)

  return { ...raw, customerName: customer?.name ?? 'Unknown customer' }
}

/** Illustrative display-sentiment mapping only — independent of the Book 3 public/private routing rule. */
function sentimentForRating(rating: number): FeedbackSentiment {
  if (rating <= 2) return 'negative'
  if (rating === 3) return 'neutral'
  return 'positive'
}

/**
 * Book 3 §9 post-visit rating submission. Validates rating range,
 * that the customer and order exist and belong to each other, and
 * that this order hasn't already been rated (one rating per visit).
 * Classifies via classifyFeedbackRating and appends to the in-memory
 * store — never updates or removes an existing record.
 *
 * As of Phase C, this IS called by a real screen — the public
 * capture route at /review/:orderId (see
 * features/feedback/screens/PublicFeedbackCaptureScreen.tsx) — but
 * nothing beyond mock, session-only storage happens: no public review
 * link is opened unless an owner has configured one in Settings
 * (Settings.publicReviewUrl — null by default, never invented), and
 * no manager alert/notification is sent for the private_alert route
 * (no notification provider exists anywhere in this project).
 */
export async function submitFeedbackRating(input: SubmitFeedbackRatingInput): Promise<FeedbackItem> {
  await delay()

  const reviewRoute = classifyFeedbackRating(input.rating)

  const customer = await getCustomerById(input.customerId)
  if (!customer) {
    throw new Error(`Unknown customer: ${input.customerId}`)
  }

  const order = await getOrderById(input.orderId)
  if (!order) {
    throw new Error(`Unknown order: ${input.orderId}`)
  }
  if (order.customerId !== input.customerId) {
    throw new Error(`Order ${input.orderId} does not belong to customer ${input.customerId}.`)
  }

  if (findFeedbackByOrderIdInStore(input.orderId)) {
    throw new Error(`Order ${input.orderId} has already been rated.`)
  }

  const raw: RawFeedbackItem = {
    id: `fb-${Date.now()}`,
    customerId: input.customerId,
    orderId: input.orderId,
    rating: input.rating,
    sentiment: sentimentForRating(input.rating),
    message: input.message?.trim() || (reviewRoute === 'public_prompt' ? 'No written comment.' : 'No written comment — rating only.'),
    status: 'open',
    createdAt: new Date().toISOString(),
  }

  addFeedbackToStore(raw)

  return { ...raw, customerName: customer.name }
}
