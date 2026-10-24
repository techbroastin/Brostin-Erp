import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SegmentErrorState, SegmentKindBadge } from '@/features/segments/components/shared/SegmentParts'
import { useSegments } from '@/features/segments/hooks/useSegments'
import { formatLastCalculated } from '@/features/segments/utils/segmentFormat'

const COLUMN_COUNT = 5

/** Desktop Segment List — docs/DESKTOP_UI_SPEC.md §9 table with a "New segment" primary action. */
export function DesktopSegmentListContent() {
  const { data, isPending, isError, refetch } = useSegments()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">Segments</h1>
          <DemoDataBadge />
        </div>
        <Link to="/customers/segments/new" className={buttonVariants({ variant: 'default', size: 'sm' })}>
          <Plus className="size-4" />
          New segment
        </Link>
      </div>

      <p className="max-w-2xl text-body-sm text-muted-foreground">
        Pre-built segments are maintained automatically. Membership for every segment is recalculated
        nightly, not on each order.
      </p>

      <Card>
        <CardContent>
          {isError ? (
            <SegmentErrorState onRetry={() => refetch()} />
          ) : !isPending && data.length === 0 ? (
            <p className="py-16 text-center text-body font-medium">No segments yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                  <TableHead>Last calculated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : data.map((segment) => (
                      <TableRow key={segment.id}>
                        <TableCell>
                          <p className="font-medium">{segment.name}</p>
                          {segment.description && (
                            <p className="max-w-md truncate text-caption text-muted-foreground">
                              {segment.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <SegmentKindBadge kind={segment.kind} />
                        </TableCell>
                        <TableCell className="text-right font-medium">{segment.memberCount}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatLastCalculated(segment.lastCalculatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            to={`/customers/segments/${segment.id}`}
                            className={buttonVariants({ variant: 'outline', size: 'sm' })}
                          >
                            View
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
