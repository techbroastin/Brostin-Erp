import type {
  GeneralSettings,
  SettingsUser,
  NotificationPreference,
  IntegrationStatus,
} from '@/features/settings/types/settings'

/**
 * Settings mock data — the single feature-local mock source, per
 * docs/FRONTEND_ARCHITECTURE.md §6/§16. Only
 * src/features/settings/services/settingsService.ts may import this
 * file.
 *
 * General settings, users and notification preferences are mutable in
 * memory, same discipline as campaigns.mock.ts/automation.mock.ts —
 * session-only, lost on reload. Integrations is a static, non-mutable
 * list (nothing is configurable yet).
 *
 * Illustrative placeholders only — not real business records. See
 * DemoDataBadge wherever this data renders.
 */

let generalSettings: GeneralSettings = {
  businessName: 'Broastin',
  contactEmail: 'hello@broastin.example',
  contactPhone: '+91 97000 00000',
}

export function getGeneralSettingsStore(): GeneralSettings {
  return generalSettings
}

export function setGeneralSettingsStore(next: GeneralSettings): GeneralSettings {
  generalSettings = next
  return generalSettings
}

let users: SettingsUser[] = [
  { id: 'user-001', name: 'Arjun Nair', email: 'arjun@broastin.example', role: 'admin' },
  { id: 'user-002', name: 'Divya Menon', email: 'divya@broastin.example', role: 'manager' },
]

export function getUsersStore(): SettingsUser[] {
  return users
}

export function addUserToStore(user: SettingsUser): void {
  users = [...users, user]
}

export function removeUserFromStore(id: string): void {
  users = users.filter((u) => u.id !== id)
}

let notificationPreferences: NotificationPreference[] = [
  { id: 'notif-new-order', label: 'New order placed', enabled: true },
  { id: 'notif-low-stock', label: 'Low stock alert', enabled: false },
  { id: 'notif-feedback', label: 'New customer feedback', enabled: true },
]

export function getNotificationPreferencesStore(): NotificationPreference[] {
  return notificationPreferences
}

export function setNotificationPreferenceInStore(id: string, enabled: boolean): void {
  notificationPreferences = notificationPreferences.map((p) => (p.id === id ? { ...p, enabled } : p))
}

/** Static — nothing is configurable until the relevant integration is defined. */
export const integrationStatuses: IntegrationStatus[] = [
  { id: 'manageme', name: 'ManageMe' },
  { id: 'qr-ordering', name: 'QR Ordering' },
]

export const ERROR_SCENARIO_FLAG = 'error'

export type SettingsMockScenario = 'normal' | typeof ERROR_SCENARIO_FLAG
