import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LoyaltyEventBadge } from '@/features/loyalty/components/shared/LoyaltyEventBadge'
import type { LoyaltyEvent } from '@/features/loyalty/types/loyalty'

export function LoyaltyActivityRow({ event }: { event: LoyaltyEvent }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/customers/${event.customerId}`}
            className="truncate text-body font-medium underline-offset-4 hover:underline"
          >
            {event.customerName}
          </Link>
          <LoyaltyEventBadge type={event.type} />
        </div>
        <p className="text-body-sm text-muted-foreground">{event.description}</p>
        <div className="flex items-center justify-between text-caption text-muted-foreground">
          <span>
            {new Date(event.createdAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </span>
          <span className="font-medium">
            {event.points > 0 ? `+${event.points}` : event.points} pts
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function LoyaltyActivityRowSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </CardContent>
    </Card>
  )
}
