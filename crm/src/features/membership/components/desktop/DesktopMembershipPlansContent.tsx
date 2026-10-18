import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { MembershipEmptyState } from '@/features/membership/components/shared/MembershipEmptyState'
import { MembershipErrorState } from '@/features/membership/components/shared/MembershipErrorState'
import { MembershipPlansTable } from '@/features/membership/components/desktop/MembershipPlansTable'
import { useMembershipPlans } from '@/features/membership/hooks/useMembershipPlans'

/**
 * Desktop Membership Plans — read-only catalogue.
 * docs/IMPLEMENTATION_PLAN.md marks membership business rules NOT YET
 * FINALIZED; this is an illustrative demo catalogue only, never an
 * approved business offer.
 */
export function DesktopMembershipPlansContent() {
  const { data, isPending, isError, refetch } = useMembershipPlans()
  const items = data ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Plans</h1>
        <DemoDataBadge />
      </div>

      <p className="text-body-sm text-muted-foreground">
        Illustrative demo catalogue — not an approved plan, pricing, duration, or benefit.
      </p>

      <Card>
        <CardContent>
          {isError ? (
            <MembershipErrorState message="Couldn't load membership plans." onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <MembershipEmptyState message="No plans available." />
          ) : (
            <MembershipPlansTable items={items} isLoading={isPending} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
