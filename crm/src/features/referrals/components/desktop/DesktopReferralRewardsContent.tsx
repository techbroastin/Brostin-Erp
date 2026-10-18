import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { ReferralEmptyState } from '@/features/referrals/components/shared/ReferralEmptyState'
import { ReferralErrorState } from '@/features/referrals/components/shared/ReferralErrorState'
import { ReferralRewardsTable } from '@/features/referrals/components/desktop/ReferralRewardsTable'
import { useReferralRewards } from '@/features/referrals/hooks/useReferralRewards'

/**
 * Desktop Referral Rewards — read-only catalogue. docs/IMPLEMENTATION_PLAN.md
 * §14 marks referral reward rules NOT YET FINALIZED; this is an
 * illustrative demo catalogue only, never an approved business offer.
 */
export function DesktopReferralRewardsContent() {
  const { data, isPending, isError, refetch } = useReferralRewards()
  const items = data ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Rewards</h1>
        <DemoDataBadge />
      </div>

      <p className="text-body-sm text-muted-foreground">
        Illustrative demo catalogue — not an approved reward model, eligibility rule, or value.
      </p>

      <Card>
        <CardContent>
          {isError ? (
            <ReferralErrorState message="Couldn't load referral rewards." onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <ReferralEmptyState message="No rewards available." />
          ) : (
            <ReferralRewardsTable items={items} isLoading={isPending} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
