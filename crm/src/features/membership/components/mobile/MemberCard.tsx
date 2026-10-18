import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MembershipStatusBadge } from '@/features/membership/components/shared/MembershipStatusBadge'
import type { Member } from '@/features/membership/types/membership'

/**
 * Links to the existing Customer Detail screen (/customers/:id) — no
 * new route is introduced; this reuses the already-built destination,
 * same as CustomerBalanceCard/ReferralCustomerCard.
 */
export function MemberCard({ member }: { member: Member }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/customers/${member.customerId}`}
            className="truncate text-body font-medium underline-offset-4 hover:underline"
          >
            {member.customerName}
          </Link>
          <MembershipStatusBadge status={member.status} />
        </div>
        <p className="text-body-sm text-muted-foreground">{member.planName}</p>
        <div className="flex items-center justify-between text-caption text-muted-foreground">
          <span>Since {new Date(member.since).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          <span>Expires {new Date(member.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function MemberCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  )
}
