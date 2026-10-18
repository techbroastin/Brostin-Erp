import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { LoyaltyEmptyState } from '@/features/loyalty/components/shared/LoyaltyEmptyState'
import { LoyaltyErrorState } from '@/features/loyalty/components/shared/LoyaltyErrorState'
import {
  LoyaltyActivityRow,
  LoyaltyActivityRowSkeleton,
} from '@/features/loyalty/components/mobile/LoyaltyActivityRow'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useLoyaltyActivity } from '@/features/loyalty/hooks/useLoyaltyActivity'

const PAGE_SIZE_STEP = 10

/**
 * Mobile Activity — search → cards → Load more, same pattern as Orders/
 * Customers. h2, not h1 — see MobileLoyaltyOverviewContent.
 */
export function MobileLoyaltyActivityContent() {
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_STEP)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch, isFetching } = useLoyaltyActivity({
    search: debouncedSearch,
    page: 1,
    pageSize,
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
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Activity</h2>
      <SearchInput
        id="loyalty-activity-search-mobile"
        label="Search activity by customer name"
        placeholder="Search by customer name"
        value={search}
        onChange={(value) => {
          setSearch(value)
          setPageSize(PAGE_SIZE_STEP)
        }}
      />

      {isError ? (
        <LoyaltyErrorState message="Couldn't load loyalty activity." onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <LoyaltyActivityRowSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <LoyaltyEmptyState
          search={debouncedSearch}
          message="No loyalty activity yet."
          onClearSearch={handleClearSearch}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((event) => (
              <LoyaltyActivityRow key={event.id} event={event} />
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
