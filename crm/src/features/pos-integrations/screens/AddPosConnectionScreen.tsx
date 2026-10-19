import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileSettingsContent } from '@/features/settings/components/mobile/MobileSettingsContent'
import { DesktopAddPosConnectionContent } from '@/features/pos-integrations/components/desktop/DesktopAddPosConnectionContent'

/** Add Connection route element — /settings/integrations/new. Not a menu item. */
export function AddPosConnectionScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopAddPosConnectionContent /> : <MobileSettingsContent />
}
