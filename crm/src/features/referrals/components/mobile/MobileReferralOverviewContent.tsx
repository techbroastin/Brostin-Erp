import { Link } from 'react-router-dom'
import { Users, Activity as ActivityIcon, Gift } from 'lucide-react'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { ReferralErrorState } from '@/features/referrals/components/shared/ReferralErrorState'
import { useReferralOverview } from '@/features/referrals/hooks/useReferralOverview'

/**
 * Mobile Referrals Overview — docs/MOBILE_UI_SPEC.md §18: summary cards,
 * avoid complex administrative configuration. h2, not h1 — MobileHeader
 * already renders this screen's page h1 ("Referrals", shared by all
 * four Referrals routes, same fix applied in Phase 4/5/6/7).
 */
export function MobileReferralOverviewContent() {
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
    <div className="flex flex-col gap-6 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Overview</h2>

      {isError ? (
        <ReferralErrorState message="Couldn't load referral overview." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {isPending
              ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/referrals/customers"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
            >
              <Users className="size-4 shrink-0" />
              Customers
            </Link>
            <Link
              to="/referrals/activity"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
            >
              <ActivityIcon className="size-4 shrink-0" />
              Activity
            </Link>
            <Link
              to="/referrals/rewards"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
            >
              <Gift className="size-4 shrink-0" />
              Rewards
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
