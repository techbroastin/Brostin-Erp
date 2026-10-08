import { LineChart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/features/dashboard/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton } from '@/features/dashboard/components/shared/KpiCard'
import { ActivityList, ActivityListSkeleton } from '@/features/dashboard/components/shared/ActivityList'
import { AlertList, AlertListSkeleton } from '@/features/dashboard/components/shared/AlertList'
import type { DashboardSummary } from '@/features/dashboard/types/dashboard'

/**
 * Desktop Dashboard — docs/DESKTOP_UI_SPEC.md §8. Multi-column widget
 * grid: KPI row; trend/chart placeholder + alerts/priority; activity feed
 * + secondary widget. Structurally independent from
 * MobileDashboardContent — not an enlarged version of it.
 */
export function DesktopDashboardContent({
  summary,
  isLoading,
}: {
  summary: DashboardSummary | undefined
  isLoading: boolean
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Dashboard</h1>
        <DemoDataBadge />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {isLoading
          ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
          : summary?.kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border text-center text-muted-foreground">
              <LineChart className="size-6" />
              <p className="max-w-xs text-body-sm">
                Charting library not yet selected — see docs/FRONTEND_ARCHITECTURE.md §2.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <AlertListSkeleton /> : <AlertList items={summary?.alerts ?? []} />}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <ActivityListSkeleton /> : <ActivityList items={summary?.activity ?? []} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loyalty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm text-muted-foreground">
              Loyalty summary lands with the Loyalty module (see docs/IMPLEMENTATION_PLAN.md Phase 9).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
