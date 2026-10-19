import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileSettingsContent } from '@/features/settings/components/mobile/MobileSettingsContent'
import { DesktopRolesSettingsContent } from '@/features/settings/components/desktop/DesktopRolesSettingsContent'

/** Roles & Access Settings route element — /settings/roles. */
export function SettingsRolesScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopRolesSettingsContent /> : <MobileSettingsContent />
}
