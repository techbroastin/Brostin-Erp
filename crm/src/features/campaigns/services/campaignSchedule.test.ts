import { beforeEach, describe, expect, test, vi } from 'vitest'
import { dateKey, groupByDay, monthGrid } from '@/features/campaigns/utils/calendar'
import { campaignSchema } from '@/features/campaigns/schemas/campaignSchema'

describe('calendar helpers', () => {
  test('monthGrid gives Monday-first full weeks covering the month', () => {
    const weeks = monthGrid(2026, 9) // October 2026 starts on a Thursday
    expect(weeks.every((w) => w.length === 7)).toBe(true)
    expect(weeks[0][0].getDay()).toBe(1)
    expect(dateKey(weeks[0][3])).toBe('2026-10-01')
    expect(weeks.flat().some((d) => dateKey(d) === '2026-10-31')).toBe(true)
  })

  test('groupByDay uses sent date first, then scheduled date, and skips drafts', () => {
    const byDay = groupByDay([
      { sentAt: '2026-10-05T09:00:00', scheduledAt: '2026-10-01T09:00:00' },
      { sentAt: null, scheduledAt: '2026-10-05T18:00:00' },
      { sentAt: null, scheduledAt: null },
    ])
    expect(byDay.get('2026-10-05')).toHaveLength(2)
    expect(byDay.has('2026-10-01')).toBe(false)
  })
})

describe('campaign schedule rules', () => {
  const base = { name: 'X', message: 'Hi', segmentId: 'seg-new', scheduledAt: null, repeatYearly: false }

  test('a scheduled time must be in the future, and yearly repeat needs a date', () => {
    expect(campaignSchema.safeParse({ ...base, scheduledAt: '2000-01-01T10:00' }).success).toBe(false)
    expect(campaignSchema.safeParse({ ...base, repeatYearly: true }).success).toBe(false)
    expect(campaignSchema.safeParse({ ...base, scheduledAt: '2999-12-25T10:00', repeatYearly: true }).success).toBe(true)
  })
})

describe('campaignService scheduling and performance', () => {
  let campaigns: typeof import('./campaignService')

  beforeEach(async () => {
    vi.resetModules()
    campaigns = await import('./campaignService')
  })

  test('sending a yearly campaign records sentAt and schedules next year', async () => {
    const before = await campaigns.getCampaignById('camp-004')
    const { campaign, nextYear } = await campaigns.sendCampaign('camp-004')

    expect(campaign.sentAt).not.toBeNull()
    expect(nextYear).not.toBeNull()
    const nextDate = new Date(nextYear!.scheduledAt!)
    const oldDate = new Date(before!.scheduledAt!)
    expect(nextDate.getFullYear()).toBe(oldDate.getFullYear() + 1)
    expect([nextDate.getMonth(), nextDate.getDate()]).toEqual([oldDate.getMonth(), oldDate.getDate()])
    expect(nextYear).toMatchObject({ status: 'scheduled', repeatYearly: true, sentToCustomerIds: null })
  })

  test('a one-off campaign does not repeat', async () => {
    const { nextYear } = await campaigns.sendCampaign('camp-002')
    expect(nextYear).toBeNull()
  })

  test('isDue flags scheduled campaigns whose time has passed', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(Date.now() + 3 * 24 * 60 * 60 * 1000)
    try {
      const summary = await campaigns.getCampaignById('camp-002')
      expect(summary?.isDue).toBe(true)
    } finally {
      vi.useRealTimers()
    }
    expect((await campaigns.getCampaignById('camp-002'))?.isDue).toBe(false)
  })

  test('performance lists sent campaigns with their delivery funnel', async () => {
    await campaigns.sendCampaign('camp-002')
    const rows = await campaigns.getCampaignPerformance()
    const row = rows.find((r) => r.campaignId === 'camp-002')
    expect(row).toBeDefined()
    expect(row!.sentTo).toBeGreaterThan(0)
    expect(row!.reached + row!.heldBack).toBe(row!.sentTo)
    expect(row!.read).toBeLessThanOrEqual(row!.delivered)
    expect(await campaigns.getCampaignDelivery('camp-003')).toBeNull()
  })
})
