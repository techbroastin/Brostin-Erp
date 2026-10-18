import { Link } from 'react-router-dom'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { MembershipActivityBadge } from '@/features/membership/components/shared/MembershipActivityBadge'
import type { MembershipActivityRecord } from '@/features/membership/types/membership'

const PAGE_SIZE = 10

/**
 * docs/DESKTOP_UI_SPEC.md §9 — real <table> semantics, row link to the
 * existing Customer Detail screen (/customers/:id). Date-sorted
 * descending only (no sort control — mirrors LoyaltyActivityTable/
 * ReferralActivityTable). Illustrative historical events only, no
 * renewal/expiry business logic.
 */
export function MembershipActivityTable({
  items,
  isLoading,
  page,
  total,
  onPageChange,
}: {
  items: MembershipActivityRecord[]
  isLoading: boolean
  page: number
  total: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Date/Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : items.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/customers/${record.customerId}`}
                      className={buttonVariants({ variant: 'link', size: 'sm' })}
                    >
                      {record.customerName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <MembershipActivityBadge type={record.type} />
                  </TableCell>
                  <TableCell>{record.description}</TableCell>
                  <TableCell className="text-right text-body-sm text-muted-foreground">
                    {new Date(record.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between text-body-sm text-muted-foreground">
        <span>
          {isLoading
            ? 'Loading…'
            : total === 0
              ? '0 events'
              : `Page ${page} of ${totalPages} · ${total} events`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isLoading || page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={isLoading || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export { PAGE_SIZE }
