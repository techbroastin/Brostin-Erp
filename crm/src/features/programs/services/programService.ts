import type {
  Program,
  ProgramInput,
  ProgramOutcome,
  ProgramEvent,
  ProgramPerformance,
  ProgramStatus,
  ProgramSummary,
} from '@/features/programs/types/program'
import { COST_OWNER_LABELS, STATUS_LABELS } from '@/features/programs/types/program'
import { getProgramStore, setProgramStore } from '@/features/programs/mock/programs.mock'
import { describeReward, describeTrigger, evaluateVisit, publishProblems } from '@/features/programs/utils/programRules'
import { getSegmentDetail, listSegments } from '@/features/segments/services/segmentService'
import { getRewards, listLoyaltyActivity } from '@/features/loyalty/services/loyaltyService'
import { getCustomerById } from '@/features/customers/services/customerService'
import { recordAudit } from '@/features/audit/services/auditService'
import { requirePermission } from '@/features/auth/services/authService'

/**
 * Book 3 §2 Program Engine (MVP: loyalty programs). Programs are
 * configured and published here; the runtime evaluation of real visits
 * needs the POS/QR order feed (backend phase) — until then "Try a
 * visit" shows what would apply. Mock store, session-only.
 */

async function withNames(programs: Program[]): Promise<ProgramSummary[]> {
  const [segments, rewards] = await Promise.all([listSegments(), getRewards()])
  const segmentNames = new Map(segments.map((s) => [s.id, s.name]))
  return programs.map((p) => {
    const reward = p.reward
    return {
      ...p,
      segmentName: p.segmentId ? (segmentNames.get(p.segmentId) ?? null) : null,
      rewardName: reward.type === 'catalogue_reward' ? (rewards.find((r) => r.id === reward.rewardId)?.name ?? null) : null,
    }
  })
}

const STATUS_ORDER: Record<ProgramStatus, number> = { active: 0, paused: 1, draft: 2, archived: 3 }

export async function listPrograms(status: ProgramStatus | 'all' = 'all'): Promise<ProgramSummary[]> {
  const programs = getProgramStore().filter((p) => status === 'all' || p.status === status)
  return (await withNames(programs)).sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name),
  )
}

export async function getProgram(id: string): Promise<ProgramSummary | null> {
  const program = getProgramStore().find((p) => p.id === id)
  if (!program) {
    await listSegments()
    return null
  }
  const [summary] = await withNames([program])
  return summary
}

function find(id: string): Program {
  const program = getProgramStore().find((p) => p.id === id)
  if (!program) throw new Error('Program not found.')
  return program
}

function assertUniqueName(name: string, exceptId?: string) {
  if (getProgramStore().some((p) => p.id !== exceptId && p.name.trim().toLowerCase() === name.trim().toLowerCase())) {
    throw new Error('A program with this name already exists.')
  }
}

/** "Can't combine with" is symmetric: saving one side updates the others. */
function syncExclusivity(programs: Program[], id: string, exclusiveWith: string[]): Program[] {
  return programs.map((p) => {
    if (p.id === id) return p
    const shouldList = exclusiveWith.includes(p.id)
    const listed = p.exclusiveWith.includes(id)
    if (shouldList === listed) return p
    return { ...p, exclusiveWith: shouldList ? [...p.exclusiveWith, id] : p.exclusiveWith.filter((x) => x !== id) }
  })
}

function auditSummary(p: Pick<Program, 'trigger' | 'visitInterval' | 'reward' | 'costOwner'>) {
  return `${describeTrigger(p)} · ${describeReward(p.reward)} · ${p.costOwner ? COST_OWNER_LABELS[p.costOwner] : 'cost owner not set'}`
}

export async function createProgram(input: ProgramInput): Promise<Program> {
  requirePermission('loyalty')
  await listSegments()
  assertUniqueName(input.name)
  const now = new Date().toISOString()
  const program: Program = { ...input, id: `prog-${Date.now()}`, status: 'draft', createdAt: now, updatedAt: now }
  setProgramStore(syncExclusivity([...getProgramStore(), program], program.id, program.exclusiveWith))
  recordAudit({
    category: 'marketing',
    action: 'Created program',
    target: { type: 'program', id: program.id, label: program.name, href: `/loyalty/programs/${program.id}` },
    changes: [{ field: 'Rule', from: '—', to: auditSummary(program) }],
  })
  return program
}

