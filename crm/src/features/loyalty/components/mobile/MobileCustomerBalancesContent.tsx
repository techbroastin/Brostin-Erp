import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { LoyaltyEmptyState } from '@/features/loyalty/components/shared/LoyaltyEmptyState'
import { LoyaltyErrorState } from '@/features/loyalty/components/shared/LoyaltyErrorState'
import {
  CustomerBalanceCard,
  CustomerBalanceCardSkeleton,
} from '@/features/loyalty/components/mobile/CustomerBalanceCard'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useCustomerBalances } from '@/features/loyalty/hooks/useCustomerBalances'

const PAGE_SIZE_STEP = 10

/**
 * Mobile Customer Balances — search → cards → Load more, same pattern as
 * Orders/Customers. h2, not h1 — see MobileLoyaltyOverviewContent.
 */
export function MobileCustomerBalancesContent() {
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_STEP)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch, isFetching } = useCustomerBalances({
    search: debouncedSearch,
    page: 1,
    pageSize,
    sortBy: 'name',
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
      <h2 className="text-page-title font-semibold">Customer Balances</h2>
      <SearchInput
        id="loyalty-balance-search-mobile"
        label="Search customer balances by name or phone"
        placeholder="Search by name or phone"
        value={search}
        onChange={(value) => {
          setSearch(value)
          setPageSize(PAGE_SIZE_STEP)
        }}
      />

      {isError ? (
        <LoyaltyErrorState message="Couldn't load customer balances." onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <CustomerBalanceCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <LoyaltyEmptyState
          search={debouncedSearch}
          message="No customer balances yet."
          onClearSearch={handleClearSearch}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((balance) => (
              <CustomerBalanceCard key={balance.id} balance={balance} />
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
