import type { Customer } from '@/features/customers/types/customer'
import { listCustomers } from '@/features/customers/services/customerService'
import type {
  Segment,
  SegmentDefinition,
  SegmentDetail,
  SegmentFieldOptions,
  SegmentInput,
  SegmentPreview,
  SegmentSummary,
} from '@/features/segments/types/segment'
import { evaluateSegment } from '@/features/segments/utils/segmentRules'
import {
  getSegmentStore,
  addSegmentToStore,
  replaceSegmentInStore,
  removeSegmentFromStore,
  emptySegments,
  ERROR_SCENARIO_FLAG,
  type SegmentMockScenario,
} from '@/features/segments/mock/segments.mock'

const ALL_CUSTOMERS_PAGE_SIZE = 1000
const PREVIEW_SAMPLE_SIZE = 8

/**
 * The swap point for real data later — nothing above this file knows
 * the data is mocked. Membership is evaluated against the Customers
 * service on read; a real backend would instead read the stored result
 * of the nightly recalculation (Book 3 §10).
 */
async function getAllCustomers(): Promise<Customer[]> {
  const result = await listCustomers({ search: '', page: 1, pageSize: ALL_CUSTOMERS_PAGE_SIZE, sortBy: 'name' })
  return result.items
}

function getSourceDataset(scenario: SegmentMockScenario): Segment[] {
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load segments.')
  }
  return scenario === 'empty' ? emptySegments : getSegmentStore()
}

/** Pre-built first, then custom; alphabetical within each group. */
function sortSegments<T extends Segment>(segments: T[]): T[] {
  return [...segments].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'prebuilt' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export async function listSegments(scenario: SegmentMockScenario = 'normal'): Promise<SegmentSummary[]> {
  const customers = await getAllCustomers()
  const source = getSourceDataset(scenario)
  const now = Date.now()
  return sortSegments(
    source.map((segment) => ({
      ...segment,
      memberCount: evaluateSegment(segment, customers, now).length,
    })),
  )
}

export async function getSegmentDetail(
  id: string,
  scenario: SegmentMockScenario = 'normal',
): Promise<SegmentDetail | null> {
  const customers = await getAllCustomers()
  const segment = getSourceDataset(scenario).find((s) => s.id === id)
  if (!segment) return null
  return { segment, members: evaluateSegment(segment, customers) }
}

/** Builder "Segment Membership Preview": who matches a definition right now. */
export async function previewSegment(definition: SegmentDefinition): Promise<SegmentPreview> {
  const customers = await getAllCustomers()
  const members = evaluateSegment(definition, customers)
  return {
    memberCount: members.length,
    totalCustomers: customers.length,
    sample: members.slice(0, PREVIEW_SAMPLE_SIZE),
  }
}

/** Distinct outlets/tags present in customer data, for the builder's value pickers. */
export async function getSegmentFieldOptions(): Promise<SegmentFieldOptions> {
  const customers = await getAllCustomers()
  const distinct = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b))
  return {
    outlets: distinct(customers.flatMap((c) => c.preferredOutlets)),
    preferenceTags: distinct(customers.flatMap((c) => c.preferenceTags)),
  }
}

function assertUniqueName(name: string, exceptId?: string) {
  const taken = getSegmentStore().some(
    (s) => s.id !== exceptId && s.name.trim().toLowerCase() === name.trim().toLowerCase(),
  )
  if (taken) throw new Error('A segment with this name already exists.')
}

function assertCustom(id: string): Segment {
  const existing = getSegmentStore().find((s) => s.id === id)
  if (!existing) throw new Error('Segment not found.')
  if (existing.kind === 'prebuilt') throw new Error('Pre-built segments cannot be changed.')
  return existing
}

/**
 * In-memory mock store only — lost on reload. A new segment has no
 * lastCalculatedAt until the next nightly run (Book 3 §10).
 */
export async function createSegment(input: SegmentInput): Promise<Segment> {
  await getAllCustomers()
  assertUniqueName(input.name)
  const now = new Date().toISOString()
  const segment: Segment = {
    id: `seg-${Date.now()}`,
    name: input.name.trim(),
    description: input.description.trim(),
    kind: 'custom',
    match: input.match,
    rules: input.rules,
    createdAt: now,
    updatedAt: now,
    lastCalculatedAt: null,
  }
  addSegmentToStore(segment)
  return segment
}

/** Editing rules invalidates the last calculation until the next nightly run. */
export async function updateSegment(id: string, input: SegmentInput): Promise<Segment> {
  await getAllCustomers()
  const existing = assertCustom(id)
  assertUniqueName(input.name, id)
  const segment: Segment = {
    ...existing,
    name: input.name.trim(),
    description: input.description.trim(),
    match: input.match,
    rules: input.rules,
    updatedAt: new Date().toISOString(),
    lastCalculatedAt: null,
  }
  replaceSegmentInStore(segment)
  return segment
}

export async function deleteSegment(id: string): Promise<void> {
  await getAllCustomers()
  assertCustom(id)
  removeSegmentFromStore(id)
}
