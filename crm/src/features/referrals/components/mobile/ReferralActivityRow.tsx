import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ReferralStatusBadge } from '@/features/referrals/components/shared/ReferralStatusBadge'
import { ReferredContactInfo } from '@/features/referrals/components/shared/ReferredContactInfo'
import type { ReferralRecord } from '@/features/referrals/types/referral'

export function ReferralActivityRow({ record }: { record: ReferralRecord }) {
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
        <p className="text-caption text-muted-foreground">
          {new Date(record.createdAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </CardContent>
    </Card>
  )
}

export function ReferralActivityRowSkeleton() {
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
