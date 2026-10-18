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
import { ReferralStatusBadge } from '@/features/referrals/components/shared/ReferralStatusBadge'
import { ReferredContactInfo } from '@/features/referrals/components/shared/ReferredContactInfo'
import type { ReferralRecord } from '@/features/referrals/types/referral'

const PAGE_SIZE = 10

/**
 * docs/DESKTOP_UI_SPEC.md §9 — real <table> semantics, pagination.
 * Referrer links to the existing Customer Detail screen (/customers/:id)
 * — no new route. Sorted by referrer name only (no sort control — a
 * single, obvious default is enough for this illustrative dataset).
 */
export function ReferralCustomerTable({
  items,
  isLoading,
  page,
  total,
  onPageChange,
}: {
  items: ReferralRecord[]
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
            <TableHead>Referrer</TableHead>
            <TableHead>Referred Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Date</TableHead>
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
                      to={`/customers/${record.referrerCustomerId}`}
                      className={buttonVariants({ variant: 'link', size: 'sm' })}
                    >
                      {record.referrerCustomerName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ReferredContactInfo referred={record.referred} />
                  </TableCell>
                  <TableCell>
                    <ReferralStatusBadge status={record.status} />
                  </TableCell>
                  <TableCell className="text-right text-body-sm text-muted-foreground">
                    {new Date(record.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
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
              ? '0 referrals'
              : `Page ${page} of ${totalPages} · ${total} referrals`}
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
