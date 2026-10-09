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
import { LoyaltyEventBadge } from '@/features/loyalty/components/shared/LoyaltyEventBadge'
import type { LoyaltyEvent } from '@/features/loyalty/types/loyalty'

const PAGE_SIZE = 10

/**
 * docs/DESKTOP_UI_SPEC.md §9 — real <table> semantics, row action links
 * to the existing Customer Detail screen (/customers/:id). Date-sorted
 * descending only (no sort control — a single, obvious default is
 * enough for a small illustrative feed; not adding a sort column avoids
 * inventing UI the approved scope doesn't call for).
 */
export function LoyaltyActivityTable({
  items,
  isLoading,
  page,
  total,
  onPageChange,
}: {
  items: LoyaltyEvent[]
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
            <TableHead>Date/Time</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : items.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Link
                      to={`/customers/${event.customerId}`}
                      className={buttonVariants({ variant: 'link', size: 'sm' })}
                    >
                      {event.customerName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <LoyaltyEventBadge type={event.type} />
                  </TableCell>
                  <TableCell>{event.description}</TableCell>
                  <TableCell>
                    {new Date(event.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {event.points > 0 ? `+${event.points}` : event.points}
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
