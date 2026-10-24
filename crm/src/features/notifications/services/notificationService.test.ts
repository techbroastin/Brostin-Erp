import { beforeEach, describe, expect, test, vi } from 'vitest'

/**
 * Pure mock-service tests — no provider, no network. vi.resetModules()
 * gives every test fresh message and settings stores.
 */
describe('notificationService', () => {
  let service: typeof import('./notificationService')
  let settings: typeof import('@/features/settings/services/settingsService')

  beforeEach(async () => {
    vi.resetModules()
    service = await import('./notificationService')
    settings = await import('@/features/settings/services/settingsService')
  })

  const forCustomer = async (customerId: string) =>
    (await service.listMessages({ search: '', status: 'all' }))
      .filter((m) => m.customerId === customerId)
      .reverse()

  test('seed history: the third message to one customer in a week is blocked', async () => {
    const messages = await forCustomer('cust-001')
    expect(messages.map((m) => m.status === 'blocked_weekly_limit')).toEqual([false, false, true])
  })

  test('seed history: a WhatsApp opt-out falls back to SMS', async () => {
    const [message] = await forCustomer('cust-003')
    expect(message.attempts[0]).toEqual({ channel: 'whatsapp', outcome: 'skipped_opted_out' })
    expect(message.channel).toBe('sms')
  })

  test('seed history: no working channel means logged only', async () => {
    const [message] = await forCustomer('cust-007')
    expect(message.status).toBe('log_only')
  })

  test('dispatch applies the cap across the existing history', async () => {
    // cust-001 already has 2 reached messages this week in the seed.
    const summary = await service.dispatchMessages([
      { customerId: 'cust-001', source: { type: 'campaign', id: 'x', name: 'X' }, body: 'Hi' },
      { customerId: 'cust-020', source: { type: 'campaign', id: 'x', name: 'X' }, body: 'Hi' },
    ])
    expect(summary.total).toBe(2)
    expect(summary.blocked).toBe(1)
  })

  test('dispatch uses the current Settings rules', async () => {
    await settings.updateMessagingRules({
      weeklyCapPerCustomer: 1,
      channelOrder: [
        { channel: 'whatsapp', enabled: false },
        { channel: 'sms', enabled: false },
        { channel: 'email', enabled: true },
      ],
    })
    const summary = await service.dispatchMessages([
      { customerId: 'cust-020', source: { type: 'program', id: 'p', name: 'P' }, body: 'Hi' },
    ])
    // Only email is on and no customer has an email address yet.
    expect(summary.logOnly).toBe(1)
  })

  test('the summary matches the log', async () => {
    const [summary, messages] = await Promise.all([
      service.getMessageSummary(),
      service.listMessages({ search: '', status: 'all' }),
    ])
    expect(summary.total).toBe(messages.length)
    expect(new Set(messages.map((m) => m.id)).size).toBe(messages.length)
  })

  test('the error scenario throws', async () => {
    await expect(service.listMessages({ search: '', status: 'all' }, 'error')).rejects.toThrow()
  })
})

describe('sendCampaign', () => {
  beforeEach(() => vi.resetModules())

  test('marks the campaign sent and routes one message per segment member', async () => {
    const campaigns = await import('@/features/campaigns/services/campaignService')
    const notifications = await import('./notificationService')
    const { campaign, delivery } = await campaigns.sendCampaign('camp-002')

    expect(campaign.status).toBe('sent')
    expect(delivery.total).toBe(campaign.sentToCustomerIds?.length)
    const logged = await notifications.listMessages({ search: 'Loyalty Points Reminder', status: 'all' })
    expect(logged).toHaveLength(campaign.sentToCustomerIds?.length ?? -1)
  })
})
