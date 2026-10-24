import { beforeEach, describe, expect, test, vi } from 'vitest'
import { firstName, personalize, unknownTokens } from '@/features/campaigns/utils/personalize'
import { messageSchema } from '@/features/campaigns/schemas/campaignSchema'

describe('personalize', () => {
  test('fills known tokens and leaves unknown ones visible', () => {
    expect(personalize('Hi {{first_name}}, from {{ business_name }} {{coupon}}', { first_name: 'Asha', business_name: 'Broastin' })).toBe(
      'Hi Asha, from Broastin {{coupon}}',
    )
  })

  test('unknown tokens are reported and rejected by the message schema', () => {
    expect(unknownTokens('{{first_name}} {{coupon}} {{coupon}}')).toEqual(['coupon'])
    expect(messageSchema.safeParse('Hi {{coupon}}').success).toBe(false)
    expect(messageSchema.safeParse('Hi {{first_name}}').success).toBe(true)
  })

  test('firstName takes the first word', () => {
    expect(firstName('  Lakshmi  Priya ')).toBe('Lakshmi')
  })
})

describe('templateService', () => {
  let templates: typeof import('./templateService')

  beforeEach(async () => {
    vi.resetModules()
    templates = await import('./templateService')
  })

  test('filters by occasion and resolves segment names', async () => {
    const festival = await templates.listTemplates({ occasion: 'festival' })
    expect(festival.every((t) => t.occasion === 'festival')).toBe(true)
    const all = await templates.listTemplates({ occasion: 'all' })
    expect(all.find((t) => t.id === 'tpl-004')?.segmentName).toBe('Lapsed')
  })

  test('create, edit and delete; duplicate names are rejected', async () => {
    const created = await templates.createTemplate({ name: 'Monsoon', occasion: 'generic', segmentId: null, body: 'Rainy day? {{first_name}}' })
    await expect(
      templates.createTemplate({ name: 'monsoon', occasion: 'generic', segmentId: null, body: 'x' }),
    ).rejects.toThrow('already exists')
    const edited = await templates.updateTemplate(created.id, { name: 'Monsoon special', occasion: 'festival', segmentId: null, body: 'x' })
    expect(edited.name).toBe('Monsoon special')
    await templates.deleteTemplate(created.id)
    expect(await templates.getTemplate(created.id)).toBeNull()
  })
})

describe('campaign preview and test-send', () => {
  let campaigns: typeof import('./campaignService')

  beforeEach(async () => {
    vi.resetModules()
    campaigns = await import('./campaignService')
  })

  test('preview fills tokens from a real audience member', async () => {
    const created = await campaigns.createCampaign({
      name: 'Hello',
      message: 'Hi {{first_name}}, thanks from {{business_name}}!',
      segmentId: 'seg-vip',
      scheduledAt: null,
    })
    const preview = await campaigns.getCampaignPreview(created.id)
    expect(preview.sampleCustomerName).not.toBeNull()
    expect(preview.text).toBe(`Hi ${firstName(preview.sampleCustomerName!)}, thanks from Broastin!`)
  })

  test('sending personalises each message', async () => {
    const notifications = await import('@/features/notifications/services/notificationService')
    const created = await campaigns.createCampaign({
      name: 'Personal',
      message: 'Hi {{first_name}}',
      segmentId: 'seg-new',
      scheduledAt: null,
    })
    await campaigns.sendCampaign(created.id)
    const messages = await notifications.listMessages({ search: 'Personal', status: 'all' })
    expect(messages.length).toBeGreaterThan(0)
    for (const m of messages) expect(m.body).toBe(`Hi ${firstName(m.customerName)}`)
  })

  test('test-send validates the number and uses the first phone channel', async () => {
    await expect(campaigns.sendTestMessage('camp-002', '12345')).rejects.toThrow('valid Indian mobile')
    const result = await campaigns.sendTestMessage('camp-002', '+91 98765 43210')
    expect(result.channel).toBe('whatsapp')
  })

  test('test-send does not touch the Message Log', async () => {
    const notifications = await import('@/features/notifications/services/notificationService')
    const before = (await notifications.listMessages({ search: '', status: 'all' })).length
    await campaigns.sendTestMessage('camp-002', '9876543210')
    expect((await notifications.listMessages({ search: '', status: 'all' })).length).toBe(before)
  })
})
