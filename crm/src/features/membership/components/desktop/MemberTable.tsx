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
import { MembershipStatusBadge } from '@/features/membership/components/shared/MembershipStatusBadge'
import type { Member } from '@/features/membership/types/membership'

const PAGE_SIZE = 10

/**
 * docs/DESKTOP_UI_SPEC.md §9 — real <table> semantics, pagination.
 * Customer links to the existing Customer Detail screen
 * (/customers/:id) — no new route. Sorted by customer name only (no
 * sort control — a single, obvious default is enough for this
 * illustrative dataset).
 */
export function MemberTable({
  items,
  isLoading,
  page,
  total,
  onPageChange,
}: {
  items: Member[]
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
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Since</TableHead>
            <TableHead className="text-right">Expires</TableHead>
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
            : items.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/customers/${member.customerId}`}
                      className={buttonVariants({ variant: 'link', size: 'sm' })}
                    >
                      {member.customerName}
                    </Link>
                  </TableCell>
                  <TableCell>{member.planName}</TableCell>
                  <TableCell>
                    <MembershipStatusBadge status={member.status} />
                  </TableCell>
                  <TableCell className="text-body-sm text-muted-foreground">
                    {new Date(member.since).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </TableCell>
                  <TableCell className="text-right text-body-sm text-muted-foreground">
                    {new Date(member.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
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
              ? '0 members'
              : `Page ${page} of ${totalPages} · ${total} members`}
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
