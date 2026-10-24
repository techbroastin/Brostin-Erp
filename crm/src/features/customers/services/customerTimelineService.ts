import type { CustomerTimelineEvent } from '@/features/customers/types/customerTimeline'
import {
  getNativeEventsForCustomerFromStore,
  addNativeTimelineEventToStore,
  ERROR_SCENARIO_FLAG,
  type CustomerTimelineMockScenario,
} from '@/features/customers/mock/customerTimeline.mock'
import { listOrders } from '@/features/orders/services/orderService'
import { listLoyaltyActivity } from '@/features/loyalty/services/loyaltyService'
import { listFeedback } from '@/features/feedback/services/feedbackService'

const SIMULATED_LATENCY_MS = 500

function delay() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
}

/** Large enough to read every mock record in one page — same approach as loyaltyService/feedbackService. */
const BULK_PAGE_SIZE = 1000

/**
 * Aggregates a single customer's events from Orders ('visit'), Loyalty
 * ('points') and Feedback ('review') — always via each feature's own
 * service, never its mock file directly, per
 * docs/FRONTEND_ARCHITECTURE.md §16's "a customer's orders, loyalty
 * and feedback must agree" — plus this feature's own native,
 * genuinely append-only events (see mock/customerTimeline.mock.ts).
 *
 * This is the swap point for real data later; nothing above this file
 * (hooks, components, screens) knows the data is mocked. `scenario`
 * exercises normal/empty/error without changing any component;
 * production code always calls this with the default ('normal').
 *
 * No 'message' events are ever produced here — see
 * types/customerTimeline.ts for why.
 */
export async function getCustomerTimeline(
  customerId: string,
  scenario: CustomerTimelineMockScenario = 'normal',
): Promise<CustomerTimelineEvent[]> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load customer timeline.')
  }
  if (scenario === 'empty') {
    return []
  }

  const [orders, loyalty, feedback] = await Promise.all([
    listOrders({ search: '', status: 'all', source: 'all', page: 1, pageSize: BULK_PAGE_SIZE, sortBy: 'createdAt' }),
    listLoyaltyActivity({ search: '', page: 1, pageSize: BULK_PAGE_SIZE }),
    listFeedback({ search: '', sentiment: 'all', page: 1, pageSize: BULK_PAGE_SIZE }),
  ])

  const visitEvents: CustomerTimelineEvent[] = orders.items
    .filter((o) => o.customerId === customerId)
    .map((o) => ({
      id: `tl-order-${o.id}`,
      customerId,
      type: 'visit',
      title: `Order ${o.orderNumber}`,
      detail: `${o.orderType} · ₹${o.grandTotal} · ${o.status}`,
      occurredAt: o.createdAt,
      href: `/orders/${o.id}`,
      correctsEventId: null,
    }))

  const pointsEvents: CustomerTimelineEvent[] = loyalty.items
    .filter((e) => e.customerId === customerId)
    .map((e) => ({
      id: `tl-loyalty-${e.id}`,
      customerId,
      type: 'points',
      title: e.type === 'earned' ? `Earned ${e.points} points` : `Redeemed ${Math.abs(e.points)} points`,
      detail: e.description,
      occurredAt: e.createdAt,
      href: '/loyalty/customers',
      correctsEventId: null,
    }))

  const reviewEvents: CustomerTimelineEvent[] = feedback.items
    .filter((f) => f.customerId === customerId)
    .map((f) => ({
      id: `tl-feedback-${f.id}`,
      customerId,
      type: 'review',
      title: f.rating !== null ? `Left a ${f.rating}-star review` : `Left ${f.sentiment} feedback`,
      detail: f.message,
      occurredAt: f.createdAt,
      href: `/feedback/${f.id}`,
      correctsEventId: null,
    }))

  const nativeEvents = getNativeEventsForCustomerFromStore(customerId)

  return [...visitEvents, ...pointsEvents, ...reviewEvents, ...nativeEvents].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  )
}

/**
 * Appends a native timeline event (optionally a correction of a prior
 * one via `correctsEventId`). Not yet wired to any UI button in this
 * phase — the approved scope is view/filter/export only — this exists
 * so the append-only/correction mechanism can be verified at the
 * service layer per the testing requirement, and so it's ready for a
 * future phase's "add note" UI without a service-layer change.
 */
export async function addCustomerTimelineNote(input: {
  customerId: string
  title: string
  detail: string
  correctsEventId?: string | null
}): Promise<CustomerTimelineEvent> {
  await delay()

  const event: CustomerTimelineEvent = {
    id: `tl-native-${Date.now()}`,
    customerId: input.customerId,
    type: 'note',
    title: input.title,
    detail: input.detail,
    occurredAt: new Date().toISOString(),
    href: null,
    correctsEventId: input.correctsEventId ?? null,
  }

  addNativeTimelineEventToStore(event)
  return event
}
