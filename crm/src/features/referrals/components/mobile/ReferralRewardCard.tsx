import { Gift } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ReferralReward } from '@/features/referrals/types/referral'

/**
 * Read-only — no redemption action (approved Phase 8 scope: viewing
 * only). No cost/value shown: no such field exists on ReferralReward.
 */
export function ReferralRewardCard({ reward }: { reward: ReferralReward }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3">
        <Gift className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-medium">{reward.name}</p>
          <p className="mt-0.5 text-body-sm text-muted-foreground">{reward.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ReferralRewardCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-start gap-3">
        <Skeleton className="size-5 shrink-0 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}
