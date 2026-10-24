import type { Segment } from '@/features/segments/types/segment'

/**
 * Segments mock data — the single feature-local mock source, per
 * docs/FRONTEND_ARCHITECTURE.md §6/§16. Only
 * src/features/segments/services/segmentService.ts may import this file.
 *
 * Like the Campaigns store, this is MUTABLE in memory: custom segments
 * created/edited/deleted in the builder live only for the current
 * browser session and are lost on reload. Not a persistence layer.
 *
 * The five pre-built definitions are illustrative (docs/NAVIGATION.md
 * §8.3: not final database segments). Lapsed uses Book 3 §10's "no
 * visit in 21-30 days" example; the other thresholds match the
 * placeholder segment tags in customers.mock.ts so both views agree.
 */

export type SegmentMockScenario = 'normal' | 'empty' | 'error'
export const ERROR_SCENARIO_FLAG: SegmentMockScenario = 'error'

/** Most recent 02:00 local time — stands in for the nightly recalculation run. */
function lastNightlyRun(): string {
  const run = new Date()
  run.setHours(2, 0, 0, 0)
  if (run.getTime() > Date.now()) run.setDate(run.getDate() - 1)
  return run.toISOString()
}

function seedSegments(): Segment[] {
  const calculatedAt = lastNightlyRun()
  const seededAt = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const prebuilt = (
    id: string,
    name: string,
    description: string,
    rules: Segment['rules'],
  ): Segment => ({
    id,
    name,
    description,
    kind: 'prebuilt',
    match: 'all',
    rules,
    createdAt: seededAt,
    updatedAt: seededAt,
    lastCalculatedAt: calculatedAt,
  })

  return [
    prebuilt('seg-new', 'New', 'Customers who have ordered exactly once.', [
      { field: 'order_count', operator: 'eq', value: '1' },
    ]),
    prebuilt('seg-repeat', 'Repeat', 'Customers with 2 to 5 orders.', [
      { field: 'order_count', operator: 'gte', value: '2' },
      { field: 'order_count', operator: 'lte', value: '5' },
    ]),
    prebuilt('seg-vip', 'Loyal / VIP', 'Customers with 6 or more orders.', [
      { field: 'order_count', operator: 'gte', value: '6' },
    ]),
    prebuilt('seg-lapsed', 'Lapsed', 'No order in the last 21 to 30 days.', [
      { field: 'days_since_last_order', operator: 'gte', value: '21' },
      { field: 'days_since_last_order', operator: 'lte', value: '30' },
    ]),
    prebuilt('seg-at-risk', 'At risk', 'Last order 14 to 20 days ago — at risk of lapsing.', [
      { field: 'days_since_last_order', operator: 'gte', value: '14' },
      { field: 'days_since_last_order', operator: 'lte', value: '20' },
    ]),
    {
      id: 'seg-custom-001',
      name: 'High spenders on WhatsApp',
      description: 'Spent more than ₹3,000 and can be reached on WhatsApp.',
      kind: 'custom',
      match: 'all',
      rules: [
        { field: 'lifetime_spend', operator: 'gt', value: '3000' },
        { field: 'whatsapp_opt_in', operator: 'is', value: 'true' },
      ],
      createdAt: seededAt,
      updatedAt: seededAt,
      lastCalculatedAt: calculatedAt,
    },
  ]
}

/** Mutable in-session store — see file header. */
let segmentStore: Segment[] = seedSegments()

export const emptySegments: Segment[] = []

export function getSegmentStore(): Segment[] {
  return segmentStore
}

export function addSegmentToStore(segment: Segment): void {
  segmentStore = [...segmentStore, segment]
}

export function replaceSegmentInStore(segment: Segment): void {
  segmentStore = segmentStore.map((s) => (s.id === segment.id ? segment : s))
}

export function removeSegmentFromStore(id: string): void {
  segmentStore = segmentStore.filter((s) => s.id !== id)
}
