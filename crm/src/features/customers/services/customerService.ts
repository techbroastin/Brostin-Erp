import type { Customer, CustomerListParams, CustomerListResult } from '@/features/customers/types/customer'
import {
  getCustomerStore,
  addCustomersToStore,
  replaceCustomerInStore,
  emptyCustomers,
  ERROR_SCENARIO_FLAG,
  type CustomerMockScenario,
} from '@/features/customers/mock/customers.mock'
import { recordAudit, recordView } from '@/features/audit/services/auditService'
import {
  MERGE_FIELD_LABELS,
  combineCustomers,
  findDuplicateGroups,
  mergeConflicts,
  type MergeChoices,
  type MergeConflict,
} from '@/features/customers/utils/customerMerge'
import { previewImport, type ImportPreview } from '@/features/customers/utils/customerImport'
import { requirePermission } from '@/features/auth/services/authService'

const SIMULATED_LATENCY_MS = 500

function getSourceDataset(scenario: CustomerMockScenario): Customer[] {
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load customers.')
  }
  return scenario === 'empty' ? emptyCustomers : getCustomerStore()
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

  const source = getSourceDataset(scenario).filter((c) => params.includeArchived || !c.archivedAt)

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

/**
 * Opening a customer's profile — Book 3 §14 logs every customer data
 * access. Use this for the detail screen; getCustomerById() stays
 * un-logged for internal lookups (e.g. the public feedback page).
 */
export async function openCustomerProfile(id: string): Promise<Customer | null> {
  const customer = await getCustomerById(id)
  if (customer) {
    recordView({
      category: 'customer_data',
      action: 'Viewed customer profile',
      target: { type: 'customer', id, label: customer.name, href: `/customers/${id}` },
      changes: [],
    })
  }
  return customer
}

/** Exports leave the system, so each one is logged (no de-duplication). */
export function recordTimelineExport(customerId: string, customerName: string, eventCount: number): void {
  recordAudit({
    category: 'customer_data',
    action: 'Exported customer timeline',
    target: { type: 'customer', id: customerId, label: customerName, href: `/customers/${customerId}` },
    changes: [{ field: 'Events exported', from: '—', to: String(eventCount) }],
  })
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
}

function findCustomer(id: string): Customer {
  const customer = getCustomerStore().find((c) => c.id === id)
  if (!customer) throw new Error('Customer not found.')
  return customer
}

/**
 * Book 3 §1: customers are archived, never deleted. Archived customers
 * drop out of lists, segments and campaigns but keep their history.
 */
export async function archiveCustomer(id: string, reason: string): Promise<Customer> {
  requirePermission('customers')
  await delay()
  const customer = findCustomer(id)
  if (customer.archivedAt) return customer
  const archived = { ...customer, archivedAt: new Date().toISOString(), archiveReason: reason.trim() || null }
  replaceCustomerInStore(archived)
  recordAudit({
    category: 'customer_data',
    action: 'Archived customer',
    target: { type: 'customer', id, label: customer.name, href: `/customers/${id}` },
    changes: [{ field: 'Reason', from: '—', to: reason.trim() || 'No reason given' }],
  })
  return archived
}

/** Merged records stay archived — restoring one would bring the duplicate back. */
export async function restoreCustomer(id: string): Promise<Customer> {
  requirePermission('customers')
  await delay()
  const customer = findCustomer(id)
  if (customer.mergedIntoId) throw new Error('This record was merged into another customer and can’t be restored.')
  if (!customer.archivedAt) return customer
  const restored = { ...customer, archivedAt: null, archiveReason: null }
  replaceCustomerInStore(restored)
  recordAudit({
    category: 'customer_data',
    action: 'Restored customer',
    target: { type: 'customer', id, label: customer.name, href: `/customers/${id}` },
    changes: [],
  })
  return restored
}

/** Merge Tool: active customers sharing a phone number. */
export async function listDuplicateGroups(): Promise<Customer[][]> {
  await delay()
  return findDuplicateGroups(getCustomerStore())
}

export type MergePreview = {
  primary: Customer
  secondary: Customer
  conflicts: MergeConflict[]
}

export async function getMergePreview(primaryId: string, secondaryId: string): Promise<MergePreview> {
  await delay()
  if (primaryId === secondaryId) throw new Error('Pick two different customers.')
  const primary = findCustomer(primaryId)
  const secondary = findCustomer(secondaryId)
  if (primary.archivedAt || secondary.archivedAt) throw new Error('Archived customers can’t be merged.')
  return { primary, secondary, conflicts: mergeConflicts(primary, secondary) }
}

