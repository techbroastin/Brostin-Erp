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
import { FeedbackSentimentBadge } from '@/features/feedback/components/shared/FeedbackSentimentBadge'
import { FeedbackStatusBadge } from '@/features/feedback/components/shared/FeedbackStatusBadge'
import type { FeedbackItem } from '@/features/feedback/types/feedback'

const PAGE_SIZE = 10

/**
 * docs/DESKTOP_UI_SPEC.md §9 — real <table> semantics, row action links
 * to the existing Customer Detail screen and to feedback detail.
 * Date-sorted descending only — no sort control, matching the
 * LoyaltyActivityTable precedent for a feed-style list.
 */
export function FeedbackTable({
  items,
  isLoading,
  page,
  total,
  onPageChange,
}: {
  items: FeedbackItem[]
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
            <TableHead>Sentiment</TableHead>
            <TableHead>Feedback</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date/Time</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : items.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>
                    <Link
                      to={`/customers/${feedback.customerId}`}
                      className={buttonVariants({ variant: 'link', size: 'sm' })}
                    >
                      {feedback.customerName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <FeedbackSentimentBadge sentiment={feedback.sentiment} />
                  </TableCell>
                  <TableCell className="max-w-sm truncate">{feedback.message}</TableCell>
                  <TableCell>
                    <FeedbackStatusBadge status={feedback.status} />
                  </TableCell>
                  <TableCell>
                    {new Date(feedback.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/feedback/${feedback.id}`}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      View
                    </Link>
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
              ? '0 feedback items'
              : `Page ${page} of ${totalPages} · ${total} feedback items`}
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
