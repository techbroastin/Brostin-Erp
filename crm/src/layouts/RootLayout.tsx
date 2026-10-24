import { Navigate, useLocation } from 'react-router-dom'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { MobileShellLayout } from '@/layouts/MobileShellLayout'
import { DesktopShellLayout } from '@/layouts/DesktopShellLayout'

/**
 * Shell selector — the one place that decides which of the two
 * INDEPENDENT shells mounts. This is a structural choice between two
 * component trees, not a responsive layout that reflows itself. There is
 * no shared "ResponsiveShell" and must never be one.
 *
 * Also the sign-in gate (docs/IMPLEMENTATION_PLAN.md §23): with no
 * signed-in user, every CRM page sends you to /sign-in and back after.
 */
export function RootLayout() {
  const isDesktop = useIsDesktopViewport()
  const user = useCurrentUser()
  const location = useLocation()
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/sign-in?next=${next}`} replace />
  }
  return isDesktop ? <DesktopShellLayout /> : <MobileShellLayout />
}
