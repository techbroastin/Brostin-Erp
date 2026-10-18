import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileQrSettingsContent } from '@/features/qr/components/mobile/MobileQrSettingsContent'
import { DesktopQrSettingsContent } from '@/features/qr/components/desktop/DesktopQrSettingsContent'

/** QR Settings route element — /qr/settings. */
export function QrSettingsScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopQrSettingsContent /> : <MobileQrSettingsContent />
}
