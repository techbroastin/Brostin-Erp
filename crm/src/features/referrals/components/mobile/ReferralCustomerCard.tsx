import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ReferralStatusBadge } from '@/features/referrals/components/shared/ReferralStatusBadge'
import { ReferredContactInfo } from '@/features/referrals/components/shared/ReferredContactInfo'
import type { ReferralRecord } from '@/features/referrals/types/referral'

/**
 * Referrer links to the existing Customer Detail screen (/customers/:id)
 * — no new route is introduced; this reuses the already-built
 * destination, same as CustomerBalanceCard.
 */
export function ReferralCustomerCard({ record }: { record: ReferralRecord }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/customers/${record.referrerCustomerId}`}
            className="truncate text-body font-medium underline-offset-4 hover:underline"
          >
            {record.referrerCustomerName}
          </Link>
          <ReferralStatusBadge status={record.status} />
        </div>
        <ReferredContactInfo referred={record.referred} />
      </CardContent>
    </Card>
  )
}

export function ReferralCustomerCardSkeleton() {
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
