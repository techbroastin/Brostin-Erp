/**
 * Campaigns feature types — provisional frontend view models, not the
 * Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16).
 *
 * No campaign status taxonomy, channel/provider, or performance metric
 * is named anywhere in docs/NAVIGATION.md §11 or
 * docs/IMPLEMENTATION_PLAN.md §18 — `CampaignStatus` below is a
 * reasonable provisional mapping (same treatment as OrderStatus's own
 * "PROVISIONAL status presentation" comment), not a finalized business
 * rule. No channel/provider field exists — docs/IMPLEMENTATION_PLAN.md
 * §18: "Actual external marketing integrations must be implemented
 * behind service boundaries. Do not hard-code a specific provider into
 * the UI layer" — since no provider is named, none is invented here.
 *
 * Audience: Book 3 §4 — every campaign targets a Segment (§10), never
 * "all customers". Until it is sent, the audience follows the segment's
 * current membership; on send, who it went to is frozen in
 * `sentToCustomerIds` so later segment changes don't rewrite history.
 */

export type CampaignStatus = 'draft' | 'scheduled' | 'sent'

export type Campaign = {
  id: string
  name: string
  status: CampaignStatus
  message: string
  segmentId: string
  /** Customer ids it was sent to, fixed at send time. Null until sent. */
  sentToCustomerIds: string[] | null
  /** ISO timestamp — when a scheduled/sent campaign is set to go out. Never an actual dispatch. */
  scheduledAt: string | null
  /**
   * Book 3 §4 recurring calendar campaign: when sent, next year's copy
   * is scheduled automatically for the same date and time.
   */
  repeatYearly: boolean
  /** When it was actually sent; null until then. */
  sentAt: string | null
  createdAt: string
}

/**
 * A campaign plus its resolved audience. `segmentName` is null if the
 * segment has since been deleted; such a campaign cannot be sent.
 */
export type CampaignSummary = Campaign & {
  segmentName: string | null
  audienceCount: number
  /**
   * Scheduled time has passed but it hasn't been sent. No automatic
   * scheduler is connected yet (backend phase), so it needs sending by hand.
   */
  isDue: boolean
}

export type CampaignPerformanceRow = {
  campaignId: string
  name: string
  sentAt: string
  segmentName: string | null
  sentTo: number
  reached: number
  delivered: number
  read: number
  heldBack: number
}

export type CampaignSortBy = 'createdAt' | 'name'

export type CampaignListParams = {
  search: string
  page: number
  pageSize: number
  sortBy: CampaignSortBy
}

export type CampaignListResult = {
  items: CampaignSummary[]
  total: number
}

export type CampaignOverview = {
  totalCampaigns: number
  draftCount: number
  scheduledCount: number
  sentCount: number
}

export type CreateCampaignInput = {
  name: string
  message: string
  segmentId: string
  scheduledAt: string | null
  repeatYearly: boolean
}
