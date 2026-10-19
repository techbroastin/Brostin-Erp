import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileSettingsContent } from '@/features/settings/components/mobile/MobileSettingsContent'
import { DesktopUsersSettingsContent } from '@/features/settings/components/desktop/DesktopUsersSettingsContent'

/** Users Settings route element — /settings/users. */
export function SettingsUsersScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopUsersSettingsContent /> : <MobileSettingsContent />
}
