import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { ReferralEmptyState } from '@/features/referrals/components/shared/ReferralEmptyState'
import { ReferralErrorState } from '@/features/referrals/components/shared/ReferralErrorState'
import {
  ReferralRewardCard,
  ReferralRewardCardSkeleton,
} from '@/features/referrals/components/mobile/ReferralRewardCard'
import { useReferralRewards } from '@/features/referrals/hooks/useReferralRewards'

/**
 * Mobile Rewards — simple card list, read-only. docs/MOBILE_UI_SPEC.md
 * §18. h2, not h1 — see MobileReferralOverviewContent.
 */
export function MobileReferralRewardsContent() {
  const { data, isPending, isError, refetch } = useReferralRewards()
  const items = data ?? []

  return (
    <div className="flex flex-col gap-4 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Rewards</h2>
      <p className="text-caption text-muted-foreground">
        Illustrative demo catalogue — not an approved reward model, eligibility rule, or value.
      </p>

      {isError ? (
        <ReferralErrorState message="Couldn't load referral rewards." onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <ReferralRewardCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <ReferralEmptyState message="No rewards available." />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((reward) => (
            <ReferralRewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      )}
    </div>
  )
}
