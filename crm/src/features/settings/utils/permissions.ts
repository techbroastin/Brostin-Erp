import type { SettingsUserRole } from '@/features/settings/types/settings'

/**
 * Book 3 §14 MVP permission matrix — the owner-approved starting point
 * for the four fixed roles, at module level only (button/field-level
 * permissions are Phase 2). NOT ENFORCED yet: there is no sign-in, and
 * real enforcement must live in the backend/database (docs/CLAUDE.md
 * §23), with this table only shaping the UI.
 */

export type AccessLevel = 'manage' | 'view' | 'none'

export type PermissionArea =
  | 'dashboard'
  | 'customers'
  | 'segments'
  | 'orders'
  | 'loyalty'
  | 'feedback'
  | 'referrals'
  | 'membership'
  | 'qr'
  | 'analytics'
  | 'campaigns'
  | 'automation'
  | 'settings'
  | 'audit_log'

export const PERMISSION_AREA_LABELS: Record<PermissionArea, string> = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  segments: 'Segments',
  orders: 'Orders',
  loyalty: 'Loyalty',
  feedback: 'Feedback',
  referrals: 'Referrals',
  membership: 'Membership',
  qr: 'QR',
  analytics: 'Analytics',
  campaigns: 'Campaigns, coupons & messages',
  automation: 'Automation',
  settings: 'Settings',
  audit_log: 'Audit Log',
}

export const PERMISSION_AREAS = Object.keys(PERMISSION_AREA_LABELS) as PermissionArea[]

const M = 'manage'
const V = 'view'
const N = 'none'

export const ROLE_PERMISSIONS: Record<SettingsUserRole, Record<PermissionArea, AccessLevel>> = {
  owner: {
    dashboard: M, customers: M, segments: M, orders: M, loyalty: M, feedback: M, referrals: M,
    membership: M, qr: M, analytics: M, campaigns: M, automation: M, settings: M, audit_log: V,
  },
  manager: {
    dashboard: M, customers: M, segments: V, orders: M, loyalty: M, feedback: M, referrals: M,
    membership: M, qr: M, analytics: V, campaigns: V, automation: V, settings: N, audit_log: N,
  },
  staff: {
    dashboard: V, customers: V, segments: N, orders: V, loyalty: M, feedback: V, referrals: V,
    membership: V, qr: V, analytics: N, campaigns: N, automation: N, settings: N, audit_log: N,
  },
  marketing_operator: {
    dashboard: V, customers: V, segments: M, orders: N, loyalty: N, feedback: V, referrals: V,
    membership: N, qr: N, analytics: V, campaigns: M, automation: M, settings: N, audit_log: N,
  },
}

const RANK: Record<AccessLevel, number> = { none: 0, view: 1, manage: 2 }

/** True if `role` has at least `level` access to `area`. */
export function can(role: SettingsUserRole, area: PermissionArea, level: Exclude<AccessLevel, 'none'>): boolean {
  return RANK[ROLE_PERMISSIONS[role][area]] >= RANK[level]
}
