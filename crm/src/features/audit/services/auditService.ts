import type { AuditActor, AuditEntry, AuditEntryInput, AuditListParams } from '@/features/audit/types/audit'
import { appendAuditEntry, getAuditStore } from '@/features/audit/mock/audit.mock'
import { getSession } from '@/features/auth/services/sessionStore'

const SIMULATED_LATENCY_MS = 500
/** Repeat views of the same record by the same person within this window are logged once. */
const VIEW_DEDUPE_MS = 5 * 60 * 1000

let nextId = 1

/**
 * Book 3 §14 Audit Engine. Other features call recordAudit() after a
 * successful change; nothing here can edit or delete an entry. Imports
 * only the auth session store (itself a leaf) for "who did it", so any
 * service can use it without circular imports.
 */
const SIGNED_OUT_ACTOR: AuditActor = { id: 'signed-out', name: 'Signed-out user', roleLabel: '—' }

/** The signed-in person, with their role at the time of the action. */
function currentActor(): AuditActor {
  const session = getSession()
  return session ? { id: session.userId, name: session.name, roleLabel: session.roleLabel } : SIGNED_OUT_ACTOR
}

export function recordAudit(input: AuditEntryInput): AuditEntry {
  const entry: AuditEntry = {
    id: `aud-${Date.now()}-${nextId++}`,
    at: new Date().toISOString(),
    actor: currentActor(),
    ...input,
  }
  appendAuditEntry(entry)
  return entry
}

/**
 * Logs that a record was viewed, unless the same person viewed it in
 * the last few minutes — page refreshes and refetches would otherwise
 * flood the log.
 */
export function recordView(input: AuditEntryInput): void {
  const cutoff = Date.now() - VIEW_DEDUPE_MS
  const recent = getAuditStore().some(
    (e) =>
      e.actor.id === currentActor().id &&
      e.action === input.action &&
      e.target.id === input.target.id &&
      new Date(e.at).getTime() >= cutoff,
  )
  if (!recent) recordAudit(input)
}

/** Builds the from/to list for the fields that actually changed. */
export function diffFields<T extends Record<string, unknown>>(
  before: T,
  after: T,
  labels: Partial<Record<keyof T, string>>,
  format: (value: unknown) => string = (v) => (v === null || v === undefined || v === '' ? '—' : String(v)),
): AuditEntry['changes'] {
  return (Object.keys(labels) as (keyof T)[])
    .filter((key) => format(before[key]) !== format(after[key]))
    .map((key) => ({ field: labels[key] as string, from: format(before[key]), to: format(after[key]) }))
}

export async function listAuditEntries(params: AuditListParams, scenario: 'normal' | 'error' = 'normal'): Promise<AuditEntry[]> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
  if (scenario === 'error') throw new Error('Failed to load the audit log.')
  const search = params.search.trim().toLowerCase()
  return getAuditStore()
    .filter((e) => params.category === 'all' || e.category === params.category)
    .filter(
      (e) =>
        !search ||
        e.actor.name.toLowerCase().includes(search) ||
        e.action.toLowerCase().includes(search) ||
        e.target.label.toLowerCase().includes(search),
    )
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}
