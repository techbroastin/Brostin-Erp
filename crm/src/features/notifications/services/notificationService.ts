import type { Customer } from '@/features/customers/types/customer'
import { listCustomers } from '@/features/customers/services/customerService'
import { getMessagingRules } from '@/features/settings/services/settingsService'
import type { MessageChannel, MessagingRules } from '@/features/settings/types/settings'
import type {
  DeliveryFunnel,
  DispatchSummary,
  MessageListParams,
  MessageRecord,
  SendRequest,
} from '@/features/notifications/types/message'
import { funnel, reachedInLastWeek, routeMessage, summarize } from '@/features/notifications/utils/messageRouting'
import {
  SEED_REQUESTS,
  simulateProvider,
  getMessageStore,
  setMessageStore,
  addMessagesToStore,
  ERROR_SCENARIO_FLAG,
  type MessageMockScenario,
} from '@/features/notifications/mock/messages.mock'

const ALL_CUSTOMERS_PAGE_SIZE = 1000
const HOUR_MS = 60 * 60 * 1000

/**
 * Book 3 §13 Notification Engine — the shared delivery layer every
 * other engine sends through. The swap point for real providers later:
 * only simulateProvider() would change. Nothing here contacts a customer.
 */
async function getCustomers(): Promise<Map<string, Customer>> {
  const { items } = await listCustomers({ search: '', page: 1, pageSize: ALL_CUSTOMERS_PAGE_SIZE, sortBy: 'name' })
  return new Map(items.map((c) => [c.id, c]))
}

let nextId = 1
function newId(): string {
  return `msg-${String(nextId++).padStart(4, '0')}`
}

/**
 * Routes one message against the history so far and appends it, so the
 * weekly cap sees earlier messages in the same batch.
 */
function routeOne(
  history: MessageRecord[],
  customer: Customer,
  request: SendRequest,
  rules: MessagingRules,
  at: number,
  providerKey: string,
  failChannels?: MessageChannel[],
): MessageRecord {
  const result = routeMessage({
    customer,
    rules,
    reachedThisWeek: reachedInLastWeek(history, customer.id, at),
    provider: (channel) => simulateProvider(providerKey, channel, failChannels),
  })
  const record: MessageRecord = {
    id: newId(),
    customerId: customer.id,
    customerName: customer.name,
    source: request.source,
    body: request.body,
    createdAt: new Date(at).toISOString(),
    ...result,
  }
  history.push(record)
  return record
}

let seeding: Promise<MessageRecord[]> | null = null

/**
 * Builds the seed history once, oldest first, through the real router.
 * The shared promise stops two screens loading at once from seeding twice.
 */
function ensureSeeded(customers: Map<string, Customer>): Promise<MessageRecord[]> {
  const existing = getMessageStore()
  if (existing) return Promise.resolve(existing)
  seeding ??= seedHistory(customers)
  return seeding
}

async function seedHistory(customers: Map<string, Customer>): Promise<MessageRecord[]> {
  const rules = await getMessagingRules()
  const now = Date.now()
  const history: MessageRecord[] = []
  for (const seed of [...SEED_REQUESTS].sort((a, b) => b.hoursAgo - a.hoursAgo)) {
    const customer = customers.get(seed.customerId)
    if (!customer) continue
    routeOne(history, customer, seed, rules, now - seed.hoursAgo * HOUR_MS, `seed-${seed.hoursAgo}-${seed.customerId}`, seed.failChannels)
  }
  setMessageStore(history)
  return history
}

/**
 * Sends a batch through the engine using the current Settings rules.
 * Unknown customer ids are ignored. Returns what happened, for the caller
 * to report back.
 */
export async function dispatchMessages(requests: SendRequest[]): Promise<DispatchSummary> {
  const customers = await getCustomers()
  const history = [...(await ensureSeeded(customers))]
  const rules = await getMessagingRules()
  const now = Date.now()
  const created: MessageRecord[] = []
  requests.forEach((request, i) => {
    const customer = customers.get(request.customerId)
    if (!customer) return
    created.push(routeOne(history, customer, request, rules, now, `${request.source.id}-${request.customerId}-${now}-${i}`))
  })
  addMessagesToStore(created)
  return summarize(created)
}

export async function listMessages(
  params: MessageListParams,
  scenario: MessageMockScenario = 'normal',
): Promise<MessageRecord[]> {
  const customers = await getCustomers()
  if (scenario === ERROR_SCENARIO_FLAG) throw new Error('Failed to load messages.')
  const records = scenario === 'empty' ? [] : await ensureSeeded(customers)
  const search = params.search.trim().toLowerCase()
  return records
    .filter((r) => params.status === 'all' || r.status === params.status)
    .filter(
      (r) => !search || r.customerName.toLowerCase().includes(search) || r.source.name.toLowerCase().includes(search),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getMessageSummary(scenario: MessageMockScenario = 'normal'): Promise<DispatchSummary> {
  const customers = await getCustomers()
  if (scenario === ERROR_SCENARIO_FLAG) throw new Error('Failed to load message summary.')
  return summarize(scenario === 'empty' ? [] : await ensureSeeded(customers))
}

/** Delivery funnel per source id (e.g. each campaign), for performance views. */
export async function getDeliveryBySource(): Promise<Map<string, DeliveryFunnel>> {
  const records = await ensureSeeded(await getCustomers())
  const bySource = new Map<string, MessageRecord[]>()
  for (const record of records) {
    bySource.set(record.source.id, [...(bySource.get(record.source.id) ?? []), record])
  }
  return new Map([...bySource].map(([id, group]) => [id, funnel(group)]))
}
