import { PosConnectionsScreen } from '@/features/pos-integrations'

/**
 * Integrations Settings route element — /settings/integrations.
 * Delegates to the POS Integrations feature (approved Phase 18b
 * multi-vendor POS Connections hub) — see features/pos-integrations.
 */
export function SettingsIntegrationsScreen() {
  return <PosConnectionsScreen />
}
