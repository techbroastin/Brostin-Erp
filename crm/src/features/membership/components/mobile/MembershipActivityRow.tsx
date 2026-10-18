import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MembershipActivityBadge } from '@/features/membership/components/shared/MembershipActivityBadge'
import type { MembershipActivityRecord } from '@/features/membership/types/membership'

export function MembershipActivityRow({ record }: { record: MembershipActivityRecord }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/customers/${record.customerId}`}
            className="truncate text-body font-medium underline-offset-4 hover:underline"
          >
            {record.customerName}
          </Link>
          <MembershipActivityBadge type={record.type} />
        </div>
        <p className="text-body-sm text-muted-foreground">{record.description}</p>
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

export function MembershipActivityRowSkeleton() {
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
