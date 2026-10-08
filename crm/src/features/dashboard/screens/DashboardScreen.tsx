import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { MobileDashboardContent } from '@/features/dashboard/components/mobile/MobileDashboardContent'
import { DesktopDashboardContent } from '@/features/dashboard/components/desktop/DesktopDashboardContent'
import { DashboardErrorState } from '@/features/dashboard/components/shared/DashboardErrorState'

/**
 * Dashboard route element. Picks between the two independent Dashboard
 * compositions using the same viewport-split pattern RootLayout already
 * uses for the shells — not a new mechanism.
 */
export function DashboardScreen() {
  const isDesktop = useIsDesktopViewport()
  const { data, isPending, isError, refetch } = useDashboardSummary()

  if (isError) {
    return <DashboardErrorState onRetry={() => refetch()} />
  }

  return isDesktop ? (
    <DesktopDashboardContent summary={data} isLoading={isPending} />
  ) : (
    <MobileDashboardContent summary={data} isLoading={isPending} />
  )
}
