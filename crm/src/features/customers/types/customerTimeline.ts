/**
 * Customer Timeline types — Book 3 §5 "Customer Timeline [MVP]":
 * "A chronological, human-readable feed of everything that's happened
 * with one customer — every visit, every message sent, every point
 * earned/redeemed, every review left... filterable by event type...
 * append-only — no event is ever edited or removed, only superseded
 * by a correction event."
 *
 * `message` is kept in the taxonomy for Book 3 compliance, but no
 * real per-customer message/send log exists anywhere in this codebase
 * yet (campaigns.mock.ts sends are not customer-scoped) — see
 * services/customerTimelineService.ts. It will show zero events until
 * a real send-log data source exists; this is not invented here.
 *
 * `note` is not a Book 3-named category — it identifies timeline-
 * native events (not sourced from Orders/Loyalty/Feedback) used to
 * demonstrate the append-only/correction mechanism itself, since the
 * other three event types are read-only aggregations of data owned by
 * other features that have no correction mechanism of their own.
 */

export type CustomerTimelineEventType = 'visit' | 'message' | 'points' | 'review' | 'note'

export type CustomerTimelineEventFilter = CustomerTimelineEventType | 'all'

export type CustomerTimelineEvent = {
  id: string
  customerId: string
  type: CustomerTimelineEventType
  title: string
  detail: string
  occurredAt: string
  /** Route to the source record (order/feedback/etc.) when one exists. */
  href: string | null
  /**
   * When set, this event is a correction that supersedes the event
   * with this id. The original event is never mutated or removed —
   * both remain in the timeline; the UI marks the original
   * "Superseded" rather than hiding it.
   */
  correctsEventId: string | null
}
