/**
 * Settings feature types — provisional frontend view models, not the
 * Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16).
 *
 * `SettingsUserRole` is an illustrative label set only — no permission
 * matrix exists anywhere (docs/NAVIGATION.md §18: "exact permission
 * matrix NOT YET FINALIZED"). Nothing here is enforced; see
 * DesktopRolesSettingsContent's explicit disclaimer.
 */

export type GeneralSettings = {
  businessName: string
  contactEmail: string
  contactPhone: string
}

export type SettingsUserRole = 'admin' | 'manager'

export const ROLE_LABELS: Record<SettingsUserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
}

export type SettingsUser = {
  id: string
  name: string
  email: string
  role: SettingsUserRole
}

export type NotificationPreference = {
  id: string
  label: string
  enabled: boolean
}

export type AddSettingsUserInput = {
  name: string
  email: string
  role: SettingsUserRole
}
