import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { OrderSearchInput } from '@/features/orders/components/shared/OrderSearchInput'
import { OrderEmptyState } from '@/features/orders/components/shared/OrderEmptyState'
import { OrderErrorState } from '@/features/orders/components/shared/OrderErrorState'
import { OrderTable, PAGE_SIZE } from '@/features/orders/components/desktop/OrderTable'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useOrderList } from '@/features/orders/hooks/useOrderList'
import type { OrderSortBy, OrderStatus } from '@/features/orders/types/order'

const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'outForDelivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

/**
 * Desktop QR Orders — docs/IMPLEMENTATION_PLAN.md "Phase 13 — QR
 * Administration": an operational, source-filtered view of the
 * existing Orders feature, not a rebuild. Every piece below (hook,
 * search input, empty/error states, table) is imported unmodified
 * from features/orders — nothing there is edited. `source` is always
 * pinned to 'qr', so unlike the main /orders screen, no source
 * selector is rendered here.
 */
export function DesktopQrOrdersContent() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<OrderSortBy>('createdAt')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch } = useOrderList({
    search: debouncedSearch,
    status,
    source: 'qr',
    page,
    pageSize: PAGE_SIZE,
    sortBy,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0

  const handleClearFilters = () => {
    setSearch('')
    setStatus('all')
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">QR Orders</h1>
        <DemoDataBadge />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="max-w-sm flex-1">
          <OrderSearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
          />
        </div>
        <select
          aria-label="Filter by status"
          className={selectClassName}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | 'all')
            setPage(1)
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent>
          {isError ? (
            <OrderErrorState onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <OrderEmptyState
              search={debouncedSearch}
              hasOtherFilters={status !== 'all'}
              onClear={handleClearFilters}
            />
          ) : (
            <OrderTable
              items={items}
              isLoading={isPending}
              sortBy={sortBy}
              onSortChange={(value) => {
                setSortBy(value)
                setPage(1)
              }}
              page={page}
              total={total}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
