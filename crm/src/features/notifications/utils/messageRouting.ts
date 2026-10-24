import type { Customer } from '@/features/customers/types/customer'
import type { MessageChannel, MessagingRules } from '@/features/settings/types/settings'
import type {
  DeliveryAttempt,
  DispatchSummary,
  MessageRecord,
  MessageStatus,
  ProviderResult,
} from '@/features/notifications/types/message'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

const REACHED: MessageStatus[] = ['sent', 'delivered', 'read']

export function isReached(status: MessageStatus): boolean {
  return REACHED.includes(status)
}

/**
 * Whether a channel can be used for this customer at all. Opt-out is
 * per channel (Book 3 §4): a WhatsApp opt-out does not block SMS.
 * Customers have no email address on record yet, so email is always
 * skipped until one exists.
 */
export function channelAvailability(
  customer: Customer,
  channel: MessageChannel,
): 'ok' | 'opted_out' | 'no_address' {
  switch (channel) {
    case 'whatsapp':
      return customer.whatsappOptIn ? 'ok' : 'opted_out'
    case 'sms':
      return customer.phone ? 'ok' : 'no_address'
    case 'email':
      return 'no_address'
  }
}

/** Messages that reached this customer in the 7 days before `now`, from every source combined. */
export function reachedInLastWeek(records: MessageRecord[], customerId: string, now: number): number {
  return records.filter(
    (r) =>
      r.customerId === customerId &&
      isReached(r.status) &&
      now - new Date(r.createdAt).getTime() < WEEK_MS &&
      new Date(r.createdAt).getTime() <= now,
  ).length
}

export type RouteResult = {
  status: MessageStatus
  channel: MessageChannel | null
  attempts: DeliveryAttempt[]
}

/**
 * The core Book 3 §13 decision for one message:
 * 1. Weekly cap reached → blocked, nothing tried.
 * 2. Otherwise try each enabled channel in order, skipping ones the
 *    customer can't receive; stop at the first the provider accepts.
 * 3. If none works, the message is only logged.
 */
export function routeMessage({
  customer,
  rules,
  reachedThisWeek,
  provider,
}: {
  customer: Customer
  rules: MessagingRules
  reachedThisWeek: number
  provider: (channel: MessageChannel) => ProviderResult
}): RouteResult {
  if (reachedThisWeek >= rules.weeklyCapPerCustomer) {
    return { status: 'blocked_weekly_limit', channel: null, attempts: [] }
  }

  const attempts: DeliveryAttempt[] = []
  for (const { channel, enabled } of rules.channelOrder) {
    if (!enabled) continue
    const availability = channelAvailability(customer, channel)
    if (availability !== 'ok') {
      attempts.push({ channel, outcome: availability === 'opted_out' ? 'skipped_opted_out' : 'skipped_no_address' })
      continue
    }
    const result = provider(channel)
    attempts.push({ channel, outcome: result })
    if (result !== 'failed') return { status: result, channel, attempts }
  }
  return { status: 'log_only', channel: null, attempts }
}

/** A message "used a fallback" if it reached the customer on anything but the first channel tried. */
export function usedFallback(record: Pick<MessageRecord, 'attempts' | 'status'>): boolean {
  return isReached(record.status) && record.attempts.length > 1
}

export function summarize(records: Pick<MessageRecord, 'attempts' | 'status'>[]): DispatchSummary {
  return {
    total: records.length,
    reached: records.filter((r) => isReached(r.status)).length,
    usedFallback: records.filter(usedFallback).length,
    blocked: records.filter((r) => r.status === 'blocked_weekly_limit').length,
    logOnly: records.filter((r) => r.status === 'log_only').length,
  }
}
