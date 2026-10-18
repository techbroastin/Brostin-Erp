import { Link } from 'react-router-dom'
import { Users, CreditCard, Activity as ActivityIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { MembershipErrorState } from '@/features/membership/components/shared/MembershipErrorState'
import { useMembershipOverview } from '@/features/membership/hooks/useMembershipOverview'

/**
 * Desktop Membership Overview — canonical docs/IMPLEMENTATION_PLAN.md
 * "Phase 12 — Membership" (operational Phase 9). KPI row + quick links
 * to the other three approved Membership screens. No charts/trends or
 * performance claims (no billing/renewal metric is defined —
 * docs/NAVIGATION.md §15: "Exact membership business rules NOT YET
 * FINALIZED").
 */
export function DesktopMembershipOverviewContent() {
  const { data, isPending, isError, refetch } = useMembershipOverview()

  const kpis: KpiCardData[] = data
    ? [
        { id: 'total-members', label: 'Total Members', value: String(data.totalMembers) },
        { id: 'active-members', label: 'Active', value: String(data.activeMembers) },
        { id: 'expired-members', label: 'Expired', value: String(data.expiredMembers) },
        { id: 'plans-available', label: 'Plans Available', value: String(data.plansAvailable) },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Overview</h1>
        <DemoDataBadge />
      </div>

      {isError ? (
        <MembershipErrorState message="Couldn't load membership overview." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {isPending
              ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Membership Module</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link to="/membership/members" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <Users className="size-4" />
                Members
              </Link>
              <Link to="/membership/plans" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <CreditCard className="size-4" />
                Plans
              </Link>
              <Link to="/membership/activity" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <ActivityIcon className="size-4" />
                Activity
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
