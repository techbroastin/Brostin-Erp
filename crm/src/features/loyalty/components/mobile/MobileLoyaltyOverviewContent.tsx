import { Link } from 'react-router-dom'
import { Users, Gift, Activity as ActivityIcon } from 'lucide-react'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { LoyaltyErrorState } from '@/features/loyalty/components/shared/LoyaltyErrorState'
import { useLoyaltyOverview } from '@/features/loyalty/hooks/useLoyaltyOverview'

/**
 * Mobile Loyalty Overview — docs/MOBILE_UI_SPEC.md §16: simple cards,
 * avoid complicated analytics. h2, not h1 — MobileHeader already renders
 * this screen's page h1 ("Loyalty", shared by all four Loyalty routes;
 * same fix applied in Phase 4/5).
 */
export function MobileLoyaltyOverviewContent() {
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
    <div className="flex flex-col gap-6 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Overview</h2>

      {isError ? (
        <LoyaltyErrorState message="Couldn't load loyalty overview." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {isPending
              ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/loyalty/customers"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
            >
              <Users className="size-4 shrink-0" />
              Customer Balances
            </Link>
            <Link
              to="/loyalty/rewards"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
            >
              <Gift className="size-4 shrink-0" />
              Rewards
            </Link>
            <Link
              to="/loyalty/activity"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
            >
              <ActivityIcon className="size-4 shrink-0" />
              Activity
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
