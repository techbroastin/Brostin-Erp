import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileSettingsContent } from '@/features/settings/components/mobile/MobileSettingsContent'
import { DesktopSystemSettingsContent } from '@/features/settings/components/desktop/DesktopSystemSettingsContent'

/** System Settings route element — /settings/system. */
export function SettingsSystemScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopSystemSettingsContent /> : <MobileSettingsContent />
}
