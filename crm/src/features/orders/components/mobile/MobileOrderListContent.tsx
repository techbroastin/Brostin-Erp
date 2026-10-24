import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { OrderSearchInput } from '@/features/orders/components/shared/OrderSearchInput'
import { OrderEmptyState } from '@/features/orders/components/shared/OrderEmptyState'
import { OrderErrorState } from '@/features/orders/components/shared/OrderErrorState'
import { OrderCard, OrderCardSkeleton } from '@/features/orders/components/mobile/OrderCard'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useOrderList } from '@/features/orders/hooks/useOrderList'
import type { OrderStatus } from '@/features/orders/types/order'

const PAGE_SIZE_STEP = 10

const VALID_STATUSES = new Set<string>([
  'placed',
  'confirmed',
  'preparing',
  'ready',
  'outForDelivery',
  'delivered',
  'completed',
  'cancelled',
])

/** Start of today (local time), for the "Today" view (docs/NAVIGATION.md §9.2). */
function startOfToday(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

/**
 * Mobile Order list — search → cards → Load more, same pattern as
 * Customers. No status filter UI exists on mobile, but `?status=` is
 * still honored when deep-linked (e.g. from Dashboard) so the data
 * shown matches what the link promised.
 */
export function MobileOrderListContent({ todayOnly = false }: { todayOnly?: boolean }) {
  const [searchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const status: OrderStatus | 'all' =
    statusParam && VALID_STATUSES.has(statusParam) ? (statusParam as OrderStatus) : 'all'

  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_STEP)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch, isFetching } = useOrderList({
    search: debouncedSearch,
    status,
    source: 'all',
    page: 1,
    pageSize,
    sortBy: 'createdAt',
    createdFrom: todayOnly ? startOfToday() : undefined,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const hasMore = items.length < total

  const handleClearSearch = () => {
    setSearch('')
    setPageSize(PAGE_SIZE_STEP)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        {todayOnly && <h2 className="text-section-title font-semibold">Today's Orders</h2>}
        <DemoDataBadge />
      </div>
      <OrderSearchInput
        value={search}
        onChange={(value) => {
          setSearch(value)
          setPageSize(PAGE_SIZE_STEP)
        }}
      />

      {isError ? (
        <OrderErrorState onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <OrderEmptyState search={debouncedSearch} onClear={handleClearSearch} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={() => setPageSize((size) => size + PAGE_SIZE_STEP)}
              disabled={isFetching}
              className={buttonVariants({ variant: 'outline' })}
            >
              {isFetching ? 'Loading…' : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
