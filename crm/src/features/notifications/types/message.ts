import type { MessageChannel } from '@/features/settings/types/settings'

/**
 * Notification Engine domain types — Book 3 §13. Mock-only: no message
 * provider (WhatsApp/SMS/email) is connected, so every "send" here is a
 * simulation and nothing reaches a real customer.
 */

export type MessageSourceType = 'campaign' | 'program' | 'workflow'

/** Which engine asked for the message — every engine sends through this one. */
export type MessageSource = {
  type: MessageSourceType
  id: string
  name: string
}

/**
 * One try on one channel. Skips never reach a provider: the customer
 * opted out of that channel, or we have no address for it.
 */
export type AttemptOutcome = 'skipped_opted_out' | 'skipped_no_address' | 'failed' | 'sent' | 'delivered' | 'read'

/** What the (simulated) provider reports for a channel it was handed. */
export type ProviderResult = Extract<AttemptOutcome, 'failed' | 'sent' | 'delivered' | 'read'>

export type DeliveryAttempt = {
  channel: MessageChannel
  outcome: AttemptOutcome
}

/**
 * Final result of a message:
 * - sent / delivered / read: reached the customer on `channel`
 * - log_only: every enabled channel was skipped or failed (Book 3 §3's "log only" fallback)
 * - blocked_weekly_limit: the customer already hit the weekly cap, so nothing was tried
 */
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'log_only' | 'blocked_weekly_limit'

export type MessageRecord = {
  id: string
  customerId: string
  customerName: string
  source: MessageSource
  body: string
  createdAt: string
  attempts: DeliveryAttempt[]
  status: MessageStatus
  /** Channel that reached the customer, if any. */
  channel: MessageChannel | null
}

export type SendRequest = {
  customerId: string
  source: MessageSource
  body: string
}

export type DispatchSummary = {
  total: number
  reached: number
  usedFallback: number
  blocked: number
  logOnly: number
}

/** Book 3 §4 delivery funnel for one source (e.g. a campaign). */
export type DeliveryFunnel = DispatchSummary & {
  /** Delivered or read. */
  delivered: number
  read: number
}

export type MessageListParams = {
  search: string
  status: MessageStatus | 'all'
}
