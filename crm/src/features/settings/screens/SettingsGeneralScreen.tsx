import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileSettingsContent } from '@/features/settings/components/mobile/MobileSettingsContent'
import { DesktopGeneralSettingsContent } from '@/features/settings/components/desktop/DesktopGeneralSettingsContent'

/** General Settings route element — /settings/general. */
export function SettingsGeneralScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopGeneralSettingsContent /> : <MobileSettingsContent />
}
