import { beforeEach, describe, expect, test, vi } from 'vitest'

/**
 * Pure mock-service tests — no backend, no provider. vi.resetModules()
 * gives every test fresh campaign, segment and message stores.
 */
describe('campaignService segment targeting', () => {
  let campaigns: typeof import('./campaignService')
  let segments: typeof import('@/features/segments/services/segmentService')

  beforeEach(async () => {
    vi.resetModules()
    campaigns = await import('./campaignService')
    segments = await import('@/features/segments/services/segmentService')
  })

  test("unsent campaigns report the segment's current size; sent ones report who they went to", async () => {
    const vip = await segments.getSegmentDetail('seg-vip')
    const { items } = await campaigns.listCampaigns({ search: '', page: 1, pageSize: 10, sortBy: 'name' })
    const byId = new Map(items.map((c) => [c.id, c]))

    expect(byId.get('camp-002')).toMatchObject({ segmentName: 'Loyal / VIP', audienceCount: vip?.members.length })
    expect(byId.get('camp-001')?.audienceCount).toBe(5)
  })

  test('creating a campaign requires an existing segment', async () => {
    await expect(
      campaigns.createCampaign({ name: 'X', message: 'Hi', segmentId: 'seg-missing', scheduledAt: null }),
    ).rejects.toThrow('Pick a segment')

    const created = await campaigns.createCampaign({ name: 'X', message: 'Hi', segmentId: 'seg-new', scheduledAt: null })
    expect(created).toMatchObject({ segmentId: 'seg-new', sentToCustomerIds: null, status: 'draft' })
  })

  test("sending freezes the segment's members on the campaign", async () => {
    const vip = await segments.getSegmentDetail('seg-vip')
    const { campaign, delivery } = await campaigns.sendCampaign('camp-002')

    expect(campaign.sentToCustomerIds).toEqual(vip?.members.map((c) => c.id))
    expect(delivery.total).toBe(vip?.members.length)
    const audience = await campaigns.getCampaignAudience('camp-002')
    expect(audience.map((c) => c.id)).toEqual(campaign.sentToCustomerIds)
  })

  test('a campaign cannot be sent twice', async () => {
    await expect(campaigns.sendCampaign('camp-001')).rejects.toThrow('already been sent')
  })

  test('a campaign whose segment was deleted cannot be sent', async () => {
    const custom = await campaigns.createCampaign({
      name: 'Y',
      message: 'Hi',
      segmentId: 'seg-custom-001',
      scheduledAt: null,
    })
    await segments.deleteSegment('seg-custom-001')

    const summary = await campaigns.getCampaignById(custom.id)
    expect(summary?.segmentName).toBeNull()
    await expect(campaigns.sendCampaign(custom.id)).rejects.toThrow('no longer exists')
  })

  test('a campaign whose segment is empty cannot be sent', async () => {
    const empty = await segments.createSegment({
      name: 'Nobody',
      description: '',
      match: 'all',
      rules: [{ field: 'order_count', operator: 'gt', value: '9999' }],
    })
    const campaign = await campaigns.createCampaign({ name: 'Z', message: 'Hi', segmentId: empty.id, scheduledAt: null })
    await expect(campaigns.sendCampaign(campaign.id)).rejects.toThrow('no customers')
  })
})