/**
 * Merges `secondaryId` into `primaryId`. Every conflict needs a choice
 * (Book 3 §1: never overwritten silently). The second record is archived
 * and points at the first — nothing is deleted. Orders, feedback and
 * messages keep their original customer id in this mock; re-pointing
 * them is a backend step.
 */
export async function mergeCustomers(primaryId: string, secondaryId: string, choices: MergeChoices): Promise<Customer> {
  requirePermission('customers')
  const { primary, secondary, conflicts } = await getMergePreview(primaryId, secondaryId)
  const merged = combineCustomers(primary, secondary, choices)
  replaceCustomerInStore(merged)
  replaceCustomerInStore({
    ...secondary,
    archivedAt: new Date().toISOString(),
    archiveReason: `Merged into ${merged.name}`,
    mergedIntoId: primaryId,
  })
  recordAudit({
    category: 'customer_data',
    action: 'Merged customers',
    target: { type: 'customer', id: primaryId, label: merged.name, href: `/customers/${primaryId}` },
    changes: [
      { field: 'Merged record', from: '—', to: `${secondary.name} (${secondary.phone})` },
      ...conflicts.map((c) => ({
        field: MERGE_FIELD_LABELS[c.field],
        from: c.primaryValue,
        to: choices[c.field] === 'secondary' ? c.secondaryValue : c.primaryValue,
      })),
    ],
  })
  return merged
}

/** Bulk Import step 1: check the file without changing anything. */
export async function previewCustomerImport(text: string): Promise<ImportPreview> {
  await delay()
  return previewImport(text, getCustomerStore())
}

export type ImportResult = {
  created: number
  updated: number
  flagged: number
  skipped: number
}

/**
 * Bulk Import step 2. The file is checked again here (the preview the
 * user saw could be stale). New phones become customers; matches only
 * get blank fields filled and new tags added; disagreeing values are
 * never overwritten — the customer is flagged for review instead.
 */
export async function importCustomers(text: string): Promise<ImportResult> {
  requirePermission('customers')
  const preview = await previewCustomerImport(text)
  if (preview.missingColumns.length > 0 || preview.tooManyRows) throw new Error('This file can’t be imported.')

  const store = getCustomerStore()
  let nextNumber = Math.max(...store.map((c) => Number(c.id.replace('cust-', '')) || 0)) + 1
  const created: Customer[] = []
  let updated = 0
  let flagged = 0

  for (const row of preview.rows) {
    const f = row.fields
    if (row.status === 'new') {
      created.push({
        id: `cust-${String(nextNumber++).padStart(3, '0')}`,
        name: f.name,
        phone: f.phone,
        dateOfBirth: f.dateOfBirth,
        anniversaryDate: f.anniversaryDate,
        firstVisitAt: null,
        lastOrderAt: null,
        orderCount: 0,
        lifetimeSpend: 0,
        preferredOutlets: [],
        preferenceTags: f.tags,
        whatsappOptIn: f.whatsappOptIn ?? false,
        segments: [],
        activePrograms: [],
        loyaltyPoints: null,
        alert: null,
        archivedAt: null,
        archiveReason: null,
        mergedIntoId: null,
      })
    } else if (row.status === 'update' && row.matchCustomerId) {
      const current = findCustomer(row.matchCustomerId)
      replaceCustomerInStore({
        ...current,
        dateOfBirth: current.dateOfBirth ?? f.dateOfBirth,
        anniversaryDate: current.anniversaryDate ?? f.anniversaryDate,
        preferenceTags: [...new Set([...current.preferenceTags, ...f.tags])],
        alert:
          row.conflicts.length > 0
            ? `Import differs on ${row.conflicts.join(', ')} — please review`
            : current.alert,
      })
      updated++
      if (row.conflicts.length > 0) flagged++
    }
  }
  addCustomersToStore(created)

  const result: ImportResult = {
    created: created.length,
    updated,
    flagged,
    skipped: preview.rows.filter((r) => r.status === 'invalid' || r.status === 'duplicate_in_file' || r.status === 'no_change')
      .length,
  }
  recordAudit({
    category: 'customer_data',
    action: 'Imported customers',
    target: { type: 'import', id: `import-${Date.now()}`, label: `${preview.rows.length} rows`, href: '/customers' },
    changes: [
      { field: 'Created', from: '—', to: String(result.created) },
      { field: 'Updated', from: '—', to: String(result.updated) },
      { field: 'Flagged for review', from: '—', to: String(result.flagged) },
      { field: 'Skipped', from: '—', to: String(result.skipped) },
    ],
  })
  return result
}
