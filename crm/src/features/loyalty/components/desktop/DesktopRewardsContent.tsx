import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { LoyaltyEmptyState } from '@/features/loyalty/components/shared/LoyaltyEmptyState'
import { LoyaltyErrorState } from '@/features/loyalty/components/shared/LoyaltyErrorState'
import { RewardsTable } from '@/features/loyalty/components/desktop/RewardsTable'
import { useRewards } from '@/features/loyalty/hooks/useRewards'

/**
 * Desktop Rewards — read-only catalogue. docs/NAVIGATION.md §10 marks the
 * exact reward model NOT YET FINALIZED; this is an illustrative demo
 * catalogue only, never an approved business offer.
 */
export function DesktopRewardsContent() {
  const { data, isPending, isError, refetch } = useRewards()
  const items = data ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Rewards</h1>
        <DemoDataBadge />
      </div>

      <p className="text-body-sm text-muted-foreground">
        Illustrative demo catalogue — not an approved reward model or final pricing.
      </p>

      <Card>
        <CardContent>
          {isError ? (
            <LoyaltyErrorState message="Couldn't load rewards." onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <LoyaltyEmptyState message="No rewards available." />
          ) : (
            <RewardsTable items={items} isLoading={isPending} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
