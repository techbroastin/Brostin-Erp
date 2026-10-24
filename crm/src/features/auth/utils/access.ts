import { navigationModules, type NavModule } from '@/app/navigation'
import { ROLE_PERMISSIONS, type AccessLevel, type PermissionArea } from '@/features/settings/utils/permissions'
import type { SettingsUserRole } from '@/features/settings/types/settings'

const MODULE_AREAS: Record<string, PermissionArea> = {
  dashboard: 'dashboard',
  customers: 'customers',
  orders: 'orders',
  loyalty: 'loyalty',
  campaigns: 'campaigns',
  automation: 'automation',
  feedback: 'feedback',
  referrals: 'referrals',
  membership: 'membership',
  qr: 'qr',
  analytics: 'analytics',
  settings: 'settings',
}

/**
 * Which permission area a CRM path belongs to (Book 3 §14 matrix,
 * utils/permissions.ts). Segments live under /customers and the Audit
 * Log under /settings but have their own rows in the matrix. Null for
 * paths outside every module (e.g. the 404 page) — those stay open.
 */
export function areaForPath(pathname: string): PermissionArea | null {
  if (pathname === '/customers/segments' || pathname.startsWith('/customers/segments/')) return 'segments'
  if (pathname === '/settings/audit' || pathname.startsWith('/settings/audit/')) return 'audit_log'
  const first = pathname.split('/')[1] ?? ''
  return MODULE_AREAS[first] ?? null
}

/**
 * Areas with something to change. A "view only" notice is shown only
 * here — Dashboard, Orders, Feedback and the Audit Log are read-only for
 * everyone, so a notice there would be noise.
 */
export const EDITABLE_AREAS: ReadonlySet<PermissionArea> = new Set([
  'customers',
  'segments',
  'loyalty',
  'campaigns',
  'automation',
  'settings',
])

/** Pages whose only purpose is making a change (builders, editors, import, merge). */
export function isEditorPath(pathname: string): boolean {
  return /\/(new|edit|merge|import)$/.test(pathname) || /^\/campaigns\/templates\/[^/]+$/.test(pathname)
}

/** View-only roles can't open editor pages at all — there is nothing they could save there. */
export function accessFor(role: SettingsUserRole, pathname: string): AccessLevel {
  const area = areaForPath(pathname)
  const level = area ? ROLE_PERMISSIONS[role][area] : 'manage'
  return level === 'view' && isEditorPath(pathname) ? 'none' : level
}

/**
 * The menu this role may see: modules and submenu items with no access
 * are left out entirely (docs/CLAUDE.md §23: managers see the manager
 * app, admin functions stay with admins). A module is kept if its own
 * page is reachable.
 */
export function visibleModules(role: SettingsUserRole, modules: NavModule[] = navigationModules): NavModule[] {
  return modules
    .filter((m) => accessFor(role, m.path) !== 'none')
    .map((m) => (m.submenu ? { ...m, submenu: m.submenu.filter((s) => accessFor(role, s.path) !== 'none') } : m))
}
