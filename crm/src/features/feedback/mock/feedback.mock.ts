/**
 * Feedback mock data — only
 * src/features/feedback/services/feedbackService.ts may import this
 * file. Customer identity is NOT duplicated here — per the approved
 * Phase 7 scope, feedbackService sources customer names from the
 * existing customers feature
 * (src/features/customers/services/customerService.ts), the same
 * discipline already used by the loyalty feature.
 *
 * Customers already flagged `alert: 'Feedback awaiting response'` in
 * customers.mock.ts (`index % 7 === 0`: cust-001, cust-008, cust-015,
 * cust-022) each have at least one 'open' record below, so that
 * existing signal stays consistent with this feature's own data
 * (docs/FRONTEND_ARCHITECTURE.md §16: "a customer's orders, loyalty and
 * feedback must agree").
 *
 * Illustrative placeholders only — not real customer feedback, not a
 * finalized rating scale or status/resolution workflow. See
 * DemoDataBadge wherever this data renders.
 */

import type { FeedbackSentiment, FeedbackStatus } from '@/features/feedback/types/feedback'

export type RawFeedbackItem = {
  id: string
  customerId: string
  /** Book 3 §9 rating, 1-5. Null for the pre-existing Phase 7 seed entries below, which predate this field. */
  rating: number | null
  orderId: string | null
  sentiment: FeedbackSentiment
  message: string
  status: FeedbackStatus
  createdAt: string
}

const HOUR_MS = 60 * 60 * 1000

const RAW_DEFS: Array<Omit<RawFeedbackItem, 'id' | 'createdAt' | 'rating' | 'orderId'> & { hoursAgo: number }> = [
  { customerId: 'cust-001', sentiment: 'negative', message: 'Order arrived cold and the wrap was soggy.', status: 'open', hoursAgo: 4 },
  { customerId: 'cust-001', sentiment: 'positive', message: 'Quick delivery, thanks!', status: 'resolved', hoursAgo: 96 },
  { customerId: 'cust-002', sentiment: 'positive', message: 'Loved the broasted chicken, will order again.', status: 'resolved', hoursAgo: 30 },
  { customerId: 'cust-003', sentiment: 'neutral', message: 'Food was fine but packaging could be better.', status: 'resolved', hoursAgo: 50 },
  { customerId: 'cust-004', sentiment: 'positive', message: 'Great service at the counter.', status: 'resolved', hoursAgo: 60 },
  { customerId: 'cust-007', sentiment: 'negative', message: 'Missing one item from my order.', status: 'resolved', hoursAgo: 80 },
  { customerId: 'cust-008', sentiment: 'negative', message: 'Waited over 40 minutes for delivery.', status: 'open', hoursAgo: 10 },
  { customerId: 'cust-008', sentiment: 'positive', message: 'Staff were polite when I called to check.', status: 'resolved', hoursAgo: 120 },
  { customerId: 'cust-010', sentiment: 'neutral', message: 'Average experience, nothing special.', status: 'open', hoursAgo: 20 },
  { customerId: 'cust-013', sentiment: 'positive', message: 'Best fried chicken in town!', status: 'resolved', hoursAgo: 40 },
  { customerId: 'cust-015', sentiment: 'negative', message: 'Wrong order delivered twice in a row.', status: 'open', hoursAgo: 6 },
  { customerId: 'cust-016', sentiment: 'positive', message: 'Consistently good quality.', status: 'resolved', hoursAgo: 70 },
  { customerId: 'cust-019', sentiment: 'neutral', message: 'Food was okay, delivery was late.', status: 'open', hoursAgo: 14 },
  { customerId: 'cust-022', sentiment: 'negative', message: 'App crashed while placing order.', status: 'open', hoursAgo: 2 },
]

function seedFeedback(): RawFeedbackItem[] {
  return RAW_DEFS.map((def, index) => ({
    id: `fb-${String(index + 1).padStart(3, '0')}`,
    customerId: def.customerId,
    rating: null,
    orderId: null,
    sentiment: def.sentiment,
    message: def.message,
    status: def.status,
    createdAt: new Date(Date.now() - def.hoursAgo * HOUR_MS).toISOString(),
  }))
}

/**
 * Mutable in-session store — session-only, lost on reload, same
 * discipline as settings.mock.ts/automation.mock.ts. Append-only in
 * practice: addFeedbackToStore only ever appends; nothing in this
 * file updates or removes an existing entry.
 */
let feedbackStore: RawFeedbackItem[] = seedFeedback()

export function getFeedbackStore(): RawFeedbackItem[] {
  return feedbackStore
}

export function addFeedbackToStore(item: RawFeedbackItem): void {
  feedbackStore = [...feedbackStore, item]
}

export function findFeedbackByOrderIdInStore(orderId: string): RawFeedbackItem | null {
  return feedbackStore.find((f) => f.orderId === orderId) ?? null
}

export const emptyFeedback: RawFeedbackItem[] = []

/**
 * Not a data scenario — a sentinel feedbackService checks for to throw a
 * simulated failure, exercising FeedbackErrorState.
 */
export const ERROR_SCENARIO_FLAG = 'error'

export type FeedbackMockScenario = 'normal' | 'empty' | typeof ERROR_SCENARIO_FLAG
