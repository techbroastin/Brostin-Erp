import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { ActivityList, ActivityListSkeleton } from '@/features/dashboard/components/shared/ActivityList'
import { AlertList, AlertListSkeleton } from '@/features/dashboard/components/shared/AlertList'
import { Panel } from '@/features/dashboard/components/shared/DashboardPanels'
import { DashboardKpiTile } from '@/features/dashboard/components/shared/DashboardKpiTile'
import type { DashboardSummary } from '@/features/dashboard/types/dashboard'

function greeting(hour: number): string {
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

/**
 * Mobile Dashboard — docs/MOBILE_UI_SPEC.md §9. Single vertical stack:
 * Today's Summary → Priority Actions → Important Activity → Alerts.
 * Look follows the owner's mobile UI reference image (red greeting hero,
 * white tiles); content and actions are the existing dashboard's only.
 * Structurally independent from DesktopDashboardContent.
 */
export function MobileDashboardContent({
  summary,
  isLoading,
}: {
  summary: DashboardSummary | undefined
  isLoading: boolean
}) {
  const [now] = useState(() => new Date())

  return (
    <div className="flex flex-col gap-4 pb-4">
      <section className="rounded-b-3xl bg-gradient-to-b from-brand-primary to-brand-primary-deep px-4 pt-4 pb-5 text-white">
        <p className="text-h3 font-extrabold">{greeting(now.getHours())}, Arjun!</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-body-sm text-white/85">
            {now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <span className="rounded-full bg-white px-2 py-0.5">
            <DemoDataBadge />
          </span>
        </div>

        <h2 className="mt-4 text-card-title font-bold">Today's Summary</h2>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {isLoading
            ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl bg-white/20" />)
            : summary?.kpis.map((kpi) => <DashboardKpiTile key={kpi.id} kpi={kpi} compact />)}
        </div>
      </section>

      <div className="flex flex-col gap-4 px-4">
        <section className="flex flex-col gap-2">
          <h2 className="text-card-title font-bold">Priority Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/customers', label: 'Find Customer', icon: Users },
              { to: '/orders', label: 'Orders', icon: ClipboardList },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex min-h-14 items-center gap-2.5 rounded-2xl bg-card px-3 text-body-sm font-medium shadow-[0_1px_3px_rgba(16,24,40,0.06)]"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                  <Icon className="size-4" />
                </span>
                {label}
              </Link>
            ))}
          </div>
        </section>

        <Panel title="Important Activity">
          {isLoading ? <ActivityListSkeleton /> : <ActivityList items={summary?.activity ?? []} />}
        </Panel>

        <Panel title="Alerts" titleClassName="text-brand-primary">
          {isLoading ? <AlertListSkeleton /> : <AlertList items={summary?.alerts ?? []} />}
        </Panel>
      </div>
    </div>
  )
}
