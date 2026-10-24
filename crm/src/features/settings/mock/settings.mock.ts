import type {
  GeneralSettings,
  SettingsUser,
  NotificationPreference,
  MessagingRules,
} from '@/features/settings/types/settings'

/**
 * Settings mock data — the single feature-local mock source, per
 * docs/FRONTEND_ARCHITECTURE.md §6/§16. Only
 * src/features/settings/services/settingsService.ts may import this
 * file.
 *
 * General settings, users and notification preferences are mutable in
 * memory, same discipline as campaigns.mock.ts/automation.mock.ts —
 * session-only, lost on reload. POS Integrations now has its own
 * feature-local mock store — see features/pos-integrations/mock/
 * posIntegrations.mock.ts.
 *
 * Illustrative placeholders only — not real business records. See
 * DemoDataBadge wherever this data renders.
 */

let generalSettings: GeneralSettings = {
  businessName: 'Broastin',
  contactEmail: 'hello@broastin.example',
  contactPhone: '+91 97000 00000',
  /** Not configured — no Google/Zomato URL is invented. See types/settings.ts. */
  publicReviewUrl: null,
}

export function getGeneralSettingsStore(): GeneralSettings {
  return generalSettings
}

export function setGeneralSettingsStore(next: GeneralSettings): GeneralSettings {
  generalSettings = next
  return generalSettings
}

let users: SettingsUser[] = [
  { id: 'user-001', name: 'Arjun Nair', email: 'arjun@broastin.example', role: 'owner' },
  { id: 'user-002', name: 'Divya Menon', email: 'divya@broastin.example', role: 'manager' },
  { id: 'user-003', name: 'Rahul Das', email: 'rahul@broastin.example', role: 'staff' },
  { id: 'user-004', name: 'Meera Joseph', email: 'meera@broastin.example', role: 'marketing_operator' },
]

export function getUsersStore(): SettingsUser[] {
  return users
}

export function addUserToStore(user: SettingsUser): void {
  users = [...users, user]
}

export function setUserRoleInStore(id: string, role: SettingsUser['role']): SettingsUser | null {
  let updated: SettingsUser | null = null
  users = users.map((u) => {
    if (u.id !== id) return u
    updated = { ...u, role }
    return updated
  })
  return updated
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

/** Book 3 §13 defaults: 2 messages per customer per week; WhatsApp first, then SMS, then email. */
let messagingRules: MessagingRules = {
  weeklyCapPerCustomer: 2,
  channelOrder: [
    { channel: 'whatsapp', enabled: true },
    { channel: 'sms', enabled: true },
    { channel: 'email', enabled: true },
  ],
}

export function getMessagingRulesStore(): MessagingRules {
  return messagingRules
}

export function setMessagingRulesStore(rules: MessagingRules): MessagingRules {
  messagingRules = rules
  return messagingRules
}

export const ERROR_SCENARIO_FLAG = 'error'

export type SettingsMockScenario = 'normal' | typeof ERROR_SCENARIO_FLAG
