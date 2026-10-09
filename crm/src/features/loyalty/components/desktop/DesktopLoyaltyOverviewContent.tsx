import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { LoyaltyErrorState } from '@/features/loyalty/components/shared/LoyaltyErrorState'
import { useLoyaltyOverview } from '@/features/loyalty/hooks/useLoyaltyOverview'

/**
 * Desktop Loyalty Overview — docs/IMPLEMENTATION_PLAN.md §12. KPI row +
 * quick links to the other three approved Loyalty screens. No charts/
 * trends (no historical metric is defined — docs/NAVIGATION.md §10:
 * "exact metrics NOT YET FINALIZED").
 */
export function DesktopLoyaltyOverviewContent() {
  const { data, isPending, isError, refetch } = useLoyaltyOverview()

  const kpis: KpiCardData[] = data
    ? [
        { id: 'points-outstanding', label: 'Total Points Outstanding', value: String(data.totalPointsOutstanding) },
        { id: 'customers-with-points', label: 'Customers with Points', value: String(data.customersWithPoints) },
        { id: 'rewards-available', label: 'Rewards Available', value: String(data.rewardsAvailable) },
        { id: 'rewards-redeemed', label: 'Rewards Redeemed', value: String(data.rewardsRedeemed) },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Overview</h1>
        <DemoDataBadge />
      </div>

      {isError ? (
        <LoyaltyErrorState message="Couldn't load loyalty overview." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {isPending
              ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Loyalty Module</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link to="/loyalty/customers" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                Customer Balances
              </Link>
              <Link to="/loyalty/rewards" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                Rewards
              </Link>
              <Link to="/loyalty/activity" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                Activity
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
