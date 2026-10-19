import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileSettingsContent } from '@/features/settings/components/mobile/MobileSettingsContent'
import { DesktopIntegrationsSettingsContent } from '@/features/settings/components/desktop/DesktopIntegrationsSettingsContent'

/** Integrations Settings route element — /settings/integrations. */
export function SettingsIntegrationsScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopIntegrationsSettingsContent /> : <MobileSettingsContent />
}
