import { Link } from 'react-router-dom'
import { Users, Activity as ActivityIcon, Gift } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { ReferralErrorState } from '@/features/referrals/components/shared/ReferralErrorState'
import { useReferralOverview } from '@/features/referrals/hooks/useReferralOverview'

/**
 * Desktop Referrals Overview — docs/IMPLEMENTATION_PLAN.md §14. KPI row +
 * quick links to the other three approved Referrals screens. No
 * charts/trends or performance claims (no historical metric or referral
 * qualification rule is defined — docs/NAVIGATION.md §14: "Exact
 * referral rules NOT YET FINALIZED").
 */
export function DesktopReferralOverviewContent() {
  const { data, isPending, isError, refetch } = useReferralOverview()

  const kpis: KpiCardData[] = data
    ? [
        { id: 'total-referrals', label: 'Total Referrals', value: String(data.totalReferrals) },
        { id: 'completed-referrals', label: 'Completed', value: String(data.completedReferrals) },
        { id: 'pending-referrals', label: 'Pending', value: String(data.pendingReferrals) },
        { id: 'rewards-available', label: 'Rewards Available', value: String(data.rewardsAvailable) },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Overview</h1>
        <DemoDataBadge />
      </div>

      {isError ? (
        <ReferralErrorState message="Couldn't load referral overview." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {isPending
              ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Referrals Module</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link to="/referrals/customers" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <Users className="size-4" />
                Customers
              </Link>
              <Link to="/referrals/activity" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <ActivityIcon className="size-4" />
                Activity
              </Link>
              <Link to="/referrals/rewards" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <Gift className="size-4" />
                Rewards
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
