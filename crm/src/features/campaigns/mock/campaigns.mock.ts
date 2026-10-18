import type { Campaign, CampaignStatus } from '@/features/campaigns/types/campaign'

/**
 * Campaigns mock data — the single feature-local mock source, per
 * docs/FRONTEND_ARCHITECTURE.md §6/§16. Only
 * src/features/campaigns/services/campaignService.ts may import this
 * file.
 *
 * Unlike every other feature's mock data (a frozen array built once),
 * this store is intentionally MUTABLE in memory: Create Campaign and
 * status transitions are the first write/mutation flow in this
 * codebase (no backend exists yet). New/updated campaigns are visible
 * only for the current browser session and are lost on reload — this
 * is not a real persistence layer and must never be represented as one.
 *
 * Illustrative placeholders only — not real campaign records, not
 * final business rules. See DemoDataBadge wherever this data renders.
 */

function seedCampaigns(): Campaign[] {
  const now = Date.now()
  return [
    {
      id: 'camp-001',
      name: 'Weekend Broasted Combo Offer',
      status: 'sent',
      message: 'This weekend only: get our Broasted Combo at a special price. Order now!',
      audienceCustomerIds: ['cust-001', 'cust-002', 'cust-003', 'cust-004', 'cust-005'],
      scheduledAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'camp-002',
      name: 'Loyalty Points Reminder',
      status: 'scheduled',
      message: 'You have loyalty points waiting to be redeemed — check your balance and treat yourself!',
      audienceCustomerIds: ['cust-007', 'cust-010', 'cust-019', 'cust-022'],
      scheduledAt: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'camp-003',
      name: 'New Menu Announcement',
      status: 'draft',
      message: "We've added new items to the menu — come try them!",
      audienceCustomerIds: [],
      scheduledAt: null,
      createdAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

/** Mutable in-session store — see file header. */
let campaignStore: Campaign[] = seedCampaigns()

export function getCampaignStore(): Campaign[] {
  return campaignStore
}

export function addCampaignToStore(campaign: Campaign): void {
  campaignStore = [campaign, ...campaignStore]
}

export function updateCampaignStatusInStore(id: string, status: CampaignStatus): Campaign | null {
  let updated: Campaign | null = null
  campaignStore = campaignStore.map((c) => {
    if (c.id !== id) return c
    updated = { ...c, status }
    return updated
  })
  return updated
}

export const emptyCampaigns: Campaign[] = []

/**
 * Not a data scenario — a sentinel campaignService checks for to throw a
 * simulated failure, exercising CampaignErrorState.
 */
export const ERROR_SCENARIO_FLAG = 'error'

export type CampaignMockScenario = 'normal' | 'empty' | typeof ERROR_SCENARIO_FLAG
