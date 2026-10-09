import { Gift } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Reward } from '@/features/loyalty/types/loyalty'

/** Read-only — no redemption action (rule approved for Phase 6: viewing only). */
export function RewardCard({ reward }: { reward: Reward }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3">
        <Gift className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-body font-medium">{reward.name}</p>
            <span className="shrink-0 text-body-sm font-semibold">{reward.pointCost} pts</span>
          </div>
          <p className="mt-0.5 text-body-sm text-muted-foreground">{reward.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function RewardCardSkeleton() {
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
