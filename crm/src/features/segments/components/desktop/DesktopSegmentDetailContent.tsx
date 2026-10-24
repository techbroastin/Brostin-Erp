import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { buttonVariants } from '@/components/ui/button'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SegmentKindBadge, SegmentRuleList } from '@/features/segments/components/shared/SegmentParts'
import { useDeleteSegment } from '@/features/segments/hooks/useSegments'
import { formatLastCalculated } from '@/features/segments/utils/segmentFormat'
import { formatRupees, formatTimestampDate } from '@/features/customers/utils/customerFormat'
import type { SegmentDetail } from '@/features/segments/types/segment'
import { permissionMessage } from '@/features/auth/utils/permissionMessage'

/**
 * Desktop Segment Membership Preview — rules + stats column beside the
 * member table. Edit/Delete exist only for custom segments; pre-built
 * ones are system-maintained. Delete uses an inline confirm step rather
 * than a browser dialog.
 */
export function DesktopSegmentDetailContent({ detail }: { detail: SegmentDetail }) {
  const { segment, members } = detail
  const navigate = useNavigate()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const deleteSegment = useDeleteSegment()

  const onDelete = () =>
    deleteSegment.mutate(segment.id, { onSuccess: () => navigate('/customers/segments') })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">{segment.name}</h1>
          <SegmentKindBadge kind={segment.kind} />
          <DemoDataBadge />
        </div>
        {segment.kind === 'custom' && (
          <div className="flex items-center gap-2">
            {confirmingDelete ? (
              <>
                <span className="text-body-sm text-muted-foreground">Delete this segment?</span>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleteSegment.isPending}
                  className={buttonVariants({ variant: 'destructive', size: 'sm' })}
                >
                  {deleteSegment.isPending ? 'Deleting…' : 'Delete'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  Delete
                </button>
                <Link
                  to={`/customers/segments/${segment.id}/edit`}
                  className={buttonVariants({ variant: 'default', size: 'sm' })}
                >
                  Edit segment
                </Link>
              </>
            )}
          </div>
        )}
      </div>
      {deleteSegment.isError && (
        <p className="text-caption text-destructive">
          {permissionMessage(deleteSegment.error) ?? 'Could not delete this segment. Please try again.'}
        </p>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardSectionHeading>Rules</CardSectionHeading>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {segment.description && <p className="text-body-sm text-muted-foreground">{segment.description}</p>}
              <SegmentRuleList segment={segment} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardSectionHeading>Membership</CardSectionHeading>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <p className="text-h2 font-semibold">{members.length}</p>
              <p className="text-body-sm text-muted-foreground">customers</p>
              <p className="mt-2 text-caption text-muted-foreground">
                {segment.lastCalculatedAt
                  ? `${formatLastCalculated(segment.lastCalculatedAt)}. Recalculated nightly.`
                  : 'Pending nightly recalculation — showing who matches right now.'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardSectionHeading>Members</CardSectionHeading>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="py-12 text-center text-body-sm text-muted-foreground">
                No customers match this segment.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Lifetime spend</TableHead>
                    <TableHead>Last order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Link to={`/customers/${customer.id}`} className="font-medium hover:underline">
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                      <TableCell className="text-right">{customer.orderCount}</TableCell>
                      <TableCell className="text-right">{formatRupees(customer.lifetimeSpend)}</TableCell>
                      <TableCell>{formatTimestampDate(customer.lastOrderAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
