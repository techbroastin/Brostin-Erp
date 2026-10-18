import { CreditCard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { MembershipPlan } from '@/features/membership/types/membership'

/**
 * Read-only — no edit/configuration action (approved Phase 9 scope:
 * viewing only). No price/duration shown: no such field exists on
 * MembershipPlan.
 */
export function MembershipPlanCard({ plan }: { plan: MembershipPlan }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3">
        <CreditCard className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-medium">{plan.name}</p>
          <p className="mt-0.5 text-body-sm text-muted-foreground">{plan.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function MembershipPlanCardSkeleton() {
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
