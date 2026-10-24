import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { OrderSearchInput } from '@/features/orders/components/shared/OrderSearchInput'
import { OrderEmptyState } from '@/features/orders/components/shared/OrderEmptyState'
import { OrderErrorState } from '@/features/orders/components/shared/OrderErrorState'
import { OrderTable, PAGE_SIZE } from '@/features/orders/components/desktop/OrderTable'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useOrderList } from '@/features/orders/hooks/useOrderList'
import type { OrderSortBy, OrderStatus, OrderSource } from '@/features/orders/types/order'

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

const SOURCE_OPTIONS: { value: OrderSource | 'all'; label: string }[] = [
  { value: 'all', label: 'All sources' },
  { value: 'qr', label: 'QR' },
  { value: 'web', label: 'Web' },
]

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const VALID_STATUSES = new Set(STATUS_OPTIONS.map((opt) => opt.value))

function statusFromSearchParams(params: URLSearchParams): OrderStatus | 'all' {
  const value = params.get('status')
  return value && VALID_STATUSES.has(value as OrderStatus | 'all') ? (value as OrderStatus | 'all') : 'all'
}

/** Start of today (local time), for the "Today" view (docs/NAVIGATION.md §9.2). */
function startOfToday(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

/**
 * Desktop Order list — docs/DESKTOP_UI_SPEC.md §9/§10: persistent filter
 * bar (search + status + source — no date-range filter, explicitly
 * excluded) + sortable, paged table. Native <select> used for filters to
 * avoid adding a new shadcn primitive for Phase 5. `status` is also
 * deep-linkable via `?status=` (e.g. from Dashboard) — the Functional
 * Navigation task requires it to survive refresh/back/forward.
 */
export function DesktopOrderListContent({ todayOnly = false }: { todayOnly?: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [status, setStatusState] = useState<OrderStatus | 'all'>(() => statusFromSearchParams(searchParams))
  const [source, setSource] = useState<OrderSource | 'all'>('all')
  const [sortBy, setSortBy] = useState<OrderSortBy>('createdAt')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  /**
   * Status is the deep-linkable filter — Dashboard/elsewhere can link to
   * /orders?status=placed and this reflects it on refresh/back/forward.
   * Source/search/sort stay local-only (docs/DESKTOP_UI_SPEC.md §9/§10
   * names no query-param requirement for them).
   */
  const setStatus = (value: OrderStatus | 'all') => {
    setStatusState(value)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === 'all') next.delete('status')
        else next.set('status', value)
        return next
      },
      { replace: true },
    )
  }

  const { data, isPending, isError, refetch } = useOrderList({
    search: debouncedSearch,
    status,
    source,
    page,
    pageSize: PAGE_SIZE,
    sortBy,
    createdFrom: todayOnly ? startOfToday() : undefined,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0

  const handleClearFilters = () => {
    setSearch('')
    setStatus('all')
    setSource('all')
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">{todayOnly ? "Today's Orders" : 'Orders'}</h1>
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
        <select
          aria-label="Filter by source"
          className={selectClassName}
          value={source}
          onChange={(e) => {
            setSource(e.target.value as OrderSource | 'all')
            setPage(1)
          }}
        >
          {SOURCE_OPTIONS.map((opt) => (
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
              hasOtherFilters={status !== 'all' || source !== 'all'}
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
