import { Link } from 'react-router-dom'
import { Users, CreditCard, Activity as ActivityIcon } from 'lucide-react'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { MembershipErrorState } from '@/features/membership/components/shared/MembershipErrorState'
import { useMembershipOverview } from '@/features/membership/hooks/useMembershipOverview'

/**
 * Mobile Membership Overview — docs/MOBILE_UI_SPEC.md §19: member list,
 * membership status, plan, expiry; complex plan configuration is
 * desktop-oriented (and out of scope entirely here — view-only). h2,
 * not h1 — MobileHeader already renders this screen's page h1
 * ("Membership", shared by all four Membership routes).
 */
export function MobileMembershipOverviewContent() {
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
    <div className="flex flex-col gap-6 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Overview</h2>

      {isError ? (
        <MembershipErrorState message="Couldn't load membership overview." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {isPending
              ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/membership/members"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
            >
              <Users className="size-4 shrink-0" />
              Members
            </Link>
            <Link
              to="/membership/plans"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
            >
              <CreditCard className="size-4 shrink-0" />
              Plans
            </Link>
            <Link
              to="/membership/activity"
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
