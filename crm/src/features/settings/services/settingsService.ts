import type {
  GeneralSettings,
  SettingsUser,
  NotificationPreference,
  AddSettingsUserInput,
  MessagingRules,
  SettingsUserRole,
} from '@/features/settings/types/settings'
import { MESSAGE_CHANNEL_LABELS, ROLE_LABELS } from '@/features/settings/types/settings'
import { diffFields, recordAudit } from '@/features/audit/services/auditService'
import { requirePermission } from '@/features/auth/services/authService'
import { getSession, notifySessionChanged } from '@/features/auth/services/sessionStore'
import {
  getGeneralSettingsStore,
  setGeneralSettingsStore,
  getUsersStore,
  addUserToStore,
  removeUserFromStore,
  setUserRoleInStore,
  getNotificationPreferencesStore,
  setNotificationPreferenceInStore,
  getMessagingRulesStore,
  setMessagingRulesStore,
  ERROR_SCENARIO_FLAG,
  type SettingsMockScenario,
} from '@/features/settings/mock/settings.mock'

const SIMULATED_LATENCY_MS = 500

function delay() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
}

/**
 * No function exists here for Integrations or System — both are
 * static placeholders with nothing to fetch or mutate, so they are
 * rendered directly by their components rather than routed through a
 * fabricated async round-trip.
 */

export async function getGeneralSettings(
  scenario: SettingsMockScenario = 'normal',
): Promise<GeneralSettings> {
  await delay()
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load general settings.')
  }
  return getGeneralSettingsStore()
}

export async function updateGeneralSettings(input: GeneralSettings): Promise<GeneralSettings> {
  await delay()
  requirePermission('settings')
  const before = getGeneralSettingsStore()
  const saved = setGeneralSettingsStore(input)
  const changes = diffFields(before, saved, {
    businessName: 'Business name',
    contactEmail: 'Contact email',
    contactPhone: 'Contact phone',
    publicReviewUrl: 'Public review link',
  })
  if (changes.length > 0) {
    recordAudit({
      category: 'settings',
      action: 'Updated general settings',
      target: { type: 'settings', id: 'general', label: 'General settings', href: '/settings/general' },
      changes,
    })
  }
  return saved
}

export async function listSettingsUsers(
  scenario: SettingsMockScenario = 'normal',
): Promise<SettingsUser[]> {
  await delay()
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load users.')
  }
  return getUsersStore()
}

/**
 * Synchronous lookups for sign-in (features/auth) — no simulated
 * latency, since the auth check runs on every change.
 */
export function findSettingsUserById(id: string): SettingsUser | null {
  return getUsersStore().find((u) => u.id === id) ?? null
}

export function findSettingsUserByEmail(email: string): SettingsUser | null {
  const wanted = email.trim().toLowerCase()
  return getUsersStore().find((u) => u.email.toLowerCase() === wanted) ?? null
}

export async function addSettingsUser(input: AddSettingsUserInput): Promise<SettingsUser> {
  await delay()
  requirePermission('settings')
  // The email is the sign-in name, so it must be unique.
  if (findSettingsUserByEmail(input.email)) {
    throw new Error(`A user with the email ${input.email.trim()} already exists.`)
  }
  const user: SettingsUser = {
    id: `user-${Date.now()}`,
    name: input.name,
    email: input.email,
    role: input.role,
  }
  addUserToStore(user)
  recordAudit({
    category: 'user_access',
    action: 'Added user',
    target: { type: 'user', id: user.id, label: user.name, href: '/settings/users' },
    changes: [{ field: 'Role', from: '—', to: ROLE_LABELS[user.role] }],
  })
  return user
}

/** Every business needs at least one Owner, so the last one can't be removed or demoted. */
function assertNotLastOwner(user: SettingsUser) {
  if (user.role === 'owner' && getUsersStore().filter((u) => u.role === 'owner').length === 1) {
    throw new Error('There must always be at least one Owner.')
  }
}

export async function updateSettingsUserRole(id: string, role: SettingsUserRole): Promise<SettingsUser> {
  await delay()
  const user = getUsersStore().find((u) => u.id === id)
  requirePermission('settings')
  if (!user) throw new Error('User not found.')
  if (user.role === role) return user
  if (role !== 'owner') assertNotLastOwner(user)
  const updated = setUserRoleInStore(id, role) as SettingsUser
  // The signed-in user's own access may have just changed.
  notifySessionChanged()
  recordAudit({
    category: 'user_access',
    action: 'Changed user role',
    target: { type: 'user', id, label: user.name, href: '/settings/users' },
    changes: [{ field: 'Role', from: ROLE_LABELS[user.role], to: ROLE_LABELS[role] }],
  })
  return updated
}

export async function removeSettingsUser(id: string): Promise<void> {
  await delay()
  requirePermission('settings')
  const user = getUsersStore().find((u) => u.id === id)
  if (!user) return
  if (getSession()?.userId === id) throw new Error("You can't remove your own account.")
  assertNotLastOwner(user)
  removeUserFromStore(id)
  notifySessionChanged()
  recordAudit({
    category: 'user_access',
    action: 'Removed user',
    target: { type: 'user', id, label: user.name },
    changes: [{ field: 'Role', from: ROLE_LABELS[user.role], to: '—' }],
  })
}

export async function listNotificationPreferences(
  scenario: SettingsMockScenario = 'normal',
): Promise<NotificationPreference[]> {
  await delay()
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load notification preferences.')
  }
  return getNotificationPreferencesStore()
}

export async function updateNotificationPreference(
  id: string,
  enabled: boolean,
): Promise<NotificationPreference[]> {
  await delay()
  requirePermission('settings')
  const pref = getNotificationPreferencesStore().find((p) => p.id === id)
  setNotificationPreferenceInStore(id, enabled)
  if (pref && pref.enabled !== enabled) {
    recordAudit({
      category: 'settings',
      action: enabled ? 'Turned on staff alert' : 'Turned off staff alert',
      target: { type: 'settings', id, label: pref.label, href: '/settings/notifications' },
      changes: [{ field: 'Enabled', from: pref.enabled ? 'On' : 'Off', to: enabled ? 'On' : 'Off' }],
    })
  }
  return getNotificationPreferencesStore()
}

export async function getMessagingRules(scenario: SettingsMockScenario = 'normal'): Promise<MessagingRules> {
  await delay()
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load messaging rules.')
  }
  return getMessagingRulesStore()
}

const describeChannels = (rules: MessagingRules) =>
  rules.channelOrder.filter((c) => c.enabled).map((c) => MESSAGE_CHANNEL_LABELS[c.channel]).join(' → ') || 'None'

export async function updateMessagingRules(rules: MessagingRules): Promise<MessagingRules> {
  await delay()
  requirePermission('settings')
  const before = getMessagingRulesStore()
  const saved = setMessagingRulesStore(rules)
  const changes = diffFields(
    { weeklyCap: before.weeklyCapPerCustomer, channels: describeChannels(before) },
    { weeklyCap: saved.weeklyCapPerCustomer, channels: describeChannels(saved) },
    { weeklyCap: 'Weekly limit', channels: 'Channel order' },
  )
  if (changes.length > 0) {
    recordAudit({
      category: 'settings',
      action: 'Updated messaging rules',
      target: { type: 'settings', id: 'messaging-rules', label: 'Customer messaging rules', href: '/settings/notifications' },
      changes,
    })
  }
  return saved
}
