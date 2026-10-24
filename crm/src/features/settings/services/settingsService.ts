import type {
  GeneralSettings,
  SettingsUser,
  NotificationPreference,
  AddSettingsUserInput,
  MessagingRules,
} from '@/features/settings/types/settings'
import {
  getGeneralSettingsStore,
  setGeneralSettingsStore,
  getUsersStore,
  addUserToStore,
  removeUserFromStore,
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
  return setGeneralSettingsStore(input)
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

export async function addSettingsUser(input: AddSettingsUserInput): Promise<SettingsUser> {
  await delay()
  const user: SettingsUser = {
    id: `user-${Date.now()}`,
    name: input.name,
    email: input.email,
    role: input.role,
  }
  addUserToStore(user)
  return user
}

export async function removeSettingsUser(id: string): Promise<void> {
  await delay()
  removeUserFromStore(id)
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
  setNotificationPreferenceInStore(id, enabled)
  return getNotificationPreferencesStore()
}

export async function getMessagingRules(scenario: SettingsMockScenario = 'normal'): Promise<MessagingRules> {
  await delay()
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load messaging rules.')
  }
  return getMessagingRulesStore()
}

export async function updateMessagingRules(rules: MessagingRules): Promise<MessagingRules> {
  await delay()
  return setMessagingRulesStore(rules)
}
