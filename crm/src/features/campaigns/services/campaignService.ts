import type { Customer } from '@/features/customers/types/customer'
import type {
  Campaign,
  CampaignListParams,
  CampaignListResult,
  CampaignOverview,
  CampaignStatus,
  CampaignSummary,
  CreateCampaignInput,
} from '@/features/campaigns/types/campaign'
import {
  getCampaignStore,
  addCampaignToStore,
  replaceCampaignInStore,
  updateCampaignStatusInStore,
  emptyCampaigns,
  ERROR_SCENARIO_FLAG,
  type CampaignMockScenario,
} from '@/features/campaigns/mock/campaigns.mock'
import { listCustomers } from '@/features/customers/services/customerService'
import { getSegmentDetail, listSegments } from '@/features/segments/services/segmentService'
import { dispatchMessages } from '@/features/notifications/services/notificationService'
import type { DispatchSummary } from '@/features/notifications/types/message'
import { recordAudit } from '@/features/audit/services/auditService'

const ALL_CUSTOMERS_PAGE_SIZE = 1000

function getSourceDataset(scenario: CampaignMockScenario): Campaign[] {
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load campaigns.')
  }
  return scenario === 'empty' ? emptyCampaigns : getCampaignStore()
}

/**
 * Resolves each campaign's segment name and audience size. The Segments
 * service also supplies the simulated latency. A sent campaign reports
 * who it actually went to, not the segment's current membership.
 */
async function withAudience(campaigns: Campaign[]): Promise<CampaignSummary[]> {
  const segments = new Map((await listSegments()).map((s) => [s.id, s]))
  return campaigns.map((campaign) => {
    const segment = segments.get(campaign.segmentId)
    return {
      ...campaign,
      segmentName: segment?.name ?? null,
      audienceCount: campaign.sentToCustomerIds?.length ?? segment?.memberCount ?? 0,
    }
  })
}

export async function listCampaigns(
  params: CampaignListParams,
  scenario: CampaignMockScenario = 'normal',
): Promise<CampaignListResult> {
  const source = await withAudience(getSourceDataset(scenario))

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
): Promise<CampaignSummary | null> {
  const campaign = getSourceDataset(scenario).find((c) => c.id === id)
  if (!campaign) {
    await listSegments()
    return null
  }
  const [summary] = await withAudience([campaign])
  return summary
}

/**
 * The customers a campaign targets: who it was sent to once sent,
 * otherwise the segment's current members (empty if the segment is gone).
 */
export async function getCampaignAudience(id: string): Promise<Customer[]> {
  const campaign = getCampaignStore().find((c) => c.id === id)
  if (!campaign) return []
  if (campaign.sentToCustomerIds) {
    const { items } = await listCustomers({ search: '', page: 1, pageSize: ALL_CUSTOMERS_PAGE_SIZE, sortBy: 'name' })
    const sentTo = new Set(campaign.sentToCustomerIds)
    return items.filter((c) => sentTo.has(c.id))
  }
  return (await getSegmentDetail(campaign.segmentId))?.members ?? []
}

/**
 * Counts by status only — no engagement/performance metric exists in
 * the mock data (see types/campaign.ts header). Not a substitute for
 * real campaign performance.
 */
export async function getCampaignOverview(
  scenario: CampaignMockScenario = 'normal',
): Promise<CampaignOverview> {
  await listSegments()

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
 * state transition, never an actual dispatch. The segment must exist
 * (Book 3 §4: always a defined segment).
 */
export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  const segments = await listSegments()
  if (!segments.some((s) => s.id === input.segmentId)) {
    throw new Error('Pick a segment for this campaign.')
  }

  const campaign: Campaign = {
    id: `camp-${Date.now()}`,
    name: input.name,
    message: input.message,
    segmentId: input.segmentId,
    sentToCustomerIds: null,
    scheduledAt: input.scheduledAt,
    status: input.scheduledAt ? 'scheduled' : 'draft',
    createdAt: new Date().toISOString(),
  }

  addCampaignToStore(campaign)
  recordAudit({
    category: 'marketing',
    action: 'Created campaign',
    target: { type: 'campaign', id: campaign.id, label: campaign.name, href: `/campaigns/${campaign.id}` },
    changes: [{ field: 'Segment', from: '—', to: segments.find((s) => s.id === input.segmentId)?.name ?? input.segmentId }],
  })
  return campaign
}

/**
 * Transitions a campaign's status in the in-memory mock store only.
 * Sending goes through sendCampaign(), which also routes the messages.
 */
export async function updateCampaignStatus(
  id: string,
  status: CampaignStatus,
): Promise<Campaign | null> {
  await listSegments()
  return updateCampaignStatusInStore(id, status)
}

/**
 * Sends a campaign to its segment's current members: freezes that list
 * on the campaign, marks it sent, and hands each message to the
 * Notification Engine (Book 3 §13), which applies the weekly limit,
 * opt-outs and channel fallback. Delivery is simulated — no provider is
 * connected — and every result appears in the Message Log.
 */
export async function sendCampaign(id: string): Promise<{ campaign: Campaign; delivery: DispatchSummary }> {
  const campaign = getCampaignStore().find((c) => c.id === id)
  if (!campaign) throw new Error('Campaign not found.')
  if (campaign.status === 'sent') throw new Error('This campaign has already been sent.')

  const segment = await getSegmentDetail(campaign.segmentId)
  if (!segment) throw new Error('This campaign’s segment no longer exists. Pick another segment first.')
  if (segment.members.length === 0) throw new Error('This campaign’s segment has no customers right now.')

  const sent: Campaign = {
    ...campaign,
    status: 'sent',
    sentToCustomerIds: segment.members.map((c) => c.id),
  }
  replaceCampaignInStore(sent)

  const delivery = await dispatchMessages(
    segment.members.map((customer) => ({
      customerId: customer.id,
      source: { type: 'campaign', id: sent.id, name: sent.name },
      body: sent.message,
    })),
  )
  recordAudit({
    category: 'marketing',
    action: 'Sent campaign',
    target: { type: 'campaign', id: sent.id, label: sent.name, href: `/campaigns/${sent.id}` },
    changes: [
      { field: 'Segment', from: '—', to: segment.segment.name },
      { field: 'Recipients', from: '—', to: String(delivery.total) },
    ],
  })
  return { campaign: sent, delivery }
}
