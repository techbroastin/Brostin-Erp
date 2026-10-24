import type { AuditActor, AuditEntry } from '@/features/audit/types/audit'

/**
 * Audit mock data — the single feature-local mock source, per
 * docs/FRONTEND_ARCHITECTURE.md §6/§16. Only
 * src/features/audit/services/auditService.ts may import this file.
 *
 * APPEND-ONLY: this module exports a way to add entries and to read
 * them, and nothing to edit or remove them (Book 3 §14: immutable log).
 * Entries are frozen when stored. Session-only — lost on reload.
 *
 * There is no sign-in yet (that is the Authentication phase), so every
 * action in this session is attributed to DEMO_ACTOR.
 */

export const DEMO_ACTOR: AuditActor = { id: 'user-001', name: 'Arjun Nair', roleLabel: 'Owner' }

const HOUR_MS = 60 * 60 * 1000

function seedEntries(): AuditEntry[] {
  const now = Date.now()
  const divya: AuditActor = { id: 'user-002', name: 'Divya Menon', roleLabel: 'Manager' }
  const entry = (hoursAgo: number, rest: Omit<AuditEntry, 'id' | 'at'>, n: number): AuditEntry => ({
    id: `aud-seed-${n}`,
    at: new Date(now - hoursAgo * HOUR_MS).toISOString(),
    ...rest,
  })
  return [
    entry(
      200,
      {
        actor: DEMO_ACTOR,
        category: 'user_access',
        action: 'Added user',
        target: { type: 'user', id: 'user-002', label: 'Divya Menon', href: '/settings/users' },
        changes: [{ field: 'Role', from: '—', to: 'Manager' }],
      },
      1,
    ),
    entry(
      150,
      {
        actor: DEMO_ACTOR,
        category: 'settings',
        action: 'Updated messaging rules',
        target: { type: 'settings', id: 'messaging-rules', label: 'Customer messaging rules', href: '/settings/notifications' },
        changes: [{ field: 'Weekly limit', from: '3', to: '2' }],
      },
      2,
    ),
    entry(
      30,
      {
        actor: divya,
        category: 'customer_data',
        action: 'Viewed customer profile',
        target: { type: 'customer', id: 'cust-004', label: 'Fathima Noor', href: '/customers/cust-004' },
        changes: [],
      },
      3,
    ),
    entry(
      6,
      {
        actor: divya,
        category: 'customer_data',
        action: 'Exported customer timeline',
        target: { type: 'customer', id: 'cust-004', label: 'Fathima Noor', href: '/customers/cust-004' },
        changes: [],
      },
      4,
    ),
  ].map((e) => Object.freeze(e))
}

const auditStore: AuditEntry[] = seedEntries()

export function getAuditStore(): readonly AuditEntry[] {
  return auditStore
}

export function appendAuditEntry(entry: AuditEntry): void {
  auditStore.push(Object.freeze({ ...entry, changes: Object.freeze([...entry.changes]) as AuditEntry['changes'] }))
}
