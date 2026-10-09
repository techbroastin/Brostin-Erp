import { Link } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { CustomerBalance } from '@/features/loyalty/types/loyalty'

/**
 * Links to the existing Customer Detail screen (/customers/:id) — no new
 * route is introduced; this reuses the already-built destination.
 */
export function CustomerBalanceCard({ balance }: { balance: CustomerBalance }) {
  return (
    <Link to={`/customers/${balance.id}`}>
      <Card>
        <CardContent className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-body font-medium">{balance.name}</p>
            <p className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
              <Phone className="size-3.5 shrink-0" />
              {balance.phone}
            </p>
          </div>
          <span className="shrink-0 text-body font-semibold">{balance.points ?? 0} pts</span>
        </CardContent>
      </Card>
    </Link>
  )
}

export function CustomerBalanceCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-2">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3.5 w-1/3" />
        </div>
        <Skeleton className="h-4 w-10 shrink-0" />
      </CardContent>
    </Card>
  )
}
