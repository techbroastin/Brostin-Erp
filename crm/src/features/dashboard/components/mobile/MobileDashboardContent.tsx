import { Link } from 'react-router-dom'
import { Users, ClipboardList } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton } from '@/features/dashboard/components/shared/KpiCard'
import { ActivityList, ActivityListSkeleton } from '@/features/dashboard/components/shared/ActivityList'
import { AlertList, AlertListSkeleton } from '@/features/dashboard/components/shared/AlertList'
import type { DashboardSummary } from '@/features/dashboard/types/dashboard'

/**
 * Mobile Dashboard — docs/MOBILE_UI_SPEC.md §9. Single vertical stack:
 * Today's Summary → Priority Actions → Important Activity → Alerts.
 * Structurally independent from DesktopDashboardContent.
 */
export function MobileDashboardContent({
  summary,
  isLoading,
}: {
  summary: DashboardSummary | undefined
  isLoading: boolean
}) {
  return (
    <div className="flex flex-col gap-6 p-4">
      <DemoDataBadge />

      <section className="flex flex-col gap-3">
        <h2 className="text-section-title font-semibold">Today's Summary</h2>
        <div className="flex flex-col gap-3">
          {isLoading
            ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
            : summary?.kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section-title font-semibold">Priority Actions</h2>
        <div className="flex gap-3">
          <Link
            to="/customers"
            className="flex flex-1 items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
          >
            <Users className="size-4 shrink-0" />
            Find Customer
          </Link>
          <Link
            to="/orders/today"
            className="flex flex-1 items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
          >
            <ClipboardList className="size-4 shrink-0" />
            Today's Orders
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section-title font-semibold">Important Activity</h2>
        <Card>
          <CardContent>
            {isLoading ? <ActivityListSkeleton /> : <ActivityList items={summary?.activity ?? []} />}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section-title font-semibold">Alerts</h2>
        <Card>
          <CardContent>
            {isLoading ? <AlertListSkeleton /> : <AlertList items={summary?.alerts ?? []} />}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
