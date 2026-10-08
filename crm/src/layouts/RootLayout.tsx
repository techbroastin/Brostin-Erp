import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileShellLayout } from '@/layouts/MobileShellLayout'
import { DesktopShellLayout } from '@/layouts/DesktopShellLayout'

/**
 * Shell selector — the one place that decides which of the two
 * INDEPENDENT shells mounts. This is a structural choice between two
 * component trees, not a responsive layout that reflows itself. There is
 * no shared "ResponsiveShell" and must never be one.
 */
export function RootLayout() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopShellLayout /> : <MobileShellLayout />
}
