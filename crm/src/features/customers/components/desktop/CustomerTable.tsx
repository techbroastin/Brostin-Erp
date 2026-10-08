import { Link } from 'react-router-dom'
import { ArrowUpDown, AlertCircle } from 'lucide-react'
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
import type { Customer, CustomerSortBy } from '@/features/customers/types/customer'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

/**
 * docs/DESKTOP_UI_SPEC.md §9 — sortable columns, status-as-badge
 * convention reserved for when a real status field exists, row-level
 * action, pagination. Real <table> semantics throughout (§22
 * accessibility).
 */
export function CustomerTable({
  items,
  isLoading,
  sortBy,
  onSortChange,
  page,
  total,
  onPageChange,
}: {
  items: Customer[]
  isLoading: boolean
  sortBy: CustomerSortBy
  onSortChange: (sortBy: CustomerSortBy) => void
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
                className={cn(
                  'flex items-center gap-1',
                  sortBy === 'name' && 'text-foreground',
                )}
              >
                Name
                <ArrowUpDown className="size-3.5" />
              </button>
            </TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => onSortChange('lastOrderAt')}
                className={cn(
                  'flex items-center gap-1',
                  sortBy === 'lastOrderAt' && 'text-foreground',
                )}
              >
                Last Order
                <ArrowUpDown className="size-3.5" />
              </button>
            </TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Loyalty</TableHead>
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
            : items.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    {customer.lastOrderAt
                      ? new Date(customer.lastOrderAt).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell>{customer.orderCount}</TableCell>
                  <TableCell>{customer.loyaltyPoints ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {customer.alert && (
                        <AlertCircle className="size-4 text-warning" aria-label={customer.alert} />
                      )}
                      <Link
                        to={`/customers/${customer.id}`}
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        View
                      </Link>
                    </div>
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
