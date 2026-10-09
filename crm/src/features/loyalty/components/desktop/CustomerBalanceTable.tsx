import { Link } from 'react-router-dom'
import { ArrowUpDown } from 'lucide-react'
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
import type { CustomerBalance, CustomerBalanceSortBy } from '@/features/loyalty/types/loyalty'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

/**
 * docs/DESKTOP_UI_SPEC.md §9 — sortable columns, row-level action,
 * pagination. "View" links to the existing Customer Detail screen
 * (/customers/:id) — no new route.
 */
export function CustomerBalanceTable({
  items,
  isLoading,
  sortBy,
  onSortChange,
  page,
  total,
  onPageChange,
}: {
  items: CustomerBalance[]
  isLoading: boolean
  sortBy: CustomerBalanceSortBy
  onSortChange: (sortBy: CustomerBalanceSortBy) => void
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
            <TableHead>
              <button
                type="button"
                onClick={() => onSortChange('name')}
                className={cn('flex items-center gap-1', sortBy === 'name' && 'text-foreground')}
              >
                Name
                <ArrowUpDown className="size-3.5" />
              </button>
            </TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => onSortChange('points')}
                className={cn('flex items-center gap-1', sortBy === 'points' && 'text-foreground')}
              >
                Points
                <ArrowUpDown className="size-3.5" />
              </button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
            : items.map((balance) => (
                <TableRow key={balance.id}>
                  <TableCell className="font-medium">{balance.name}</TableCell>
                  <TableCell>{balance.phone}</TableCell>
                  <TableCell>{balance.points ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/customers/${balance.id}`}
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
              ? '0 customers'
              : `Page ${page} of ${totalPages} · ${total} customers`}
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
