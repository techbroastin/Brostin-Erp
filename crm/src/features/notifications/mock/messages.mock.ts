import type { MessageChannel } from '@/features/settings/types/settings'
import type { MessageRecord, MessageSource, ProviderResult } from '@/features/notifications/types/message'

/**
 * Notification Engine mock data — the single feature-local mock source,
 * per docs/FRONTEND_ARCHITECTURE.md §6/§16. Only
 * src/features/notifications/services/notificationService.ts may import
 * this file.
 *
 * No provider is connected. SEED_REQUESTS is a scripted message history
 * that the service runs through the real routing logic on first load,
 * so the log always agrees with the rules. simulateProvider() stands in
 * for WhatsApp/SMS/email providers. The record store is MUTABLE in
 * memory: messages sent from the UI (e.g. a campaign marked as sent)
 * live only for this browser session.
 */

export type MessageMockScenario = 'normal' | 'empty' | 'error'
export const ERROR_SCENARIO_FLAG: MessageMockScenario = 'error'

export type SeedRequest = {
  hoursAgo: number
  customerId: string
  source: MessageSource
  body: string
  /** Channels the simulated provider fails on for this message. */
  failChannels?: MessageChannel[]
}

const weekendCampaign: MessageSource = { type: 'campaign', id: 'camp-001', name: 'Weekend Broasted Combo Offer' }
const loyaltyProgram: MessageSource = { type: 'program', id: 'prog-loyalty', name: 'Loyalty points earned' }
const winBack: MessageSource = { type: 'workflow', id: 'wf-win-back', name: 'Lapsed customer win-back' }

const COMBO = 'This weekend only: get our Broasted Combo at a special price. Order now!'
const POINTS = 'You earned loyalty points on your last order — thanks for visiting Broastin!'
const MISS_YOU = "We miss you! Here's 10% off your next order with code WELCOME10."

/**
 * cust-003 and cust-007 have opted out of WhatsApp in customers.mock.ts
 * (index % 4 === 2), so their messages fall back to SMS. cust-001 gets
 * three messages inside a week, so the third hits the default cap of 2.
 */
export const SEED_REQUESTS: SeedRequest[] = [
  { hoursAgo: 140, customerId: 'cust-001', source: weekendCampaign, body: COMBO },
  { hoursAgo: 140, customerId: 'cust-002', source: weekendCampaign, body: COMBO },
  { hoursAgo: 140, customerId: 'cust-003', source: weekendCampaign, body: COMBO },
  { hoursAgo: 140, customerId: 'cust-004', source: weekendCampaign, body: COMBO, failChannels: ['whatsapp'] },
  { hoursAgo: 140, customerId: 'cust-005', source: weekendCampaign, body: COMBO },
  { hoursAgo: 96, customerId: 'cust-001', source: loyaltyProgram, body: POINTS },
  { hoursAgo: 72, customerId: 'cust-001', source: winBack, body: MISS_YOU },
  { hoursAgo: 60, customerId: 'cust-007', source: winBack, body: MISS_YOU, failChannels: ['sms'] },
  { hoursAgo: 48, customerId: 'cust-010', source: loyaltyProgram, body: POINTS },
  { hoursAgo: 30, customerId: 'cust-013', source: winBack, body: MISS_YOU },
  { hoursAgo: 20, customerId: 'cust-016', source: loyaltyProgram, body: POINTS, failChannels: ['whatsapp'] },
  { hoursAgo: 5, customerId: 'cust-019', source: loyaltyProgram, body: POINTS },
]

function hash(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * Stand-in for the real providers: deterministic per `key` so the
 * same message always gets the same result. Roughly 1 in 10 WhatsApp
 * and 1 in 20 SMS sends fail; successes split across sent/delivered/read.
 */
export function simulateProvider(key: string, channel: MessageChannel, failChannels: MessageChannel[] = []): ProviderResult {
  if (failChannels.includes(channel)) return 'failed'
  const h = hash(`${key}:${channel}`)
  const failEvery = channel === 'whatsapp' ? 10 : 20
  if (h % failEvery === 0) return 'failed'
  const outcomes: ProviderResult[] = ['read', 'delivered', 'delivered', 'sent']
  return outcomes[h % outcomes.length]
}

let messageStore: MessageRecord[] | null = null

/** Null until the service has run the seed history through the router. */
export function getMessageStore(): MessageRecord[] | null {
  return messageStore
}

export function setMessageStore(records: MessageRecord[]): void {
  messageStore = records
}

export function addMessagesToStore(records: MessageRecord[]): void {
  messageStore = [...(messageStore ?? []), ...records]
}
