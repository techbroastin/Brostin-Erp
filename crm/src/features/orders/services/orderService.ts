import type { Order, OrderListParams, OrderListResult } from '@/features/orders/types/order'
import {
  normalOrders,
  emptyOrders,
  ERROR_SCENARIO_FLAG,
  type OrderMockScenario,
} from '@/features/orders/mock/orders.mock'

const SIMULATED_LATENCY_MS = 500

function getSourceDataset(scenario: OrderMockScenario): Order[] {
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load orders.')
  }
  return scenario === 'empty' ? emptyOrders : normalOrders
}

/**
 * The swap point for real data later. `scenario` lets normal/empty/error
 * be exercised without changing any component; production code always
 * calls this with the default ('normal').
 */
export async function listOrders(
  params: OrderListParams,
  scenario: OrderMockScenario = 'normal',
): Promise<OrderListResult> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))

  const source = getSourceDataset(scenario)

  const search = params.search.trim().toLowerCase()
  let filtered = search
    ? source.filter((o) => o.orderNumber.toLowerCase().includes(search))
    : source

  if (params.status !== 'all') {
    filtered = filtered.filter((o) => o.status === params.status)
  }
  if (params.source !== 'all') {
    filtered = filtered.filter((o) => o.source === params.source)
  }
  if (params.createdFrom) {
    const from = new Date(params.createdFrom).getTime()
    filtered = filtered.filter((o) => new Date(o.createdAt).getTime() >= from)
  }

  const sorted = [...filtered].sort((a, b) => {
    if (params.sortBy === 'grandTotal') return b.grandTotal - a.grandTotal
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const start = (params.page - 1) * params.pageSize
  const items = sorted.slice(start, start + params.pageSize)

  return { items, total: sorted.length }
}

export async function getOrderById(
  id: string,
  scenario: OrderMockScenario = 'normal',
): Promise<Order | null> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))

  const source = getSourceDataset(scenario)
  return source.find((o) => o.id === id) ?? null
}
