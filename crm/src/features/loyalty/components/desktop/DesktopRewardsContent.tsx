import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { LoyaltyEmptyState } from '@/features/loyalty/components/shared/LoyaltyEmptyState'
import { LoyaltyErrorState } from '@/features/loyalty/components/shared/LoyaltyErrorState'
import { RewardsTable } from '@/features/loyalty/components/desktop/RewardsTable'
import { RewardForm } from '@/features/loyalty/components/desktop/RewardForm'
import { useRewards } from '@/features/loyalty/hooks/useRewards'
import type { Reward } from '@/features/loyalty/types/loyalty'

/**
 * Desktop Rewards — view and manage the catalogue (docs/NAVIGATION.md
 * §10). The exact reward model is NOT YET FINALIZED, so a reward is only
 * a name, description and point cost the owner sets — no invented
 * pricing rules. Add/edit only: programs may point at a reward.
 */
export function DesktopRewardsContent() {
  const { data, isPending, isError, refetch } = useRewards()
  const items = data ?? []
  // null = form closed, 'new' = adding, otherwise the reward being edited.
  const [editing, setEditing] = useState<Reward | 'new' | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">Rewards</h1>
          <DemoDataBadge />
        </div>
        {editing === null && !isError && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className={buttonVariants({ variant: 'default', size: 'sm' })}
          >
            Add reward
          </button>
        )}
      </div>

      <p className="text-body-sm text-muted-foreground">
        Illustrative demo catalogue — not an approved reward model or final pricing.
      </p>

      {editing !== null && (
        <RewardForm
          key={editing === 'new' ? 'new' : editing.id}
          reward={editing === 'new' ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      )}

      <Card>
        <CardContent>
          {isError ? (
            <LoyaltyErrorState message="Couldn't load rewards." onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <LoyaltyEmptyState message="No rewards available." />
          ) : (
            <RewardsTable items={items} isLoading={isPending} onEdit={setEditing} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
