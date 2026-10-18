import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { AnalyticsErrorState } from '@/features/analytics/components/shared/AnalyticsErrorState'
import { useLoyaltyAnalytics } from '@/features/analytics/hooks/useLoyaltyAnalytics'

/**
 * Desktop Loyalty Analytics — totalPointsOutstanding/customersWithPoints/
 * rewardsAvailable/rewardsRedemptionCount are the authoritative values
 * from loyaltyService.getLoyaltyOverview(), shown separately from the
 * historical Points Earned/Redeemed activity totals below — the two
 * groups are NOT claimed to reconcile (loyalty.mock.ts: "not a
 * reconciled points ledger").
 */
export function DesktopLoyaltyAnalyticsContent() {
  const { data, isPending, isError, refetch } = useLoyaltyAnalytics()

  const balanceKpis: KpiCardData[] = data
    ? [
        { id: 'points-outstanding', label: 'Total Points Outstanding', value: String(data.totalPointsOutstanding) },
        { id: 'customers-with-points', label: 'Customers with Points', value: String(data.customersWithPoints) },
        { id: 'rewards-available', label: 'Rewards Available', value: String(data.rewardsAvailable) },
        {
          id: 'rewards-redemption-count',
          label: 'Reward Redemptions',
          value: String(data.rewardsRedemptionCount),
        },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Loyalty</h1>
        <DemoDataBadge />
      </div>

      {isError ? (
        <AnalyticsErrorState message="Couldn't load loyalty analytics." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {isPending
              ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
              : balanceKpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Totals (Historical)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {isPending ? null : (
                  <>
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-muted-foreground">Points Earned</span>
                      <span className="font-medium">{data!.totalPointsEarned}</span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-muted-foreground">Points Redeemed</span>
                      <span className="font-medium">{data!.totalPointsRedeemed}</span>
                    </div>
                    <p className="mt-2 text-caption text-muted-foreground">
                      Historical activity totals — not reconciled against the current outstanding balance above.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Top Customers by Points</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {isPending
                  ? null
                  : data!.topCustomersByPoints.map((c) => (
                      <Link
                        key={c.id}
                        to={`/customers/${c.id}`}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-body-sm hover:bg-accent"
                      >
                        <span>{c.name}</span>
                        <span className="font-medium">{c.points ?? 0} pts</span>
                      </Link>
                    ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
