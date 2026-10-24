import { describe, expect, test } from 'vitest'
import type { Customer } from '@/features/customers/types/customer'
import type { MessagingRules } from '@/features/settings/types/settings'
import type { MessageRecord, ProviderResult } from '@/features/notifications/types/message'
import { reachedInLastWeek, routeMessage, summarize } from './messageRouting'

const customer: Customer = {
  id: 'c1',
  name: 'Test',
  phone: '+91 900',
  dateOfBirth: null,
  anniversaryDate: null,
  firstVisitAt: null,
  lastOrderAt: null,
  orderCount: 0,
  lifetimeSpend: 0,
  preferredOutlets: [],
  preferenceTags: [],
  whatsappOptIn: true,
  segments: [],
  activePrograms: [],
  loyaltyPoints: null,
  alert: null,
}

const rules: MessagingRules = {
  weeklyCapPerCustomer: 2,
  channelOrder: [
    { channel: 'whatsapp', enabled: true },
    { channel: 'sms', enabled: true },
    { channel: 'email', enabled: true },
  ],
}

const always = (result: ProviderResult) => () => result

describe('routeMessage', () => {
  test('uses the first channel when it works', () => {
    const result = routeMessage({ customer, rules, reachedThisWeek: 0, provider: always('delivered') })
    expect(result).toEqual({ status: 'delivered', channel: 'whatsapp', attempts: [{ channel: 'whatsapp', outcome: 'delivered' }] })
  })

  test('falls back to SMS when WhatsApp fails', () => {
    const result = routeMessage({
      customer,
      rules,
      reachedThisWeek: 0,
      provider: (channel) => (channel === 'whatsapp' ? 'failed' : 'sent'),
    })
    expect(result.channel).toBe('sms')
    expect(result.attempts.map((a) => a.outcome)).toEqual(['failed', 'sent'])
  })

  test('a WhatsApp opt-out skips WhatsApp without touching SMS', () => {
    const result = routeMessage({
      customer: { ...customer, whatsappOptIn: false },
      rules,
      reachedThisWeek: 0,
      provider: always('read'),
    })
    expect(result.attempts).toEqual([
      { channel: 'whatsapp', outcome: 'skipped_opted_out' },
      { channel: 'sms', outcome: 'read' },
    ])
  })

  test('is logged only when every channel is skipped or fails (email has no address)', () => {
    const result = routeMessage({ customer, rules, reachedThisWeek: 0, provider: always('failed') })
    expect(result.status).toBe('log_only')
    expect(result.channel).toBeNull()
    expect(result.attempts.at(-1)).toEqual({ channel: 'email', outcome: 'skipped_no_address' })
  })

  test('blocks without trying anything once the weekly cap is reached', () => {
    const result = routeMessage({ customer, rules, reachedThisWeek: 2, provider: always('read') })
    expect(result).toEqual({ status: 'blocked_weekly_limit', channel: null, attempts: [] })
  })

  test('respects channel order and switched-off channels', () => {
    const result = routeMessage({
      customer,
      rules: {
        weeklyCapPerCustomer: 2,
        channelOrder: [
          { channel: 'sms', enabled: true },
          { channel: 'whatsapp', enabled: false },
        ],
      },
      reachedThisWeek: 0,
      provider: always('failed'),
    })
    expect(result.attempts.map((a) => a.channel)).toEqual(['sms'])
  })
})

describe('reachedInLastWeek', () => {
  const now = new Date('2026-10-24T12:00:00Z').getTime()
  const record = (daysAgo: number, status: MessageRecord['status'], customerId = 'c1') =>
    ({ customerId, status, createdAt: new Date(now - daysAgo * 86_400_000).toISOString() }) as MessageRecord

  test('counts only reached messages for this customer in the last 7 days', () => {
    const records = [
      record(1, 'delivered'),
      record(3, 'read'),
      record(2, 'blocked_weekly_limit'),
      record(2, 'log_only'),
      record(8, 'delivered'),
      record(1, 'delivered', 'c2'),
    ]
    expect(reachedInLastWeek(records, 'c1', now)).toBe(2)
  })
})

test('summarize counts fallbacks only for reached messages', () => {
  const summary = summarize([
    { status: 'delivered', attempts: [{ channel: 'whatsapp', outcome: 'delivered' }] },
    {
      status: 'sent',
      attempts: [
        { channel: 'whatsapp', outcome: 'failed' },
        { channel: 'sms', outcome: 'sent' },
      ],
    },
    { status: 'log_only', attempts: [{ channel: 'sms', outcome: 'failed' }, { channel: 'email', outcome: 'skipped_no_address' }] },
    { status: 'blocked_weekly_limit', attempts: [] },
  ])
  expect(summary).toEqual({ total: 4, reached: 2, usedFallback: 1, blocked: 1, logOnly: 1 })
})
