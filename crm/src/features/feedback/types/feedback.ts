/**
 * Feedback feature types — provisional frontend view models, not the
 * Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16).
 *
 * Per docs/IMPLEMENTATION_PLAN.md §13 and docs/NAVIGATION.md §13, the
 * status taxonomy and any response/resolution workflow remain
 * UNDEFINED and are not invented here — there is still no resolve/
 * respond action anywhere in this feature (view-only). `rating` is
 * now the real Book 3 §9 Review Engine field (1-5, exact threshold
 * rule in utils/reviewClassification.ts); `FeedbackSentiment` is kept
 * for the pre-existing Phase 7 seed data and is independent of
 * `rating` — legacy entries have `rating: null` and keep only their
 * original illustrative sentiment tag.
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
  /** Book 3 §9 post-visit rating, 1-5. Null for feedback predating this field. */
  rating: number | null
  /** The order this rating followed, when known. Null for general/legacy feedback not tied to a visit. */
  orderId: string | null
  sentiment: FeedbackSentiment
  message: string
  status: FeedbackStatus
  createdAt: string
}

export type SubmitFeedbackRatingInput = {
  customerId: string
  orderId: string
  rating: number
  message?: string
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
