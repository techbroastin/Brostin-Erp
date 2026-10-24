import type { Customer } from '@/features/customers/types/customer'
import type {
  Campaign,
  CampaignListParams,
  CampaignListResult,
  CampaignOverview,
  CampaignPerformanceRow,
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
import { dispatchMessages, getDeliveryBySource } from '@/features/notifications/services/notificationService'
import type { DeliveryFunnel, DispatchSummary } from '@/features/notifications/types/message'
import { recordAudit } from '@/features/audit/services/auditService'
import { getGeneralSettings, getMessagingRules } from '@/features/settings/services/settingsService'
import { MESSAGE_CHANNEL_LABELS, type MessageChannel } from '@/features/settings/types/settings'
import { firstName, personalize } from '@/features/campaigns/utils/personalize'
import { requirePermission } from '@/features/auth/services/authService'

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
  const now = Date.now()
  return campaigns.map((campaign) => {
    const segment = segments.get(campaign.segmentId)
    return {
      ...campaign,
      segmentName: segment?.name ?? null,
      audienceCount: campaign.sentToCustomerIds?.length ?? segment?.memberCount ?? 0,
      isDue:
        campaign.status === 'scheduled' &&
        campaign.scheduledAt !== null &&
        new Date(campaign.scheduledAt).getTime() <= now,
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
  requirePermission('campaigns')
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
    repeatYearly: input.scheduledAt ? input.repeatYearly : false,
    sentAt: null,
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
  requirePermission('campaigns')
  await listSegments()
  return updateCampaignStatusInStore(id, status)
}

/**
 * Book 3 §4 recurring calendar campaigns: once a yearly campaign is
 * sent, an unsent copy is scheduled for the same date and time next
 * year, so each year keeps its own recipients and results.
 */
function scheduleNextYear(sent: Campaign): Campaign | null {
  if (!sent.repeatYearly || !sent.scheduledAt) return null
  const next = new Date(sent.scheduledAt)
  next.setFullYear(next.getFullYear() + 1)
  const copy: Campaign = {
    ...sent,
    id: `camp-${Date.now()}-next`,
    status: 'scheduled',
    sentToCustomerIds: null,
    sentAt: null,
    scheduledAt: next.toISOString(),
    createdAt: new Date().toISOString(),
  }
  addCampaignToStore(copy)
  return copy
}

/**
 * Sends a campaign to its segment's current members: freezes that list
 * on the campaign, marks it sent, and hands each message to the
 * Notification Engine (Book 3 §13), which applies the weekly limit,
 * opt-outs and channel fallback. Delivery is simulated — no provider is
 * connected — and every result appears in the Message Log.
 */
export async function sendCampaign(
  id: string,
): Promise<{ campaign: Campaign; delivery: DispatchSummary; nextYear: Campaign | null }> {
  requirePermission('campaigns')
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
    sentAt: new Date().toISOString(),
  }
  replaceCampaignInStore(sent)
  const nextYear = scheduleNextYear(sent)

  const { businessName } = await getGeneralSettings()
  const delivery = await dispatchMessages(
    segment.members.map((customer) => ({
      customerId: customer.id,
      source: { type: 'campaign', id: sent.id, name: sent.name },
      body: personalize(sent.message, { first_name: firstName(customer.name), business_name: businessName }),
    })),
  )
  recordAudit({
    category: 'marketing',
    action: 'Sent campaign',
    target: { type: 'campaign', id: sent.id, label: sent.name, href: `/campaigns/${sent.id}` },
    changes: [
      { field: 'Segment', from: '—', to: segment.segment.name },
      { field: 'Recipients', from: '—', to: String(delivery.total) },
      ...(nextYear ? [{ field: 'Next year', from: '—', to: nextYear.scheduledAt ?? '' }] : []),
    ],
  })
  return { campaign: sent, delivery, nextYear }
}

export type CampaignPreview = {
  text: string
  /** Whose details filled the tokens, or null when the audience is empty. */
  sampleCustomerName: string | null
}

/** The message as one audience member would see it ("Send preview", Book 3 §4). */
export async function getCampaignPreview(id: string): Promise<CampaignPreview> {
  const campaign = getCampaignStore().find((c) => c.id === id)
  if (!campaign) throw new Error('Campaign not found.')
  const [audience, { businessName }] = await Promise.all([getCampaignAudience(id), getGeneralSettings()])
  const sample = audience[0] ?? null
  return {
    text: personalize(campaign.message, {
      first_name: sample ? firstName(sample.name) : 'Customer',
      business_name: businessName,
    }),
    sampleCustomerName: sample?.name ?? null,
  }
}

const PHONE_PATTERN = /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/

export type TestSendResult = {
  to: string
  channel: MessageChannel
  text: string
}

/**
 * Book 3 §4 "test-send-to-self": sends one copy to a staff phone number
 * before broadcasting. Uses the first switched-on phone channel from the
 * messaging rules. Simulated (no provider), not a customer message — so
 * it skips the weekly limit and the Message Log — but it is audited.
 */
export async function sendTestMessage(id: string, phone: string): Promise<TestSendResult> {
  requirePermission('campaigns')
  const campaign = getCampaignStore().find((c) => c.id === id)
  if (!campaign) throw new Error('Campaign not found.')
  const to = phone.trim()
  if (!PHONE_PATTERN.test(to)) throw new Error('Enter a valid Indian mobile number, e.g. +91 98765 43210.')

  const [rules, preview] = await Promise.all([getMessagingRules(), getCampaignPreview(id)])
  const channel = rules.channelOrder.find((c) => c.enabled && c.channel !== 'email')?.channel
  if (!channel) throw new Error('Switch on WhatsApp or SMS in Settings → Notifications to send a test.')

  recordAudit({
    category: 'marketing',
    action: 'Sent test message',
    target: { type: 'campaign', id, label: campaign.name, href: `/campaigns/${id}` },
    changes: [{ field: 'To', from: '—', to: `${to} (${MESSAGE_CHANNEL_LABELS[channel]})` }],
  })
  return { to, channel, text: preview.text }
}

/** Delivery funnel for one sent campaign, from the Message Log. Null before it's sent. */
export async function getCampaignDelivery(id: string): Promise<DeliveryFunnel | null> {
  const campaign = getCampaignStore().find((c) => c.id === id)
  if (!campaign || campaign.status !== 'sent') return null
  return (await getDeliveryBySource()).get(id) ?? null
}

/**
 * Book 3 §4 Campaign Performance: delivery results for every sent
 * campaign, newest first. Opens, clicks and coupon redemptions need a
 * connected provider and POS, so they aren't tracked yet.
 */
export async function getCampaignPerformance(): Promise<CampaignPerformanceRow[]> {
  const [delivery, summaries] = await Promise.all([
    getDeliveryBySource(),
    withAudience(getCampaignStore().filter((c) => c.status === 'sent')),
  ])
  return summaries
    .map((c) => {
      const f = delivery.get(c.id)
      return {
        campaignId: c.id,
        name: c.name,
        sentAt: c.sentAt ?? c.scheduledAt ?? c.createdAt,
        segmentName: c.segmentName,
        sentTo: c.audienceCount,
        reached: f?.reached ?? 0,
        delivered: f?.delivered ?? 0,
        read: f?.read ?? 0,
        heldBack: (f?.blocked ?? 0) + (f?.logOnly ?? 0),
      }
    })
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
}
