import { Link } from 'react-router-dom'
import { ChevronRight, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SegmentErrorState, SegmentKindBadge } from '@/features/segments/components/shared/SegmentParts'
import { useSegments } from '@/features/segments/hooks/useSegments'
import { formatLastCalculated } from '@/features/segments/utils/segmentFormat'

/**
 * Mobile Segment List — browse-only cards (member count is the key
 * number). Building/editing is Desktop Admin only; see
 * SegmentBuilderDesktopOnlyNotice.
 */
export function MobileSegmentListContent() {
  const { data, isPending, isError, refetch } = useSegments()

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-page-title font-semibold">Segments</h1>
        <DemoDataBadge />
      </div>

      {isError ? (
        <SegmentErrorState onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Users className="size-8 text-muted-foreground" />
          <p className="text-body font-medium">No segments yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((segment) => (
            <Link key={segment.id} to={`/customers/segments/${segment.id}`}>
              <Card>
                <CardContent className="flex items-center gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-body font-medium">{segment.name}</p>
                      <SegmentKindBadge kind={segment.kind} />
                    </div>
                    {segment.description && (
                      <p className="line-clamp-2 text-body-sm text-muted-foreground">{segment.description}</p>
                    )}
                    <p className="text-caption text-muted-foreground">
                      {formatLastCalculated(segment.lastCalculatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <div className="text-right">
                      <p className="text-h3 font-semibold">{segment.memberCount}</p>
                      <p className="text-caption text-muted-foreground">members</p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
