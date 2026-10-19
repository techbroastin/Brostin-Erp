import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileSettingsContent } from '@/features/settings/components/mobile/MobileSettingsContent'
import { DesktopNotificationsSettingsContent } from '@/features/settings/components/desktop/DesktopNotificationsSettingsContent'

/** Notifications Settings route element — /settings/notifications. */
export function SettingsNotificationsScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopNotificationsSettingsContent /> : <MobileSettingsContent />
}
