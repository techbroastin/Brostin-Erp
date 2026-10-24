import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { ActivityList, ActivityListSkeleton } from '@/features/dashboard/components/shared/ActivityList'
import { AlertList, AlertListSkeleton } from '@/features/dashboard/components/shared/AlertList'
import { Panel } from '@/features/dashboard/components/shared/DashboardPanels'
import { DashboardKpiTile } from '@/features/dashboard/components/shared/DashboardKpiTile'
import type { DashboardSummary } from '@/features/dashboard/types/dashboard'
import { cn } from '@/lib/utils'

function greeting(hour: number): string {
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

/**
 * Desktop Dashboard — docs/DESKTOP_UI_SPEC.md §8. Multi-column widget
 * grid: KPI row; trend/chart placeholder + alerts/priority; activity feed
 * + secondary widget. Structurally independent from
 * MobileDashboardContent — not an enlarged version of it.
 *
 * Look follows the owner's desktop UI reference image; the content and
 * actions are the existing dashboard's only (requirements come from the
 * project docs / Book 3, never from the reference image).
 */
export function DesktopDashboardContent({
  summary,
  isLoading,
}: {
  summary: DashboardSummary | undefined
  isLoading: boolean
}) {
  const [now] = useState(() => new Date())

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 font-extrabold tracking-tight">{greeting(now.getHours())}, Arjun!</h1>
          <p className="mt-1 text-body text-muted-foreground">
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <DemoDataBadge />
      </div>

      <div className="grid grid-cols-2 gap-4 min-[1360px]:grid-cols-4">
        {isLoading
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : summary?.kpis.map((kpi) => <DashboardKpiTile key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Trend" className="xl:col-span-2">
          <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-center text-muted-foreground">
            <LineChart className="size-6" />
            <p className="max-w-xs text-body-sm">Charting library not yet selected — see docs/FRONTEND_ARCHITECTURE.md §2.</p>
          </div>
        </Panel>
        <Panel title="Alerts" titleClassName="text-brand-primary">
          {isLoading ? <AlertListSkeleton /> : <AlertList items={summary?.alerts ?? []} />}
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Recent Activity" className="xl:col-span-2">
          {isLoading ? <ActivityListSkeleton /> : <ActivityList items={summary?.activity ?? []} />}
        </Panel>
        <Panel title="Loyalty">
          <p className="text-body-sm text-muted-foreground">View customer points, rewards and loyalty activity.</p>
          <Link to="/loyalty" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'self-start')}>
            Open Loyalty
          </Link>
        </Panel>
      </div>
    </div>
  )
}
