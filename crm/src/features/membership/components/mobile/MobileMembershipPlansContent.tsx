import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { MembershipEmptyState } from '@/features/membership/components/shared/MembershipEmptyState'
import { MembershipErrorState } from '@/features/membership/components/shared/MembershipErrorState'
import {
  MembershipPlanCard,
  MembershipPlanCardSkeleton,
} from '@/features/membership/components/mobile/MembershipPlanCard'
import { useMembershipPlans } from '@/features/membership/hooks/useMembershipPlans'

/**
 * Mobile Plans — simple card list, read-only. docs/MOBILE_UI_SPEC.md
 * §19: complex plan configuration is desktop-oriented (and out of
 * scope entirely here). h2, not h1 — see
 * MobileMembershipOverviewContent.
 */
export function MobileMembershipPlansContent() {
  const { data, isPending, isError, refetch } = useMembershipPlans()
  const items = data ?? []

  return (
    <div className="flex flex-col gap-4 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Plans</h2>
      <p className="text-caption text-muted-foreground">
        Illustrative demo catalogue — not an approved plan, pricing, duration, or benefit.
      </p>

      {isError ? (
        <MembershipErrorState message="Couldn't load membership plans." onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <MembershipPlanCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <MembershipEmptyState message="No plans available." />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((plan) => (
            <MembershipPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  )
}
