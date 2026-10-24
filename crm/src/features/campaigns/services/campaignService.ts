import type {
  Campaign,
  CampaignListParams,
  CampaignListResult,
  CampaignOverview,
  CampaignStatus,
  CreateCampaignInput,
} from '@/features/campaigns/types/campaign'
import {
  getCampaignStore,
  addCampaignToStore,
  updateCampaignStatusInStore,
  emptyCampaigns,
  ERROR_SCENARIO_FLAG,
  type CampaignMockScenario,
} from '@/features/campaigns/mock/campaigns.mock'
import { dispatchMessages } from '@/features/notifications/services/notificationService'
import type { DispatchSummary } from '@/features/notifications/types/message'

const SIMULATED_LATENCY_MS = 500

function delay() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
}

function getSourceDataset(scenario: CampaignMockScenario): Campaign[] {
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load campaigns.')
  }
  return scenario === 'empty' ? emptyCampaigns : getCampaignStore()
}

export async function listCampaigns(
  params: CampaignListParams,
  scenario: CampaignMockScenario = 'normal',
): Promise<CampaignListResult> {
  await delay()

  const source = getSourceDataset(scenario)

  const search = params.search.trim().toLowerCase()
  const filtered = search ? source.filter((c) => c.name.toLowerCase().includes(search)) : source

  const sorted = [...filtered].sort((a, b) => {
    if (params.sortBy === 'name') return a.name.localeCompare(b.name)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const start = (params.page - 1) * params.pageSize
  const items = sorted.slice(start, start + params.pageSize)

  return { items, total: sorted.length }
}

export async function getCampaignById(
  id: string,
  scenario: CampaignMockScenario = 'normal',
): Promise<Campaign | null> {
  await delay()

  const source = getSourceDataset(scenario)
  return source.find((c) => c.id === id) ?? null
}

/**
 * Counts by status only — no engagement/performance metric exists in
 * the mock data (see types/campaign.ts header). Not a substitute for
 * real campaign performance.
 */
export async function getCampaignOverview(
  scenario: CampaignMockScenario = 'normal',
): Promise<CampaignOverview> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load campaign overview.')
  }

  const source = scenario === 'empty' ? emptyCampaigns : getCampaignStore()

  return {
    totalCampaigns: source.length,
    draftCount: source.filter((c) => c.status === 'draft').length,
    scheduledCount: source.filter((c) => c.status === 'scheduled').length,
    sentCount: source.filter((c) => c.status === 'sent').length,
  }
}

/**
 * Creates a campaign in the in-memory mock store only — see
 * mock/campaigns.mock.ts header. This is NOT persisted to any backend
 * and is lost on reload. Status starts 'draft' unless a schedule date
 * is provided, in which case it starts 'scheduled' — this is a UI-only
 * state transition, never an actual dispatch.
 */
export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  await delay()

  const campaign: Campaign = {
    id: `camp-${Date.now()}`,
    name: input.name,
    message: input.message,
    audienceCustomerIds: input.audienceCustomerIds,
    scheduledAt: input.scheduledAt,
    status: input.scheduledAt ? 'scheduled' : 'draft',
    createdAt: new Date().toISOString(),
  }

  addCampaignToStore(campaign)
  return campaign
}

/**
 * Transitions a campaign's status in the in-memory mock store only.
 * This never performs an actual send/dispatch — 'sent' here means
 * "marked as sent in the mock data," not a real delivery event.
 */
export async function updateCampaignStatus(
  id: string,
  status: CampaignStatus,
): Promise<Campaign | null> {
  await delay()
  return updateCampaignStatusInStore(id, status)
}

/**
 * Marks a campaign as sent and hands each audience member's message to
 * the Notification Engine (Book 3 §13), which applies the weekly limit,
 * opt-outs and channel fallback. Delivery is simulated — no provider is
 * connected — and every result appears in the Message Log.
 */
export async function sendCampaign(
  id: string,
): Promise<{ campaign: Campaign | null; delivery: DispatchSummary | null }> {
  const campaign = await updateCampaignStatus(id, 'sent')
  if (!campaign) return { campaign: null, delivery: null }
  const delivery = await dispatchMessages(
    campaign.audienceCustomerIds.map((customerId) => ({
      customerId,
      source: { type: 'campaign', id: campaign.id, name: campaign.name },
      body: campaign.message,
    })),
  )
  return { campaign, delivery }
}