/** Draft and paused programs can be edited; active ones must be paused first, archived ones are final. */
export async function updateProgram(id: string, input: ProgramInput): Promise<Program> {
  requirePermission('loyalty')
  await listSegments()
  const existing = find(id)
  if (existing.status === 'active') throw new Error('Pause this program before editing it.')
  if (existing.status === 'archived') throw new Error('Archived programs can’t be edited.')
  assertUniqueName(input.name, id)
  const updated: Program = { ...existing, ...input, updatedAt: new Date().toISOString() }
  setProgramStore(syncExclusivity(getProgramStore().map((p) => (p.id === id ? updated : p)), id, updated.exclusiveWith))
  const changes = [
    { field: 'Name', from: existing.name, to: updated.name },
    { field: 'Rule', from: auditSummary(existing), to: auditSummary(updated) },
  ].filter((c) => c.from !== c.to)
  recordAudit({
    category: 'marketing',
    action: 'Edited program',
    target: { type: 'program', id, label: updated.name, href: `/loyalty/programs/${id}` },
    changes,
  })
  return updated
}

export async function getProgramProblems(id: string): Promise<string[]> {
  await listSegments()
  return publishProblems(find(id), getProgramStore().map((p) => p.id))
}

const ALLOWED: Record<ProgramStatus, ProgramStatus[]> = {
  draft: ['active', 'archived'],
  active: ['paused'],
  paused: ['active', 'archived'],
  archived: [],
}

/**
 * Book 3 §2 lifecycle: Draft → Active ⇄ Paused → Archived. Going live
 * passes the publish gate (cost owner is a hard requirement). Archived
 * is final.
 */
export async function setProgramStatus(id: string, status: ProgramStatus): Promise<Program> {
  requirePermission('loyalty')
  await listSegments()
  const existing = find(id)
  if (!ALLOWED[existing.status].includes(status)) {
    throw new Error(`A ${STATUS_LABELS[existing.status].toLowerCase()} program can’t be ${STATUS_LABELS[status].toLowerCase()}.`)
  }
  if (status === 'active') {
    const problems = publishProblems(existing, getProgramStore().map((p) => p.id))
    if (problems.length > 0) throw new Error(problems.join(' '))
  }
  const updated: Program = { ...existing, status, updatedAt: new Date().toISOString() }
  setProgramStore(getProgramStore().map((p) => (p.id === id ? updated : p)))
  recordAudit({
    category: 'marketing',
    action: `${status === 'active' ? 'Published' : STATUS_LABELS[status]} program`,
    target: { type: 'program', id, label: existing.name, href: `/loyalty/programs/${id}` },
    changes: [{ field: 'Status', from: STATUS_LABELS[existing.status], to: STATUS_LABELS[status] }],
  })
  return updated
}

/**
 * "Try a visit": which active programs would reward this customer on a
 * visit like this. Nothing is awarded or sent.
 */
export async function simulateVisit(event: ProgramEvent): Promise<ProgramOutcome[]> {
  const customer = await getCustomerById(event.customerId)
  if (!customer) throw new Error('Customer not found.')
  const programs = getProgramStore()
  const segmentIds = [...new Set(programs.map((p) => p.segmentId).filter((id): id is string => id !== null))]
  const [details, rewards] = await Promise.all([Promise.all(segmentIds.map((id) => getSegmentDetail(id))), getRewards()])
  const members = new Map(
    segmentIds.map((id, i) => [id, new Set((details[i]?.members ?? []).map((c) => c.id))] as const),
  )
  return evaluateVisit(programs, customer, event, members, rewards)
}

/**
 * Book 3 §2 "Program Detail (performance dashboard)": what this program
 * has awarded so far, read from the loyalty points ledger — so it always
 * agrees with Loyalty → Activity and Customer Balances.
 */
export async function getProgramPerformance(id: string): Promise<ProgramPerformance> {
  const { items } = await listLoyaltyActivity({ search: '', page: 1, pageSize: 100_000, programId: id })
  return {
    timesApplied: items.length,
    customersRewarded: new Set(items.map((e) => e.customerId)).size,
    pointsAwarded: items.reduce((sum, e) => sum + e.points, 0),
    // listLoyaltyActivity returns newest first.
    lastAppliedAt: items[0]?.createdAt ?? null,
  }
}
