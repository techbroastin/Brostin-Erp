import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { AnalyticsErrorState } from '@/features/analytics/components/shared/AnalyticsErrorState'
import { useLoyaltyAnalytics } from '@/features/analytics/hooks/useLoyaltyAnalytics'

/**
 * Mobile Loyalty Analytics — shows the ranking by points, per the
 * approved mobile ranking split (Customers mobile = by orders only).
 */
export function MobileLoyaltyAnalyticsContent() {
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
    <div className="flex flex-col gap-6 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Loyalty</h2>

      {isError ? (
        <AnalyticsErrorState message="Couldn't load loyalty analytics." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {isPending
              ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
              : balanceKpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

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

          <Card>
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
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-body-sm"
                    >
                      <span>{c.name}</span>
                      <span className="font-medium">{c.points ?? 0} pts</span>
                    </Link>
                  ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
