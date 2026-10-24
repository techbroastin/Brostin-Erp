import type { AuditCategory, AuditEntry } from '@/features/audit/types/audit'

export const AUDIT_CATEGORY_LABELS: Record<AuditCategory, string> = {
  customer_data: 'Customer data',
  marketing: 'Marketing',
  settings: 'Settings',
  user_access: 'Users & access',
}

export function auditEntriesToCsv(entries: AuditEntry[]): string {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const header = ['When', 'Who', 'Role', 'Category', 'Action', 'Target', 'Changes']
  const rows = entries.map((e) =>
    [
      e.at,
      e.actor.name,
      e.actor.roleLabel,
      AUDIT_CATEGORY_LABELS[e.category],
      e.action,
      e.target.label,
      e.changes.map((c) => `${c.field}: ${c.from} → ${c.to}`).join('; '),
    ]
      .map(escape)
      .join(','),
  )
  return [header.join(','), ...rows].join('\n')
}
