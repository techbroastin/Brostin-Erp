import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { CustomerSearchInput } from '@/features/customers/components/shared/CustomerSearchInput'
import { CustomerEmptyState } from '@/features/customers/components/shared/CustomerEmptyState'
import { CustomerErrorState } from '@/features/customers/components/shared/CustomerErrorState'
import { CustomerCard, CustomerCardSkeleton } from '@/features/customers/components/mobile/CustomerCard'
import { useDebouncedValue } from '@/features/customers/hooks/useDebouncedValue'
import { useCustomerList } from '@/features/customers/hooks/useCustomerList'

const PAGE_SIZE_STEP = 10

/**
 * Mobile Customer list — docs/MOBILE_UI_SPEC.md §13: search → cards →
 * "Load more" (docs/DESIGN_SYSTEM.md §36 mobile pagination guidance).
 */
export function MobileCustomerListContent() {
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_STEP)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch, isFetching } = useCustomerList({
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
      <CustomerSearchInput
        value={search}
        onChange={(value) => {
          setSearch(value)
          setPageSize(PAGE_SIZE_STEP)
        }}
      />

      {isError ? (
        <CustomerErrorState onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <CustomerCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <CustomerEmptyState search={debouncedSearch} onClearSearch={handleClearSearch} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
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
