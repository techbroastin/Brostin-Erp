import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { LoyaltyEmptyState } from '@/features/loyalty/components/shared/LoyaltyEmptyState'
import { LoyaltyErrorState } from '@/features/loyalty/components/shared/LoyaltyErrorState'
import { RewardCard, RewardCardSkeleton } from '@/features/loyalty/components/mobile/RewardCard'
import { useRewards } from '@/features/loyalty/hooks/useRewards'

/**
 * Mobile Rewards — simple card list, read-only. docs/MOBILE_UI_SPEC.md
 * §16. h2, not h1 — see MobileLoyaltyOverviewContent.
 */
export function MobileRewardsContent() {
  const { data, isPending, isError, refetch } = useRewards()
  const items = data ?? []

  return (
    <div className="flex flex-col gap-4 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Rewards</h2>
      <p className="text-caption text-muted-foreground">
        Illustrative demo catalogue — not an approved reward model or final pricing.
      </p>

      {isError ? (
        <LoyaltyErrorState message="Couldn't load rewards." onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <RewardCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <LoyaltyEmptyState message="No rewards available." />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((reward) => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      )}
    </div>
  )
}
