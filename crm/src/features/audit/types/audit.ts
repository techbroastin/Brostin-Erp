/**
 * Audit Engine domain types — Book 3 §14 (MVP: a basic action log).
 * Mock-only and session-only: no audit table exists in the backend.
 * A real audit trail must be written server-side, where the client
 * cannot skip or alter it — this frontend log is a stand-in for that.
 */

export type AuditCategory = 'customer_data' | 'marketing' | 'settings' | 'user_access'

export type AuditActor = {
  id: string
  name: string
  /** Role label at the time of the action, e.g. "Owner". */
  roleLabel: string
}

export type AuditChange = {
  field: string
  from: string
  to: string
}

export type AuditEntry = {
  id: string
  at: string
  actor: AuditActor
  category: AuditCategory
  /** Short past-tense description, e.g. "Changed user role". */
  action: string
  target: {
    type: string
    id: string
    label: string
    /** In-app link to the thing acted on, if it still has a page. */
    href?: string
  }
  changes: AuditChange[]
}

export type AuditEntryInput = Omit<AuditEntry, 'id' | 'at' | 'actor'>

export type AuditListParams = {
  search: string
  category: AuditCategory | 'all'
}
