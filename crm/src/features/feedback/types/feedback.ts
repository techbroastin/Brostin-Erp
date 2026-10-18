/**
 * Feedback feature types — provisional frontend view models, not the
 * Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16).
 *
 * Per docs/IMPLEMENTATION_PLAN.md §13 and docs/NAVIGATION.md §13, no
 * feedback business rules are finalized: the rating/sentiment scale,
 * status taxonomy, "negative feedback" classification logic, and any
 * response/resolution workflow are all UNDEFINED and are not invented
 * here. `FeedbackSentiment` and `FeedbackStatus` are intentionally
 * limited to the minimal illustrative values approved for Phase 7 — not
 * a finalized rating scale or status-transition model. There is no
 * resolve/respond action anywhere in this feature (view-only).
 *
 * `FeedbackItem.customerName` is sourced from the customers feature
 * (never duplicated), and the mock dataset keeps the customers already
 * flagged `Customer.alert === 'Feedback awaiting response'` consistent
 * with having at least one 'open' feedback record.
 */

export type FeedbackSentiment = 'positive' | 'neutral' | 'negative'

export type FeedbackStatus = 'open' | 'resolved'

export type FeedbackItem = {
  id: string
  customerId: string
  customerName: string
  sentiment: FeedbackSentiment
  message: string
  status: FeedbackStatus
  createdAt: string
}

export type FeedbackSentimentFilter = FeedbackSentiment | 'all'

export type FeedbackListParams = {
  search: string
  sentiment: FeedbackSentimentFilter
  page: number
  pageSize: number
}

export type FeedbackListResult = {
  items: FeedbackItem[]
  total: number
}
