import type { CustomerTimelineEvent } from '@/features/customers/types/customerTimeline'

/**
 * Customer Timeline mock data — the single feature-local mock source,
 * per docs/FRONTEND_ARCHITECTURE.md §6/§16. Only
 * src/features/customers/services/customerTimelineService.ts may
 * import this file.
 *
 * Holds only this feature's own NATIVE events — Orders/Loyalty/
 * Feedback events are read live from their own services in
 * customerTimelineService.ts, never duplicated here.
 *
 * Genuinely append-only: there is no update/delete export from this
 * file, only addNativeTimelineEvent(). A correction is just another
 * appended event whose correctsEventId points at the event it
 * supersedes — the original array entry is never mutated or spliced
 * out, satisfying Book 3 §5's append-only business rule at the data
 * layer, not merely by convention.
 *
 * Illustrative placeholder only — not a real event. See DemoDataBadge
 * wherever this data renders.
 */

const DAY = 24 * 60 * 60 * 1000

function seedNativeEvents(): CustomerTimelineEvent[] {
  const now = Date.now()
  return [
    {
      id: 'tl-native-001',
      customerId: 'cust-001',
      type: 'note',
      title: 'Loyalty points balance recorded',
      detail: 'Initial balance recorded as 80 points.',
      occurredAt: new Date(now - 5 * DAY).toISOString(),
      href: null,
      correctsEventId: null,
    },
    {
      id: 'tl-native-002',
      customerId: 'cust-001',
      type: 'note',
      title: 'Loyalty points balance corrected',
      detail: 'Correction: balance was actually 120 points — the original entry missed a redemption reversal.',
      occurredAt: new Date(now - 4 * DAY).toISOString(),
      href: null,
      correctsEventId: 'tl-native-001',
    },
  ]
}

/** Mutable in-session store — see file header. Append-only by construction. */
let nativeEventStore: CustomerTimelineEvent[] = seedNativeEvents()

export function getNativeEventsForCustomerFromStore(customerId: string): CustomerTimelineEvent[] {
  return nativeEventStore.filter((e) => e.customerId === customerId)
}

/** Append-only: adds a new event. There is no corresponding update/remove function. */
export function getAllNativeEventsFromStore(): CustomerTimelineEvent[] {
  return nativeEventStore
}

export function addNativeTimelineEventToStore(event: CustomerTimelineEvent): void {
  nativeEventStore = [...nativeEventStore, event]
}

export const emptyNativeEvents: CustomerTimelineEvent[] = []

/**
 * Not a data scenario — a sentinel customerTimelineService checks for
 * to throw a simulated failure.
 */
export const ERROR_SCENARIO_FLAG = 'error'

export type CustomerTimelineMockScenario = 'normal' | 'empty' | typeof ERROR_SCENARIO_FLAG
