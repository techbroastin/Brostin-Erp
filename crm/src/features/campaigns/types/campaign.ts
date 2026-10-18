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
 * `audienceCustomerIds` reuses customerService.listCustomers()'s own
 * Customer.id — no new customer mock data, no segment/tag data model
 * (none exists on Customer).
 */

export type CampaignStatus = 'draft' | 'scheduled' | 'sent'

export type Campaign = {
  id: string
  name: string
  status: CampaignStatus
  message: string
  audienceCustomerIds: string[]
  /** ISO timestamp — when a scheduled/sent campaign is set to go out. Never an actual dispatch. */
  scheduledAt: string | null
  createdAt: string
}

export type CampaignSortBy = 'createdAt' | 'name'

export type CampaignListParams = {
  search: string
  page: number
  pageSize: number
  sortBy: CampaignSortBy
}

export type CampaignListResult = {
  items: Campaign[]
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
  audienceCustomerIds: string[]
  scheduledAt: string | null
}
