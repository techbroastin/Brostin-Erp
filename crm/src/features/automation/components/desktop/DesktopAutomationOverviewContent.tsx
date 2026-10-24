import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { List, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { AutomationErrorState } from '@/features/automation/components/shared/AutomationErrorState'
import { getAutomationOverview } from '@/features/automation/services/automationService'
import { WorkflowRunLog } from '@/features/automation/components/desktop/WorkflowRunLog'

/**
 * Desktop Automation Overview — canonical docs/IMPLEMENTATION_PLAN.md
 * "Phase 16 — Automation". Status counts only — no run/execution
 * metric exists or is implied (mock-only, per §19).
 */
export function DesktopAutomationOverviewContent() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['automation', 'overview'],
    queryFn: () => getAutomationOverview(),
  })

  const kpis: KpiCardData[] = data
    ? [
        { id: 'total-workflows', label: 'Total Workflows', value: String(data.totalWorkflows) },
        { id: 'draft-count', label: 'Draft', value: String(data.draftCount) },
        { id: 'active-count', label: 'Active', value: String(data.activeCount) },
        { id: 'paused-count', label: 'Paused', value: String(data.pausedCount) },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Overview</h1>
        <DemoDataBadge />
      </div>

      {isError ? (
        <AutomationErrorState message="Couldn't load automation overview." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {isPending
              ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <p className="max-w-md text-body-sm text-muted-foreground">
            Automation is mock-only in this phase — no workflow here ever runs, monitors, or sends
            anything real. Statuses change only in this demo data.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Automation Module</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link to="/automation/workflows" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <List className="size-4" />
                Workflows
              </Link>
              <Link to="/automation/new" className={buttonVariants({ variant: 'default', size: 'sm' })}>
                <Plus className="size-4" />
                Create Workflow
              </Link>
            </CardContent>
          </Card>

          <WorkflowRunLog limit={10} />
        </>
      )}
    </div>
  )
}
