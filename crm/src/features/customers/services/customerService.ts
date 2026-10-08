import type { Customer, CustomerListParams, CustomerListResult } from '@/features/customers/types/customer'
import {
  normalCustomers,
  emptyCustomers,
  ERROR_SCENARIO_FLAG,
  type CustomerMockScenario,
} from '@/features/customers/mock/customers.mock'

const SIMULATED_LATENCY_MS = 500

function getSourceDataset(scenario: CustomerMockScenario): Customer[] {
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load customers.')
  }
  return scenario === 'empty' ? emptyCustomers : normalCustomers
}

/**
 * The swap point for real data later — nothing above this file (hooks,
 * components, screens) knows the data is mocked. `scenario` lets the
 * normal/empty/error states be exercised without changing any component;
 * production code always calls this with the default ('normal').
 */
export async function listCustomers(
  params: CustomerListParams,
  scenario: CustomerMockScenario = 'normal',
): Promise<CustomerListResult> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))

  const source = getSourceDataset(scenario)

  const search = params.search.trim().toLowerCase()
  const filtered = search
    ? source.filter(
        (c) => c.name.toLowerCase().includes(search) || c.phone.toLowerCase().includes(search),
      )
    : source

  const sorted = [...filtered].sort((a, b) => {
    if (params.sortBy === 'name') return a.name.localeCompare(b.name)
    // lastOrderAt: customers with no orders sort last
    if (!a.lastOrderAt) return 1
    if (!b.lastOrderAt) return -1
    return new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime()
  })

  const start = (params.page - 1) * params.pageSize
  const items = sorted.slice(start, start + params.pageSize)

  return { items, total: sorted.length }
}

export async function getCustomerById(
  id: string,
  scenario: CustomerMockScenario = 'normal',
): Promise<Customer | null> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))

  const source = getSourceDataset(scenario)
  return source.find((c) => c.id === id) ?? null
}
